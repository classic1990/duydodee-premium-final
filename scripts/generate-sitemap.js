const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// NOTE: Ensure 'serviceAccountKey.json' exists in the project root
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function generateSitemap() {
  const urlset = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  
  // Base URLs
  const baseUrls = [
    { loc: 'https://duydodeesport.web.app/', priority: '1.0' },
    { loc: 'https://duydodeesport.web.app/login', priority: '0.5' },
    { loc: 'https://duydodeesport.web.app/register', priority: '0.5' }
  ];
  
  baseUrls.forEach(u => {
    urlset.push(`  <url><loc>${u.loc}</loc><priority>${u.priority}</priority></url>`);
  });

  // Fetch Movies
  const movies = await db.collection('movies').get();
  movies.forEach(doc => {
    urlset.push(`  <url><loc>https://duydodeesport.web.app/watch-movie.html?id=${doc.id}</loc><priority>0.8</priority></url>`);
  });

  // Fetch Series
  const series = await db.collection('series').get();
  series.forEach(doc => {
    urlset.push(`  <url><loc>https://duydodeesport.web.app/watch-series.html?id=${doc.id}</loc><priority>0.8</priority></url>`);
  });

  urlset.push('</urlset>');
  
  fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), urlset.join('\n'));
  console.log('✅ Sitemap generated successfully!');
  process.exit(0);
}

generateSitemap().catch(console.error);
