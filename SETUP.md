# Setup Guide - Setor G Espaço VIP

## Prerequisites

- Node.js 20.x or higher
- A Supabase account and project
- Git

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/samany-cutrim/setorgespacovip.git
cd setorgespacovip
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Supabase

#### Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select or create your project
3. Go to **Settings** > **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

#### Important Notes:
- ⚠️ The `anon` key should be a long JWT token starting with `eyJ`
- ❌ Do NOT use placeholder keys like `sb_publishable_xxx`
- ✅ The key should be at least 100 characters long

### 4. Set Environment Variables

#### For Local Development:

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...
```

#### For Production (Render/Netlify/Vercel):

Add the environment variables in your hosting platform's dashboard:

**Render:**
1. Go to your Static Site dashboard
2. Navigate to **Environment** section
3. Add both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Netlify:**
1. Go to **Site settings** > **Build & deploy** > **Environment**
2. Add both environment variables

**Vercel:**
1. Go to **Settings** > **Environment Variables**
2. Add both variables

### 5. Initialize Database

Run the Supabase migrations to create all required tables:

1. Install Supabase CLI (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. Link to your Supabase project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Push migrations to your database:
   ```bash
   supabase db push
   ```

Alternatively, you can run the SQL migrations manually in your Supabase dashboard:
- Go to **SQL Editor**
- Execute each migration file from `supabase/migrations/` in order

### 6. Run the Application

#### Development:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

#### Production Build:
```bash
npm run build
```

## Troubleshooting

### "Erro ao enviar solicitação" when submitting a reservation

This error occurs when:
1. ❌ **Invalid API Key**: The `VITE_SUPABASE_ANON_KEY` is not set or is invalid
   - Solution: Check that your `.env` file has the correct anon key from Supabase
   
2. ❌ **Missing Environment Variables**: Variables not set in production
   - Solution: Add environment variables in your hosting platform

3. ❌ **Network/CORS Issues**: Supabase project configuration
   - Solution: Check your Supabase project is active and accessible

### Checking Your Configuration

You can verify your Supabase connection by:
1. Open the browser console (F12)
2. Look for any error messages starting with "Invalid API key" or "JWTExpired"
3. If you see these errors, your Supabase credentials need to be updated

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the [README.md](./README.md) for additional information
- Open an issue on GitHub if you encounter problems

## Security Notes

- ✅ The `anon` key is safe to expose in client-side code
- ✅ Row Level Security (RLS) policies protect your data
- ❌ Never commit your `.env` file to version control (it's in `.gitignore`)
- ⚠️ Keep your Supabase service role key secret (not used in this app)
