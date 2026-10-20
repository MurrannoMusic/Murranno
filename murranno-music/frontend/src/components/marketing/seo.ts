import seo from '@/content/seo.json';
import { CONTACT_DETAILS, SOCIAL_LINKS } from './contactDetails';

export const SITE_URL = seo.site.url;
export interface SeoMeta { title: string; description: string; keywords?: string[]; image?: string; type?: 'website' | 'article'; schema?: string }
export interface Faq { q: string; a: string }

type PageKey = keyof typeof seo.pages;
const normalise = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : '/');
/** Canonical URLs keep the trailing slash the old WordPress site (and its search rankings) used. */
export const canonicalUrl = (path: string) => `${SITE_URL}${normalise(path) === '/' ? '/' : `${normalise(path)}/`}`;
export const pageSeo = (path: string): (SeoMeta & { schema?: string }) | undefined => seo.pages[normalise(path) as PageKey];

const ORG_ID = `${SITE_URL}/#organization`;
const organization = {
  '@type': ['Organization', 'LocalBusiness'],
  '@id': ORG_ID,
  name: seo.site.name,
  alternateName: ['Murranno', 'murrannomusic', 'MurrannoMusic', 'murrannomusic.co'],
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/favicon.png`,
  image: `${SITE_URL}${seo.site.image}`,
  description: seo.site.description,
  email: CONTACT_DETAILS.email,
  telephone: CONTACT_DETAILS.phone,
  address: { '@type': 'PostalAddress', streetAddress: '100 Kujore Street, Ojota', addressLocality: 'Lagos', addressRegion: 'Lagos', postalCode: '105102', addressCountry: 'NG' },
  areaServed: [{ '@type': 'Country', name: 'Nigeria' }, { '@type': 'Place', name: 'Africa' }, { '@type': 'Place', name: 'Worldwide' }],
  knowsAbout: ['Music distribution', 'Music promotion', 'Afrobeats', 'Playlist pitching', 'Artist profile verification', 'Music royalties'],
  sameAs: SOCIAL_LINKS,
  contactPoint: [{ '@type': 'ContactPoint', telephone: CONTACT_DETAILS.phone, email: CONTACT_DETAILS.email, contactType: 'customer support', areaServed: 'NG', availableLanguage: ['English'] }],
};

const service = (name: string, serviceType: string, description: string, url: string) => ({
  '@type': 'Service', name, serviceType, description, url, provider: { '@id': ORG_ID },
  areaServed: [{ '@type': 'Country', name: 'Nigeria' }, { '@type': 'Place', name: 'Worldwide' }],
  audience: { '@type': 'Audience', audienceType: 'Independent artists, record labels and music managers' },
});

const SERVICES: Record<string, (url: string) => object> = {
  distribution: (url) => service('Music distribution', 'Digital music distribution', 'Release music from Nigeria to Spotify, Apple Music, Boomplay, Audiomack, YouTube Music, TikTok and 150+ stores, with free UPC and ISRC codes and 100% master ownership.', url),
  promotion: (url) => service('Music promotion', 'Music marketing and promotion', 'Playlist placement, TikTok and Instagram campaigns, press features and radio airplay for artists in Nigeria and worldwide.', url),
  profiles: (url) => service('Artist profile setup', 'Artist profile verification', 'Claim and set up verified artist profiles on Spotify for Artists, Apple Music for Artists, Boomplay, Deezer and YouTube Official Artist Channel.', url),
};

function breadcrumb(path: string, title: string) {
  const parts = normalise(path).split('/').filter(Boolean);
  const items = [{ name: 'Home', url: `${SITE_URL}/` }];
  parts.forEach((part, i) => {
    const sub = `/${parts.slice(0, i + 1).join('/')}`;
    items.push({ name: i === parts.length - 1 ? title.split(/ [—|-] /)[0] : (pageSeo(sub)?.title.split(/ [—|-] /)[0] ?? part), url: canonicalUrl(sub) });
  });
  return { '@type': 'BreadcrumbList', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })) };
}

function upsert(selector: string, create: () => HTMLElement, set: (el: HTMLElement) => void) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) { el = create(); document.head.appendChild(el); }
  set(el);
}
const meta = (attr: 'name' | 'property', key: string, content: string) =>
  upsert(`meta[${attr}="${key}"]`, () => document.createElement('meta'), (el) => { el.setAttribute(attr, key); el.setAttribute('content', content); });
const link = (rel: string, href: string, hreflang?: string) =>
  upsert(hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`, () => document.createElement('link'), (el) => { el.setAttribute('rel', rel); el.setAttribute('href', href); if (hreflang) el.setAttribute('hreflang', hreflang); });

/** Writes every head tag crawlers read; the prerender step snapshots the result into static HTML. */
export function applySeo(path: string, m: SeoMeta, extra: { faq?: Faq[]; jsonLd?: object[] } = {}) {
  const url = canonicalUrl(path);
  const image = `${SITE_URL}${m.image ?? seo.site.image}`;
  const keywords = [...new Set([...(m.keywords ?? []), ...seo.site.brandKeywords, ...seo.site.keywords])].join(', ');
  document.title = m.title;
  document.documentElement.lang = 'en-NG';
  meta('name', 'description', m.description);
  meta('name', 'keywords', keywords);
  meta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1');
  meta('name', 'geo.region', 'NG-LA');
  meta('name', 'geo.placename', 'Lagos');
  meta('property', 'og:site_name', seo.site.name);
  meta('property', 'og:locale', seo.site.locale);
  meta('property', 'og:type', m.type ?? 'website');
  meta('property', 'og:title', m.title);
  meta('property', 'og:description', m.description);
  meta('property', 'og:url', url);
  meta('property', 'og:image', image);
  meta('name', 'twitter:card', 'summary_large_image');
  meta('name', 'twitter:site', '@murrannomusic');
  meta('name', 'twitter:title', m.title);
  meta('name', 'twitter:description', m.description);
  meta('name', 'twitter:image', image);
  link('canonical', url);
  link('alternate', url, 'en-NG');
  link('alternate', url, 'x-default');

  const graph: object[] = [organization, { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: seo.site.name, alternateName: 'Murranno', inLanguage: 'en-NG', publisher: { '@id': ORG_ID } }];
  graph.push({ '@type': 'WebPage', '@id': `${url}#webpage`, url, name: m.title, description: m.description, inLanguage: 'en-NG', isPartOf: { '@id': `${SITE_URL}/#website` }, about: { '@id': ORG_ID } });
  if (normalise(path) !== '/') graph.push(breadcrumb(path, m.title));
  if (m.schema && SERVICES[m.schema]) graph.push(SERVICES[m.schema](url));
  if (extra.faq?.length) graph.push({ '@type': 'FAQPage', mainEntity: extra.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  graph.push(...(extra.jsonLd ?? []));
  upsert('script[data-seo="ld"]', () => Object.assign(document.createElement('script'), { type: 'application/ld+json' }), (el) => { el.dataset.seo = 'ld'; el.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }); });
}
