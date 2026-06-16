const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

const db = getFirestore();

exports.incrementViewCount = onCall(async (request) => {
  const { type, id } = request.data;

  if (!type || !id) {
    throw new HttpsError('invalid-argument', 'Type and ID are required');
  }

  try {
    const collectionName = type === 'series' ? 'series' : 'movies';

    await db.collection(collectionName).doc(id).update({
      views: admin.firestore.FieldValue.increment(1),
      lastViewedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const today = new Date().toISOString().split('T')[0];
    await db.collection('daily_stats').doc(today).set({
      views: admin.firestore.FieldValue.increment(1),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Increment view count error:', error);
    throw new HttpsError('internal', 'Failed to increment view count');
  }
});

exports.searchContent = onCall(async (request) => {
  const { term, limit = 12 } = request.data;

  if (!term || term.length < 2) {
    throw new HttpsError('invalid-argument', 'Search term must be at least 2 characters');
  }

  try {
    const keyword = term.trim().toUpperCase();
    const results = {
      movies: [],
      series: []
    };

    const moviesQuery = db.collection('movies')
      .where('title', '>=', keyword)
      .where('title', '<=', keyword + '\uf8ff')
      .limit(limit);

    const moviesSnapshot = await moviesQuery.get();
    results.movies = moviesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      type: 'movie'
    }));

    const seriesQuery = db.collection('series')
      .where('title', '>=', keyword)
      .where('title', '<=', keyword + '\uf8ff')
      .limit(limit);

    const seriesSnapshot = await seriesQuery.get();
    results.series = seriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      type: 'series'
    }));

    return { success: true, results };
  } catch (error) {
    console.error('Search content error:', error);
    throw new HttpsError('internal', 'Search failed');
  }
});
