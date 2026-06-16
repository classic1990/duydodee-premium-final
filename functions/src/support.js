const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

const db = getFirestore();

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
