# 🍩 Sweet Dots Café Inventory Management System

A production-ready, full-stack inventory management web application designed specifically for café operations. Optimized for iPad use with large, touch-friendly buttons and a clean, modern interface.

## 🎨 Features

### For Employees
- **Update Inventory**: Morning/Night shift-based inventory counting
- **Real-time Critical Alerts**: Automatically highlights items below par levels
- **Touch-Optimized UI**: Large buttons and inputs perfect for iPad
- **Supplies Tracking**: Mark when supplies are received
- **Notes & Comments**: Add context to each submission
- **History View**: Browse past inventory snapshots with navigation

### For Admins
- **Item Management**: Add, edit, delete inventory items
- **Category Management**: Organize items into categories
- **Par Level Control**: Set and adjust par levels for each item
- **Submission Logs**: View complete history of all submissions
- **Email Reports**: Automatic email notifications with detailed reports

### Email Reports Include:
- 🚨 Critical low items section (items below par level)
- Complete inventory snapshot by category
- Supplies received information
- Employee notes
- Submission details (time, employee, shift type)

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (React 18) with TypeScript
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL (Neon or Supabase)
- **Authentication**: JWT with bcrypt password hashing
- **Email**: Gmail SMTP via Nodemailer
- **Styling**: Tailwind CSS + Custom Design
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon or Supabase account)
- Gmail account with App Password
- Vercel account (for deployment)

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
# Navigate to project directory
cd sweet-dots-inventory

# Install dependencies
npm install
```

### 2. Database Setup

#### Option A: Using Neon (Recommended)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://user:password@host/database?sslmode=require`)
4. Run the schema:
   ```bash
   # Connect to your database using psql or Neon's SQL Editor
   # Copy and paste the contents of database/schema.sql
   ```

#### Option B: Using Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Project Settings → Database
4. Copy the connection string (URI format)
5. Go to SQL Editor and run the contents of `database/schema.sql`

### 3. Gmail SMTP Setup

To send email reports, you need a Gmail App Password:

1. Go to your Google Account settings
2. Enable 2-Factor Authentication (if not already enabled)
3. Go to Security → 2-Step Verification → App Passwords
4. Generate a new app password for "Mail"
5. Copy the 16-character password (no spaces)

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Database (from Neon or Supabase)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-random-string-here

# Gmail SMTP
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Report recipient
INVENTORY_REPORT_EMAIL=manager@sweetdots.com

# App URL (use localhost for development)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Session duration
SESSION_DURATION=7d
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Default Login Credentials

The database schema includes a default admin account:

- **Email**: admin@sweetdots.com
- **Password**: admin123

**⚠️ IMPORTANT**: Change this password immediately in production!

To change the password:
1. Log in as admin
2. Use a tool like pgAdmin or psql to update the password hash in the `users` table
3. Or create a new admin user via SQL

## 📱 Usage Guide

### Employee Workflow

1. **Login**: Enter credentials at the home page
2. **Select Shift**: Choose Morning ☀️ or Night 🌙
3. **Update Counts**: 
   - Use +/- buttons for quick adjustments
   - Tap the number to enter directly
   - Items below par level are highlighted in red
4. **Check Supplies**: Mark if supplies were received
5. **Add Notes**: Optional comments or observations
6. **Submit**: Tap the big submit button
7. **View History**: Browse past submissions with arrow navigation

### Admin Workflow

1. **Manage Items**:
   - Add new inventory items
   - Edit item names and par levels
   - Move items between categories
   - Delete items
2. **Manage Categories**:
   - Create new categories
   - Rename existing categories
   - Delete empty categories
3. **View Reports**: Access all submission history

## 🌐 Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin your-github-repo-url
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
5. Add Environment Variables (copy from your `.env.local`):
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `INVENTORY_REPORT_EMAIL`
   - `NEXT_PUBLIC_APP_URL` (use your Vercel URL)
   - `SESSION_DURATION`
6. Click "Deploy"

### 3. Post-Deployment

1. Your app will be live at `https://your-project.vercel.app`
2. Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables
3. Test the email functionality
4. Share the URL with your team

## 🔧 Customization

### Branding

The app uses "Sweet Dots" branding with orange and white colors. To customize:

1. **Colors**: Edit `tailwind.config.js` to change the color scheme
2. **Logo**: Replace the 🍩 emoji in header components
3. **Name**: Search and replace "Sweet Dots" throughout the codebase

### Email Template

Edit `/lib/email.ts` to customize the email report format and styling.

### Par Levels

Admins can adjust par levels for any item through the admin dashboard.

## 📊 Database Schema

The system uses 5 main tables:

- **users**: Authentication and role management
- **categories**: Inventory groupings
- **items**: Individual inventory items
- **inventory_submissions**: Submission records (morning/night)
- **inventory_snapshots**: Immutable historical records

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control (Employee/Admin)
- SQL injection prevention via parameterized queries
- Environment variable protection
- HTTPS enforcement (via Vercel)
- Duplicate submission prevention

## 🐛 Troubleshooting

### Email not sending
- Verify Gmail credentials in environment variables
- Check that 2FA is enabled on Google account
- Ensure App Password is correct (16 characters, no spaces)
- Check Gmail "Less secure app access" settings

### Database connection errors
- Verify DATABASE_URL is correct
- Ensure SSL mode is required: `?sslmode=require`
- Check that your IP is whitelisted (for some providers)
- Test connection using psql or pgAdmin

### Authentication issues
- Clear browser localStorage
- Check JWT_SECRET is set
- Verify password hash in database matches input

### Build errors on Vercel
- Check that all environment variables are set
- Verify Node.js version compatibility
- Review build logs for specific errors

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Check database connection logs
4. Verify environment variables are correct

## 📝 License

This project is proprietary software for Sweet Dots Café.

## 🎉 Credits

Built with modern web technologies for efficient café inventory management.

---

**Made with ❤️ for Sweet Dots Café**
