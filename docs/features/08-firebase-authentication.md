# Firebase Authentication

The Firebase Authentication feature provides secure admin login using Google Sign-In or email/password authentication.

## Overview

Admin access is protected by Firebase Authentication, replacing the previous hardcoded password system. Administrators can sign in with their Google account (recommended) or with email/password credentials.

## Sign-In Methods

### Google Sign-In (Recommended)
- One-click login using your Google account
- No password to remember
- Automatic session management
- Most secure option

### Email/Password
- Traditional email and password login
- Admin accounts must be created in Firebase Console
- Includes "Forgot Password" functionality
- Useful as a backup option

## Accessing Admin

1. Click the **Admin** button on the registration page
2. Choose your sign-in method:
   - Click **Sign in with Google** (recommended)
   - Or enter email/password and click **Login**
3. You'll be redirected to the Admin Dashboard

## Session Persistence

- Login state persists across page refreshes
- No need to re-login when reopening the browser
- Session is managed securely by Firebase

## Logout

1. From the Admin Dashboard, click the **Logout** button
2. You'll be returned to the public registration page
3. Session is cleared from the browser

## Forgot Password

If you forget your email/password login credentials:

1. Click **Admin** to go to the login page
2. Click **Forgot password?** link below the password field
3. Enter your email address
4. Click **Send Reset Email**
5. Check your inbox for the reset link
6. Click the link and set a new password
7. Return to the app and login with your new password

Note: Password reset only works for Email/Password accounts, not Google Sign-In.

## Creating Admin Users

### For Google Sign-In
No setup required - any Google account can sign in.

To restrict access to specific users:
1. Share the admin URL only with authorized people
2. Or implement an allowlist (future enhancement)

### For Email/Password
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → Authentication → Users
3. Click **Add user**
4. Enter the admin's email and password
5. Share credentials with the admin

## Security Features

### Firestore Security Rules
Admin operations are protected by authentication:

```javascript
// Settings - public read, authenticated write
match /settings/{document=**} {
  allow read: if true;
  allow write: if request.auth != null;
}

// Guests - public create, authenticated for other operations
match /guests/{guestId} {
  allow create: if true;
  allow read, update, delete: if request.auth != null;
}
```

### What's Protected
| Operation | Requires Auth |
|-----------|---------------|
| View registration form | No |
| Submit registration | No |
| View guest list | Yes |
| Edit/delete guests | Yes |
| Modify settings | Yes |
| Export CSV | Yes |

## Technical Implementation

**Files Modified:**
- `src/firebase.js` - Firebase Auth initialization
- `src/App.js` - Auth state management and UI
- `firestore.rules` - Security rules

**Key Functions:**
- `handleGoogleSignIn()` - Google popup sign-in
- `handleAdminLogin()` - Email/password sign-in
- `handleLogout()` - Sign out user
- `onAuthStateChanged()` - Auth state listener

**State Variables:**
- `adminLoggedIn` - Boolean for auth status
- `authLoading` - Loading state during auth check
- `loginEmail` - Email input value
- `loginPassword` - Password input value
- `loginError` - Error message display

## Firebase Console Setup

### Enable Authentication
1. Go to Firebase Console → Authentication
2. Click **Get Started**
3. Enable **Email/Password** provider
4. Enable **Google** provider

### Configure Google Sign-In
1. Authentication → Sign-in method → Google
2. Enable the toggle
3. Set project name and support email
4. Save

### Authorized Domains
Ensure these domains are listed in Authentication → Settings → Authorized domains:
- `localhost` (for development)
- `your-domain.com` (for production)

## Troubleshooting

### Google Sign-In Failed
1. Check browser console for error details
2. Verify API key in `.env` matches Firebase Console
3. Ensure `localhost` is in authorized domains
4. Check that Google provider is enabled

### API Key Not Valid
1. Go to Firebase Console → Project Settings
2. Copy the correct `apiKey` from your web app config
3. Update `.env` file
4. Restart the development server

### Session Not Persisting
1. Check for browser privacy/incognito mode
2. Ensure cookies are enabled
3. Clear browser cache and try again

## Best Practices

1. **Use Google Sign-In** - More secure and convenient
2. **Limit Admin Access** - Only share admin URL with authorized users
3. **Monitor Users** - Check Firebase Console → Authentication → Users periodically
4. **Review Security Rules** - Ensure rules match your security requirements
