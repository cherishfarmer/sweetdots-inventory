# 🚀 Deployment Guide - Sweet Dots Inventory System

This guide walks you through deploying the Sweet Dots Inventory Management System to production.

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] GitHub account
- [ ] Vercel account (sign up at vercel.com)
- [ ] PostgreSQL database (Neon or Supabase)
- [ ] Gmail account with App Password
- [ ] All environment variables ready

## Step-by-Step Deployment

### Phase 1: Database Setup (Neon - Recommended)

1. **Create Neon Account**
   - Go to https://neon.tech
   - Sign up for free account
   - Click "Create Project"

2. **Configure Database**
   - Project name: `sweet-dots-inventory`
   - Region: Choose closest to your location
   - PostgreSQL version: 15 or latest
   - Click "Create Project"

3. **Get Connection String**
   - Go to "Dashboard"
   - Click "Connection Details"
   - Copy the connection string
   - It should look like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

4. **Run Database Schema**
   - Click "SQL Editor" in Neon dashboard
   - Open the file `database/schema.sql` from this project
   - Copy all contents
   - Paste into SQL Editor
   - Click "Run"
   - Verify that tables were created successfully

5. **Verify Default Admin**
   - In SQL Editor, run:
     ```sql
     SELECT email, role FROM users;
     ```
   - You should see: `admin@sweetdots.com` with role `admin`

### Phase 2: Gmail SMTP Setup

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification" if not already enabled

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Enter: "Sweet Dots Inventory"
   - Click "Generate"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
   - Remove spaces: `abcdefghijklmnop`

3. **Test Email (Optional)**
   - You can test later after deployment
   - Save the password securely for now

### Phase 3: Prepare for Deployment

1. **Generate JWT Secret**
   - Open terminal/command prompt
   - Run (on Mac/Linux):
     ```bash
     openssl rand -base64 32
     ```
   - Or use an online generator: https://generate-random.org/api-token-generator
   - Copy the generated string

2. **Prepare Environment Variables**
   Create a text file with your values:
   ```
   DATABASE_URL=postgresql://[YOUR_NEON_CONNECTION_STRING]
   JWT_SECRET=[YOUR_GENERATED_SECRET]
   GMAIL_USER=[YOUR_EMAIL]@gmail.com
   GMAIL_APP_PASSWORD=[YOUR_16_CHAR_PASSWORD]
   INVENTORY_REPORT_EMAIL=[MANAGER_EMAIL]@sweetdots.com
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app (will update after deployment)
   SESSION_DURATION=7d
   ```

### Phase 4: GitHub Setup

1. **Create GitHub Repository**
   - Go to https://github.com/new
   - Repository name: `sweet-dots-inventory`
   - Description: "Café inventory management system"
   - Make it Private (recommended)
   - Don't initialize with README (we already have one)
   - Click "Create repository"

2. **Push Code to GitHub**
   - Open terminal in project directory
   - Run these commands:
     ```bash
     git init
     git add .
     git commit -m "Initial commit - Sweet Dots Inventory"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/sweet-dots-inventory.git
     git push -u origin main
     ```

3. **Verify Upload**
   - Refresh your GitHub repository page
   - You should see all project files

### Phase 5: Vercel Deployment

1. **Connect Vercel to GitHub**
   - Go to https://vercel.com
   - Sign in (or sign up with GitHub)
   - Click "Add New..." → "Project"
   - Click "Import" next to your repository

2. **Configure Project**
   - **Project Name**: `sweet-dots-inventory` (or your preference)
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

3. **Add Environment Variables**
   Click "Environment Variables" and add each one:
   
   | Name | Value |
   |------|-------|
   | DATABASE_URL | Your Neon connection string |
   | JWT_SECRET | Your generated secret |
   | GMAIL_USER | your-email@gmail.com |
   | GMAIL_APP_PASSWORD | Your 16-char password |
   | INVENTORY_REPORT_EMAIL | manager@sweetdots.com |
   | NEXT_PUBLIC_APP_URL | https://your-project.vercel.app |
   | SESSION_DURATION | 7d |

   **Important**: For `NEXT_PUBLIC_APP_URL`, use the Vercel URL you'll get after deployment (you'll update this in Step 6)

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Vercel will show you the deployment URL

5. **Get Your Production URL**
   - After deployment completes, copy your URL
   - It will be like: `https://sweet-dots-inventory-xyz.vercel.app`

6. **Update App URL**
   - Go to Project Settings → Environment Variables
   - Find `NEXT_PUBLIC_APP_URL`
   - Click "Edit"
   - Replace with your actual Vercel URL
   - Save
   - Click "Redeploy" from the Deployments tab

### Phase 6: Post-Deployment Testing

1. **Test Login**
   - Visit your Vercel URL
   - Login with: `admin@sweetdots.com` / `admin123`
   - Should redirect to admin dashboard

2. **Test Inventory Update**
   - Go to inventory page
   - Select shift type (Morning/Night)
   - Update a few items
   - Add your name
   - Submit

3. **Test Email**
   - After submitting inventory, check the email inbox
   - You should receive a formatted report
   - Verify all data appears correctly

4. **Test History**
   - Click "History" button
   - Verify you can see the submission you just made
   - Test navigation arrows

5. **Test Admin Functions**
   - Go to admin dashboard
   - Try adding a new item
   - Try adding a new category
   - Verify changes appear on inventory page

### Phase 7: Security & Finalization

1. **Change Default Password**
   - Important: The default admin password is public
   - Options to change:
     
     **Option A: Via Database**
     - Go to Neon SQL Editor
     - Generate new hash (use bcrypt online tool)
     - Run:
       ```sql
       UPDATE users 
       SET password_hash = '[NEW_HASH]' 
       WHERE email = 'admin@sweetdots.com';
       ```
     
     **Option B: Create New Admin**
     - In SQL Editor:
       ```sql
       INSERT INTO users (name, email, password_hash, role)
       VALUES ('Your Name', 'your.email@sweetdots.com', '[BCRYPT_HASH]', 'admin');
       ```

2. **Create Employee Accounts**
   - For each employee, run in SQL Editor:
     ```sql
     INSERT INTO users (name, email, password_hash, role)
     VALUES ('Employee Name', 'employee@sweetdots.com', '[BCRYPT_HASH]', 'employee');
     ```
   - Use https://bcrypt-generator.com/ to generate password hashes

3. **Set Up Custom Domain (Optional)**
   - In Vercel Project Settings → Domains
   - Add your custom domain (e.g., inventory.sweetdots.com)
   - Follow DNS setup instructions
   - Update `NEXT_PUBLIC_APP_URL` to use custom domain

4. **Enable Vercel Analytics (Optional)**
   - Project Settings → Analytics
   - Enable Web Analytics
   - Track usage and performance

## Maintenance & Updates

### To Update Code

1. Make changes locally
2. Test with `npm run dev`
3. Commit changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. Vercel will automatically deploy

### To Add Users

Run SQL in Neon:
```sql
INSERT INTO users (name, email, password_hash, role)
VALUES ('User Name', 'email@example.com', '[BCRYPT_HASH]', 'employee');
```

### To Backup Database

1. In Neon Dashboard → Backups
2. Enable automatic backups
3. Or export data:
   ```sql
   -- Run in SQL Editor to export data
   COPY (SELECT * FROM users) TO STDOUT WITH CSV HEADER;
   ```

## Troubleshooting

### Build Fails on Vercel
- Check "Build Logs" in Vercel deployment
- Verify all environment variables are set
- Ensure no typos in DATABASE_URL

### Can't Login
- Verify DATABASE_URL is correct
- Check user exists: `SELECT * FROM users;`
- Clear browser cache and cookies

### Email Not Sending
- Verify GMAIL_APP_PASSWORD has no spaces
- Check GMAIL_USER is correct
- Ensure 2FA is enabled on Gmail
- Test with a simple email first

### Database Connection Error
- Verify DATABASE_URL includes `?sslmode=require`
- Check Neon project is active
- Verify network connectivity

## Success Checklist

After deployment, verify:
- [ ] Application loads at Vercel URL
- [ ] Can login as admin
- [ ] Can update inventory
- [ ] Email report is received
- [ ] History page works
- [ ] Admin can add items
- [ ] Admin can add categories
- [ ] Default password has been changed
- [ ] Employee accounts created

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Neon database logs
3. Review environment variables
4. Test email settings separately

---

**Deployment complete!** 🎉

Your Sweet Dots Inventory System is now live and ready for use.
