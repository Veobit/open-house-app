# Settings Management

The Settings Management feature allows administrators to customize the appearance and content of the Open House registration page.

## Overview

All settings are stored in Firebase Firestore and can be edited through the Admin Dashboard. Changes take effect immediately after saving.

## Accessing Settings

1. Login to Admin Dashboard
2. Navigate to the **Settings** panel (left side)
3. Click **Edit** to enable editing mode
4. Make changes
5. Click **Save** to apply changes

## Configurable Settings

### Welcome Message
- **Description:** Main heading displayed on the registration page
- **Default:** "Welcome to Our Open House!"
- **Character Limit:** Recommended under 50 characters for best display

### Property Address
- **Description:** Property location displayed below the welcome message
- **Format:** Full address (e.g., "123 Main Street, City, State 12345")
- **Usage:** Also used in email templates with `[ADDRESS]` placeholder

### Logo
- **Description:** Company/brokerage logo displayed on registration page
- **Format:** Image file (PNG, JPG, etc.)
- **Size:** Automatically compressed to ~150KB
- **Display:** Shows in a white rounded container

### Realtor Photo
- **Description:** Headshot of the hosting realtor
- **Format:** Image file (PNG, JPG, etc.)
- **Size:** Automatically compressed to ~150KB
- **Display:** Circular crop, displayed with "Hosted by" label

### House Photo
- **Description:** Background image for the registration page
- **Format:** Image file (PNG, JPG, etc.)
- **Size:** Automatically compressed to ~400KB
- **Display:** Full-screen background with gradient overlay

### Realtor Name
- **Description:** Name of the hosting realtor
- **Usage:** Displayed below realtor photo; used in email templates with `[REALTOR_NAME]`

### Realtor Email
- **Description:** Contact email for the realtor
- **Usage:** Displayed at bottom of registration page; used for email reply-to

### Email Template
- **Description:** Content of the confirmation email sent to guests
- **Placeholders:**
  - `[DATE]` - Registration date
  - `[TIME]` - Registration time
  - `[ADDRESS]` - Property address
  - `[REALTOR_NAME]` - Realtor's name

## Image Handling

### Automatic Compression
All uploaded images are automatically compressed to stay within Firestore's 1MB document limit:

| Image Type | Max Size | Max Dimensions |
|------------|----------|----------------|
| Logo | 150KB | 1920px |
| Realtor Photo | 150KB | 1920px |
| House Photo | 400KB | 1920px |

### Re-compression on Edit
When entering edit mode, existing images that exceed size limits are automatically re-compressed.

### Supported Formats
- PNG
- JPG/JPEG
- GIF
- WebP

## Data Storage

Settings are stored in Firebase Firestore at `settings/appSettings`:

```javascript
{
  welcomeMessage: "Welcome to Our Open House!",
  propertyAddress: "123 Main Street, City, State 12345",
  logo: "data:image/jpeg;base64,...",
  realtorPhoto: "data:image/jpeg;base64,...",
  housePhoto: "data:image/jpeg;base64,...",
  realtorName: "John Smith",
  realtorEmail: "john@example.com",
  emailTemplate: "Thank you for registering..."
}
```

## Size Limits

Firestore has a 1MB document size limit. The app enforces:
- Pre-save check warns if document exceeds 900KB
- Automatic image compression to stay under limits
- Clear error messages if limits are exceeded

## Technical Implementation

**File:** `src/App.js`

**Key Functions:**
- `saveSettings()` - Save settings to Firestore
- `enterEditMode()` - Enable edit mode, re-compress images
- `handleLogoUpload()` - Logo upload handler
- `handleImageUpload()` - House photo upload handler
- `handleRealtorPhotoUpload()` - Realtor photo upload handler
- `compressImage()` - Image compression utility
- `compressBase64Image()` - Base64 image compression

**State Variables:**
- `settings` - Current saved settings
- `tempSettings` - Temporary settings during editing
- `editSettings` - Edit mode toggle
- `imagePreview`, `logoPreview`, `realtorPhotoPreview` - Image previews

## Best Practices

1. **Images:** Use high-quality source images; compression is handled automatically
2. **Welcome Message:** Keep it short and welcoming
3. **Property Address:** Include full address for clarity
4. **Email Template:** Test email delivery before the event
5. **Realtor Photo:** Use a professional headshot (will be displayed as circle)
