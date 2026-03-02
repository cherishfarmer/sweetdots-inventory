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
  
  const formattedDate = format(submissionDate, 'MMMM dd, yyyy');
  const formattedTime = format(submissionDate, 'h:mm a');
  
  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.categoryName]) {
      acc[item.categoryName] = [];
    }
    acc[item.categoryName].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white;
      padding: 25px;
      border-radius: 8px 8px 0 0;
      margin: -30px -30px 30px -30px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 8px 0 0 0;
      opacity: 0.95;
      font-size: 16px;
    }
    .critical-section {
      background-color: #fee2e2;
      border-left: 4px solid #dc2626;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .critical-section h2 {
      color: #dc2626;
      margin: 0 0 15px 0;
      font-size: 20px;
      display: flex;
      align-items: center;
    }
    .critical-item {
      background-color: white;
      padding: 12px;
      margin: 8px 0;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .critical-item strong {
      color: #dc2626;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 25px 0;
      padding: 20px;
      background-color: #fef3c7;
      border-radius: 6px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-size: 12px;
      text-transform: uppercase;
      color: #92400e;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .info-value {
      font-size: 16px;
      color: #78350f;
      font-weight: 500;
      margin-top: 4px;
    }
    .category-section {
      margin: 30px 0;
    }
    .category-header {
      background-color: #f97316;
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 16px;
      background-color: #fff7ed;
      margin: 6px 0;
      border-radius: 4px;
      border-left: 3px solid #fed7aa;
    }
    .item-name {
      font-weight: 500;
      color: #9a3412;
    }
    .item-quantity {
      display: flex;
      gap: 20px;
      color: #7c2d12;
    }
    .quantity-value {
      font-weight: 600;
    }
    .notes-section {
      margin: 25px 0;
      padding: 20px;
      background-color: #f0fdf4;
      border-left: 4px solid #16a34a;
      border-radius: 4px;
    }
    .notes-section h3 {
      margin: 0 0 10px 0;
      color: #166534;
      font-size: 16px;
    }
    .notes-section p {
      margin: 0;
      color: #14532d;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #fed7aa;
      text-align: center;
      color: #9a3412;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧋 Sweet Dots Inventory Report</h1>
      <p>${submissionType.charAt(0).toUpperCase() + submissionType.slice(1)} Shift • ${formattedDate}</p>
    </div>

    ${criticalItems.length > 0 ? `
    <div class="critical-section">
      <h2>🚨 Critically Low Items</h2>
      ${criticalItems.map(item => `
        <div class="critical-item">
          <div>
            <strong>${item.itemName}</strong>
            <span style="color: #6b7280; margin-left: 8px;">(${item.categoryName})</span>
          </div>
          <div>
            <strong>${item.quantity}</strong> / ${item.parLevel} needed
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Submitted By</span>
        <span class="info-value">${employeeName}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Submission Time</span>
        <span class="info-value">${formattedTime}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Supplies Received</span>
        <span class="info-value">${suppliesReceived ? '✓ Yes' : '✗ No'}</span>
      </div>
      ${suppliesReceived && suppliesNote ? `
      <div class="info-item">
        <span class="info-label">What Was Received</span>
        <span class="info-value">${suppliesNote}</span>
      </div>
      ` : ''}
    </div>

    ${notes ? `
    <div class="notes-section">
      <h3>📝 Additional Notes</h3>
      <p>${notes}</p>
    </div>
    ` : ''}

    <h2 style="margin: 30px 0 20px 0; color: #9a3412; font-size: 22px;">Complete Inventory Snapshot</h2>

    ${Object.entries(itemsByCategory).map(([categoryName, categoryItems]) => `
      <div class="category-section">
        <div class="category-header">${categoryName}</div>
        ${categoryItems.map(item => `
          <div class="item-row">
            <span class="item-name">${item.itemName}</span>
            <div class="item-quantity">
              <span>Current: <span class="quantity-value">${item.quantity}</span></span>
              <span>Par: <span class="quantity-value">${item.parLevel}</span></span>
            </div>
          </div>
        `).join('')}
      </div>
    `).join('')}

    <div class="footer">
      <p><strong>Sweet Dots Café</strong> • Inventory Management System</p>
      <p>This is an automated report. Please do not reply to this email.</p>
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
  
  const subject = `Daily Inventory Report – ${submissionType.charAt(0).toUpperCase() + submissionType.slice(1)} – ${formattedDate}`;
  
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
