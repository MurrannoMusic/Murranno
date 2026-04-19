# Netlify Deployment Guide

## Overview

This guide covers deploying the Murranno Music web application to Netlify. The application is built with Vite + React and uses Supabase for backend services.

## Prerequisites

- [Netlify account](https://app.netlify.com/signup) (free tier works)
- Git repository with your code (GitHub, GitLab, or Bitbucket)
- Node.js 18+ installed locally (for testing)

## Quick Start

### Option 1: Deploy via Netlify UI (Recommended)

1. **Connect Repository**
   - Log in to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select the `murranno-music` repository

2. **Configure Build Settings**

   Netlify should auto-detect the settings from `netlify.toml`, but verify:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
   - **Node version:** 24

3. **Add Environment Variables**

   Go to Site settings → Environment variables → Add variables:

   ```
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_SUPABASE_PROJECT_ID=your_project_id
   VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete (~2-3 minutes)
   - Your site will be live at `https://[random-name].netlify.app`

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**

   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**

   ```bash
   netlify login
   ```

3. **Initialize Site**

   ```bash
   cd c:\Users\PRECISE\Desktop\Projects\Murranno\murranno-music\frontend
   netlify init
   ```

   Follow the prompts to connect your repository.

4. **Set Environment Variables**

   ```bash
   netlify env:set VITE_CLOUDINARY_CLOUD_NAME your_cloud_name
   netlify env:set VITE_SUPABASE_PROJECT_ID your_project_id
   netlify env:set VITE_SUPABASE_PUBLISHABLE_KEY your_publishable_key
   netlify env:set VITE_SUPABASE_URL your_supabase_url
   netlify env:set VITE_SUPABASE_ANON_KEY your_anon_key
   ```

5. **Deploy**

   ```bash
   netlify deploy --prod
   ```

## Configuration Details

### netlify.toml

The `netlify.toml` file in the frontend directory configures:

- **Build Settings:** Node 18, npm build command, dist output
- **SPA Redirects:** All routes redirect to index.html for React Router
- **Security Headers:** CSP, HSTS, X-Frame-Options, etc.
- **Caching:** Optimized caching for static assets and service workers

### Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the Vite build:

| Variable | Description |
|----------|-------------|
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for media uploads |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project identifier |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key for client access |

> **Important:** Never commit the `.env` file to Git. Environment variables should only be set in Netlify's dashboard.

## Custom Domain Setup

1. **Add Custom Domain**
   - Go to Site settings → Domain management
   - Click "Add custom domain"
   - Enter your domain (e.g., `murrannomusic.com`)

2. **Configure DNS**

   Add these DNS records at your domain registrar:

   **For apex domain (murrannomusic.com):**

   ```
   Type: A
   Name: @
   Value: 75.2.60.5
   ```

   **For www subdomain:**

   ```
   Type: CNAME
   Name: www
   Value: [your-site].netlify.app
   ```

3. **Enable HTTPS**
   - Netlify automatically provisions SSL certificates
   - Wait a few minutes for DNS propagation
   - HTTPS will be enabled automatically

## Continuous Deployment

Netlify automatically deploys when you push to your repository:

- **Production:** Pushes to `main` branch deploy to production
- **Preview:** Pull requests create preview deployments
- **Branch Deploys:** Configure specific branches for staging

### Deploy Previews

Every pull request gets a unique preview URL:

- Automatically built and deployed
- Perfect for testing before merging
- Accessible at `https://deploy-preview-[PR#]--[site-name].netlify.app`

## Testing the Deployment

After deployment, verify:

1. **Navigation**
   - Test all routes (home, login, dashboard, etc.)
   - Verify React Router works (no 404s on refresh)

2. **Authentication**
   - Test login/signup flow
   - Verify Supabase connection works
   - Check OAuth redirects

3. **API Calls**
   - Test data fetching from Supabase
   - Verify Cloudinary uploads work
   - Check edge functions are accessible

4. **Performance**
   - Run Lighthouse audit
   - Check PWA functionality
   - Verify service worker caching

5. **Security**
   - Check security headers in DevTools Network tab
   - Verify HTTPS is enforced
   - Test CSP doesn't block legitimate requests

## Troubleshooting

### Build Fails

**Error:** `Command failed with exit code 1`

**Solution:**

1. Check build logs in Netlify dashboard
2. Verify all environment variables are set
3. Test build locally: `npm run build`
4. Check Node version matches (18+)

### 404 on Page Refresh

**Error:** Routes work on navigation but 404 on refresh

**Solution:**

- Verify `netlify.toml` is in the frontend directory
- Check the redirect rule is present: `/* → /index.html (200)`

### Environment Variables Not Working

**Error:** `undefined` when accessing `import.meta.env.VITE_*`

**Solution:**

1. Verify variables are prefixed with `VITE_`
2. Check they're set in Netlify dashboard
3. Trigger a new deploy after adding variables
4. Clear cache and redeploy if needed

### Supabase Connection Issues

**Error:** CORS errors or connection failures

**Solution:**

1. Add Netlify domain to Supabase allowed origins
2. Go to Supabase Dashboard → Settings → API
3. Add your Netlify URL to "Site URL" and "Redirect URLs"

### CSP Blocking Resources

**Error:** Content Security Policy blocks scripts/styles

**Solution:**

1. Check browser console for CSP violations
2. Update CSP in `netlify.toml` to allow the domain
3. Redeploy after updating configuration

## Performance Optimization

### Enable Netlify Features

1. **Asset Optimization**
   - Site settings → Build & deploy → Post processing
   - Enable: Bundle CSS, Minify CSS, Minify JS, Compress images

2. **Prerendering**
   - For better SEO on static pages
   - Site settings → Build & deploy → Prerendering

3. **Edge Functions** (if needed)
   - For server-side logic at the edge
   - Create `netlify/edge-functions` directory

## Monitoring

### Analytics

Enable Netlify Analytics:

- Site settings → Analytics
- Provides server-side analytics (no client-side tracking)
- Shows page views, top pages, bandwidth usage

### Logs

View deployment and function logs:

- Deploys → [specific deploy] → Deploy log
- Functions → [function name] → Function log

## Cost Considerations

**Free Tier Includes:**

- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- HTTPS on custom domains
- Deploy previews

**Paid Plans:**

- Pro: $19/month (1 TB bandwidth, 1000 build minutes)
- Business: Custom pricing

## Next Steps

1. ✅ Deploy to Netlify
2. 🔧 Set up custom domain
3. 📊 Enable analytics
4. 🔄 Configure continuous deployment
5. 🧪 Set up staging environment (optional)
6. 📱 Test on mobile devices
7. 🚀 Share with users!

## Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#netlify)
- [Supabase + Netlify Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-netlify)
- [netlify.toml Reference](https://docs.netlify.com/configure-builds/file-based-configuration/)

## Support

If you encounter issues:

1. Check [Netlify Support Forums](https://answers.netlify.com/)
2. Review [Netlify Status](https://www.netlifystatus.com/)
3. Contact Netlify support (Pro/Business plans)
