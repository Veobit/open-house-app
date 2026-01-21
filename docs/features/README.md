# Open House App - Feature Documentation

This folder contains detailed documentation for each feature of the Open House Registration App.

## Features Overview

| # | Feature | Description |
|---|---------|-------------|
| 1 | [Guest Registration](./01-guest-registration.md) | Public registration form for open house visitors |
| 2 | [Admin Dashboard](./02-admin-dashboard.md) | Secure admin interface |
| 3 | [Settings Management](./03-settings-management.md) | Customize appearance and content |
| 4 | [Guest Management](./04-guest-management.md) | View, edit, add, and delete guests |
| 5 | [Email Notifications](./05-email-notifications.md) | Automated confirmation emails via SendGrid |
| 6 | [QR Code Generation](./06-qr-code-generation.md) | Generate and download registration QR codes |
| 7 | [CSV Export](./07-csv-export.md) | Export guest list for CRM integration |
| 8 | [Firebase Authentication](./08-firebase-authentication.md) | Google Sign-In and email/password login |
| 9 | [Multi-Tenant Architecture](./09-multi-tenant-architecture.md) | Isolated data per realtor |
| 10 | [Multi-Property Management](./10-multi-property-management.md) | Multiple properties per realtor account |

## Quick Start

1. **For Guests:** Scan QR code or visit registration URL → Fill out form → Done!
2. **For Admins:** Click "Admin" → Sign in → Select property → Manage settings and guests

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Guest Registration | ✅ Complete | Fully functional |
| Admin Dashboard | ✅ Complete | Secure Firebase Auth |
| Settings Management | ✅ Complete | Image compression included |
| Guest Management | ✅ Complete | Full CRUD operations |
| Email Notifications | ✅ Complete | Requires SendGrid setup |
| QR Code Generation | ✅ Complete | Includes realtor + property ID |
| CSV Export | ✅ Complete | All guest data |
| Firebase Authentication | ✅ Complete | Google Sign-In + Email/Password |
| Multi-Tenant Architecture | ✅ Complete | Isolated data per realtor |
| Multi-Property Management | ✅ Complete | Multiple open houses per realtor |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Open House App                          │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + Tailwind CSS)                            │
│  ├── Public Registration Page (?r=realtorId&p=propertyId)   │
│  ├── Admin Login Page (Google + Email/Password)             │
│  └── Admin Dashboard (per-realtor, per-property data)       │
│      ├── Property Selector (dropdown + add/manage)          │
│      ├── Settings Panel (per property)                      │
│      ├── Guest List Panel (per property)                    │
│      └── QR Code Modal (property-specific URL)              │
├─────────────────────────────────────────────────────────────┤
│  Backend (Firebase)                                         │
│  ├── Authentication (Google, Email/Password)                │
│  ├── Firestore Database (Multi-Tenant, Multi-Property)      │
│  │   └── users/{realtorId}/                                 │
│  │       ├── properties/{propertyId}/                       │
│  │       │   ├── settings/appSettings                       │
│  │       │   └── guests/{guestId}                           │
│  │       └── mail/{mailId}                                  │
│  └── Extensions                                             │
│      └── Trigger Email from Firestore                       │
├─────────────────────────────────────────────────────────────┤
│  External Services                                          │
│  └── SendGrid (Email Delivery)                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
Guest scans QR code
       │
       ▼
URL: ?r={realtorId}&p={propertyId}
       │
       ▼
Load property settings from:
users/{realtorId}/properties/{propertyId}/settings/appSettings
       │
       ▼
Display registration form with property branding
       │
       ▼
Guest submits registration
       │
       ▼
Save guest to:
users/{realtorId}/properties/{propertyId}/guests/{guestId}
       │
       ▼
Queue confirmation email in:
users/{realtorId}/mail/{mailId}
```

## Tech Stack

- **Frontend:** React 18, Tailwind CSS, Lucide Icons
- **Backend:** Firebase Firestore, Firebase Authentication
- **Auth:** Google Sign-In, Email/Password
- **Data Isolation:** Per-realtor, per-property data paths with Firestore security rules
- **Email:** Firebase Trigger Email Extension + SendGrid
- **QR Codes:** qrcode.react library

## Roadmap

### Completed
- [x] Guest Registration
- [x] Admin Dashboard
- [x] Settings Management
- [x] Guest Management (CRUD)
- [x] Email Notifications
- [x] QR Code Generation
- [x] CSV Export
- [x] Firebase Authentication (Google + Email/Password)
- [x] Multi-Tenant Architecture
- [x] Multi-Property Management

### Planned Features
- [ ] Check-in tracking (arrived vs registered)
- [ ] Analytics dashboard
- [ ] CRM integrations (Salesforce, HubSpot)
- [ ] SMS notifications
- [ ] PWA support
- [ ] Property scheduling/calendar

## Contributing

When adding new features:

1. Create a new markdown file: `XX-feature-name.md`
2. Follow the existing documentation format
3. Update this README with the new feature
4. Update the feature status table

## Support

For questions or issues, contact: kire.angjushev@veobit.com
