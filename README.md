# 🐱 FinCat PWA

> Investasi bareng si Kucing — compound interest simulator for financial literacy

## Quick Deploy (3 minutes)

```bash
# 1. Extract the zip, then:
cd fincat-pwa-deploy

# 2. Run the deploy script
./deploy.sh
```

The script will ask for 2 keys then deploy automatically.

## Manual Deploy

```bash
npm install
cp .env.local.template .env.local
# Fill in your keys in .env.local
vercel --prod
```

## Environment Variables

| Variable | Where to get |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Already set: `https://ssgyeenkyexdywuczuhz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/ssgyeenkyexdywuczuhz/settings/api) |
| `NEXT_PUBLIC_POSTHOG_KEY` | [PostHog → Project Settings](https://us.posthog.com/project/360951/settings/project-details) |
| `NEXT_PUBLIC_POSTHOG_HOST` | Already set: `https://us.posthog.com` |

## Features

- 📈 **Compound Interest Simulator** — stacked bar chart, top-up rutin, tabel breakdown
- 🐱 **Cat Mascot** — 5 ekspresi SVG (idle, excited, thinking, celebrating, sleeping)
- 🎯 **Feature Slider** — 6 product icons dengan coming soon screen
- 📊 **PostHog Analytics** — simulation_run, feature_selected, feedback_submitted, dll
- 🗄️ **Supabase** — simulations, feedback, feature_requests, feature_usage tables
- 🛡️ **Anti-fraud Ads** — 30s delay + 60s cooldown + scroll check
- 💬 **Feedback Modal** — star rating + Supabase insert
- 💡 **Request Dong!** — feature request flow

## Tech Stack

Next.js 14 • TypeScript • Tailwind CSS • Recharts • Supabase • PostHog • Vercel

## Supabase

Project: `ssgyeenkyexdywuczuhz` (ap-southeast-2)  
Migrations applied: `fincat_initial_schema` + `fincat_security_hardening`
