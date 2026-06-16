const { ADMIN_EMAILS } = require('./config');

function isAdmin(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

module.exports = { isAdmin };
