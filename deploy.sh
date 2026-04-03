#!/bin/bash
set -e

# ─── Colors ───────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

echo -e "${CYAN}${BOLD}"
echo "  ███████╗██╗███╗   ██╗ ██████╗ █████╗ ████████╗"
echo "  ██╔════╝██║████╗  ██║██╔════╝██╔══██╗╚══██╔══╝"
echo "  █████╗  ██║██╔██╗ ██║██║     ███████║   ██║   "
echo "  ██╔══╝  ██║██║╚██╗██║██║     ██╔══██║   ██║   "
echo "  ██║     ██║██║ ╚████║╚██████╗██║  ██║   ██║   "
echo "  ╚═╝     ╚═╝╚═╝  ╚═══╝ ╚═════╝╚═╝  ╚═╝  ╚═╝   "
echo -e "${NC}"
echo -e "${BOLD}FinCat PWA — One-Command Deploy${NC}"
echo "─────────────────────────────────────────────────"
echo ""

# ─── Check Node ───────────────────────────────────────────────────
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js not found. Install from https://nodejs.org${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node $(node --version)${NC}"

# ─── Check/Install Vercel CLI ─────────────────────────────────────
if ! command -v vercel &> /dev/null; then
  echo -e "${YELLOW}Installing Vercel CLI...${NC}"
  npm install -g vercel
fi
echo -e "${GREEN}✓ Vercel CLI ready${NC}"

# ─── Collect credentials ──────────────────────────────────────────
echo ""
echo -e "${BOLD}We need 2 keys to complete setup:${NC}"
echo ""
echo -e "${CYAN}1. Supabase Anon Key${NC}"
echo "   → Open: https://supabase.com/dashboard/project/ssgyeenkyexdywuczuhz/settings/api"
echo "   → Copy the 'anon / public' key"
echo ""
read -p "Paste Supabase Anon Key: " SUPABASE_ANON_KEY
echo ""

echo -e "${CYAN}2. PostHog Project API Key${NC}"
echo "   → Open: https://us.posthog.com/project/360951/settings/project-details"
echo "   → Copy the 'Project API Key' (starts with phc_)"
echo ""
read -p "Paste PostHog Key (or press Enter to skip): " POSTHOG_KEY
POSTHOG_KEY=${POSTHOG_KEY:-"placeholder_add_later"}
echo ""

# ─── Write .env.local ─────────────────────────────────────────────
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://ssgyeenkyexdywuczuhz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
NEXT_PUBLIC_POSTHOG_KEY=${POSTHOG_KEY}
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com
EOF

echo -e "${GREEN}✓ .env.local created${NC}"

# ─── Install dependencies ─────────────────────────────────────────
echo ""
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install --legacy-peer-deps --silent
echo -e "${GREEN}✓ Dependencies installed${NC}"

# ─── Login to Vercel ──────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Logging in to Vercel...${NC}"
vercel login

# ─── Deploy ───────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Deploying to Vercel...${NC}"

vercel deploy --prod \
  --yes \
  --name fincat-pwa \
  --env NEXT_PUBLIC_SUPABASE_URL="https://ssgyeenkyexdywuczuhz.supabase.co" \
  --env NEXT_PUBLIC_SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY}" \
  --env NEXT_PUBLIC_POSTHOG_KEY="${POSTHOG_KEY}" \
  --env NEXT_PUBLIC_POSTHOG_HOST="https://us.posthog.com" \
  2>&1 | tee /tmp/vercel_deploy.log

# ─── Get deployed URL ─────────────────────────────────────────────
DEPLOY_URL=$(grep -o 'https://[^ ]*vercel\.app' /tmp/vercel_deploy.log | tail -1)

echo ""
echo "─────────────────────────────────────────────────"
echo -e "${GREEN}${BOLD}🎉 FinCat is LIVE!${NC}"
echo ""
if [ -n "$DEPLOY_URL" ]; then
  echo -e "  ${CYAN}${BOLD}${DEPLOY_URL}${NC}"
else
  echo -e "  ${CYAN}Check your Vercel dashboard for the URL${NC}"
fi
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  • Open the URL above on your phone"
echo "  • Test all 6 feature slider buttons"
echo "  • Run a compound interest simulation"
echo "  • Submit a feedback rating"
echo "  • Check PostHog dashboard for events"
echo "─────────────────────────────────────────────────"
