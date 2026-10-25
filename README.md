# PREHERITAGE — Ecommerce Starter

A mobile-first, quiet-luxury storefront starter for **PREHERITAGE — Wear the Stories of India**. Built with Next.js App Router, TypeScript, Tailwind CSS, Prisma/PostgreSQL, Auth.js (Google OAuth + Twilio Verify OTP), Cloudinary signed image uploads, and Razorpay/COD order flows.

> **Important:** This is a substantial working starter, not yet a fully audited production commerce system. Live provider credentials, a database, real product photography, end-to-end tests, and a number of operations screens/integrations are required before accepting real orders. The scaffold deliberately calls out unfinished areas rather than simulating working integrations.

## Included in this starter

- Premium responsive home page, product catalogue, search/category filtering, product details, editorial story, FAQ, contact and draft policy pages.
- Persistent client-side shopping bag, shipping threshold calculation, checkout form, COD order creation and server-side Razorpay order creation/signature verification.
- PostgreSQL Prisma schema for users, Auth.js accounts/sessions, admins/roles, addresses, products/images/variants, categories, collections, regions, orders/items/payments, coupons/usages, wishlists, reviews/questions, banners/posters, returns/refunds, support tickets, notifications, newsletter subscribers and admin activity logs.
- Google OAuth, Twilio Verify OTP start + verify hooks, customer account with recent orders, server-guarded admin overview, product creation, Cloudinary signed upload credentials, content/poster entry and admin order status/tracking fields.
- Newsletter and support-ticket APIs, Razorpay webhook skeleton, robots.txt and sitemap.
- Seed data for six illustrative products to validate layout and DB wiring.

## Not yet complete / required before launch

- The sample product photos are illustrative remote images. Replace every image, SKU, size/colour variant and product description with approved PREHERITAGE inventory details.
- The admin screens are a starter foundation. Page and API role gates are in place for product, order, and content sections, but full variant management, product editing UI, bulk inventory tools, customer management, finance charts/exports, coupons, reviews moderation, FAQ/blog CMS, and scheduled content publication are not fully implemented.
- Customer address CRUD, complete profile editing/deletion, wishlist actions, review/Q&A submissions, invoices, returns/exchanges, support ticket management and in-site notification UI need completion.
- The Razorpay flow checks signed callbacks against the Razorpay payment API, captures authorised payments, and makes callback/webhook settlement idempotent. Inventory conflicts are flagged for manual refund review. No automatic gateway refund call, durable retries/reconciliation queue, or accounting/tax engine is enabled. Configure the webhook in Razorpay and test duplicate events and races before launch.
- COD serviceability, PIN-code lookup, courier-rate lookup, automated Shiprocket/Delhivery sync, shipping labels, delivery notifications and carrier webhooks are not connected.
- Email notifications/receipts, SMS/WhatsApp order updates, abandoned-cart messaging, Stripe, analytics/Meta Pixel, consent management and accessibility/performance audit are not complete.
- Policy copy is deliberately draft-only; review legal entity details, consumer-law compliance, privacy, shipping, cancellation and returns before publication.

## 1. Folder structure

```text
preheritage-store/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── auth/otp/start/route.ts
│   │   ├── products/route.ts
│   │   ├── newsletter/route.ts
│   │   ├── contact/route.ts
│   │   ├── checkout/{cod,razorpay}/route.ts
│   │   ├── checkout/razorpay/verify/route.ts
│   │   ├── webhooks/razorpay/route.ts
│   │   └── admin/{products,orders,banners,posters,upload/sign}/route.ts
│   ├── account/ page.tsx
│   ├── admin/ (overview, products, orders, content)
│   ├── about/ cart/ checkout/ contact/ faq/ login/ shop/
│   ├── products/[slug]/ order-success/ shipping/ returns/ privacy/ terms/
│   ├── globals.css layout.tsx page.tsx robots.ts sitemap.ts
├── components/ (header, footer, cart provider, product cards and admin forms)
├── lib/ (Auth-aware admin helper, catalogue, checkout validation, Prisma and utilities)
├── prisma/schema.prisma
├── prisma/seed.ts
├── auth.ts
├── proxy.ts (Next.js 16 route guard)
├── .env.example
├── package.json
└── README.md
```

## 2. Database setup

Recommended: PostgreSQL on Neon via the Vercel Marketplace, or a managed PostgreSQL instance you control. Vercel Postgres is no longer a separate product; new Vercel projects should connect a supported Marketplace PostgreSQL provider. See [Vercel Postgres documentation](https://vercel.com/docs/postgres).

1. Create a PostgreSQL database and copy its connection string.
2. Copy `.env.example` to `.env.local` and fill `DATABASE_URL` plus `AUTH_SECRET`.
3. Install dependencies, generate Prisma Client, create the schema and seed illustrative rows:

```bash
npm install
cp .env.example .env.local
# Edit .env.local locally; never commit it.
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

For a production database, prefer reviewed Prisma migrations over `db push`; this starter uses `db:push` as a quick initial development path. Do not seed production with sample data.

## 3. Environment variables

Copy `.env.example` to `.env.local`. Required keys depend on which features you enable:

- Core: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`
- Google: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `NEXT_PUBLIC_GOOGLE_ENABLED=true` once configured
- OTP: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`
- Payments: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- Image uploads: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Optional placeholders: `RESEND_API_KEY`, `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, `SHIPROCKET_BASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

Never put private provider secrets in variables prefixed with `NEXT_PUBLIC_`. `NEXT_PUBLIC_RAZORPAY_KEY_ID` is a public key identifier, not the secret.

## 4. Google OAuth

1. Create a Google OAuth web application in Google Cloud Console.
2. Set the authorised redirect URI to `http://localhost:3000/api/auth/callback/google` for local development and `https://preheritage.com/api/auth/callback/google` after custom-domain setup.
3. Put the client ID and client secret in `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
4. If either value is missing, Google sign-in is omitted from the provider list.

## 5. Mobile OTP

1. Configure a Twilio Verify Service and confirm your messaging/region settings.
2. Set the three `TWILIO_*` environment variables.
3. The login UI accepts phone numbers in E.164 format, such as `+919876543210`. Twilio issues and checks the code; the app does not persist OTP codes.
4. The UI includes a 30-second resend cooldown, but server-side distributed rate limiting/CAPTCHA is not implemented. Add and test abuse controls, provider limits, messaging compliance and costs before launch.

## 6. Razorpay and webhook setup

1. Start with Razorpay test mode credentials.
2. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` on the server; configure `NEXT_PUBLIC_RAZORPAY_KEY_ID` only if needed by a public client SDK.
3. Add a Razorpay webhook endpoint at `https://preheritage.com/api/webhooks/razorpay`, subscribe to `payment.captured` and `payment.failed`, and put the webhook secret in `RAZORPAY_WEBHOOK_SECRET`.
4. Test successful payment, cancelled payment window, failed payment, duplicate webhook delivery, replay/signature mismatch, concurrent last-item purchase and database outage. Compare gateway settlements with order/payment records.
5. The starter does not automatically invoke gateway refunds. A captured payment that loses the inventory race is flagged as cancelled with a refund-review record; ops must reconcile and refund through the provider.
6. Do not enable live credentials until financial, tax, cancellation and refund workflows have been tested end-to-end.

## 7. Cloudinary product image upload

1. Create a Cloudinary account and configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` as server-side env vars.
2. The admin upload-sign endpoint is protected and returns a short-lived signature for `preheritage/products` uploads. The browser receives only the cloud name, API key, timestamp, folder and request signature; the API secret remains server-side.
3. Upload approved JPG/PNG/WebP product photographs and save the resulting secure URL to a product record. Configure upload restrictions and monitor storage usage.

## 8. Admin access

- Set `ADMIN_EMAILS` to a comma-separated list of trusted administrator email addresses.
- Sign in with Google using an allowlisted address. Alternatively, create a matching `User` and active `Admin` record in the database.
- `getAdminSession()` checks the allowlist or an active database Admin record on protected server pages and API routes. Product, order and content pages/APIs have role checks. An allowlisted user without a database Admin record is treated as `SUPER_ADMIN`; remove that fallback after seeding explicit Admin roles, add MFA, audit access, and review account recovery.
- The product API creates product records; order management updates status and tracking fields. Refund and fulfillment mutations need narrower role-specific permissions before production.

## 9. Vercel deployment

1. Push this project to a private Git repository.
2. In Vercel, **create a new project** from that repository rather than reusing an unrelated existing project.
3. Choose Node.js 22.x or the supported default runtime, keep the Next.js framework preset, and set the root directory to `preheritage-store` if this folder lives inside a larger repository.
4. Add all applicable environment variables in Project Settings → Environment Variables. Use separate Development, Preview and Production values; never commit `.env.local`.
5. Provision/connect PostgreSQL in the Vercel Marketplace and place the resulting connection string in `DATABASE_URL`. Confirm network access and TLS requirements.
6. For a first verified deployment, run the schema migration from a trusted environment against the intended database, build and smoke-test a Preview deployment, test auth and checkout using provider test mode, then promote the reviewed build.
7. Add a production webhook URL in Razorpay after the domain is attached, and test it against a deployed Preview endpoint where practical.
8. In Vercel Project Settings → Domains, add `preheritage.com` and `www.preheritage.com` (choose the canonical hostname). Follow the DNS instructions Vercel shows, configure the redirect between apex and `www`, wait for DNS and TLS verification, and verify the callback URLs again.
9. Replace the `NEXT_PUBLIC_SITE_URL` with `https://preheritage.com`, redeploy, and recheck sitemap, metadata, OAuth callbacks, payment webhooks and cookie/session behavior.
10. Configure database backups, error monitoring, alerts, legal pages, privacy/consent requirements and a rollback plan.

## 10. Pre-launch checklist

- [ ] Replace every sample image, SKU, product description, price, size/colour option and stock count.
- [ ] Run `npm run typecheck` and the production build on the same Node version used by Vercel.
- [ ] Provision PostgreSQL; run schema migration; seed only a non-production database.
- [ ] Test sign-in, OTP abuse cases, blocked-user behavior and protected admin API routes.
- [ ] Test order pricing and stock on the server, idempotency, COD, Razorpay verification, webhook signature validation, duplicate events, race conditions and refunds.
- [ ] Configure serviceability/PIN lookup, courier integration, delivery messages, tracking, cancellation and returns.
- [ ] Review policies, tax handling, seller/legal entity details, privacy, accessibility, SEO and customer-support contacts.
- [ ] Set up monitoring, backups, database recovery, error alerts and an incident/refund process.
- [ ] Use Razorpay test mode until every payment/refund path is verified; obtain an independent security and legal review before accepting production orders.

## Testing notes

The source includes validation and server-side access checks, but it has **not** been connected to your real database or provider accounts, and no live deployment has been performed. A TypeScript/TSX syntax-transpile pass over the source files reported no syntax diagnostics, and `package.json`/`tsconfig.json` parse as valid JSON. Dependency installation could not reach the npm registry in the build environment, so full TypeScript type-checking, Prisma schema validation, linting, production build and live auth/payment tests remain unverified until you run the commands below in a network-enabled environment.
