# Pregnancy Tracker — Product Requirements Document

## 1. Overview

**Product name:** Pregnancy Tracker

**Description:** A simple, mobile-first web application for pregnant women to track daily body weight, abdominal circumference, and belly photos throughout their pregnancy. The app provides tabular and chart-based reports to visualize trends over time.

**Target user:** A single pregnant woman (personal use, single-tenant).

**Goals:**
- Make daily measurement entry as fast and frictionless as possible (< 10 seconds).
- Provide clear visual reports of weight and circumference trends.
- Keep the tech stack simple and self-hostable.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), TypeScript, React 19 |
| Styling | Tailwind CSS 4 + shadcn/ui component library |
| ORM | Prisma (PostgreSQL provider) |
| Database | Supabase PostgreSQL (all environments) |
| Charting | Recharts (free, open-source, React-native) |
| Image storage | Local filesystem (`/uploads`) in dev; persistent volume in k3s |
| Auth | None (single-user personal app; can be added later behind a reverse-proxy or basic auth) |
| Deployment | Vercel (primary) + Docker image + Helm chart for self-hosted k3s |

---

## 3. Data Model

### 3.1 `Measurement` table

| Column | Type | Constraints | Description |
|---|---|---|---|
| `date` | `DATE` | **Primary Key** | The calendar date of the measurement (one entry per day). |
| `weight` | `DECIMAL(4,1)` | NOT NULL | Body weight in kg (e.g. `64.1`). |
| `circumference` | `DECIMAL(4,1)` | NULL | Abdominal circumference in cm (e.g. `87.3`). Optional. |
| `imagePath` | `TEXT` | NULL | Relative path to the uploaded belly photo. Optional. |
| `createdAt` | `TIMESTAMP` | NOT NULL, default now | Record creation timestamp. |
| `updatedAt` | `TIMESTAMP` | NOT NULL, auto-update | Record last-update timestamp. |

### 3.2 Prisma schema (reference)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Measurement {
  date           DateTime  @id @db.Date
  weight         Float
  circumference  Float?
  imagePath      String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

---

## 4. Use Cases

### UC1: Daily Measurement Entry

Set the morning body weight, abdominal circumference, and optionally upload an image.

**Precondition:** No daily measurement exists for the current day.

**Steps:**
1. User opens the app (home page).
2. The UI is in **edit mode** by default (no entry exists yet).
3. User enters body weight, optionally abdominal circumference, and optionally uploads/captures a photo.
4. User clicks the **Save** button.

**Postconditions:**
- A new measurement record is persisted in the database.
- The home page switches to **display mode** showing today's values.

### UC2: Daily Measurement Correction

**Precondition:** A daily measurement already exists for the current day.

**Steps:**
1. User opens the app — the home page is in **display mode** showing today's entry.
2. User clicks the **Edit** button to switch to edit mode.
3. User modifies weight, circumference, or image.
4. User clicks the **Save** button.

**Postconditions:**
- The existing record for today is updated in the database.
- The home page returns to display mode with the updated values.

### UC3: Table Report

**Precondition:** At least one daily measurement exists.

**Steps:**
1. User navigates to the **Table Report** page.
2. A table is displayed with one row per measurement day, ordered by **descending date** (most recent on top).
3. Columns: **Date**, **Weight (kg)**, **Abdominal Circumference (cm)**.

### UC4: Chart Report

**Precondition:** At least one daily measurement exists.

**Steps:**
1. User navigates to the **Chart Report** page.
2. A toggle at the top allows switching between **Combo-chart** and **Distinct-chart** mode.
3. **Combo-chart mode:**
   - A single 2D chart is displayed.
   - X-axis: date.
   - Dual Y-axes: left axis for circumference (cm), right axis for weight (kg).
   - Line chart with rectangular markers for circumference.
   - Bar chart for weight.
4. **Distinct-chart mode:**
   - Two separate charts are displayed — one for weight, one for circumference.
5. Charts are interactive — hovering/tapping on a data point shows a tooltip with the exact value and date.

### UC5: Admin Interface (CRUD)

**Precondition:** None.

**Steps:**
- User can **list** all entries in a table.
- User can **create** a new entry with a selectable date, weight, circumference, and image.
- User can **view** a single entry by clicking a row.
- User can **edit** any existing entry (except the date, which is the primary key).
- User can **delete** a single entry (with a confirmation dialog).

---

## 5. API Design (Next.js Server Actions & API Routes)

All data mutations use **Next.js Server Actions** for tight integration with the App Router. Image uploads use an API route for multipart form handling.

| Method | Route / Action | Description |
|---|---|---|
| Server Action | `createMeasurement(data)` | Insert a new measurement record. |
| Server Action | `updateMeasurement(date, data)` | Update an existing measurement. |
| Server Action | `deleteMeasurement(date)` | Delete a measurement by date. |
| Server Action | `getMeasurements()` | Fetch all measurements (ordered by date desc). |
| Server Action | `getMeasurement(date)` | Fetch a single measurement. |
| Server Action | `getTodayMeasurement()` | Fetch today's measurement (or null). |
| `POST` | `/api/upload` | Accept a multipart image upload, store it, return the path. |

---

## 6. Frontend

### 6.1 General Considerations

- **Mobile-first, responsive design.** The primary device is a smartphone used each morning.
- **Color scheme:** Soft, calming pregnancy-friendly palette — pastel pinks, lavenders, and warm whites. Use Tailwind CSS custom theme colors.
- **Component library:** shadcn/ui for buttons, dialogs, tables, cards, and form elements.
- **Charting:** Recharts — free, open-source, composable React charting library.
- **Daily entry UX:** The weight/circumference input must not require a mobile keyboard. Use a swipeable digit-roller instead.
- **Navigation:** A persistent bottom navigation bar (mobile) / top nav bar (desktop) with 4 items:
  - 🏠 **Home** (`/`)
  - 📋 **Table** (`/table-report`)
  - 📊 **Charts** (`/chart-report`)
  - ⚙️ **Admin** (`/entries`)

### 6.2 Pages

#### `/` — Home (Daily Measurement)

- Main page, optimized for entering or updating the daily measurement.
- Has two modes: **display** and **edit**.
  - If a measurement for today already exists → default to **display** mode.
  - If no measurement exists for today → default to **edit** mode.
- Displays a **carousel** with three slides:
  1. **Weight editor:**
     - Large 3-digit display (2 integer + 1 decimal, e.g. `64.1 kg`).
     - **Edit mode:** Each digit is individually swipeable (up/down). Small triangle arrows appear above and below each digit. Default value is the most recent entry's weight, or `60.0` if the DB is empty.
     - **Display mode:** Digits shown without arrows (read-only).
  2. **Circumference editor:**
     - Same UX as the weight editor, 3 digits (e.g. `87.3 cm`).
     - Default value is the most recent entry's circumference, or `70.0` if the DB is empty.
  3. **Image editor:**
     - Displays the uploaded image, or an empty placeholder with a camera icon.
     - **Edit mode:** Tapping opens a file picker / camera capture dialog.
     - **Display mode:** Displays the image (read-only).
- Below the carousel:
  - **Edit mode:** A **Save** button. On click → creates or updates the measurement, then switches to display mode.
  - **Display mode:** An **Edit** button. On click → switches to edit mode.

#### `/table-report` — Table Report

- Displays a formatted, responsive table as described in **UC3**.
- Pagination or virtual scrolling if the entry count exceeds 50.
- Optional: a search/filter bar to jump to a specific date range.

#### `/chart-report` — Chart Report

- Displays interactive charts as described in **UC4**.
- Toggle button (combo / distinct) at the top of the page.
- Responsive — charts resize to fit the viewport.
- Tooltips on hover/tap showing exact values.

#### `/entries` — Admin List

- A table listing all measurement entries (date, weight, circumference, has image).
- Clicking/tapping a row navigates to `/entries/<date>`.
- **New** button at the top:
  - Opens an inline form with fields: date (date picker), weight, circumference, image upload.
  - **Save** button → creates a new entry. On success a green toast is shown. On error a red error message is displayed.

#### `/entries/[date]` — Admin Detail

- **Display mode:**
  - Properties listed in a clean 2-column layout (label / value), borderless.
  - Image displayed if present.
  - **Edit** button → switches to edit mode.
  - **Delete** button → opens a confirmation dialog. On confirm → deletes the entry and redirects to `/entries`.
- **Edit mode:**
  - Same layout, but values are editable text inputs.
  - Date is **read-only** (it is the primary key).
  - Image can be replaced via file picker.
  - **Save** button → updates the entry, returns to display mode.
  - **Cancel** button → discards changes, returns to display mode.

---

## 7. Navigation & Layout

```
┌─────────────────────────────────────┐
│  Pregnancy Tracker       [nav bar]  │  ← Desktop: top bar
├─────────────────────────────────────┤
│                                     │
│           Page Content              │
│                                     │
├─────────────────────────────────────┤
│  🏠  │  📋  │  📊  │  ⚙️           │  ← Mobile: bottom tab bar
└─────────────────────────────────────┘
```

- Use Next.js App Router **layout.tsx** for the shared shell.
- Active tab is highlighted with the primary theme color.

---

## 8. Image Handling

- Images are uploaded via a `POST /api/upload` endpoint using `multipart/form-data`.
- Files are stored on the server filesystem under `/public/uploads/<date>.<ext>` (dev) or a persistent volume mount (k3s).
- Only JPEG, PNG, and WebP formats are accepted. Max file size: **5 MB**.
- Images are served statically via Next.js static file serving from `/uploads/`.
- On Vercel, images should be stored in Vercel Blob or an S3-compatible bucket (configurable via environment variable).

---

## 9. Deployment

### 9.1 Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Supabase connection string (pooled, for Prisma Client) | `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase direct connection (for Prisma migrations) | `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres` |
| `UPLOAD_DIR` | Directory for uploaded images | `./public/uploads` |
| `NODE_ENV` | `development` or `production` | `development` |

### 9.2 Supabase Setup

- Create a Supabase project (one for dev, optionally a separate one for prod).
- Copy the **pooled connection string** (port `6543`, with `?pgbouncer=true`) → `DATABASE_URL`.
- Copy the **direct connection string** (port `5432`) → `DIRECT_URL`.
- Prisma uses `DIRECT_URL` for migrations and `DATABASE_URL` for runtime queries.

### 9.3 Vercel

- Connect the GitHub repo to Vercel.
- Set `DATABASE_URL` and `DIRECT_URL` to the Supabase connection strings.
- Prisma migrations run as part of the build step.
- Images stored in Vercel Blob (or external S3).

### 9.4 Docker

```dockerfile
# Multi-stage build
FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npx prisma generate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "server.js"]
```

### 9.5 Helm Chart (k3s)

Generate a Helm chart under `helm/pregnancy-tracker/` with the following structure:

```
helm/pregnancy-tracker/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── pvc.yaml            # Persistent volume for uploads
│   ├── configmap.yaml
│   └── secret.yaml          # DATABASE_URL, DIRECT_URL
```

**Key values.yaml settings:**
- `image.repository` / `image.tag`
- `supabase.databaseUrl` — pooled Supabase connection string
- `supabase.directUrl` — direct Supabase connection string
- `persistence.enabled`, `persistence.size` (for image uploads PVC)
- `ingress.enabled`, `ingress.host`

---

## 10. Non-Functional Requirements

| Requirement | Target |
|---|---|
| **Performance** | Home page loads in < 1s on 4G. |
| **Responsiveness** | Fully usable on screens ≥ 320px wide. |
| **Browser support** | Latest 2 versions of Chrome, Safari, Firefox, Edge. |
| **Accessibility** | WCAG 2.1 AA — proper labels, contrast, keyboard navigation. |
| **Data safety** | Data stored in Supabase (managed PostgreSQL). For full data sovereignty, deploy to self-hosted k3s with your own PostgreSQL instance. No third-party analytics or tracking. |
| **Offline** | Not required for v1. |

---

## 11. Development Milestones

| Phase | Scope | Estimate |
|---|---|---|
| **M1 — Scaffold** | Next.js project setup, Prisma schema, DB migration, Tailwind + shadcn/ui theming, layout with navigation. | 1 day |
| **M2 — Daily Entry** | Home page with swipeable digit roller, image upload, create/update logic (UC1 & UC2). | 2–3 days |
| **M3 — Reports** | Table report page (UC3) and chart report page with Recharts (UC4). | 2 days |
| **M4 — Admin CRUD** | Admin list page and detail page with full CRUD (UC5). | 1–2 days |
| **M5 — Deployment** | Dockerfile, Helm chart, Vercel deployment, end-to-end testing. | 1–2 days |

---

## 12. Future Considerations (Out of Scope for v1)

- Multi-user support with authentication (e.g. NextAuth.js).
- Push notification reminders to enter daily measurements.
- Export data as CSV / PDF.
- Pregnancy week calculator and milestone tracking.
- Doctor appointment notes.
- PWA / offline support.
