#!/usr/bin/env bash
# Build and (re)start the shop. Run from the project folder on the server:
#   ./deploy/deploy.sh --first-time   first install: also loads products, prices, blog posts and pages
#   ./deploy/deploy.sh                every later update (after "git pull")
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] || { echo "Missing .env — run deploy/setup-server.sh first."; exit 1; }
grep -q '^DATABASE_URL=..*' .env || { echo "DATABASE_URL is empty in .env — paste the Neon connection string first."; exit 1; }

DC="docker compose -f docker-compose.prod.yml"

echo "==> Building (10-20 minutes the first time on a small server)"
$DC build web

echo "==> Updating the database structure"
$DC run --rm --no-deps api node_modules/.bin/prisma migrate deploy

if [ "${1:-}" = "--first-time" ] || [ "${1:-}" = "--seed" ]; then
  echo "==> Loading products, prices, blog posts and pages"
  $DC run --rm --no-deps api node_modules/.bin/tsx prisma/seed.ts
fi

echo "==> Starting"
$DC up -d --remove-orphans
docker image prune -f >/dev/null || true

ADDR=$(grep '^SITE_ADDRESS=' .env | cut -d= -f2 | cut -d, -f1 | xargs)
echo
echo "Running. Open https://$ADDR  (the first visit can take a minute while the HTTPS certificate is issued)."
echo "Status:  $DC ps        Logs:  $DC logs -f --tail=100 api"
