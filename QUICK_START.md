# 🧋 Sweet Dots Inventory - Quick Reference

## 🚀 5-Minute Setup (Development)

```bash
# 1. Install
npm install

# 2. Configure database (create free account at neon.tech)
# Run database/schema.sql in Neon SQL Editor

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local with your values

# 4. Run
npm run dev

# 5. Login at http://localhost:3000
# Email: admin@sweetdots.com
# Password: admin123
```

## 🔐 Default Credentials

**Admin Account:**
- Email: `admin@sweetdots.com`
- Password: `admin123`
- ⚠️ Change immediately in production!

## 📋 Essential Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET=your-random-secret-string
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=16-char-app-password
INVENTORY_REPORT_EMAIL=manager@sweetdots.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_DURATION=7d
```

## 🎯 User Workflows

### Employee: Update Inventory
1. Login → `/inventory`
2. Select shift (☀️ Morning or 🌙 Night)
3. Update quantities using +/- or direct input
4. Check supplies if received
5. Enter your name
6. Add notes (optional)
7. Submit ✅

### Employee: View History
1. Click "History" button
2. Use ← → arrows to navigate
3. Filter by shift type
4. View complete snapshots

### Admin: Manage Items
1. Login → `/admin`
2. Click "Manage Items" tab
3. Add/Edit/Delete items
4. Set par levels
5. Move between categories

### Admin: Manage Categories
1. Login → `/admin`
2. Click "Manage Categories" tab
3. Add/Edit/Delete categories
4. Note: Can't delete categories with items

## 📧 Email Setup Quick Guide

1. **Enable 2FA on Gmail**
   - https://myaccount.google.com/security

2. **Generate App Password**
   - https://myaccount.google.com/apppasswords
   - Select: Mail → Other → "Sweet Dots"
   - Copy 16-character password

3. **Add to .env.local**
   ```env
   GMAIL_USER=youremail@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   ```

## 🗄️ Database Quick Commands

### Connect to Database
```bash
# Using psql
psql "postgresql://user:pass@host/db?sslmode=require"
```

### Add Employee
```sql
INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Employee Name',
  'employee@sweetdots.com',
  '$2b$10$hash...',  -- Generate at bcrypt-generator.com
  'employee'
);
```

### Add Category
```sql
INSERT INTO categories (name, sort_order)
VALUES ('Beverages', 1);
```

### Add Item
```sql
INSERT INTO items (name, category_id, par_level, current_quantity)
VALUES (
  'Coffee Beans (lb)',
  'category-uuid-here',
  10,
  8
);
```

### View Recent Submissions
```sql
SELECT 
  submission_type,
  employee_name,
  submitted_at,
  supplies_received
FROM inventory_submissions
ORDER BY submitted_at DESC
LIMIT 10;
```

## 🌐 Vercel Deployment Quick Steps

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main

# 2. Deploy on Vercel
# - Go to vercel.com
# - Import GitHub repo
# - Add all environment variables
# - Click Deploy

# 3. Update app URL
# - Copy Vercel URL
# - Update NEXT_PUBLIC_APP_URL in Vercel settings
# - Redeploy
```

## 🔧 NPM Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🎨 Customization Quick Links

**Change Colors:**
- Edit: `tailwind.config.js`

**Change Logo:**
- Replace 🧋 in all page headers

**Email Template:**
- Edit: `lib/email.ts`

**Database Schema:**
- View: `database/schema.sql`

## 🐛 Troubleshooting Quick Fixes

### Can't Login
```bash
# Clear browser storage
localStorage.clear()
# Or use incognito mode
```

### Email Not Sending
```bash
# Test Gmail password (no spaces!)
# Check 2FA enabled
# Verify app password
```

### Database Connection Failed
```bash
# Check URL format includes ?sslmode=require
# Verify database is active
# Test connection with psql
```

### Build Error
```bash
# Check all env vars set
# Clear .next folder
rm -rf .next
npm run build
```

## 📱 Feature Access Matrix

| Feature | Employee | Admin |
|---------|----------|-------|
| Update Inventory | ✅ | ✅ |
| View History | ✅ | ✅ |
| Add Items | ❌ | ✅ |
| Edit Items | ❌ | ✅ |
| Delete Items | ❌ | ✅ |
| Manage Categories | ❌ | ✅ |
| View All Submissions | ❌ | ✅ |

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Keep dependencies updated
- [ ] Restrict database access
- [ ] Use environment variables
- [ ] Don't commit .env files

## 📊 File Locations

```
Key Files:
├── Login Page: app/page.tsx
├── Inventory Update: app/inventory/page.tsx
├── History: app/history/page.tsx
├── Admin: app/admin/page.tsx
├── Auth API: app/api/auth/
├── Database Schema: database/schema.sql
├── Email Service: lib/email.ts
└── Auth Context: contexts/AuthContext.tsx
```

## 🆘 Support Quick Links

- **Full Documentation:** README.md
- **Deployment Guide:** DEPLOYMENT.md
- **Project Overview:** PROJECT_OVERVIEW.md
- **Environment Template:** .env.example
- **Database Schema:** database/schema.sql

## 💡 Pro Tips

1. **iPad Optimization:** Use Safari for best experience
2. **Quick Updates:** Use +/- buttons for speed
3. **Critical Alerts:** Red items are below par level
4. **History Navigation:** Keyboard arrows work too
5. **Email Reports:** Check spam folder first time
6. **Duplicate Prevention:** System blocks duplicate day/shift submissions
7. **Session Duration:** Tokens last 7 days by default
8. **Database Backups:** Enable automatic backups in Neon

## 🎯 Production Checklist

Before going live:
- [ ] Database created and seeded
- [ ] All environment variables set
- [ ] Email sending tested
- [ ] Default password changed
- [ ] Employee accounts created
- [ ] Custom domain configured (optional)
- [ ] Vercel project named correctly
- [ ] Test all features on iPad
- [ ] Train staff on system
- [ ] Monitor first few submissions

## 📞 Quick Help

**Issue?** Check in this order:
1. Browser console for errors
2. Vercel deployment logs
3. Database connection status
4. Environment variables
5. Gmail credentials

**Need to Reset?**
```sql
-- Clear all submissions (careful!)
DELETE FROM inventory_snapshots;
DELETE FROM inventory_submissions;

-- Reset item quantities
UPDATE items SET current_quantity = 0;
```

---

**🚀 Ready to launch!**

Start with: `npm install && npm run dev`

Then read: README.md for complete instructions
