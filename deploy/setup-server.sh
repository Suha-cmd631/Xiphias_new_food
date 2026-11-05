#!/usr/bin/env bash
# One-time preparation of a fresh Ubuntu server (AWS Lightsail). Run from the project folder:
#   bash deploy/setup-server.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> 1/4  Swap space (lets a 1 GB server build the site without running out of memory)"
if ! swapon --show | grep -q /swapfile; then
  sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile >/dev/null && sudo swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

echo "==> 2/4  Docker"
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
fi
sudo usermod -aG docker "$USER" || true

echo "==> 3/4  Settings file (.env)"
IP=$(curl -fsS https://checkip.amazonaws.com | tr -d '\n')
ADDR="$(echo "$IP" | tr . -).sslip.io"
if [ ! -f .env ]; then
  cp deploy/production.env.example .env
  sed -i "s|^SITE_ADDRESS=.*|SITE_ADDRESS=$ADDR|; s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://$ADDR|; s|^WEB_ORIGIN=.*|WEB_ORIGIN=https://$ADDR|; s|^PUBLIC_API_URL=.*|PUBLIC_API_URL=https://$ADDR|" .env
  sed -i "s|^SESSION_SECRET=.*|SESSION_SECRET=$(openssl rand -hex 32)|; s|^SERVICE_TOKEN=.*|SERVICE_TOKEN=$(openssl rand -hex 24)|" .env
  chmod 600 .env
  echo "    Created .env with address https://$ADDR and fresh secrets."
else
  echo "    .env already exists — left unchanged."
fi

echo "==> 4/4  Done."
echo
echo "Next: open .env and paste the Neon DATABASE_URL:   nano .env"
echo "Then log out and back in once (so Docker works without sudo), and run:   ./deploy/deploy.sh --first-time"
echo "Your test address will be:  https://$ADDR"
