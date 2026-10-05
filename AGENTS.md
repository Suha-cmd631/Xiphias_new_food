# Repository-wide agent instructions

Same rules as the XIPHIAS CRM repo, condensed:

- **Styling**: Tailwind utility classes only. Custom CSS only for animations (kept in `apps/web/src/app/globals.css`). Use the semantic tokens (`ink`, `leaf`, `leaf-dark`, `soft`, `line`, `muted`, pastels) — never raw hex in components.
- **Frontend data**: TanStack Query for all server state (`apps/web/src/lib/api/queries.ts`). No ad-hoc `useEffect` fetching. Every data-owning component has loading + error + retry UI.
- **Backend**: routes → services → repositories. Repositories own Prisma; services never import `PrismaClient`. Validate every boundary with the zod schemas in `packages/contracts`. Central error handler, consistent `{ error: { code, message } }` shape.
- **Side effects**: request handlers never send email or call couriers inline — write an `Outbox` row; `apps/api/src/worker.ts` delivers with retries.
- **Integrations** live in `apps/api/src/integrations/<provider>` behind adapters; unconfigured providers return 503 with a specific code.
- **Time**: Postgres `timestamptz`, `TZ=UTC`, ISO-8601 on the wire; the web formats via `apps/web/src/lib/time.ts`.
- **Money**: `Decimal(12,2)`, currency fixed per order, formatted server-side (`Money { amount, currency, formatted }`).
- Review generated migrations by hand; destructive changes need a note in the PR.
