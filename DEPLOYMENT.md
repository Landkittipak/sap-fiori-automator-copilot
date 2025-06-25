
# Deployment Guide - SAP Copilot

This guide covers different deployment options for the SAP Copilot application.

## 🎯 Deployment Options

### 1. Lovable Platform (Recommended)

The easiest way to deploy your SAP Copilot application:

1. **Click Publish**: In the Lovable editor, click the "Publish" button
2. **Automatic Deployment**: Your app will be automatically built and deployed
3. **Live URL**: You'll receive a live URL for your application
4. **Custom Domain**: Upgrade to connect your own domain

**Pros:**
- Zero configuration required
- Automatic builds and deployments
- Built-in CDN and global distribution
- SSL certificates included
- Easy custom domain setup

### 2. Vercel (Static Hosting)

Deploy to Vercel for excellent performance and developer experience:

```bash
# Install Vercel CLI
npm i -g vercel

# Build the project
npm run build

# Deploy
vercel

# Or deploy directly from GitHub
# Connect your GitHub repo to Vercel dashboard
```

**Configuration:**
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 3. Netlify

Deploy to Netlify for simple static hosting:

```bash
# Build the project
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**Netlify Configuration (`netlify.toml`):**
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4. AWS S3 + CloudFront

For AWS-based hosting:

```bash
# Build the project
npm run build

# Upload to S3 (using AWS CLI)
aws s3 sync dist/ s3://your-bucket-name --delete

# Configure CloudFront distribution
# Point to your S3 bucket
# Configure custom error pages for SPA routing
```

### 5. GitHub Pages

Deploy directly from your GitHub repository:

1. Build the project locally: `npm run build`
2. Push the `dist` folder to a `gh-pages` branch
3. Enable GitHub Pages in repository settings
4. Point to the `gh-pages` branch

## 🔧 Environment Configuration

### Supabase Configuration

The application is pre-configured with Supabase credentials. If using your own Supabase project:

1. **Update Client Configuration:**
```typescript
// src/integrations/supabase/client.ts
const SUPABASE_URL = "your-project-url";
const SUPABASE_PUBLISHABLE_KEY = "your-anon-key";
```

2. **Set up Database:**
   - Run migrations from `supabase/migrations/`
   - Enable Row Level Security
   - Configure authentication providers

### Authentication Setup

1. **Update Supabase Auth Settings:**
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: Add your production domain

2. **Google OAuth (Optional):**
   - Configure Google OAuth in Supabase dashboard
   - Add authorized redirect URIs

## 📊 Performance Optimization

### Build Optimization

The application is already optimized for production:

- **Code Splitting**: Automatic with Vite
- **Tree Shaking**: Dead code elimination
- **Asset Optimization**: Images and assets are optimized
- **Minification**: JavaScript and CSS are minified

### Additional Optimizations

1. **Enable Gzip/Brotli** compression on your hosting platform
2. **Configure Caching** headers for static assets
3. **Use CDN** for global distribution (most hosting platforms include this)

## 🔒 Security Considerations

### Production Checklist

- [ ] HTTPS enabled (automatic on most platforms)
- [ ] Supabase RLS policies configured
- [ ] Authentication redirect URLs updated
- [ ] No sensitive data in client-side code
- [ ] CORS configured properly in Supabase
- [ ] Rate limiting configured (if needed)

### Supabase Security

1. **Row Level Security**: Already configured
2. **API Keys**: Using public anon key (safe for client-side)
3. **Authentication**: Secure token-based authentication

## 🌐 Custom Domain Setup

### Lovable Platform
1. Go to project settings
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate is automatically provisioned

### Other Platforms
1. **Add Domain**: In your hosting platform dashboard
2. **Update DNS**: Point your domain to the hosting platform
3. **SSL**: Most platforms auto-provision SSL certificates
4. **Update Supabase**: Add new domain to auth settings

## 📈 Monitoring and Analytics

### Built-in Analytics
The application includes built-in analytics dashboard showing:
- Task execution metrics
- Success rates
- Usage patterns
- Performance data

### External Monitoring (Optional)
Consider adding:
- Google Analytics
- Sentry for error tracking
- Uptime monitoring
- Performance monitoring

## 🚀 CI/CD Pipeline (Optional)

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        working-directory: ./
```

## 🔄 Database Migrations

If you need to update the database schema:

1. **Create Migration**: Add SQL files to `supabase/migrations/`
2. **Test Locally**: Run migrations in development
3. **Deploy**: Apply migrations to production database

## 📱 Mobile Considerations

The application is responsive and works on mobile devices:
- Touch-friendly interface
- Responsive design
- Progressive Web App capabilities (can be added)

## 🆘 Troubleshooting

### Common Issues

1. **Authentication Errors:**
   - Check Supabase auth settings
   - Verify redirect URLs
   - Ensure site URL is correct

2. **Database Connection:**
   - Verify Supabase credentials
   - Check RLS policies
   - Ensure migrations are applied

3. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

### Debug Mode

Enable debug mode for troubleshooting:
```bash
# Build with source maps
npm run build -- --sourcemap

# Run in debug mode
npm run dev
```

## 📞 Support

For deployment issues:
1. Check hosting platform documentation
2. Verify Supabase configuration
3. Check browser console for errors
4. Review build logs for issues

---

**Successfully deployed? Your SAP Copilot is now live! 🎉**
