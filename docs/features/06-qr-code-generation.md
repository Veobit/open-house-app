# QR Code Generation

The QR Code Generation feature allows administrators to create and download QR codes that link directly to the registration page.

## Overview

QR codes provide a quick, contactless way for open house visitors to access the registration form. Guests simply scan the code with their smartphone camera to open the registration page.

## Accessing QR Code

1. Login to Admin Dashboard
2. Click the **QR Code** button (purple) in the header
3. QR Code modal opens with the generated code

## Features

### QR Code Display
- Large, high-contrast QR code for easy scanning
- Uses brand color (blue) for the QR pattern
- High error correction level (Level H) for reliability

### Download Options
- **Download PNG:** Saves a high-resolution (400x400px) image
- Filename format: `qr-code-[property-address].png`

### Copy Link
- Copies the registration URL to clipboard
- Useful for sharing via text, email, or social media

### Property Information
- Displays the property address below the QR code
- Helps identify which property the code is for

## QR Code Specifications

| Property | Value |
|----------|-------|
| Size (Display) | 200x200 pixels |
| Size (Download) | 400x400 pixels |
| Error Correction | Level H (30%) |
| Format | PNG |
| Foreground Color | #1e3a8a (Blue) |
| Background Color | #ffffff (White) |
| Margin | Included |

## Usage Scenarios

### At the Open House
1. Print the QR code on a sign or poster
2. Place at the entrance or sign-in area
3. Guests scan with their phone
4. Registration form opens automatically

### Marketing Materials
- Include in property flyers
- Add to social media posts
- Include in email invitations
- Display on digital signage

### Pre-Event Sharing
1. Download the QR code image
2. Send to potential attendees
3. Guests can pre-register before arriving

## URL Generation

The QR code automatically uses the current URL of your app:

| Environment | Example URL |
|-------------|-------------|
| Development | `http://localhost:3000` |
| Production | `https://your-domain.com` |

When deployed, the QR code will automatically generate for your production URL.

## Modal Interface

```
┌─────────────────────────────────────────┐
│ Registration QR Code              [X]   │
├─────────────────────────────────────────┤
│                                         │
│         ┌─────────────────┐             │
│         │    QR CODE      │             │
│         │    [IMAGE]      │             │
│         └─────────────────┘             │
│                                         │
│     Scan to register for the open house │
│     https://your-app-url.com            │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ 123 Main Street, City, ST 12345 │   │
│   └─────────────────────────────────┘   │
│                                         │
│   [Download PNG]      [Copy Link]       │
│                                         │
└─────────────────────────────────────────┘
```

## Technical Implementation

**File:** `src/App.js`

**Dependencies:**
```javascript
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
```

**Key Functions:**
- `getRegistrationUrl()` - Returns the current origin URL
- `downloadQRCode()` - Exports QR code as PNG image

**Components Used:**
- `QRCodeSVG` - Visible QR code for display
- `QRCodeCanvas` - Hidden canvas for PNG export

**State Variables:**
- `showQRModal` - Toggle for QR code modal visibility

## Package

The QR code functionality uses the `qrcode.react` library:

```bash
npm install qrcode.react
```

## Best Practices

1. **Test the Code:** Always scan your QR code before printing
2. **Size Appropriately:** Ensure printed codes are large enough to scan
3. **Good Lighting:** Place printed codes in well-lit areas
4. **Backup Link:** Include a text URL below the QR code for those who prefer typing
5. **Multiple Locations:** Place QR codes at entrance, sign-in table, and property info sheets

## Print Recommendations

| Use Case | Minimum Size |
|----------|-------------|
| Table tent | 2" x 2" |
| Poster/Sign | 4" x 4" |
| Flyer | 1.5" x 1.5" |
| Business card | 1" x 1" |

## Error Correction

The QR code uses Level H error correction, which means:
- Up to 30% of the code can be damaged/obscured
- Still scannable with partial wear or low-quality printing
- Suitable for environments where the code may be partially covered

## Custom URL (Future Enhancement)

Currently, the QR code uses the app's current URL. A future enhancement could allow:
- Custom URL configuration in settings
- Multiple QR codes for different landing pages
- Tracking parameters for analytics
