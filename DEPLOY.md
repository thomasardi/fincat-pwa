# FinCat Deployment Guide

## 1. Get your Supabase Anon Key
1. Go to https://supabase.com/dashboard/project/ssgyeenkyexdywuczuhz/settings/api
2. Copy the **anon / public** key

## 2. Get your PostHog Key  
1. Go to https://us.posthog.com/project/360951/settings/project-details
2. Copy the **Project API Key** (starts with `phc_`)

## 3. Push to GitHub
```bash
# One-time setup on your machine:
gh repo create fincat-pwa --public --source=. --remote=origin --push
# OR manually:
git remote add origin https://github.com/YOUR_USERNAME/fincat-pwa.git
git push -u origin main
```

## 4. Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your `fincat-pwa` repo
3. Team: **thomasardis-projects** (already connected)
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL      = https://ssgyeenkyexdywuczuhz.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [paste from step 1]
   NEXT_PUBLIC_POSTHOG_KEY       = [paste from step 2]
   NEXT_PUBLIC_POSTHOG_HOST      = https://us.posthog.com
   ```
5. Click **Deploy** → live in ~2 minutes 🎉

## 5. (Optional) Custom Domain
- In Vercel project settings → Domains → Add `fincat.app` or similar
