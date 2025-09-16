# Deploy EduPaper Frontend to Vercel

## Quick Deploy Steps

1. **Update Environment Variables**
   ```bash
   # Update .env with your backend URL
   VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
   ```

2. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

3. **Login to Vercel**
   ```bash
   vercel login
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

## Environment Variables

Set in Vercel dashboard or use `.env.example`:
- `VITE_API_BASE_URL` - Your deployed backend URL + `/api`

## Build Settings

Vercel will automatically detect:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## After Deployment

1. Your frontend will be available at: `https://your-frontend.vercel.app`
2. Test the connection to your backend API
3. Verify all features work in production

## CORS Setup

Make sure your backend allows requests from your frontend domain. The backend should already be configured for CORS.