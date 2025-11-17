# 🚀 Deployment Guide - SISFO-BAITULILMI

This guide covers three deployment options for your Next.js + Firebase application.

---

## Option 1: Vercel (⭐ Recommended - Easiest)

### Why Vercel?
- Built by Next.js creators (best compatibility)
- Zero configuration
- Free SSL & CDN
- Automatic deployments from Git
- Environment variables management
- Free tier: Generous limits

### Step-by-Step Deployment

#### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

#### 2. Push Code to GitHub
```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - SISFO-BAITULILMI"

# Create GitHub repository at https://github.com/new
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/SISFO-BAITULILMI.git
git branch -M main
git push -u origin main
```

#### 3. Deploy via Vercel Dashboard
1. Go to https://vercel.com/
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Select your repository: `SISFO-BAITULILMI`
5. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next

6. **Add Environment Variables** (CRITICAL):
   Click "Environment Variables" and add:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAqcU1_HkpSSPONkMwzC7WVD5D_qrTrdio
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sisfo-baitulilmi.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=sisfo-baitulilmi
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sisfo-baitulilmi.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=304168965102
   NEXT_PUBLIC_FIREBASE_APP_ID=1:304168965102:web:65762d80e12b0d8283b4ff

   FIREBASE_ADMIN_PROJECT_ID=sisfo-baitulilmi
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@sisfo-baitulilmi.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_FULL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n
   ```

   ⚠️ **IMPORTANT**: For `FIREBASE_ADMIN_PRIVATE_KEY`, copy the EXACT value from your `.env.local` including all `\n` characters.

7. Click **"Deploy"**

8. Wait 1-2 minutes for deployment to complete

9. Your app will be live at: `https://sisfo-baitulilmi.vercel.app`

#### 4. Configure Firebase Authentication Domain
1. Go to Firebase Console: https://console.firebase.google.com/project/sisfo-baitulilmi/authentication/settings
2. Scroll to "Authorized domains"
3. Click "Add domain"
4. Add your Vercel domain: `sisfo-baitulilmi.vercel.app`

#### 5. Update Vercel Domain (Optional - Custom Domain)
1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain (e.g., `sisfo-baitulilmi.com`)
3. Update DNS records as instructed
4. Add the custom domain to Firebase authorized domains

### Deploy from CLI (Alternative)
```bash
vercel

# Follow prompts, then for production:
vercel --prod
```

---

## Option 2: Firebase Hosting

### Why Firebase Hosting?
- Integrated with Firebase services
- Free SSL
- Global CDN
- Easy rollbacks

### Limitations
- Next.js dynamic features require Cloud Functions (more complex)
- Server-side rendering needs additional setup

### Deployment Steps

#### 1. Update Firebase Config

Edit `firebase.json`:
```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

#### 2. Update package.json
Add export script:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next build && next export",
    "deploy": "npm run export && firebase deploy --only hosting"
  }
}
```

⚠️ **NOTE**: This only works for static export. Your app uses server-side features (middleware, API routes), so you'll need Cloud Functions for full functionality.

#### 3. Deploy
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only hosting
```

**Your app will be at**: `https://sisfo-baitulilmi.web.app`

---

## Option 3: Traditional VPS (Digital Ocean, AWS, etc.)

### Why VPS?
- Full control
- Can run any Node.js app
- Good for custom infrastructure

### Basic Setup (Ubuntu Server)

#### 1. Prepare Your Server
```bash
# SSH into your server
ssh root@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### 2. Deploy Your Code
```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/SISFO-BAITULILMI.git
cd SISFO-BAITULILMI

# Install dependencies
npm install

# Create .env.local with your environment variables
nano .env.local
# (Paste all your Firebase credentials)

# Build the app
npm run build

# Start with PM2
pm2 start npm --name "sisfo-baitulilmi" -- start
pm2 save
pm2 startup
```

#### 3. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/sisfo-baitulilmi
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/sisfo-baitulilmi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] Firebase project is set up correctly
- [ ] Firestore security rules are deployed
- [ ] Environment variables are configured
- [ ] Data is migrated (if applicable)
- [ ] Admin user is created
- [ ] `.env.local` is NOT committed to Git
- [ ] `.gitignore` includes `.env*.local`
- [ ] Firebase authorized domains include your deployment domain

---

## 🔧 Environment Variables Reference

All deployments need these environment variables:

### Client-side (NEXT_PUBLIC_*)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Server-side (FIREBASE_ADMIN_*)
```bash
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

---

## 🎯 Recommended Choice

**For your project, I recommend Vercel because:**

1. ✅ **Zero configuration** - Works out of the box
2. ✅ **Free tier is generous** - Perfect for this app
3. ✅ **Automatic HTTPS** - Free SSL certificates
4. ✅ **Fast deployments** - 1-2 minutes
5. ✅ **Git integration** - Push to deploy
6. ✅ **Environment variables UI** - Easy to manage
7. ✅ **Best Next.js support** - Made by the creators

### Quick Start with Vercel:
```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main

# 2. Go to vercel.com
# 3. Import your GitHub repository
# 4. Add environment variables
# 5. Deploy!
```

---

## 🔍 Testing Your Deployment

After deployment, test:

1. **Homepage**: Should load without errors
2. **Public attendance page**: Should show categories (if data exists)
3. **Login page**: `/login` - Should display login form
4. **Admin panel**: `/admin` - Should redirect to login if not authenticated
5. **Authentication**: Try logging in with your admin user
6. **Real-time updates**: Test attendance marking

---

## 📞 Need Help?

- Vercel Docs: https://vercel.com/docs
- Firebase Hosting: https://firebase.google.com/docs/hosting
- Next.js Deployment: https://nextjs.org/docs/deployment

