# setor g espaço vip

Simple project for managing reservations and administrative tasks for properties.

## Development

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build for production: `npm run build`

## Deployment

### Render + Supabase Deployment

This project uses **Render** for static hosting and **Supabase** for the complete backend. Follow these steps to deploy:

#### Prerequisites
- A Render account (https://render.com)
- Your GitHub repository connected to Render
- A Supabase project (https://supabase.com)

#### Steps to Deploy

1. **Set up Supabase**:
   - Create a new Supabase project
   - Run all SQL migrations from `supabase/migrations/` 
   - Copy your credentials:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

2. **Connect your repository to Render**:
   - Go to https://dashboard.render.com
   - Click "New +" and select "Static Site"
   - Connect your GitHub repository `setorgespacovip`

3. **Configure the Static Site**:
   - **Name**: `setor-g-espaco-vip` (or your preferred name)
   - **Build Command**: `npm install && npm run build`
   - **Publish directory**: `dist`

4. **Set Environment Variables in Render**:
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase Anonymous Key

5. **Deploy**:
   - Click "Create Static Site"
   - Render will automatically build and deploy
   - Your app will be live at `https://<your-service-name>.onrender.com`

#### Supabase Database Schema

All tables and RLS policies are automatically created by running the migrations:
- `reservations`
- `guests`
- `payments`
- `pricing_rules`
- `blocked_dates`
- `expenses`
- `property_settings`

All database operations are performed directly from the frontend using Supabase client-side SDK. No backend server is needed!

#### Features of This Setup
- ✅ **Completely Serverless** - No memory limits, scales automatically
- ✅ **No Backend Server** - All logic in Supabase & frontend
- ✅ **Free Tier Compatible** - Render Static + Supabase Free
- ✅ **Real-time Updates** - Supabase real-time subscriptions enabled
- ✅ **Secure** - Row-level security policies enforced

## Technologies

- Vite
- React + TypeScript
- Tailwind CSS
- shadcn-ui
- Supabase (PostgreSQL)