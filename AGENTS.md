# DUYDODEE PREMIUM - AGENTS.md

## 📋 Project Information for AI Agents

### 🎯 Project Overview
**DUYDODEE PREMIUM** - Professional 4K HDR Streaming Platform built with Modern Web Stack and Firebase.

### 🛠️ Technology Stack
- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS
- **Build Tool**: Vite 8.0.14
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Search**: Algolia
- **Analytics**: Google Analytics 4
- **Error Monitoring**: Sentry
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier

### 📁 Key Directories
- `public/src/` - Main source code
- `public/src/services/` - Business logic and Firebase integration
- `public/src/components/` - UI components
- `public/src/pages/` - Page-specific logic
- `public/src/utils/` - Utility functions
- `public/src/admin/` - Admin dashboard functionality
- `public/src/config/` - Configuration files
- `docs/` - Documentation

### 🔑 Important Files
- `vite.config.js` - Vite configuration with multi-page setup
- `firebase.json` - Firebase hosting configuration
- `firestore.rules` - Firestore security rules
- `.env.example` - Environment variables template
- `package.json` - Dependencies and scripts

### 🚀 Common Commands

#### Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run build:prod       # Build with production mode
npm run preview          # Preview production build
```

#### Testing
```bash
npm test                 # Run tests
npm run test:coverage    # Run tests with coverage
npm run test:watch       # Run tests in watch mode
```

#### Code Quality
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run security:audit   # Run security audit
npm run security:fix     # Fix security issues
npm run health:check     # Run project health check
```

#### Deployment
```bash
npm run deploy           # Deploy to Firebase
npm run deploy:hosting   # Deploy hosting only
.\deploy.bat             # Windows deployment script
```

### 🔒 Security Best Practices
1. Never commit `.env.local` or real credentials
2. Firebase Security Rules are strictly enforced
3. All inputs must be validated before saving
4. Error messages must not expose sensitive information
5. Service Account Keys must be kept secure

### 📊 Architecture Patterns
- **Service Pattern** - Business logic separated from UI
- **Repository Pattern** - Data access abstraction
- **Error Handling** - Centralized error management
- **Validation** - Input validation at every entry point
- **Auth Guard** - Protected routes for admin functions

### 🎨 Code Style
- Use ES6+ features
- Follow ESLint rules
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### 🐛 Debugging
- Use `VITE_ENABLE_DEBUG=true` for debug mode
- Check browser console for errors
- Review Firebase Console for authentication issues
- Monitor Sentry for error tracking
- Use network tab for API debugging

### 📈 Performance Optimization
- Lazy loading for images
- Code splitting with Vite
- Caching strategy for static assets
- Service Worker for offline support
- Performance monitoring enabled

### 🌐 Environment Variables
Required variables (see `.env.example`):
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_SITE_URL` - Site URL
- `VITE_SITE_NAME` - Site name

### 🧪 Testing Strategy
- Unit tests for utility functions
- Integration tests for services
- E2E tests for critical user flows
- Coverage target: 70%+
- Health check script for project validation
- CI/CD testing with `npm run test:ci`

### 🚦 CI/CD Pipeline
- Automated testing on push
- Code quality checks
- Security scanning
- Automated deployment to staging
- Manual approval for production

### 📝 Development Workflow
1. Create feature branch from `main`
2. Make changes with proper testing
3. Run linting and tests
4. Commit with conventional commits
5. Push and create pull request
6. Code review and approval
7. Merge to main
8. Automatic deployment

### 🎯 Current Focus Areas
- Performance optimization
- Security enhancements
- User experience improvements
- Accessibility compliance
- Code quality improvements

### 📞 Support
- Email: support@duydodee.com
- GitHub Issues: [Create Issue](https://github.com/yourusername/DUYDODEE-HD/issues)

---

**Last Updated**: 2026-07-20
**Version**: 1.0.0
**Status**: Security Audited & Documentation Verified