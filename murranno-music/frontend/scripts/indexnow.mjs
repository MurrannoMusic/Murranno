// Tell Bing, Yandex, Seznam and Naver (IndexNow) about every URL in the live sitemap. Run after a site deploy:
//   npm run seo:indexnow
const SITE = 'https://murrannomusic.co';
const KEY = 'ab94ff9d7e759b69a165e2d8a9598b91'; // public by design; served at /<key>.txt by scripts/prerender.mjs

const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const body = JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList });
for (const endpoint of ['https://api.indexnow.org/indexnow', 'https://www.bing.com/indexnow']) {
  const res = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body });
  console.log(`${endpoint}: HTTP ${res.status} (${urlList.length} URLs)`);
}
