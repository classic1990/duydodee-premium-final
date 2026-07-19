# Contributing to DUYDODEE PREMIUM

Thank you for your interest in contributing to DUYDODEE PREMIUM! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git
- Firebase Account (for development)

### Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/DUYDODEE-HD.git
   cd DUYDODEE-HD
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🔄 Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Making Changes

1. Write clean, readable code following our coding standards
2. Add tests for new functionality
3. Ensure all tests pass
4. Update documentation if needed

### Local Testing

```bash
# Run linter
npm run lint

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build:prod
```

## 📝 Coding Standards

### JavaScript/ES6+

- Use modern ES6+ features
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep functions small and focused

### Code Style

- Use single quotes for strings
- Use semicolons
- Use 2 spaces for indentation
- Maximum line length: 100 characters
- Add trailing commas only in multi-line arrays/objects

### File Organization

```
public/src/
├── admin/           # Admin functionality
├── components/      # Reusable UI components
├── config/          # Configuration files
├── middleware/      # Middleware functions
├── pages/           # Page-specific logic
├── services/        # Business logic and API calls
└── utils/           # Utility functions
```

### Security Best Practices

- Never commit sensitive information
- Validate all user inputs
- Use parameterized queries
- Implement proper error handling
- Follow Firebase security rules

## 🧪 Testing Guidelines

### Unit Tests

- Test individual functions and components
- Mock external dependencies
- Aim for high code coverage
- Test both success and error cases

### Integration Tests

- Test service interactions
- Test Firebase operations
- Test authentication flows

### Test Commands

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📦 Commit Guidelines

### Commit Message Format

Follow conventional commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements
- `security` - Security fixes

### Examples

```bash
feat(auth): add Google OAuth login
fix(player): resolve video loading issue
docs(readme): update installation instructions
test(services): add unit tests for content service
```

## 🔄 Pull Request Process

### Before Submitting

1. Update documentation
2. Ensure all tests pass
3. Run linter and fix issues
4. Rebase your branch on latest main
5. Add meaningful description

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests passing

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

1. Automated checks must pass
2. At least one approval required
3. Address all review comments
4. Maintain clean commit history

## 🐛 Bug Reporting

### Bug Report Template

```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. Go to...
2. Click on...
3. Scroll down to...
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Screenshots
If applicable, add screenshots

## Environment
- OS: [e.g. Windows 10, macOS 12]
- Browser: [e.g. Chrome 96, Safari 15]
- Version: [e.g. 1.0.0]

## Additional Context
Any other context about the problem
```

## 💡 Feature Requests

### Feature Request Template

```markdown
## Problem Description
Clear description of the problem

## Proposed Solution
Detailed description of your proposed solution

## Alternatives Considered
Any alternative solutions you've considered

## Additional Context
Any other context or screenshots
```

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Project Documentation](./README.md)

## ❓ Questions?

For questions or support, please:
- Open an issue on GitHub
- Contact: support@duydodee.com

---

**Happy Contributing! 🎉**