# 🔥 Firebase API Key Setup Guide

## 🚨 Current Issue
The application is showing Firebase authentication errors because the API key is still set to the placeholder value `your_api_key_here`.

## 🔧 How to Fix Firebase API Key

### Step 1: Get Your Firebase API Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `duydodeesport`
3. Click on the gear icon ⚙️ (Settings) → Project settings
4. Scroll down to "Your apps" section
5. Find your web app configuration
6. Copy the `apiKey` value

### Step 2: Update Environment Variables

#### Option A: Create `.env.local` file
```bash
# Copy the example file
cp .env.example .env.local
```

#### Option B: Edit existing `.env.local` file
```bash
# Edit the file
notepad .env.local
```

### Step 3: Replace the API Key

In your `.env.local` file, find this line:
```bash
VITE_FIREBASE_API_KEY=your_api_key_here
```

Replace it with your actual API key:
```bash
VITE_FIREBASE_API_KEY=AIzaSyC-YourActualApiKeyHere
```

### Step 4: Complete `.env.local` Example

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC-YourActualApiKeyHere
VITE_FIREBASE_AUTH_DOMAIN=duydodeesport.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=duydodeesport
VITE_FIREBASE_STORAGE_BUCKET=duydodeesport.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=30514101130
VITE_FIREBASE_APP_ID=1:30514101130:web:1ec44f2b09367468132e49
VITE_FIREBASE_MEASUREMENT_ID=G-7EC2RQZH22

# Site Configuration
VITE_SITE_URL=https://duydodee.web.app
VITE_SITE_NAME=DUYDODEE PREMIUM
VITE_SITE_DESCRIPTION=แพลตฟอร์มสตรีมมิ่ง 4K HDR ระดับพรีเมียม
VITE_SITE_KEYWORDS=streaming,4K,HDR,movies,series,premium

# Feature Flags
VITE_ENABLE_DEBUG=false
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

### Step 5: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## 🔍 Verify the Fix

After updating the API key:

1. **Check the browser console** - Firebase errors should disappear
2. **Test authentication** - Try logging in with Google or email
3. **Check network requests** - API calls to Firebase should succeed

## ⚠️ Important Security Notes

- **NEVER commit `.env.local` to Git** - It's already in `.gitignore`
- **Keep your API key secret** - Don't share it publicly
- **Use different keys for different environments** - Development vs Production
- **Rotate keys if compromised** - Generate new keys from Firebase Console

## 🆘 Troubleshooting

### Still getting API key errors?

1. **Clear browser cache**
   ```bash
   # In browser: Ctrl+Shift+Delete
   # Clear cache and cookies
   ```

2. **Restart development server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. **Check environment variable loading**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Type: `import.meta.env.VITE_FIREBASE_API_KEY`
   - Should show your actual API key, not placeholder

4. **Verify Firebase project configuration**
   - Ensure project ID matches: `duydodeesport`
   - Check that Firebase Auth is enabled in console
   - Verify Google sign-in provider is enabled

### Need a new API key?

1. Go to Firebase Console → Project Settings
2. Scroll to "Your apps" section
3. Click on your web app
4. Choose "Config" option
5. Copy the new configuration

## 📞 Additional Help

If you're still having issues:
- Check Firebase Console for project status
- Verify Firebase services are enabled
- Review Firebase documentation: https://firebase.google.com/docs

---

**Remember**: The API key must be replaced for the application to work properly!