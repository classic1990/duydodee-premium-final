# DUYDODEE Security Checklist

## 1. Firestore Rules
- [ ] No `allow write: if true;` for any collection.
- [ ] `daily_stats` must require `isSignedIn()`.
- [ ] Admin-only collections (`hero_slides`, `movies`, `series`, `vip_payments`) must use `isAdmin()` helper.
- [ ] User documents must restrict write access to the owner: `allow write: if request.auth.uid == userId;`.

## 2. CORS Policy
- [ ] `cors.json` must NOT contain `*` origin.
- [ ] Allowed origins should only be `https://duydodeesport.web.app` and `https://duydodeesport.firebaseapp.com`.
- [ ] Methods should be restricted to `GET` for public static assets.

## 3. Secret Management
- [ ] No hardcoded private keys or service account JSONs in the repository.
- [ ] Firebase Public Config (API Key, App ID) is acceptable in client-side code but should be monitored.
- [ ] Ensure `.env` files (if any) are in `.gitignore`.

## 4. Hosting Security
- [ ] Verify `firebase.json` headers (e.g., security headers like HSTS, X-Content-Type-Options).
