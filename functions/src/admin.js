const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');
const { isAdmin } = require('./utils/auth');

const db = () => getFirestore();

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
    const batch = db().batch();
    let count = 0;

    for (const colName of collections) {
      const snapshot = await db().collection(colName).get();
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

exports.banUser = onCall(async (request) => {
  // Check if request is the data object directly (from fft.wrap)
  const data = request.data || request;
  const auth = request.auth || (request.auth ? request.auth : null);
  const { userId, isBanned, reason } = data;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Handle case where admin email might be in token or directly in auth object
  const adminEmail = auth.token ? auth.token.email : auth.email;

  if (!isAdmin(adminEmail)) {
    throw new HttpsError('permission-denied', 'Admin access required');
  }
  // ... rest of the function

  if (!userId) {
    throw new HttpsError('invalid-argument', 'User ID is required');
  }

  try {
    const user = auth;
    await db().collection('users').doc(userId).update({
      isBanned: isBanned,
      banReason: reason || '',
      bannedAt: isBanned ? admin.firestore.FieldValue.serverTimestamp() : admin.firestore.FieldValue.delete()
    });

    await db().collection('activity_logs').add({
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

    await db().collection('users').doc(userId).update(updateData);

    await db().collection('activity_logs').add({
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
