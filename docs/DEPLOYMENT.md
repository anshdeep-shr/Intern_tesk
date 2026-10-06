# Deployment Guide

This document explains step-by-step instructions on deploying the **Backend API**, **Web Frontend**, **Database**, and **Mobile App**.

---

## 1. Backend & Database Deployment (Render / Railway / Fly.io)

### Option A: Render.com
1. Create a **PostgreSQL Database** on Render.
   - Note the `Internal Database URL` and `External Database URL`.
2. Create a **Web Service** pointing to your repository `backend` directory.
3. Set Build Command: `npm install && npm run build`
4. Set Start Command: `npx prisma db push && npm start`
5. Set Environment Variables:
   - `PORT`: `5000`
   - `DATABASE_URL`: `<Your-PostgreSQL-Connection-String>`
   - `JWT_SECRET`: `<Random-Generated-Secret-Key>`
   - `CORS_ORIGIN`: `https://your-web-frontend.vercel.app`

### Option B: Railway.app / Railway CLI
1. Run `railway init` inside `backend/`.
2. Provision a PostgreSQL plugin.
3. Deploy service: `railway up`.

---

## 2. Web Frontend Deployment (Vercel / Netlify)

### Deploying to Vercel
1. Import repository to Vercel dashboard.
2. Select Root Directory: `web`.
3. Framework Preset: `Vite`.
4. Environment Variables:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api`
5. Click **Deploy**.

---

## 3. Mobile App Deployment & APK Build (Expo EAS)

### Building Android APK with Expo EAS:
1. Install EAS CLI: `npm install -g eas-cli`
2. Log in to Expo: `eas login`
3. Configure EAS project: `eas build:configure`
4. Build Android Standalone APK:
```bash
eas build -p android --profile preview
```
5. Download generated `.apk` file or scan QR code to install on Android device.
