import scholarArticlesJson from './scholar-articles.json';

export interface ScholarJournalMeta {
  name: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
}

export interface ScholarArticle {
  id: string;
  slug: string;
  title: string;
  authors: string[];
  publicationDate: string;
  year?: number;
  journal: ScholarJournalMeta;
  abstract: string;
  doi?: string;
  doiUrl?: string;
  citationsCount?: number;
  scholarUrl: string;
}

export const HAYKAL_SCHOLAR_ARTICLES: ScholarArticle[] = scholarArticlesJson as ScholarArticle[];

/**
 * Formats journal metadata in standard APA 7th style
 * e.g., "Studies in Conflict & Terrorism, 47(11), 1388-1402"
 */
export function formatJournalCitation(article: ScholarArticle): string {
  const { name, volume, issue, pages } = article.journal;
  if (!name) return '';

  let citation = name;
  if (volume) {
    citation += `, ${volume}`;
    if (issue) {
      citation += `(${issue})`;
    }
  }
  if (pages) {
    citation += `, ${pages}`;
  }
  return citation;
}

/**
 * Formats a complete APA 7th edition reference string
 */
export function formatApaCitation(article: ScholarArticle): string {
  const authorText = article.authors.length > 0 ? article.authors.join(', ') : 'Arifin, H. H.';
  const yearText = article.year ? `(${article.year})` : '(n.d.)';
  const journalText = formatJournalCitation(article);
  const doiText = article.doiUrl ? ` ${article.doiUrl}` : '';

  return `${authorText} ${yearText}. ${article.title}. ${journalText}.${doiText}`.trim();
}

/**
 * Checks if a specific author is Haykal Hafizul Arifin (case-insensitive)
 */
export function isHaykalAuthor(authorName: string): boolean {
  const normalized = authorName.toLowerCase();
  return (
    normalized.includes('haykal') ||
    normalized.includes('arifin, h') ||
    normalized.includes('h. h. arifin') ||
    normalized.includes('hh arifin')
  );
}
