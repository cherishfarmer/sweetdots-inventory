import nodemailer from 'nodemailer';
import { format } from 'date-fns';

interface InventoryItem {
  categoryName: string;
  itemName: string;
  quantity: number;
  parLevel: number;
}

interface EmailData {
  submissionType: 'morning' | 'night';
  submissionDate: Date;
  employeeName: string;
  notes: string | null;
  suppliesReceived: boolean;
  suppliesNote: string | null;
  items: InventoryItem[];
  criticalItems: InventoryItem[];
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Generate HTML email content
function generateEmailHTML(data: EmailData): string {
  const { submissionType, submissionDate, employeeName, notes, suppliesReceived, suppliesNote, items, criticalItems } = data;
  
  const formattedDate = format(submissionDate, 'EEEE, MMMM dd, yyyy');
  const formattedTime = format(submissionDate, 'h:mm a');
  
  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.categoryName]) {
      acc[item.categoryName] = [];
    }
    acc[item.categoryName].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  // Format decimal values for display
  const formatQty = (qty: number) => qty % 1 === 0 ? qty.toString() : qty.toFixed(1);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #1a1a1a;
      background-color: #f8f9fa;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.07);
    }
    .header {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 15px;
      opacity: 0.95;
    }
    .content {
      padding: 24px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 24px;
      padding: 16px;
      background: #fef3c7;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
    }
    .summary-item {
      display: flex;
      flex-direction: column;
    }
    .summary-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #92400e;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .summary-value {
      font-size: 15px;
      color: #78350f;
      font-weight: 600;
    }
    .critical-alert {
      background: #fee2e2;
      border-left: 4px solid #dc2626;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .critical-alert h2 {
      color: #dc2626;
      font-size: 18px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .critical-item {
      background: white;
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .critical-item:last-child {
      margin-bottom: 0;
    }
    .critical-name {
      font-weight: 600;
      color: #dc2626;
    }
    .critical-category {
      font-size: 13px;
      color: #991b1b;
      margin-top: 2px;
    }
    .critical-qty {
      text-align: right;
    }
    .critical-current {
      font-size: 20px;
      font-weight: 700;
      color: #dc2626;
    }
    .critical-needed {
      font-size: 12px;
      color: #991b1b;
    }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #9a3412;
      margin: 32px 0 16px 0;
    }
    .category-block {
      margin-bottom: 20px;
    }
    .category-header {
      background: #f97316;
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 8px;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      background: #fff7ed;
      margin-bottom: 4px;
      border-radius: 4px;
      border-left: 3px solid #fed7aa;
    }
    .item-name {
      font-weight: 500;
      color: #9a3412;
    }
    .item-qty {
      display: flex;
      gap: 16px;
      font-size: 14px;
      color: #7c2d12;
    }
    .qty-label {
      color: #9a3412;
      opacity: 0.7;
    }
    .qty-value {
      font-weight: 700;
      color: #9a3412;
    }
    .notes-box {
      background: #f0fdf4;
      border-left: 4px solid #16a34a;
      border-radius: 6px;
      padding: 16px;
      margin: 24px 0;
    }
    .notes-box h3 {
      font-size: 14px;
      color: #166534;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .notes-box p {
      color: #14532d;
      line-height: 1.6;
    }
    .footer {
      text-align: center;
      padding: 24px;
      border-top: 2px solid #fed7aa;
      margin-top: 32px;
      color: #9a3412;
      font-size: 13px;
    }
    .footer strong {
      display: block;
      margin-bottom: 4px;
    }
    @media only screen and (max-width: 600px) {
      .summary-grid {
        grid-template-columns: 1fr;
      }
      .item-qty {
        flex-direction: column;
        gap: 4px;
        align-items: flex-end;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧋 Sweet Dots Inventory Report</h1>
      <p>${submissionType === 'morning' ? '☀️ Morning' : '🌙 Night'} Shift • ${formattedDate}</p>
    </div>

    <div class="content">
      <!-- Summary Info -->
      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-label">Submitted By</span>
          <span class="summary-value">${employeeName}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Time</span>
          <span class="summary-value">${formattedTime}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Supplies Received</span>
          <span class="summary-value">${suppliesReceived ? '✓ Yes' : '✗ No'}</span>
        </div>
        ${suppliesReceived && suppliesNote ? `
        <div class="summary-item">
          <span class="summary-label">Items Received</span>
          <span class="summary-value">${suppliesNote}</span>
        </div>
        ` : ''}
      </div>

      ${criticalItems.length > 0 ? `
      <!-- Critical Items Alert -->
      <div class="critical-alert">
        <h2>
          <span>🚨</span>
          <span>Critically Low Items (${criticalItems.length})</span>
        </h2>
        ${criticalItems.map(item => `
          <div class="critical-item">
            <div>
              <div class="critical-name">${item.itemName}</div>
              <div class="critical-category">${item.categoryName}</div>
            </div>
            <div class="critical-qty">
              <div class="critical-current">${formatQty(item.quantity)}</div>
              <div class="critical-needed">Need: ${formatQty(item.parLevel)}</div>
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${notes ? `
      <!-- Notes -->
      <div class="notes-box">
        <h3>📝 Additional Notes</h3>
        <p>${notes}</p>
      </div>
      ` : ''}

      <!-- Full Inventory -->
      <h2 class="section-title">Complete Inventory Snapshot</h2>

      ${Object.entries(itemsByCategory).map(([categoryName, categoryItems]) => `
        <div class="category-block">
          <div class="category-header">${categoryName}</div>
          ${categoryItems.map(item => `
            <div class="item-row">
              <span class="item-name">${item.itemName}</span>
              <div class="item-qty">
                <span><span class="qty-label">Current:</span> <span class="qty-value">${formatQty(item.quantity)}</span></span>
                <span><span class="qty-label">Par:</span> <span class="qty-value">${formatQty(item.parLevel)}</span></span>
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}

      <!-- Footer -->
      <div class="footer">
        <strong>Sweet Dots Café</strong>
        <div>Inventory Management System</div>
        <div style="margin-top: 8px; opacity: 0.7;">This is an automated report</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// Send inventory report email
export async function sendInventoryReport(data: EmailData): Promise<void> {
  const { submissionType, submissionDate } = data;
  const formattedDate = format(submissionDate, 'MMMM dd, yyyy');
  
  const subject = `Sweet Dots Inventory – ${submissionType === 'morning' ? 'Morning' : 'Night'} – ${formattedDate}`;
  
  const htmlContent = generateEmailHTML(data);

  const mailOptions = {
    from: `"Sweet Dots Inventory" <${process.env.GMAIL_USER}>`,
    to: process.env.INVENTORY_REPORT_EMAIL,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Inventory report email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send inventory report email');
  }
}

// Test email configuration
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}
