/**
 * 🔒 DUYดูDEE Firebase Functions
 * Server-side operations for security and performance
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Export functions from sub-modules
const adminFunctions = require('./src/admin');
const contentFunctions = require('./src/content');
const supportFunctions = require('./src/support');

exports.resetWeeklyViews = adminFunctions.resetWeeklyViews;
exports.banUser = adminFunctions.banUser;
exports.updateVIPStatus = adminFunctions.updateVIPStatus;

exports.incrementViewCount = contentFunctions.incrementViewCount;
exports.searchContent = contentFunctions.searchContent;

exports.createSupportTicket = supportFunctions.createSupportTicket;
