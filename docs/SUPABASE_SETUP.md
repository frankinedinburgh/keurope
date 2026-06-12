# Supabase Setup Guide

This guide walks you through setting up Supabase for Keurope's auth and PostgreSQL database.

## What is Supabase?

Supabase is a managed backend platform that provides:
- **PostgreSQL Database** - managed SQL database
- **Authentication** - built-in user auth with JWT tokens
- **Real-time Updates** - WebSocket support for live data
- **Storage** - file upload storage

For Keurope, we use:
- **Auth**: User login/signup, JWT tokens
- **PostgreSQL**: Replace SQLite for production

## Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with email or GitHub
4. Create a new organization (or use default)

## Step 2: Create a New Project

1. In the Supabase dashboard, click "Create a new project"
2. **Project name**: `keurope`
3. **Database password**: Create a strong password (save it!) Mvgrz4tOc8GhQZSb
4. **Region**: Choose Ireland or closest to you (eu-west-1)
5. Click "Create new project" - this takes 2-3 minutes

## Step 3: Get Your Credentials

Once the project is created:

1. Go to **Settings → API** (left sidebar)
2. Copy these values:
   - **URL**: Your Supabase project URL (starts with https://...supabase.co)
   - **Anon Key**: Public key for frontend
   - **Service Role Key**: Secret key for backend only (⚠️ KEEP SECRET)

3. Save to `backend/.env`:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   ```

4. Save to `frontend/.env.local`:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

⚠️ **Security**: Never commit `.env` files with real keys to git!

## Step 4: Set Up Authentication

1. In Supabase dashboard, go to **Authentication**
2. Click **Providers** → **Email**
3. Make sure "Enable Email provider" is checked
4. Under **Confirm email**, choose "Double confirm required" (default)
5. (Optional) Add Google/GitHub OAuth later if desired

## Step 5: Configure Database

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Run the migrations from `backend/src/database/migrations/*.sql`

**Option A: Copy-paste**
- Open `001_initial_schema.sql`
- Copy the SQL
- Paste into Supabase SQL Editor
- Click "Run"
- Repeat for `002_add_indexes.sql`

**Option B: Using CLI (more advanced)**
```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

## Step 6: Test the Connection

### Backend
```bash
cd backend
npm install  # if you haven't already
npm run build
npm run dev
```

Check logs - should say "Connected to database"

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173 - should work normally

## Step 7: Create a Test User (Optional)

1. In Supabase dashboard, go to **Authentication → Users**
2. Click "Add user"
3. Enter email and password
4. Click "Create user"

Now you can use these credentials to test login.

## Troubleshooting

### "Connection refused"
- Check SUPABASE_URL is correct
- Check you're connected to the internet
- Check .env file is in the right place

### "Invalid API key"
- Copy the key again from Supabase Settings
- Make sure you're using ANON_KEY (frontend) not SERVICE_KEY
- Reload env files: restart server

### "User creation failed"
- Check email provider is enabled
- Check email format is valid
- Check Supabase project status (go to dashboard)

### "Database migrations failed"
- Check you ran both migration files
- Check the SQL syntax (must be PostgreSQL)
- Check for foreign key constraint errors

## Next Steps

- Run migrations and seed data: `npm run seed`
- Set up environment variables for Stripe (payment)
- Set up environment variables for SendGrid (email)
- Deploy to production (Vercel for frontend, Railway for backend)

## Useful Links

- Supabase Docs: https://supabase.com/docs
- Auth API: https://supabase.com/docs/guides/auth
- JavaScript Client: https://supabase.com/docs/reference/javascript
- Database: https://supabase.com/docs/guides/database/overview

## Security Checklist

- [ ] SUPABASE_URL and SUPABASE_ANON_KEY in `.env.local` (frontend)
- [ ] SUPABASE_SERVICE_KEY in `.env` (backend) - **NEVER in frontend**
- [ ] Both `.env` files added to `.gitignore`
- [ ] Real .env files not committed to git
- [ ] Row Level Security (RLS) policies configured (for production)
- [ ] API keys rotated every 90 days (for production)

---

**Questions?** Open the Supabase dashboard and check the SQL Editor logs for detailed error messages.
