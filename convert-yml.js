const fs = require('fs');
const yaml = require('js-yaml');

const yamlPath = '/Users/kytama/Projects/Neo-Attentive/attentiveid.github.io/data/en/homepage.yml';
const fileContents = fs.readFileSync(yamlPath, 'utf8');
const data = yaml.load(fileContents);

const result = {
  hero: {
    title1: data.features?.title1 || '',
    title2: data.features?.title2 || '',
    title3: data.features?.title3 || '',
    tagline: data.features?.tagline || '',
  },
  about_us: {
    title: 'About Us',
    content1: data.features?.content1 || '',
    content2: data.features?.content2 || '',
  },
  why_attentive: {
    title: data.promo?.title || '',
    content: data.promo?.content || '',
  },
  services: data.promo?.items || [],
  psychologists: data.psychologists?.items || [],
  testimonials: data.testimonial?.testimonial_item || [],
  partner_content: {
    title: "Coming soon",
    description: "We are currently preparing this section. Check back later!"
  },
  cta: {
    title: "Contact Us",
    button: "Take the First Step"
  },
  clinics_locations: {
    title: data.contact_us?.location_title || '',
    locations: data.contact_us?.locations || []
  }
};

const enPath = './apps/web/src/locales/en.json';
const idPath = './apps/web/src/locales/id.json';

fs.mkdirSync('./apps/web/src/locales', { recursive: true });
fs.writeFileSync(enPath, JSON.stringify(result, null, 2));
fs.writeFileSync(idPath, JSON.stringify(result, null, 2));

console.log('JSON files generated successfully.');
