/**
 * 🔒 DUYดูDEE Firebase Functions
 * Server-side operations for security and performance
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();
const db = getFirestore();
const auth = getAuth();

// Environment configuration
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];

/**
 * 🔐 Check if user is admin
 */
function isAdmin(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * 📊 Increment view count (server-side for security)
 */
exports.incrementViewCount = onCall(async (request) => {
  const { type, id } = request.data;

  if (!type || !id) {
    throw new HttpsError('invalid-argument', 'Type and ID are required');
  }

  try {
    const collectionName = type === 'series' ? 'series' : 'movies';

    // Increment view count
    await db.collection(collectionName).doc(id).update({
      views: admin.firestore.FieldValue.increment(1),
      lastViewedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update daily stats
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

/**
 * 🔄 Reset weekly views (admin only)
 */
exports.resetWeeklyViews = onCall(async (request) => {
  const user = request.auth;

  if (!user) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  if (!isAdmin(user.email)) {
    throw new HttpsError('permission-denied', 'Admin access required');
  }

  try {
    const collections = ['movies', 'series'];
    const batch = db.batch();
    let count = 0;

    for (const colName of collections) {
      const snapshot = await db.collection(colName).get();
      snapshot.forEach(doc => {
        batch.update(doc.ref, {
          weeklyViews: 0,
          trendingScore: 0
        });
        count++;
      });
    }

    if (count > 0) {
      await batch.commit();
    }

    return { success: true, total: count };
  } catch (error) {
    console.error('Reset weekly views error:', error);
    throw new HttpsError('internal', 'Failed to reset weekly views');
  }
});

/**
 * 👤 Ban user (admin only)
 */
exports.banUser = onCall(async (request) => {
  const { userId, isBanned, reason } = request.data;
  const user = request.auth;

  if (!user) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  if (!isAdmin(user.email)) {
    throw new HttpsError('permission-denied', 'Admin access required');
  }

  if (!userId) {
    throw new HttpsError('invalid-argument', 'User ID is required');
  }

  try {
    await db.collection('users').doc(userId).update({
      isBanned: isBanned,
      banReason: reason || '',
      bannedAt: isBanned ? admin.firestore.FieldValue.serverTimestamp() : admin.firestore.FieldValue.delete()
    });

    // Log admin action
    await db.collection('activity_logs').add({
      adminEmail: user.email,
      adminName: user.displayName || 'Unknown',
      action: isBanned ? 'BAN_USER' : 'UNBAN_USER',
      details: { targetUserId: userId, reason },
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Ban user error:', error);
    throw new HttpsError('internal', 'Failed to update user status');
  }
});

/**
 * 💎 Update user VIP status (admin only)
 */
exports.updateVIPStatus = onCall(async (request) => {
  const { userId, isVIP, expiryDate } = request.data;
  const user = request.auth;

  if (!user) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  if (!isAdmin(user.email)) {
    throw new HttpsError('permission-denied', 'Admin access required');
  }

  if (!userId) {
    throw new HttpsError('invalid-argument', 'User ID is required');
  }

  try {
    const updateData = {
      isVIP: isVIP,
      role: isVIP ? 'vip' : 'member'
    };

    if (isVIP && expiryDate) {
      updateData.vipExpiryDate = new Date(expiryDate);
    } else {
      updateData.vipExpiryDate = admin.firestore.FieldValue.delete();
    }

    await db.collection('users').doc(userId).update(updateData);

    // Log admin action
    await db.collection('activity_logs').add({
      adminEmail: user.email,
      adminName: user.displayName || 'Unknown',
      action: isVIP ? 'GRANT_VIP' : 'REVOKE_VIP',
      details: { targetUserId: userId, expiryDate },
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Update VIP status error:', error);
    throw new HttpsError('internal', 'Failed to update VIP status');
  }
});

/**
 * 📝 Create support ticket
 */
exports.createSupportTicket = onCall(async (request) => {
  const { subject, message, category } = request.data;
  const user = request.auth;

  if (!user) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  if (!subject || !message) {
    throw new HttpsError('invalid-argument', 'Subject and message are required');
  }

  try {
    const ticketRef = await db.collection('support_tickets').add({
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName || 'Unknown',
      subject,
      message,
      category: category || 'general',
      status: 'open',
      priority: 'normal',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, ticketId: ticketRef.id };
  } catch (error) {
    console.error('Create support ticket error:', error);
    throw new HttpsError('internal', 'Failed to create support ticket');
  }
});

/**
 * 🔍 Search content (server-side for better performance)
 */
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

    // Search movies
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

    // Search series
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
