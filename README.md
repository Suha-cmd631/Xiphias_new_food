# Xiphias Superfoods — website + API (drop 1)

From-scratch rebuild of xiphiassuperfoods.com: Next.js 16 storefront, Node/Express API, PostgreSQL (Prisma), regional pricing (INR · EUR · GBP · USD · CAD · AED), JioPay (India) / Stripe (abroad) checkout, Shiprocket-ready shipping, 16 products, 79 blog posts. Admin / Sales-tracker CRM comes in drop 2.

## Run it locally (5 commands)

Requirements: Node 22+, pnpm 9 (`npm i -g pnpm`), Docker Desktop (for Postgres + Redis + Mailpit).

```bash
pnpm install                 # 1. dependencies
cp .env.example apps/api/.env    # 2. config (defaults work as-is; see .env.example for the web part)
pnpm services:up             # 3. Postgres :5434, Redis :6381, Mailpit UI http://localhost:8026
pnpm db:generate && pnpm db:push && pnpm db:seed   # 4. schema + 16 products / prices / 79 posts
pnpm dev                     # 5. web http://localhost:3000  ·  api http://localhost:4000
```

Optional, in a second terminal: `pnpm dev:worker` — sends the emails (view them in Mailpit) and books shipments.

Shortcut for steps 1–4: `pnpm setup`.

The web app reads `apps/web/.env.local` (already created with local defaults). `.env.example` lists every variable with comments.

## What's inside

```
apps/web        Next.js 16 (App Router, React 19, Tailwind v4, TanStack Query)
apps/api        Express 5 + Prisma 6 (engine-less client + pg adapter) + outbox worker
packages/contracts   zod schemas shared by web and api (request/response shapes)
packages/config      shared tsconfig
docker-compose.yml   Postgres 16, Redis 7, Mailpit
```

### Pages (apps/web/src/app)
Home · Shop (+ filters, sort, pagination) · Shop/[category] · Products/[slug] · Search · About · B2B (quote form) · Contact · Blog (left / right / full-width layouts, search, categories, 79 posts) · Blog/[slug] · FAQ · Store · Policies (shipping, returns, terms, privacy, cookies) · Cart · Checkout (address → shipping → payment) · Mock pay · Thank-you · Track order · Account (login, register, orders) · Newsletter confirm · 404 · sitemap.xml · robots.txt · 301s from the old Shopify URLs.

### API (apps/api/src/modules) — base `/api/v1`
regions · catalog (products, categories, facets, bestsellers) · search/suggest · content (posts, pages, banners, settings) · cart (lines, coupon, address, shipping-rates) · checkout (create, status, mock) · orders / track / me/orders · auth (register, login, logout, me) · contact · b2b/quote · newsletter · webhooks (stripe, jiopay, shiprocket). Health: `GET /health`.

### Payments
- No keys in `.env` → the **mock gateway** is used: checkout redirects to `/checkout/mock-pay/:orderId` with Pay / Decline buttons. Everything downstream (order paid, stock, emails) runs for real.
- Add `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` (+ `NEXT_PUBLIC_STRIPE_PK` in the web env) → Stripe Payment Element for every non-India region. Webhook: `POST /api/v1/webhooks/stripe` (use `stripe listen --forward-to localhost:4000/api/v1/webhooks/stripe`).
- Add `JIOPAY_*` → hosted-checkout redirect for India. The field names / hash in `apps/api/src/modules/payments/gateways/jiopay.ts` must be matched to the JioPay integration doc that comes with the credentials.
- Payment truth comes only from webhooks / the gateway status API — never from the browser redirect.

### Regions & prices
Region = cookie `xsf_region` (detected from the edge geo header on first visit, changeable in the header picker). Each region has its own price list, currency, gateway, shipping rules and tax mode. INR prices are the live-store prices; other currencies are **draft** (INR × rate × 1.6 landed factor) in `apps/api/prisma/regions.ts` — set the real ones before launch (admin UI in drop 2).

### Useful
- `pnpm db:studio` — browse the database
- `pnpm --filter @xsf/api test` — unit tests (pricing rules)
- Demo customer: `demo@xiphias.in` / `Demo1234!` · Coupons: `BULKSAVE` (20 % on 3+ packs), `WELCOME10`
- Blog bodies are placeholders until `scripts/migrate` pulls the full articles from Shopify (needs store API access).

## Conventions
See `AGENTS.md` (same rules as the XIPHIAS CRM repo): Tailwind only, TanStack Query for server state, repositories own Prisma, zod contracts shared, no inline email/HTTP side effects in request handlers (Outbox → worker).

## Roadmap (from plan.md)
Drop 2: admin + sales tracker/CRM (dashboard, orders desk, customers, B2B pipeline, price-list editor), Shiprocket live rates/AWB, Stripe/JioPay sandbox verification, BullMQ queues, Playwright e2e, Terraform/AWS.
