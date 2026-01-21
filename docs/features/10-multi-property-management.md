# Multi-Property Management

The Multi-Property Management feature allows realtors to manage multiple open house properties within a single account. Each property has its own settings, guest list, and QR code.

## Overview

Realtors often host multiple open houses simultaneously or across different time periods. This feature enables them to:
- Create and manage multiple properties
- Switch between properties in the dashboard
- Generate unique QR codes for each property
- Track guests separately per property
- Maintain independent settings for each property

## Features

### Property Management
- **Create Properties** - Add new properties with a name/address
- **Switch Properties** - Dropdown selector to switch between properties
- **Manage Properties** - View all properties, delete duplicates, remove properties
- **Property-Specific Settings** - Each property has its own welcome message, photos, and branding

### Property Selector
Located in the admin dashboard header:
- Dropdown showing all properties
- "Add" button to create new properties
- "Manage" button to view/delete properties
- Auto-loads property data when switching

### QR Code Generation
Each property gets a unique registration URL:
```
https://your-app.com?r={realtorId}&p={propertyId}
```
- QR codes include both realtor ID and property ID
- Guests register directly to the correct property
- No cross-contamination between property guest lists

## Data Structure

### Firestore Paths
```
users/{userId}/
├── properties/{propertyId}/
│   ├── settings/appSettings     ← Property-specific settings
│   └── guests/{guestId}         ← Property-specific guests
└── mail/{mailId}                ← All emails (shared)
```

### Property Document
```javascript
{
  name: "169 Hamburg Tpke, Bloomingdale, NJ",
  createdAt: "2024-01-18T10:30:00.000Z"
}
```

### Property Settings Document
```javascript
{
  welcomeMessage: "Welcome to Our Open House!",
  propertyAddress: "169 Hamburg Tpke, Bloomingdale, NJ",
  housePhoto: "base64-encoded-image...",
  logo: "base64-encoded-image...",
  realtorPhoto: "base64-encoded-image...",
  realtorName: "Jane Smith",
  realtorPhone: "(555) 123-4567",
  realtorEmail: "jane@example.com",
  emailTemplate: "Thank you for visiting..."
}
```

## User Flows

### Creating a New Property
```
1. Admin clicks "+ Add" button
2. Modal appears with name input
3. Admin enters property name/address
4. Clicks "Create Property"
5. Property is created with default settings
6. Property is auto-selected in dropdown
7. Admin can configure settings for new property
```

### Switching Between Properties
```
1. Admin clicks property dropdown
2. Selects different property
3. Dashboard loads that property's settings
4. Guest list updates to show that property's guests
5. QR code updates to that property's URL
```

### Viewing Registration Page
```
1. Admin selects property in dropdown
2. Clicks "View Page" button
3. Registration page displays selected property's:
   - Welcome message
   - Property address
   - Logo and photos
   - Realtor information
```

### Guest Registration (Public)
```
1. Guest scans QR code with ?r={realtorId}&p={propertyId}
2. App loads that specific property's settings
3. Registration page displays property branding
4. Guest submits registration
5. Guest data saved to that property's guests collection
6. Confirmation email sent with property details
```

## URL Parameters

| Parameter | Description | Required |
|-----------|-------------|----------|
| `r` | Realtor ID (user UID) | Yes |
| `p` | Property ID | Recommended |

**URL Examples:**
```
# Full URL with property ID
https://open-house-app.web.app?r=abc123&p=xyz789

# Legacy URL (loads first property)
https://open-house-app.web.app?r=abc123
```

## Security Rules

```javascript
match /users/{userId}/properties/{propertyId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;

  match /settings/{document=**} {
    allow read: if true;  // Public for registration page
    allow write: if request.auth != null && request.auth.uid == userId;
  }

  match /guests/{guestId} {
    allow create: if true;  // Public registration
    allow read, update, delete: if request.auth != null && request.auth.uid == userId;
  }
}
```

## Migration

### Automatic Migration for Existing Users
When an existing user (with single-property data) logs in:
1. System checks for `properties` collection
2. If empty, checks for legacy `settings/appSettings`
3. Creates first property with legacy data
4. Migrates guests to new property structure
5. User continues seamlessly with multi-property support

### Legacy Data Paths
```
# Old structure (single property)
users/{userId}/settings/appSettings
users/{userId}/guests/{guestId}

# New structure (multi-property)
users/{userId}/properties/{propertyId}/settings/appSettings
users/{userId}/properties/{propertyId}/guests/{guestId}
```

## UI Components

### Property Selector (Dashboard Header)
- Building icon with "Property:" label
- Dropdown select with all properties
- "+ Add" button (indigo/purple)
- "Manage" button (gray outline)

### Add Property Modal
- Property name input field
- "Cancel" and "Create Property" buttons
- Loading state during creation
- Auto-closes on success

### Manage Properties Modal
- List of all properties
- Delete button for each property
- "Delete All Duplicates" button for cleanup
- Confirmation before deletion
- Cannot delete last property

## State Management

### Key State Variables
```javascript
const [properties, setProperties] = useState([]);
const [activePropertyId, setActivePropertyId] = useState(null);
const [propertyId, setPropertyId] = useState(null);  // From URL
const [showPropertyModal, setShowPropertyModal] = useState(false);
const [showManagePropertiesModal, setShowManagePropertiesModal] = useState(false);
```

### Key Functions
| Function | Purpose |
|----------|---------|
| `loadUserData()` | Load all properties on login |
| `loadPropertyData()` | Load specific property's settings/guests |
| `switchProperty()` | Change active property |
| `createProperty()` | Add new property |
| `deleteProperty()` | Remove property and its data |
| `deleteDuplicateProperties()` | Bulk remove duplicate properties |

## Best Practices

1. **Always use QR codes** - Share QR codes that include the property ID
2. **Name properties clearly** - Use full addresses for easy identification
3. **Test with QR code** - Scan the QR code to verify correct property loads
4. **Check Firebase Console** - Verify data is in correct property path
5. **One property at a time** - Edit and save settings before switching

## Troubleshooting

### Wrong property showing on registration page
- Verify URL has correct `?p=` parameter
- Use QR code instead of manual URL
- Check if property settings are saved

### Guest registered to wrong property
- Check the URL used for registration
- Verify in Firebase Console which property has the guest
- Move guest data manually if needed

### Settings not saving
- Ensure you're logged in
- Check browser console for errors
- Verify Firestore rules are deployed

### Duplicate properties appearing
- Use "Manage" button to view all properties
- Click "Delete All Duplicates" to clean up
- Only keeps first instance of each name

## Technical Implementation

**File:** `src/App.js`

**Key Functions:**
- `loadPropertyData()` - Load property settings and guests
- `switchProperty()` - Handle property selection change
- `createProperty()` - Create new property with defaults
- `deleteProperty()` - Delete property and all subcollections
- `getRegistrationUrl()` - Generate URL with realtor and property IDs

**Firestore Operations:**
- Collection: `users/{userId}/properties`
- Subcollection: `properties/{propertyId}/settings`
- Subcollection: `properties/{propertyId}/guests`
