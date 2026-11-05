#!/usr/bin/env bash
# Copies the whole database into ~/backups (keeps the last 14). Neon also keeps its own short history.
# Daily at 03:30:   (crontab -l 2>/dev/null; echo "30 3 * * * cd $PWD && ./deploy/backup.sh") | crontab -
set -euo pipefail
cd "$(dirname "$0")/.."
URL=$(grep '^DATABASE_URL=' .env | cut -d= -f2-)
mkdir -p ~/backups
F=~/backups/xiphias-$(date +%Y%m%d-%H%M).sql.gz
docker run --rm postgres:17-alpine pg_dump "$URL" --no-owner | gzip > "$F"
ls -1t ~/backups/xiphias-*.sql.gz | tail -n +15 | xargs -r rm --
echo "Saved $F"
