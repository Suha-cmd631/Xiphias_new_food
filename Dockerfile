# One image runs all three parts of the shop: the website (Next.js), the API and the background worker.
# docker-compose.prod.yml starts it three times with a different command each.
FROM node:22-bookworm-slim

# openssl: Prisma needs it to pick the right database engine. ca-certificates: HTTPS to Neon, Stripe, SMTP.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1 COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile

# NEXT_PUBLIC_* values are baked into the website when it is built, so they come in as build arguments.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_STRIPE_PK=
ARG NEXT_PUBLIC_GA_ID=
ARG NEXT_PUBLIC_US_ORGANIC_OK=
ARG NEXT_PUBLIC_SHOW_TESTIMONIALS=
# The browser calls /api/v1 on the same address as the site; the website passes those calls to the "api" container.
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_STRIPE_PK=$NEXT_PUBLIC_STRIPE_PK \
    NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID \
    NEXT_PUBLIC_US_ORGANIC_OK=$NEXT_PUBLIC_US_ORGANIC_OK \
    NEXT_PUBLIC_SHOW_TESTIMONIALS=$NEXT_PUBLIC_SHOW_TESTIMONIALS \
    NEXT_PUBLIC_API_URL= \
    API_INTERNAL_URL=http://api:4000

# Cap memory so the build fits a small (1 GB + swap) server.
RUN pnpm db:generate && NODE_OPTIONS=--max-old-space-size=1536 pnpm build

ENV NODE_ENV=production
