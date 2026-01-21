# Email Notifications

The Email Notifications feature automatically sends confirmation emails to guests after they register for an open house.

## Overview

The app uses Firebase's Trigger Email extension with SendGrid to send automated emails. When a guest completes registration, an email document is created in Firestore, which triggers the email delivery.

## How It Works

```
Guest Registers → Email Document Created → Firebase Extension → SendGrid → Guest Inbox
```

1. Guest submits registration form
2. App creates a document in the `mail` collection
3. Firebase Trigger Email extension detects the new document
4. Extension sends the email via SendGrid SMTP
5. Guest receives confirmation email

## Email Content

### Subject Line
```
Thank you for registering - [Property Address]
```

### Email Body
The email body is customizable via the admin settings. Default template:

```
Thank you for registering for our open house! We look forward to seeing you!

Property Details:
Date: [DATE]
Time: [TIME]
Address: [ADDRESS]

Best regards,
[REALTOR_NAME]
```

### Template Placeholders

| Placeholder | Replaced With |
|-------------|--------------|
| `[DATE]` | Registration date (localized) |
| `[TIME]` | Registration time (localized) |
| `[ADDRESS]` | Property address from settings |
| `[REALTOR_NAME]` | Realtor name from settings |

## Configuration

### Firebase Extension Setup

1. Install "Trigger Email from Firestore" extension in Firebase Console
2. Configure SMTP settings:
   - **SMTP Connection URI:** `smtps://apikey:YOUR_API_KEY@smtp.sendgrid.net:465`
   - **SMTP Password:** Your SendGrid API key
   - **Default FROM address:** Your verified sender email

### SendGrid Setup

1. Create a SendGrid account
2. Verify your sender email address
3. Generate an API key
4. Configure the API key in Firebase extension

### Sender Verification

SendGrid requires sender verification:

1. Go to SendGrid Dashboard → Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Add your sender email address
4. Complete email verification

## Email Document Structure

When a guest registers, this document is created in the `mail` collection:

```javascript
{
  to: ["guest@example.com"],
  replyTo: "realtor@example.com",
  message: {
    subject: "Thank you for registering - 123 Main St",
    text: "Plain text version of email...",
    html: "<div>HTML version of email...</div>"
  }
}
```

## Delivery Status

After processing, the document is updated with delivery information:

```javascript
{
  delivery: {
    attempts: 1,
    startTime: "2024-01-18T10:30:00.000Z",
    endTime: "2024-01-18T10:30:02.000Z",
    state: "SUCCESS",
    error: null,
    info: {
      accepted: ["guest@example.com"],
      rejected: [],
      pending: [],
      response: "status=202",
      messageId: "<unique-id@gmail.com>"
    }
  }
}
```

## Troubleshooting

### Email Not Sending

1. **Check mail collection:** Verify documents are being created
2. **Check delivery status:** Look for errors in the document
3. **Verify sender:** Ensure sender email is verified in SendGrid
4. **Check extension logs:** Firebase Console → Extensions → Trigger Email → Logs

### Common Errors

| Error | Solution |
|-------|----------|
| "Sender not verified" | Verify sender email in SendGrid |
| "Account suspended" | Contact SendGrid support |
| "Invalid API key" | Regenerate and update API key |
| "Document not created" | Check Firestore rules for `mail` collection |

### Firestore Rules

Ensure the `mail` collection allows writes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /mail/{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Technical Implementation

**File:** `src/App.js`

**Email Creation Code:**
```javascript
await addDoc(collection(db, 'mail'), {
  to: [formData.email],
  replyTo: settings.realtorEmail,
  message: {
    subject: `Thank you for registering - ${settings.propertyAddress}`,
    text: emailBody,
    html: `<div>...</div>`
  }
});
```

## Email Template Customization

To customize the email template:

1. Login to Admin Dashboard
2. Edit Settings
3. Modify the **Email Template** field
4. Save changes

Use placeholders `[DATE]`, `[TIME]`, `[ADDRESS]`, `[REALTOR_NAME]` for dynamic content.

## Best Practices

1. **Test Before Events:** Send test emails to verify delivery
2. **Check Spam Folders:** Instruct guests to check spam if not received
3. **Keep It Short:** Concise emails have better engagement
4. **Include Contact Info:** Provide a way for guests to reach you
5. **Monitor Delivery:** Regularly check the `mail` collection for failed deliveries
