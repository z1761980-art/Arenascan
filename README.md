# DukanPilot POS

DukanPilot is a modern, Pakistani-market point-of-sale workspace for motorcycle parts shops. It is designed around the real counter workflow: search a part by name/SKU/barcode, filter by common bike model, add to a sale, take cash or mobile-wallet payment, update stock, and keep workshop credit visible.

## Included in this build

- Dashboard with sales trend, today’s KPIs, recent invoices, top-selling parts, receivables, and low-stock alerts.
- Counter-first POS with CD 70, CG 125, Pridor, YBR 125/YBR 125G, GS 150, GD 110S, United US 70, Ravi Piaggio, and CB 150F fitment filters.
- Seed catalog of 28 commonly requested parts with Pakistani rupee pricing, SKUs, purchase cost, reorder levels, and fitment data.
- Cash, Easypaisa, JazzCash, and customer credit payment methods.
- Product catalog with add/edit, search, bike/category filters, stock receiving/issuing, CSV export, and reorder queue.
- Customer accounts, phone/area details, outstanding credit, payment recording, and CSV export.
- Sales reports for 7, 30, and 90 days with payment mix and estimated margin.
- Seller-only license console with monthly, half-yearly, and annual renewal plans; secure random key generation, activation, revocation, expiry, and audit activity.
- Admin settings for shop profile, receipts, tax toggle, low-stock alerts, automatic backup preference, license enforcement, team roles, exports, and JSON backup.
- Responsive layout for a counter monitor, tablet, or small laptop. Local state is retained in the browser for an offline-friendly counter experience.

## Run locally

No build step is required for the static app:

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

Open `http://localhost:4173`.

The Arena preview can be started with the same command from the repository root.

## Commercial deployment notes

This repository contains the complete POS front-end and a browser-local data adapter so the workflow can be tested immediately. For a hosted production sale, keep the UI and replace the local adapter with an authenticated API/database:

1. Store products, sales, users, audit records, and license records server-side.
2. Enforce seller/owner permissions on the API, not only in the browser.
3. Generate and validate signed license tokens on a private seller service; do not put a signing secret in client JavaScript.
4. Add server-side idempotency for sale completion, stock transactions, and license activation.
5. Add tenant isolation, encrypted backups, HTTPS, rate limiting, refresh-token rotation, and server audit logs before onboarding shops.
6. Connect receipt printing, barcode scanner input, WhatsApp/SMS reminders, and payment integrations through deployment-specific adapters.

The UI already labels the seller-only boundary and records a local audit trail, making those API boundaries explicit for the next integration step.
