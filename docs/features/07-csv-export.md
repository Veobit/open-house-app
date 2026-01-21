# CSV Export

The CSV Export feature allows administrators to download the complete guest list as a CSV file for use in spreadsheets, CRM systems, or other applications.

## Overview

Export all registered guests to a CSV (Comma-Separated Values) file that can be opened in Excel, Google Sheets, or imported into CRM systems like Salesforce, HubSpot, or Follow Up Boss.

## Accessing Export

1. Login to Admin Dashboard
2. Navigate to the Guest List panel
3. Click the **Export CSV** button (green)
4. File downloads automatically

**Note:** The Export button only appears when there are guests in the list.

## Exported Data

### Columns Included

| Column | Description |
|--------|-------------|
| Name | Full name (First + Last) |
| First Name | Guest's first name |
| Last Name | Guest's last name |
| Email | Email address |
| Phone | Phone number |
| Do Not Call | Registry status (Yes/No/N/A) |
| Agency Agreement | Buyer representation status (Yes/No/N/A) |
| Broker Name | Representing broker (if applicable) |
| Company Name | Brokerage company (if applicable) |
| Notes | Admin notes |
| Registration Date | Timestamp of registration |

### Sample Output

```csv
"Name","First Name","Last Name","Email","Phone","Do Not Call","Agency Agreement","Broker Name","Company Name","Notes","Registration Date"
"John Doe","John","Doe","john@example.com","(555) 123-4567","No","Yes","Jane Smith","ABC Realty","Interested in 3BR","1/18/2024, 10:30:00 AM"
"Mary Johnson","Mary","Johnson","mary@example.com","(555) 987-6543","Yes","No","","","First-time buyer","1/18/2024, 11:15:00 AM"
```

## File Naming

Files are named with the export date:
```
openhouse-guests-2024-01-18.csv
```

Format: `openhouse-guests-YYYY-MM-DD.csv`

## Data Formatting

### Text Handling
- All fields are wrapped in double quotes
- Internal quotes are escaped (doubled)
- Newlines in notes are preserved

### Date Formatting
- Dates use locale-specific formatting
- Format depends on user's browser settings
- Example: `1/18/2024, 10:30:00 AM`

### Empty Fields
- Empty fields are exported as empty strings
- N/A values are preserved as "N/A"

## Using Exported Data

### Microsoft Excel
1. Double-click the downloaded CSV file
2. Excel opens it automatically
3. Data appears in columns A through K

### Google Sheets
1. Go to Google Sheets
2. File → Import
3. Upload the CSV file
4. Select "Replace current sheet" or "Insert new sheet"

### CRM Import

Most CRM systems accept CSV imports. Common mappings:

| CSV Column | CRM Field |
|------------|-----------|
| Email | Primary Email |
| First Name | First Name |
| Last Name | Last Name |
| Phone | Phone Number |
| Notes | Notes/Description |

### Mail Merge
Use the exported data for personalized follow-up emails:
1. Export guest list
2. Open in Excel/Google Sheets
3. Use mail merge feature in Word or Gmail

## Technical Implementation

**File:** `src/App.js`

**Function:** `exportGuests()`

```javascript
const exportGuests = () => {
  const headers = ['Name', 'First Name', 'Last Name', ...];
  const rows = guests.map(g => [...]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  // Trigger download...
};
```

## Best Practices

1. **Regular Exports:** Export guest lists regularly for backup
2. **Before Clearing:** Always export before deleting old records
3. **Privacy:** Handle exported data securely; contains personal information
4. **CRM Integration:** Import promptly to ensure timely follow-up
5. **Archive:** Keep exports organized by property and date

## Limitations

### Current Limitations
- Exports all guests (no filtering)
- Single file format (CSV only)
- No scheduling/automation

### Future Enhancements
- Date range filtering
- Multiple export formats (Excel, PDF)
- Automated scheduled exports
- Direct CRM integration
- Selective column export

## Troubleshooting

### File Won't Open
- Ensure you have a CSV-compatible application
- Try opening with a text editor first
- Check file extension is `.csv`

### Garbled Characters
- Ensure UTF-8 encoding support
- In Excel: Data → From Text/CSV → Select UTF-8 encoding

### Missing Data
- Verify all guests are loaded in the dashboard
- Check for JavaScript errors in browser console
- Refresh the page and try again

## Data Privacy

When handling exported guest data:

1. **Store Securely:** Keep files in protected locations
2. **Limit Access:** Only share with authorized team members
3. **Delete When Done:** Remove files after importing to CRM
4. **Compliance:** Follow applicable privacy regulations (GDPR, CCPA)
5. **Encryption:** Consider encrypting sensitive exports
