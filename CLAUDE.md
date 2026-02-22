# Pregnancy Tracker — Project Instructions

## Overview
A mobile-first web app for tracking pregnancy measurements (weight, abdominal circumference, belly photos). Single-user, no auth. See `docs/PRD.md` for full requirements.

## Tech Stack
- **Framework:** Next.js 15 (App Router), TypeScript, React 19
- **Styling:** Tailwind CSS 4 + shadcn/ui (New York style)
- **ORM:** Prisma with PostgreSQL (Supabase)
- **Charts:** Recharts
- **Package manager:** pnpm

## Directory Structure
```
app/                    # Next.js App Router pages & layouts
  api/upload/           # Image upload API route
  actions.ts            # Server Actions (all data mutations)
  chart-report/         # Chart report page
  entries/              # Admin CRUD pages
    [date]/             # Single entry detail
  table-report/         # Table report page
components/             # Reusable React components
  charts/               # Recharts chart components
  ui/                   # shadcn/ui generated components
lib/                    # Utilities & shared logic
  prisma.ts             # Prisma client singleton
prisma/                 # Prisma schema & migrations
public/uploads/         # Uploaded belly photos (gitignored)
docs/                   # Documentation (PRD)
helm/                   # Helm chart for k3s deployment
```

## Coding Conventions
- **TypeScript strict mode** — no `any` types unless absolutely necessary
- **Server Components by default** — only add `"use client"` when client interactivity is needed
- **Server Actions for mutations** — all CRUD operations via Server Actions in `app/actions.ts`
- **File naming:** kebab-case for files (e.g. `digit-roller.tsx`)
- **Component naming:** PascalCase (e.g. `DigitRoller`)
- **Function naming:** camelCase (e.g. `getMeasurements`)

## Prisma
- Uses Supabase PostgreSQL with connection pooler
- `DATABASE_URL` = pooled connection (port 6543, `?pgbouncer=true`) — used at runtime
- `DIRECT_URL` = direct connection (port 5432) — used for migrations
- Singleton pattern in `lib/prisma.ts` to avoid connection leaks in dev hot-reload

## Common Commands
```bash
pnpm dev                          # Start dev server (http://localhost:3000)
pnpm build                        # Production build
pnpm lint                         # Run ESLint
npx prisma migrate dev --name <n> # Create & run a migration
npx prisma migrate deploy         # Apply pending migrations (prod)
npx prisma generate               # Regenerate Prisma Client
npx prisma studio                 # Open Prisma Studio GUI
```

## Environment Variables
See `.env.example` for the template. Copy to `.env` and fill in Supabase connection strings.

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase pooled connection string |
| `DIRECT_URL` | Supabase direct connection string |
| `UPLOAD_DIR` | Image upload directory (default: `./public/uploads`) |

## UI Testing
Use the `playwright-cli` skill to interact with the running dev server for visual verification:
```bash
playwright-cli open http://localhost:3000
playwright-cli snapshot
playwright-cli click <ref>
playwright-cli screenshot
playwright-cli close
```
