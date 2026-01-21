# Guest Registration

The guest registration feature is the core public-facing functionality of the Open House App, allowing visitors to quickly register for an open house event.

## Overview

When visitors arrive at an open house, they can use the registration form to sign in. The form is mobile-responsive and designed for quick, easy completion on tablets or smartphones.

## Features

### Required Information
- **First Name** - Guest's first name
- **Last Name** - Guest's last name
- **Email Address** - Valid email format required
- **Phone Number** - Minimum 10 digits required

### Compliance Questions
- **Do Not Call Registry** - Asks if the phone number is on the Do Not Call registry (Yes/No)
- **Buyer Agency Agreement** - Asks if the guest has signed a buyer representation agreement with another broker (Yes/No)

### Broker Information (Conditional)
If the guest indicates they have an agency agreement, a modal appears to capture:
- **Broker/Agent Name** - Name of their representing agent
- **Company Name** - Name of the brokerage firm

## Validation

| Field | Validation Rules |
|-------|-----------------|
| First Name | Required, non-empty |
| Last Name | Required, non-empty |
| Email | Required, valid email format |
| Phone | Required, minimum 10 digits |
| Do Not Call | Required selection |
| Agency Agreement | Required selection |

## Duplicate Detection

The system automatically checks for duplicate email addresses. If a guest tries to register with an email that's already in the system, they'll receive an error message.

## User Flow

```
1. Guest arrives at open house
2. Opens registration page (via QR code or direct URL)
3. Fills out registration form
4. If agency agreement = Yes → Broker info modal appears
5. Submits registration
6. Confirmation message displayed
7. Email confirmation sent (if configured)
```

## Data Storage

Guest data is stored in Firebase Firestore in the `guests` collection:

```javascript
{
  firstName: "John",
  lastName: "Doe",
  name: "John Doe",
  email: "john@example.com",
  phone: "(555) 123-4567",
  doNotCall: "No",
  hasAgencyAgreement: "Yes",
  brokerName: "Jane Smith",
  companyName: "ABC Realty",
  notes: "",
  timestamp: "2024-01-18T10:30:00.000Z"
}
```

## Confirmation

After successful registration:
1. Success message is displayed with the email template content
2. A confirmation email is queued for delivery (via SendGrid)
3. Guest can register another person by clicking "Register Another Guest"

## Customization

The registration page appearance is controlled by admin settings:
- Welcome message
- Property address
- Logo image
- Realtor photo
- House background photo
- Realtor contact information

## Technical Implementation

**File:** `src/App.js`

**Key Functions:**
- `handleSubmit()` - Main registration handler
- `validateEmail()` - Email format validation
- `validatePhone()` - Phone number validation
- `handleInputChange()` - Form input handler

**State Variables:**
- `formData` - Registration form data
- `errors` - Validation errors
- `submitting` - Submission state
- `submitted` - Success state
- `brokerInfo` - Broker details (conditional)
