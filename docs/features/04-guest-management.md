# Guest Management

The Guest Management feature allows administrators to view, edit, add, and delete guest registrations from the Admin Dashboard.

## Overview

All guest records are stored in Firebase Firestore and displayed in a scrollable list in the Admin Dashboard. Administrators have full CRUD (Create, Read, Update, Delete) capabilities.

## Accessing Guest Management

1. Login to Admin Dashboard
2. Navigate to the **Guest List** panel (right side)
3. View all registered guests
4. Use action buttons to manage individual records

## Features

### View Guest List
- Displays all registered guests
- Shows guest count in header
- Scrollable list for large numbers of registrations
- Real-time updates when new registrations occur

### Guest Information Displayed
- **Name** - Full name (First + Last)
- **Email** - Email address with mail icon
- **Phone** - Phone number with phone icon
- **Do Not Call Status** - Registry status
- **Agency Agreement** - Buyer representation status
- **Broker Info** - If applicable, shows broker name and company
- **Notes** - Any admin notes added
- **Registration Date** - Timestamp of registration

### Add Guest Manually
1. Click **+ Add** button
2. Fill out guest information form
3. Click **Add Guest** to save

Useful for:
- Walk-in guests who prefer not to use the digital form
- Adding guests from paper sign-in sheets
- Testing the system

### Edit Guest
1. Click the **Edit** (pencil) icon on a guest record
2. Modify any fields
3. Click **Update Guest** to save changes

Editable fields:
- First Name
- Last Name
- Email
- Phone
- Do Not Call status
- Agency Agreement status
- Broker Name (if applicable)
- Company Name (if applicable)
- Notes

### Delete Guest
1. Click the **Delete** (trash) icon on a guest record
2. Confirm deletion in the popup dialog
3. Record is permanently removed

**Warning:** Deletion is permanent and cannot be undone.

### Add Notes
Notes can be added to any guest record to track:
- Follow-up status
- Special interests
- Property feedback
- Any other relevant information

## Guest Record Display

Each guest card shows:

```
┌─────────────────────────────────────────┐
│ John Doe                    [Edit][Del] │
│ ✉ john@example.com                      │
│ ☎ (555) 123-4567                        │
│ Do Not Call: No                         │
│ Agency Agreement: Yes                   │
│ ┌─────────────────────────────────────┐ │
│ │ Broker: Jane Smith                  │ │
│ │ Company: ABC Realty                 │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Notes: Interested in 3BR properties │ │
│ └─────────────────────────────────────┘ │
│ 1/18/2024, 10:30:00 AM                  │
└─────────────────────────────────────────┘
```

## Data Validation

When adding or editing guests:

| Field | Validation |
|-------|------------|
| First Name | Required |
| Last Name | Required |
| Email | Required, valid format |
| Phone | Required, 10+ digits |
| Do Not Call | Optional |
| Agency Agreement | Optional |
| Broker Name | Optional |
| Company Name | Optional |
| Notes | Optional |

## Data Storage

Guest data is stored in Firebase Firestore `guests` collection:

```javascript
{
  id: "auto-generated-id",
  firstName: "John",
  lastName: "Doe",
  name: "John Doe",
  email: "john@example.com",
  phone: "(555) 123-4567",
  doNotCall: "No",
  hasAgencyAgreement: "Yes",
  brokerName: "Jane Smith",
  companyName: "ABC Realty",
  notes: "Interested in 3BR properties",
  timestamp: "2024-01-18T10:30:00.000Z"
}
```

## Technical Implementation

**File:** `src/App.js`

**Key Functions:**
- `handleAddGuest()` - Open add guest form
- `handleEditGuest()` - Open edit guest form
- `handleDeleteGuest()` - Delete guest with confirmation
- `handleSaveGuest()` - Save new or updated guest
- `handleCancelGuestEdit()` - Cancel editing

**State Variables:**
- `guests` - Array of all guest records
- `editingGuest` - ID of guest being edited (null if not editing)
- `showAddGuest` - Toggle for add guest form
- `guestFormData` - Form data for add/edit operations

## Best Practices

1. **Add Notes:** Document follow-up actions and guest preferences
2. **Verify Before Delete:** Double-check before deleting records
3. **Regular Export:** Export guest lists regularly for backup
4. **Privacy:** Handle guest data according to privacy regulations
5. **Follow-up:** Use notes to track which guests have been contacted
