# Service Account Key Setup Guide

## ⚠️ IMPORTANT SECURITY NOTICE

**NEVER commit the real `serviceAccountKey.json` file to Git!** This file contains sensitive credentials that could compromise your Firebase project.

## Setup Instructions

### 1. Create Service Account in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save the downloaded JSON file as `serviceAccountKey.json`

### 2. Place the File

Put the `serviceAccountKey.json` file in the root directory of your project (same level as package.json).

### 3. Add to .gitignore

Ensure `serviceAccountKey.json` is in your `.gitignore` file:

```
serviceAccountKey.json
```

### 4. Environment-Specific Keys

For different environments (staging/production), use environment-specific service accounts:

- Development: Use development service account
- Staging: Use staging service account  
- Production: Use production service account

### 5. GitHub Actions Setup

For CI/CD pipelines, store the service account key as a GitHub Secret:

1. Go to your GitHub repository settings
2. Navigate to Secrets and variables → Actions
3. Add a new secret named `FIREBASE_SERVICE_ACCOUNT_KEY`
4. Paste the entire JSON content as the secret value

### 6. Usage in Code

```javascript
// Only load service account in server-side environments
if (typeof window === 'undefined') {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
```

## Security Best Practices

- ✅ Use different service accounts for different environments
- ✅ Rotate service account keys regularly
- ✅ Apply principle of least privilege to service accounts
- ✅ Monitor service account usage in Google Cloud Console
- ❌ Never commit service account keys to version control
- ❌ Never share service account keys via email/chat
- ❌ Never hardcode service account keys in source code

## Troubleshooting

### Permission Denied Errors
If you encounter permission errors, ensure your service account has the necessary Firebase roles:
- Firebase Admin SDK Administrator
- Cloud Firestore Admin
- Firebase Authentication Admin

### Key Expiration
Service account keys don't expire, but you should:
- Rotate them annually or when compromised
- Delete unused service accounts
- Monitor for suspicious activity

## Recovery

If your service account key is accidentally committed:
1. Immediately delete the key from Firebase Console
2. Generate a new key
3. Revoke the compromised key
4. Rotate all related credentials
5. Audit your project for unauthorized access
