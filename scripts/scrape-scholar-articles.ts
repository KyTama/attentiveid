/**
 * scripts/scrape-scholar-articles.ts
 *
 * Scrapes all publications for Haykal Hafizul Arifin from Google Scholar,
 * extracts detailed metadata (authors, pub date, journal, description/abstract),
 * enriches with DOI & URL via Crossref API,
 * and saves to apps/web/src/data/scholar-articles.json.
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

export interface ScholarArticle {
  id: string; // e.g. "35N4QoGY0k4C"
  slug: string;
  title: string;
  authors: string[];
  publicationDate: string; // e.g. "2024/11/1" or "2020"
  year?: number;
  journal: {
    name: string;
    volume?: string;
    issue?: string;
    pages?: string;
    publisher?: string;
  };
  abstract: string;
  doi?: string;
  doiUrl?: string;
  citationsCount?: number;
  scholarUrl: string;
}

const SCHOLAR_USER_ID = 'SDe2IKQAAAAJ';
const SCHOLAR_BASE_URL = 'https://scholar.google.com';
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function stripHtml(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

// Simple Levenshtein or token overlap to verify Crossref match
function calculateTitleMatch(titleA: string, titleB: string): number {
  const normalize = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  const wordsA = new Set(normalize(titleA));
  const wordsB = new Set(normalize(titleB));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }
  return intersection / Math.max(wordsA.size, wordsB.size);
}

async function fetchCrossrefMetadata(title: string, authorName: string = 'Arifin') {
  try {
    const url = `https://api.crossref.org/works?rows=3&query.bibliographic=${encodeURIComponent(title)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'AttentiveScholarSync/1.0 (mailto:engineering@attentive.id)'
      }
    });

    if (!res.ok) return null;
    const data = await res.json();
    const items = data?.message?.items || [];

    for (const item of items) {
      const itemTitle = Array.isArray(item.title) ? item.title[0] : item.title;
      if (!itemTitle) continue;

      const score = calculateTitleMatch(title, itemTitle);
      if (score >= 0.6) {
        return {
          doi: item.DOI,
          doiUrl: item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : undefined),
          matchedTitle: itemTitle
        };
      }
    }
  } catch (err) {
    console.warn(`[Crossref Warning] Failed to query DOI for "${title.slice(0, 40)}...":`, err);
  }
  return null;
}

async function scrapeArticleDetail(citationUrl: string): Promise<Partial<ScholarArticle>> {
  const fullUrl = citationUrl.startsWith('http') ? citationUrl : `${SCHOLAR_BASE_URL}${citationUrl}`;
  const res = await fetch(fullUrl, {
    headers: { 'User-Agent': USER_AGENT }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch detail: HTTP ${res.status}`);
  }

  const html = await res.text();

  // Extract Title
  const titleMatch = /id="gsc_oci_title"[^>]*>([\s\S]*?)<\/div>/.exec(html);
  const title = titleMatch ? stripHtml(titleMatch[1]) : '';

  // Extract Metadata Fields
  const fieldMatches = [...html.matchAll(/<div class="gsc_oci_field">([\s\S]*?)<\/div>\s*<div class="gsc_oci_value"[^>]*>([\s\S]*?)<\/div>/g)];
  
  const fields: Record<string, string> = {};
  for (const match of fieldMatches) {
    const key = stripHtml(match[1]).toLowerCase();
    const val = stripHtml(match[2]);
    fields[key] = val;
  }

  // Authors
  const authorsRaw = fields['authors'] || '';
  const authors = authorsRaw.split(',').map((a) => a.trim()).filter(Boolean);

  // Publication Date & Year
  const pubDate = fields['publication date'] || '';
  let year: number | undefined;
  const yearMatch = pubDate.match(/\b(19\d\d|20\d\d)\b/);
  if (yearMatch) {
    year = parseInt(yearMatch[1], 10);
  }

  // Journal details
  const journalName = fields['journal'] || fields['conference'] || fields['book'] || '';
  const volume = fields['volume'];
  const issue = fields['issue'];
  const pages = fields['pages'];
  const publisher = fields['publisher'];

  // Description / Abstract
  const abstract = fields['description'] || '';

  // Total citations
  let citationsCount: number | undefined;
  if (fields['total citations']) {
    const cMatch = fields['total citations'].match(/(\d+)/);
    if (cMatch) citationsCount = parseInt(cMatch[1], 10);
  }

  return {
    title,
    authors,
    publicationDate: pubDate,
    year,
    journal: {
      name: journalName,
      volume,
      issue,
      pages,
      publisher
    },
    abstract,
    citationsCount,
    scholarUrl: fullUrl
  };
}

async function main() {
  console.log(`🔍 [1/3] Fetching profile publications from Google Scholar (User: ${SCHOLAR_USER_ID})...`);
  const profileUrl = `${SCHOLAR_BASE_URL}/citations?user=${SCHOLAR_USER_ID}&hl=en&cstart=0&pagesize=100`;
  const res = await fetch(profileUrl, {
    headers: { 'User-Agent': USER_AGENT }
  });

  if (!res.ok) {
    console.error(`Failed to fetch profile: HTTP ${res.status}`);
    process.exit(1);
  }

  const profileHtml = await res.text();
  const rowRegex = /<tr class="gsc_a_tr">([\s\S]*?)<\/tr>/g;
  const items: Array<{ id: string; citationUrl: string; listTitle: string }> = [];

  let match;
  while ((match = rowRegex.exec(profileHtml)) !== null) {
    const row = match[1];
    const linkMatch = /<a href="([^"]+)" class="gsc_a_at">([\s\S]*?)<\/a>/.exec(row);
    if (linkMatch) {
      const rawUrl = linkMatch[1].replace(/&amp;/g, '&');
      const listTitle = stripHtml(linkMatch[2]);
      const idMatch = rawUrl.match(/citation_for_view=[^:]+:([^&]+)/);
      const id = idMatch ? idMatch[1] : `art-${items.length + 1}`;
      items.push({ id, citationUrl: rawUrl, listTitle });
    }
  }

  console.log(`📚 Found ${items.length} publications. Fetching details & Crossref DOIs...`);

  const results: ScholarArticle[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log(`\n[${i + 1}/${items.length}] Processing: "${item.listTitle.slice(0, 60)}..."`);
    
    try {
      const detail = await scrapeArticleDetail(item.citationUrl);
      const articleTitle = detail.title || item.listTitle;

      // Query Crossref for DOI
      process.stdout.write(`   Fetching Crossref DOI... `);
      const crossrefMeta = await fetchCrossrefMetadata(articleTitle, 'Arifin');
      if (crossrefMeta?.doi) {
        console.log(`✅ DOI: ${crossrefMeta.doi}`);
      } else {
        console.log(`⚠️  DOI not found on Crossref`);
      }

      function slugify(text: string): string {
        return text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .slice(0, 80)
          .replace(/-+$/, '');
      }

      const fullArticle: ScholarArticle = {
        id: item.id,
        slug: slugify(articleTitle),
        title: articleTitle,
        authors: detail.authors && detail.authors.length > 0 ? detail.authors : ['Haykal Hafizul Arifin'],
        publicationDate: detail.publicationDate || '',
        year: detail.year,
        journal: detail.journal || { name: '' },
        abstract: detail.abstract || '',
        doi: crossrefMeta?.doi,
        doiUrl: crossrefMeta?.doiUrl,
        citationsCount: detail.citationsCount,
        scholarUrl: detail.scholarUrl || `${SCHOLAR_BASE_URL}${item.citationUrl}`
      };

      results.push(fullArticle);

      // Polite delay between requests to avoid rate limits
      await new Promise((r) => setTimeout(r, 600));
    } catch (err) {
      console.error(`   ❌ Failed to scrape item ${item.id}:`, err);
    }
  }

  // Save to JSON
  const outputPath = resolve(process.cwd(), 'apps/web/src/data/scholar-articles.json');
  const dir = dirname(outputPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n🎉 Successfully scraped & saved ${results.length} articles to:`);
  console.log(`   ${outputPath}`);

  // Summary statistics
  const withDoi = results.filter((r) => r.doi).length;
  const withAbstract = results.filter((r) => r.abstract).length;
  console.log(`\n📊 Summary:`);
  console.log(`   - Total Articles: ${results.length}`);
  console.log(`   - With Abstract: ${withAbstract}/${results.length}`);
  console.log(`   - With DOI: ${withDoi}/${results.length}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
