# Admin Dashboard

The Admin Dashboard provides realtors with a comprehensive interface to manage open house settings, view registrations, and access various tools.

## Overview

The dashboard is password-protected and provides access to all administrative functions of the Open House App.

## Accessing the Dashboard

1. Click the **Admin** button (top-right corner of registration page)
2. Enter the admin password (default: `admin123`)
3. Click **Login**

## Dashboard Layout

The dashboard is divided into two main sections:

### Left Panel: Settings
- Welcome message configuration
- Property address
- Image uploads (logo, realtor photo, house photo)
- Realtor information
- Email template customization

### Right Panel: Guest List
- List of all registered guests
- Add/Edit/Delete guest functions
- CSV export capability

## Header Actions

| Button | Function |
|--------|----------|
| **QR Code** | Generate and download registration QR code |
| **View Page** | Preview the public registration page |
| **Logout** | End admin session and return to public view |

## Features

### Real-time Data
- Guest list updates automatically when new registrations occur
- Settings changes are reflected immediately

### Responsive Design
- Works on desktop, tablet, and mobile devices
- Collapsible navigation for smaller screens

### Session Management
- Login state persists during the browser session
- Automatic logout on browser close

## Security

### Current Implementation
- Simple password-based authentication
- Password stored in client-side code (development only)

### Recommended for Production
- Implement Firebase Authentication
- Use secure password hashing
- Add session timeout
- Enable two-factor authentication

## Navigation

```
Public Registration Page
        ↓
   [Admin Button]
        ↓
   Admin Login
        ↓
   Admin Dashboard
    ├── Settings Panel
    ├── Guest List Panel
    └── Header Actions
        ├── QR Code Modal
        ├── View Page
        └── Logout
```

## Technical Implementation

**File:** `src/App.js`

**Views:**
- `view === 'login'` - Admin login screen
- `view === 'admin'` - Admin dashboard

**Key Functions:**
- `handleAdminLogin()` - Authentication handler
- `handleLogout()` - Logout handler
- `goToPublicView()` - Navigate to public page

**State Variables:**
- `adminLoggedIn` - Authentication state
- `view` - Current view state ('public', 'login', 'admin')
- `loginPassword` - Password input value

## Changing the Admin Password

To change the default password, edit `src/App.js`:

```javascript
const handleAdminLogin = () => {
  if (loginPassword === 'YOUR_NEW_PASSWORD') {
    setAdminLoggedIn(true);
    setView('admin');
    setLoginPassword('');
  } else {
    alert('Incorrect password');
  }
};
```

**Warning:** For production, implement proper authentication instead of hardcoded passwords.
