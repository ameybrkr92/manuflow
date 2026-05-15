# ManuFlow Deployment Guide

This document outlines the hosting strategy for the ManuFlow AI ERP platform.

## 1. Database & Authentication (Supabase)
We use Supabase for PostgreSQL, Authentication, and File Storage.

### Setup Steps:
1. Create a new project in [Supabase](https://supabase.com).
2. Choose the **Mumbai (ap-south-1)** region for optimal performance in India.
3. Copy the **Database Connection String** and set it as `DATABASE_URL` in your environment variables.
4. Run Prisma migrations: `npm run db:migrate`.
5. Use the Supabase Project URL and Anon Key for client-side authentication if switching from the custom JWT system.

## 2. Backend API (Railway / Render)
The NestJS API can be hosted on platforms that support long-running Node.js processes.

### Setup Steps:
1. Connect your GitHub repository to [Railway.app](https://railway.app).
2. Set the root directory to `apps/api`.
3. Add the following Environment Variables:
   - `DATABASE_URL`: Your Supabase connection string.
   - `JWT_SECRET`: A secure random string.
   - `CLAUDE_API_KEY`: Your Anthropic API key.
   - `PORT`: 3000 (default).
4. Deploy.

## 3. Frontend Web (Vercel / Netlify)
The React/Vite application is best hosted on Vercel.

### Setup Steps:
1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Set the root directory to `apps/web`.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Add Environment Variables:
   - `VITE_API_URL`: URL of your deployed backend.
6. Deploy.

## 4. Mobile App (Expo / EAS)
The React Native app is managed via Expo.

### Setup Steps:
1. Install EAS CLI: `npm install -g eas-cli`.
2. Login: `eas login`.
3. Configure build: `eas build:configure`.
4. Build for Android/iOS: `eas build -p android`.
5. For local testing, use `npx expo start`.

## 5. Storage (Supabase Storage / S3)
Upload engineering drawings and invoices to Supabase Storage buckets or AWS S3.
- `drawings`: For CAD and PDF files.
- `invoices`: For GST invoices.
- `quality-docs`: For inspection reports.
