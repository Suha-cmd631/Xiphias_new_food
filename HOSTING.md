# Hosting the Xiphias Superfoods shop

One small server runs everything. Cost at today's scale (20–30 orders a day): about **US$7 a month**.

| Part | Where | Cost |
|---|---|---|
| Website, API, background worker, HTTPS | AWS Lightsail, Ubuntu, 1 GB plan, Mumbai | ~$7/month |
| Database | Neon, free plan (1 GB, permanent) | free |
| HTTPS certificate | Caddy + Let's Encrypt, automatic | free |

When sales grow: move to a bigger Lightsail plan (a few clicks), then to the full AWS setup in `plan/backend.md`.

---

## 1. Database (Neon) — 5 minutes

1. Sign up at **neon.com** with the company email.
2. **New project** → name `xiphias-superfoods` → region **AWS Asia Pacific (Mumbai)** or **Singapore** → Create.
3. Click **Connect** → turn **Connection pooling OFF** → copy the connection string (starts `postgresql://`, ends `sslmode=require`). Keep it private; it is the database password.

## 2. Server (AWS Lightsail) — 10 minutes

1. Sign in to AWS → search **Lightsail** → **Create instance**.
2. Region **Mumbai (ap-south-1)** · Platform **Linux/Unix** · Blueprint **OS Only → Ubuntu 24.04 LTS**.
3. Plan: the **$7 (1 GB RAM)** plan. Name it `xiphias-shop` → **Create instance**.
4. Open the instance → **Networking** tab:
   - **Attach static IP** (free while attached) — this IP never changes, the domain will point here later.
   - Under **IPv4 Firewall** add a rule **HTTPS (443)**. SSH (22) and HTTP (80) are already there.
5. Click **Connect using SSH** — a terminal opens in the browser. Everything below is typed there.

## 3. Install the shop — 25 minutes (mostly waiting)

```bash
git clone https://github.com/Suha-cmd631/Xiphias_new_food.git shop
cd shop
bash deploy/setup-server.sh
```
If the repository is private, GitHub asks for a username and a **personal access token** (GitHub → Settings → Developer settings → Personal access tokens → read-only access to this repository).

`setup-server.sh` adds swap memory, installs Docker, creates the settings file `.env` with fresh secrets, and prints your test address, e.g. `https://13-233-10-20.sslip.io` (the server IP with dashes — gives real HTTPS without touching the domain).

```bash
nano .env          # paste the Neon string after DATABASE_URL=   then Ctrl+O, Enter, Ctrl+X
exit               # log out once, then click "Connect using SSH" again
cd shop
./deploy/deploy.sh --first-time
```

The first build takes 10–20 minutes on the small server. Then open the printed address.

## 4. Check it

- Home, shop, a product page and the blog open over **https://**.
- Place a test order: with `ALLOW_MOCK_PAYMENTS=true` (the default in `.env`) checkout shows a fake payment page — no money moves.
- `docker compose -f docker-compose.prod.yml ps` shows `web`, `api`, `worker`, `caddy` as running.

## 5. Updating the site later

```bash
cd shop && git pull && ./deploy/deploy.sh
```
The site stays up while the new version builds; the switch-over takes a few seconds.

## 6. Going live on xiphiassuperfoods.com

Do these in order:

1. **Payments:** fill in the Stripe and/or JioPay keys in `.env` and set `ALLOW_MOCK_PAYMENTS=false`. Regions without keys show "Online payment isn't available" instead of taking orders.
2. **Email:** fill in `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (Zoho or Google app password) so order confirmations go out.
3. **Address:** in `.env` set
   `SITE_ADDRESS=xiphiassuperfoods.com, www.xiphiassuperfoods.com`
   and `NEXT_PUBLIC_SITE_URL`, `WEB_ORIGIN`, `PUBLIC_API_URL` to `https://xiphiassuperfoods.com`.
4. **DNS** (where the domain is managed): an **A record** for `@` and one for `www`, both pointing to the static IP. Remove the old Shopify records for those two names.
5. Run `./deploy/deploy.sh`. HTTPS for the real domain is issued automatically within a minute of DNS updating.
6. Put the Shopify store in password mode (keep it 30 days, then close).

## 7. Backups

Neon keeps a short history of its own. For a daily copy on the server as well:
```bash
(crontab -l 2>/dev/null; echo "30 3 * * * cd $PWD && ./deploy/backup.sh") | crontab -
```
Copies go to `~/backups` (last 14 kept).

## Useful commands

| What | Command |
|---|---|
| Is everything running? | `docker compose -f docker-compose.prod.yml ps` |
| API log | `docker compose -f docker-compose.prod.yml logs -f --tail=100 api` |
| Website log | `docker compose -f docker-compose.prod.yml logs -f --tail=100 web` |
| Restart after editing `.env` | `./deploy/deploy.sh` |
| Reload products/blog from the seed files | `./deploy/deploy.sh --seed` |
