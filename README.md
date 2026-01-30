# setor g espaço vip

Simple project for managing reservations and administrative tasks for properties.

## Development

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build for production: `npm run build`

## Deployment

### Render Deployment

This project is configured for deployment on **Render**. Follow these steps to deploy:

#### Prerequisites
- A Render account (https://render.com)
- Your GitHub repository connected to Render
- A PostgreSQL database (you can create one on Render or use an external service)

#### Steps to Deploy

1. **Connect your repository to Render**:
   - Go to https://dashboard.render.com
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Select the repository `setorgespacovip`

2. **Configure the Web Service**:
   - **Name**: `setor-g-espaco-vip` (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -l 3000`
   - **Plan**: Free (or choose based on your needs)

3. **Set Environment Variables**:
   Go to the Environment section and add:
   - `NODE_ENV` = `production`
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase Anonymous Key

4. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically build and deploy your application
   - Your application will be available at `https://<your-service-name>.onrender.com`

#### Using render.yaml

Alternatively, you can use the `render.yaml` file included in the repository:
1. Push the `render.yaml` file to your main branch
2. Connect your repository to Render
3. Render will automatically detect and use the `render.yaml` configuration

#### Database Setup

Your API calls are made directly to **Supabase** from the frontend:
1. Create a new Supabase project at https://supabase.com
2. Run the SQL migrations from `supabase/migrations/` on your Supabase database
3. Copy your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Render environment variables

This deployment strategy uses Supabase for all backend operations, keeping your Render instance lightweight and free from memory issues.

## Technologies

- Vite
- React + TypeScript
- Tailwind CSS
- shadcn-ui
- Supabase (PostgreSQL)