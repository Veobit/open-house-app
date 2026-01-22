# Deployment Guide

This document covers all deployment configurations for the Open House Registration App.

## Deployment Overview

| Platform | URL | Auto-Deploy | Purpose |
|----------|-----|-------------|---------|
| Firebase Hosting | https://open-house-app-51.web.app | GitHub Actions on push to `main` | Primary hosting |
| Vercel | https://openhouse.veobit.com | Manual via CLI | Custom domain |

## Environment Variables

The app requires these Firebase environment variables:

| Variable | Where to Find |
|----------|---------------|
| `REACT_APP_FIREBASE_API_KEY` | Firebase Console → Project Settings → Web app |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | `{project-id}.firebaseapp.com` |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase Console → Project Settings |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | `{project-id}.firebasestorage.app` |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console → Project Settings |
| `REACT_APP_FIREBASE_APP_ID` | Firebase Console → Project Settings → Web app |

**Get all values from:** https://console.firebase.google.com/project/open-house-app-51/settings/general

Or copy from local `.env` file (not committed to git).

### Local Development
These are stored in `.env` file (not committed to git).

### GitHub Actions
These are stored as **Repository Secrets** in GitHub:
- Settings → Secrets and variables → Actions → Repository secrets

### Vercel
These are stored as **Environment Variables** in Vercel project settings.

---

## Firebase Hosting Deployment

### Automatic Deployment (GitHub Actions)
Pushes to `main` branch automatically trigger deployment via `.github/workflows/firebase-deploy.yml`.

### Manual Deployment
```bash
npm run build
npx firebase deploy --only hosting --project open-house-app-51
```

### GitHub Actions Workflow
Location: `.github/workflows/firebase-deploy.yml`

Required GitHub Secrets:
- `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`

---

## Vercel Deployment (openhouse.veobit.com)

### Project Details
- **Vercel Project Name**: `veobit-openhouse`
- **Domain**: `openhouse.veobit.com`
- **GitHub Repo**: Connected to `Veobit/open-house-app`

### IMPORTANT: Correct Project Linking
The CLI must be linked to the correct Vercel project:

```bash
# Check current project
cat .vercel/project.json

# If wrong project, remove and relink
rm -rf .vercel
npx vercel link --project veobit-openhouse --yes
```

### Deploy to Vercel
```bash
# Standard deployment
npx vercel --prod --yes

# Force fresh build (no cache)
npx vercel --prod --yes --force
```

### Managing Environment Variables
```bash
# List all env vars
npx vercel env ls

# Add/Update an env var (get VALUE from .env file)
printf "VALUE" | npx vercel env add VAR_NAME production --force
```

### Update All Vercel Environment Variables
Get values from local `.env` file, then run:

```bash
# Copy values from .env file for each variable
printf "<API_KEY_FROM_ENV>" | npx vercel env add REACT_APP_FIREBASE_API_KEY production --force
printf "<AUTH_DOMAIN_FROM_ENV>" | npx vercel env add REACT_APP_FIREBASE_AUTH_DOMAIN production --force
printf "<PROJECT_ID_FROM_ENV>" | npx vercel env add REACT_APP_FIREBASE_PROJECT_ID production --force
printf "<STORAGE_BUCKET_FROM_ENV>" | npx vercel env add REACT_APP_FIREBASE_STORAGE_BUCKET production --force
printf "<MESSAGING_SENDER_ID_FROM_ENV>" | npx vercel env add REACT_APP_FIREBASE_MESSAGING_SENDER_ID production --force
printf "<APP_ID_FROM_ENV>" | npx vercel env add REACT_APP_FIREBASE_APP_ID production --force
```

Then redeploy:
```bash
npx vercel --prod --yes --force
```

---

## Google Cloud API Key Configuration

### Console URL
https://console.cloud.google.com/apis/credentials?project=open-house-app-51

### Required API Restrictions
The "Browser key (auto created by Firebase)" must have these APIs enabled:

**CRITICAL - Identity Toolkit API must be included!**

Required APIs:
- Identity Toolkit API (REQUIRED for Firebase Auth)
- Firebase Realtime Database Management API
- Firebase Hosting API
- Firebase Rules API
- Cloud Firestore API
- Firebase Cloud Messaging API
- Firebase Installations API
- Token Service API

### Adding Identity Toolkit API
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Click on "Browser key (auto created by Firebase)"
3. Under "API restrictions" → Select "Restrict key"
4. Click the dropdown and check "Identity Toolkit API"
5. Click "OK" then "Save"

---

## Firebase Authentication - Authorized Domains

### Console URL
https://console.firebase.google.com/project/open-house-app-51/authentication/settings

### Required Domains
These domains must be in the "Authorized domains" list:
- `localhost` (default)
- `open-house-app-51.firebaseapp.com` (default)
- `open-house-app-51.web.app` (default)
- `openhouse.veobit.com` (custom)
- `veobit-openhouse.vercel.app` (custom)

---

## Troubleshooting

### Error: "auth/api-key-not-valid"

**Causes:**
1. Missing environment variables
2. Identity Toolkit API not enabled in Google Cloud
3. Wrong Vercel project (env vars on different project)

**Solutions:**
1. Verify env vars are set: `npx vercel env ls`
2. Add Identity Toolkit API in Google Cloud Console
3. Ensure linked to correct project: `cat .vercel/project.json` should show `veobit-openhouse`

### Error: GitHub Actions workflow fails with Node.js version error

**Solution:** Update `.github/workflows/firebase-deploy.yml` to use Node.js 20:
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
```

### Error: GitHub push rejected for workflow file

**Cause:** Personal Access Token lacks `workflow` scope.

**Solution:** Update workflow file directly on GitHub:
https://github.com/Veobit/open-house-app/edit/main/.github/workflows/firebase-deploy.yml

### Vercel deployment not updating

**Causes:**
1. Deploying to wrong project
2. Build cache issues

**Solutions:**
1. Check project: `cat .vercel/project.json`
2. Relink if needed: `rm -rf .vercel && npx vercel link --project veobit-openhouse --yes`
3. Force fresh build: `npx vercel --prod --yes --force`

### Firebase Hosting not loading

**Check:**
1. Deployment status: `curl -sI https://open-house-app-51.web.app`
2. GitHub Actions status: https://github.com/Veobit/open-house-app/actions

---

## Quick Reference Commands

```bash
# Local development
npm start

# Build locally
npm run build

# Deploy to Firebase manually
npx firebase deploy --only hosting --project open-house-app-51

# Deploy Firestore rules
npx firebase deploy --only firestore:rules --project open-house-app-51

# Deploy to Vercel
npx vercel --prod --yes --force

# Check Vercel project
cat .vercel/project.json

# List Vercel env vars
npx vercel env ls

# Check GitHub Actions
curl -s "https://api.github.com/repos/Veobit/open-house-app/actions/runs?per_page=1" | jq '.workflow_runs[0] | {status, conclusion}'
```

---

## Repository Links

- **GitHub**: https://github.com/Veobit/open-house-app
- **Firebase Console**: https://console.firebase.google.com/project/open-house-app-51
- **Vercel Dashboard**: https://vercel.com/veobits-projects/veobit-openhouse
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials?project=open-house-app-51

---

## Security Note

Firebase API keys are designed to be public (embedded in client-side JavaScript). Security is enforced via:
1. **Firestore Security Rules** - Control data access
2. **API Key Restrictions** - Limit which APIs the key can call
3. **Authorized Domains** - Restrict which domains can use Firebase Auth

Never commit sensitive secrets like service account keys or database passwords to the repository.
