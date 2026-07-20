# DUYDODEE PREMIUM - Agent Instructions

## 🎯 Project Vision
**DUYDODEE PREMIUM** is a high-performance, secure, and visually stunning 4K HDR streaming platform. It follows a clean architecture with a strong focus on security, performance, and user experience.

## 🛠️ Architecture & Patterns
- **Frontend**: Vanilla JS with Vite, Tailwind CSS for styling.
- **Backend**: Firebase (Auth, Firestore, Storage, Hosting).
- **Service Pattern**: Business logic is encapsulated in services (`public/src/services/`).
- **Security**: Strict Firestore rules, environment variable validation, and secure headers.
- **UI/UX**: Premium aesthetic with glassmorphism, neon glows, and smooth transitions.

## 🔒 Security Mandates
- **Environment Variables**: Always use `import.meta.env` via `ENV` config. NEVER hardcode keys.
- **Validation**: All user inputs must be validated using `validator.js`.
- **Error Handling**: Use the centralized `error-handler.js` for all async operations.
- **Firestore Rules**: Ensure rules are updated when adding new collections.

## 🚀 Development Workflow
- **CSS**: Styling changes should be made in `public/css/styles.css` and built using `npm run build:css`.
- **Testing**: Add tests in `public/src/**/*.test.js` using Jest.
- **Health Check**: Run `npm run health:check` before any deployment or major commit.

## 📁 File Structure Highlights
- `public/src/services/`: Core business logic.
- `public/src/config/`: System and security configurations.
- `public/src/admin/`: Admin-only logic and dashboards.
- `public/src/utils/`: Shared utilities (logger, validator, etc.).

## 📞 Support & Documentation
- Refer to `AGENTS.md` for detailed technical specs.
- Refer to `SECURITY.md` for security protocols.
- Refer to `FIREBASE_SETUP.md` for environment setup.

---
**Last Updated**: 2026-07-20
**Current Status**: Security audited, documentation verified, and UI/UX enhancements applied.
