# 🔐 SECURITY.md - Security Guide

> ไกด์ความปลอดภัยและการป้องกัน secrets สำหรับโปรเจค DUYดูDEE PREMIUM

---

## 📋 Table of Contents

- [Security Checklist](#security-checklist)
- [Secret Management](#secret-management)
- [Branch Protection](#branch-protection)
- [Pre-commit Hooks](#pre-commit-hooks)
- [Secrets in Code](#secrets-in-code)
- [Emergency Procedures](#emergency-procedures)

---

## ✅ Security Checklist

### Daily/Regular Tasks

- [ ] Review `.gitignore` for new file patterns
- [ ] Verify no .env files in repository
- [ ] Check environment variables in CI/CD
- [ ] Rotate sensitive keys quarterly
- [ ] Audit Firebase project security settings

### Before Committing

- [ ] No hardcoded secrets in code
- [ ] No API keys in code
- [ ] No passwords in code
- [ ] No .env files committed
- [ ] No credential files committed

### After Deployment

- [ ] Verify API keys not exposed
- [ ] Check console for sensitive data
- [ ] Review Firebase security rules
- [ ] Test authentication flows
- [ ] Verify admin access restrictions

---

## 🔑 Secret Management

### Environment Variables

**Never commit:**
- `.env` files
- `.env.local` files
- `.env.*.local` files
- `serviceAccountKey.json`
- Any file with actual credentials

**Use instead:**
- Environment variables in CI/CD
- Firebase default authentication (for Functions)
- Environment-specific config files (ignored by git)

### Firebase Configuration

**Frontend (Public):**
```javascript
// Use Vite environment variables
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
```

**Backend (Functions):**
```javascript
// Use Firebase default authentication
admin.initializeApp();
// Credentials loaded from Firebase automatically
```

### Local Development

```bash
# Copy example env file
cp .env.example .env.local

# Fill in your values
# Edit .env.local with your actual keys

# .env.local is already in .gitignore
```

---

## 🛡️ Branch Protection

### GitHub Repository Settings

Go to: Repository Settings → Branches → main

**Enable Protection Rules:**

1. **Require pull request before merging**
   - ทำให้ทุกการ merge ต้องผ่าน PR
   - Reviewer(s) ต้อง approve

2. **Require status checks to pass before merging**
   - Lint checks
   - Build checks
   - Test checks (ถ้ามี)

3. **Require branches to be up to date before merging**
   - ป้องกัน merge conflicts
   - ต้อง update branch ก่อน merge

4. **Do not allow bypassing the above settings**
   - บังคับให้ทุกอย่างผ่านขั้นตอน

5. **Restrict who can push to matching branches**
   - เฉพาะ maintainers/main developers
   - ป้องกัน direct push ไป main

6. **Allow force pushes** ❌ (DISABLE)
   - ห้าม force push เพื่อป้องกัน history rewrite
   - ป้องกัน accidental data loss

7. **Require signed commits** (Optional)
   - GPG signing for commits
   - Verify commit authenticity

### Recommended Branch Structure

```
main (Protected)
  ├── develop (Optional - Protected)
  ├── feature/* (Topic branches)
  ├── hotfix/* (Urgent fixes)
  └── release/* (Release preparation)
```

**Workflow:**
1. Create feature branch from develop
2. Work on feature
3. Create PR to develop
4. Code review
5. Merge to develop
6. Test on develop
7. Create PR from develop to main
8. Final review
9. Merge to main

---

## 🔍 Pre-commit Hooks

### What They Do

Pre-commit hooks ตรวจสอบ code ก่อน commit:
- 🔒 Check for secrets/patterns
- 🧹 Run linting
- ✨ Format code
- 🧪 Run tests (if configured)

### Installed Hooks

**.husky/pre-commit:**
```bash
# Check for secrets (AIza, sk_, AKIA, etc.)
# Check for .env files
# Run lint-staged
```

**Secret Patterns Checked:**
- Google API Keys (`AIza...`)
- AWS Keys (`AKIA...`)
- Stripe Keys (`sk_...`)
- GitHub Tokens (`ghp_...`)
- Slack Tokens (`xox...`)
- Passwords, secrets, tokens
- API keys
- Private keys

### How It Works

1. Developer runs `git add` and `git commit`
2. Pre-commit hook runs automatically
3. If secrets found → COMMIT BLOCKED
4. If no secrets → Runs lint-staged
5. If lint passes → COMMIT ALLOWED

### Testing the Hook

```bash
# Test by trying to add a file with secret
echo "API_KEY=AIzaSyBZz2QI4hb2FAVjhhNCP8rARVo_zlv7_KA" > test.txt
git add test.txt
git commit -m "Test"

# Expected: COMMIT BLOCKED with error message
```

### Disabling the Hook (NOT RECOMMENDED)

```bash
# Only for emergencies
git commit --no-verify
```

---

## 🔎 Secrets in Code

### Patterns to Avoid

❌ **NEVER commit:**
```javascript
const apiKey = "AIzaSyBZz2QI4hb2FAVjhhNCP8rARVo_zlv7_KA"; // ❌
const secret = "my-secret-password"; // ❌
const token = "ghp_1234567890abcdef"; // ❌
```

✅ **USE instead:**
```javascript
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY; // ✅
```

### Safe Patterns

✅ **Firebase SDK URLs (Public):**
```javascript
// These are public CDN URLs - safe to commit
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
```

✅ **YouTube URLs (Public):**
```javascript
// Public URLs - safe to commit
const embedUrl = `https://www.youtube.com/embed/${videoId}`;
const thumbnail = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
```

✅ **Function Names (Not Secrets):**
```javascript
// Function names - safe to commit
await signInWithEmailAndPassword(auth, email, password);
await sendPasswordResetEmail(auth, email);
```

---

## 🚨 Emergency Procedures

### Secret Leaked in Repository

**If a secret is committed:**

1. **IMMEDIATE ACTIONS:**
   ```bash
   # Revoke the leaked key immediately
   # In Firebase Console: Settings → General → Regenerate key
   # In AWS Console: IAM → Access Keys → Delete/Create new
   # In GitHub Settings: Personal access tokens → Revoke
   ```

2. **Remove from Repository:**
   ```bash
   # Remove file
   git rm path/to/file

   # Commit removal
   git commit -m "Remove leaked credentials"

   # Push
   git push
   ```

3. **Purge History (If Public Repo):**
   ```bash
   # Option 1: BFG Repo-Cleaner (Recommended)
   java -jar bfg.jar --delete-files path/to/file
   git push --force

   # Option 2: git filter-repo
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/file"

   # Option 3: Make repository private temporarily
   ```

4. **Rotate All Keys:**
   - Firebase API keys
   - Service account keys
   - Database passwords
   - API tokens

5. **Notify Team:**
   - Alert all developers
   - Update their local .env files
   - Rotate tokens in CI/CD

### Compromised Account

**If account is compromised:**

1. **Change Password:**
   - GitHub account password
   - Email account password
   - Firebase account password

2. **Enable 2FA:**
   - GitHub: Settings → Security → Two-factor authentication
   - Email: Enable 2FA
   - Firebase: Enable additional verification

3. **Review Access:**
   - Check GitHub authorized apps
   - Check Firebase connected apps
   - Revoke unauthorized access

4. **Audit Recent Activity:**
   - Check recent commits
   - Check deployment logs
   - Check access logs

---

## 🔧 Security Tools

### Recommended Tools

**For Local Development:**
- **dotenv** - Manage environment variables
- **husky** - Git hooks
- **lint-staged** - Run linters on staged files

**For Repository Security:**
- **GitHub Secret Scanning** - Automatically scans for secrets
- **GitGuardian** - Scan for secrets in code
- **TruffleHog** - Find secrets in code

**For CI/CD:**
- **GitHub Actions Secrets** - Store secrets securely
- **Secret Scanning in CI** - Scan before deploy

### Installing Tools (Optional)

```bash
# GitGuardian
brew install gitleaks  # Mac
# or
winget install gitleaks  # Windows

# TruffleHog
npm install -g trufflehog

# Git Secrets
brew install git-secrets  # Mac
# or
choco install git-secrets  # Windows
```

---

## 📚 Security Best Practices

### DO's

✅ Use environment variables
✅ Keep .gitignore updated
✅ Enable pre-commit hooks
✅ Rotate keys regularly
✅ Use branch protection
✅ Enable 2FA on all accounts
✅ Review access logs
✅ Keep secrets in CI/CD only
✅ Use secret management tools

### DON'Ts

❌ Commit secrets to repository
❌ Hardcode credentials in code
❌ Share secrets via chat/email
❌ Use weak passwords
❌ Disable security checks
❌ Push directly to main
❌ Ignore security warnings
❌ Leave old credentials in code

---

## 🎯 Quick Reference

### Quick Security Check

```bash
# Check for .env files
git ls-files | grep "\.env"

# Check gitignore
cat .gitignore | grep -E "env|secret|key"

# Check staged files for secrets
git diff --cached --name-only

# Run pre-commit hook manually
npx husky run pre-commit
```

### Revoke Firebase Key

1. Firebase Console → Project Settings → General
2. Web App → Config → Gear icon
3. Regenerate API key
4. Update .env.local locally
5. Update CI/CD secrets

---

## 📞 Reporting Security Issues

**If you find a security vulnerability:**

1. **Do NOT** create a public issue
2. **DO NOT** disclose publicly
3. **Contact security team:**
   - Email: security@duydodee.com
   - Private message via GitHub

---

**Last Updated:** 2026-01-XX
**Maintained by:** Security Team
