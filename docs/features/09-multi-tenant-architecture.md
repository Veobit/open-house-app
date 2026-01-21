# Multi-Tenant Architecture

The Multi-Tenant Architecture ensures each realtor has completely isolated data - their own properties, settings, guests, and email records.

## Overview

Each realtor who signs up gets their own isolated data space. Realtor A cannot see or access Realtor B's data. This is enforced at both the application level and the Firestore security rules level.

## Data Structure

### Firestore Paths

```
users/
├── {realtorA_userId}/
│   ├── properties/
│   │   ├── {propertyId1}/
│   │   │   ├── settings/appSettings    ← Property-specific settings
│   │   │   └── guests/
│   │   │       ├── {guestId1}
│   │   │       └── {guestId2}
│   │   └── {propertyId2}/
│   │       ├── settings/appSettings
│   │       └── guests/
│   │           └── ...
│   └── mail/
│       └── {mailId}                    ← Email records
│
├── {realtorB_userId}/
│   ├── properties/
│   │   └── ...                         ← Completely separate data
│   └── mail/
│       └── ...
```

### Example Paths

| Data | Path |
|------|------|
| Realtor's property | `users/{userId}/properties/{propertyId}` |
| Property settings | `users/{userId}/properties/{propertyId}/settings/appSettings` |
| Property guest | `users/{userId}/properties/{propertyId}/guests/{guestId}` |
| Realtor's email | `users/{userId}/mail/{mailId}` |

## How It Works

### 1. Realtor Registration Flow

1. Realtor visits the app
2. Clicks **Admin** → Signs in with Google or Email/Password
3. First login creates their user space in Firestore
4. System creates first property automatically (or migrates legacy data)
5. Realtor configures their property settings (address, photos, etc.)

### 2. QR Code Generation

When a realtor generates a QR code:
- URL includes both user ID and property ID: `https://app.com?r={userId}&p={propertyId}`
- This ensures guests register to the correct realtor AND correct property

**Example URL:**
```
https://open-house-app-51.web.app?r=abc123xyz789&p=prop456def
```

### 3. Guest Registration Flow

1. Guest scans QR code with `?r={realtorId}&p={propertyId}` parameters
2. App loads that specific property's settings (branding, photos)
3. Guest fills out registration form
4. Data saved to `users/{realtorId}/properties/{propertyId}/guests/{guestId}`
5. Confirmation email created at `users/{realtorId}/mail/{mailId}`

### 4. Admin Dashboard

When a realtor logs in:
- App identifies them by `currentUser.uid`
- Loads their properties from `users/{their_uid}/properties`
- Shows property selector dropdown
- Loads selected property's settings and guests
- They can only see and edit their own data

## Security Rules

Firestore rules enforce data isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      match /properties/{propertyId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;

        match /settings/{document=**} {
          allow read: if true;
          allow write: if request.auth != null && request.auth.uid == userId;
        }

        match /guests/{guestId} {
          allow create: if true;
          allow read, update, delete: if request.auth != null && request.auth.uid == userId;
        }
      }

      match /mail/{document=**} {
        allow create: if true;
        allow read, delete: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### Rule Breakdown

| Operation | Who Can Do It | Why |
|-----------|---------------|-----|
| Read property settings | Anyone | Guests need to see property info on registration page |
| Write property settings | Owner only | Only realtor can edit their own settings |
| Create property | Owner only | Only realtor can create properties |
| Create guest | Anyone | Public registration via QR code |
| Read/Edit/Delete guest | Owner only | Only realtor sees their guest list |
| Create mail | Anyone | Triggered by guest registration |
| Read/Delete mail | Owner only | Only realtor sees their email records |

## URL Parameters

The URL parameters are critical for routing guests to the correct realtor and property:

| URL | Behavior |
|-----|----------|
| `app.com?r=abc123&p=xyz789` | Guest registers to specific property |
| `app.com?r=abc123` | Loads first property for that realtor |
| `app.com` (logged in) | Uses current user's ID and selected property |
| `app.com` (not logged in) | Shows error - invalid registration link |

## Data Isolation Guarantees

1. **Application Level:** Queries always filter by `currentUser.uid`
2. **Database Level:** Firestore rules block unauthorized access
3. **URL Level:** QR codes encode the specific realtor's ID and property ID
4. **Property Level:** Each property has isolated guests and settings

Even if someone modifies client-side code, Firestore rules prevent:
- Reading another realtor's guests
- Reading another realtor's properties
- Modifying another realtor's settings
- Deleting another realtor's data

## Technical Implementation

### Key State Variables

```javascript
const [currentUser, setCurrentUser] = useState(null);
const [realtorId, setRealtorId] = useState(null);
const [properties, setProperties] = useState([]);
const [activePropertyId, setActivePropertyId] = useState(null);
const [propertyId, setPropertyId] = useState(null);
```

### Data Loading

```javascript
const loadUserData = async (userId) => {
  const propertiesSnapshot = await getDocs(
    collection(db, 'users', userId, 'properties')
  );
  // Load properties list
  // Select first property
  // Load property settings and guests
};

const loadPropertyData = async (userId, propId) => {
  const settingsDoc = await getDoc(
    doc(db, 'users', userId, 'properties', propId, 'settings', 'appSettings')
  );
  const guestsSnapshot = await getDocs(
    collection(db, 'users', userId, 'properties', propId, 'guests')
  );
};
```

### Data Saving

```javascript
await setDoc(
  doc(db, 'users', currentUser.uid, 'properties', activePropertyId, 'settings', 'appSettings'),
  settings
);

const targetUserId = realtorId || currentUser.uid;
const targetPropertyId = propertyId || activePropertyId;
await addDoc(
  collection(db, 'users', targetUserId, 'properties', targetPropertyId, 'guests'),
  guestData
);
```

## Viewing Data in Firebase Console

1. Go to: https://console.firebase.google.com/project/open-house-app-51/firestore
2. Click on `users` collection
3. Click on a user ID
4. Click on `properties` subcollection
5. Click on a property ID
6. View `settings` and `guests` subcollections

## Best Practices

1. **Always share QR codes** - Don't share plain URLs without the parameters
2. **Test with QR code** - Use the generated QR code to test guest registration
3. **Check Firebase Console** - Verify data is going to the correct path
4. **Don't share credentials** - Each realtor should have their own account
5. **Use property selector** - Always verify correct property is selected before sharing QR code

## Troubleshooting

### "Invalid registration link" Error
- URL is missing `?r=` parameter
- Solution: Use the QR code or add `?r={userId}&p={propertyId}` to URL

### Guest Not Appearing in Dashboard
- Guest may have registered to wrong property
- Check the URL used for registration
- Verify in Firebase Console which property path has the guest

### Settings Not Saving
- User may not be logged in
- Check browser console for permission errors
- Verify Firestore rules are deployed

### Wrong Property Showing
- Check activePropertyId in browser dev tools
- Verify property selector shows correct property
- Refresh page and re-select property
