# Orbit AI

Orbit AI is a Next.js lost-and-found application that helps a community report lost and found items, compare reports with multimodal AI, verify ownership claims, and coordinate handover. It combines a Prisma/PostgreSQL-backed identity system with a client-side item-recovery workspace.

> **Implementation status:** Authentication and user profiles are persisted through Prisma. Reports, matches, claims, chat, and notifications are currently managed in React state; items and matches are also saved to the browser's `localStorage`. This is an important limitation for production deployment.

## Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Application Workflows](#application-workflows)
- [API Reference](#api-reference)
- [Database](#database)
- [Authentication and Security](#authentication-and-security)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Scripts](#scripts)
- [Error Handling and Logging](#error-handling-and-logging)
- [Testing](#testing)
- [Performance and Scalability](#performance-and-scalability)
- [Configuration](#configuration)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)

## Overview

The main workflow is:

1. A user reports a lost or found item, optionally uploading a photo.
2. Gemini analyzes the draft for category, colors, brand, OCR-oriented text, tags, and ownership questions.
3. The client compares lost and found reports through the matching route and displays scored suggestions.
4. A claimant answers item-specific questions. Gemini evaluates the answers, with a deterministic fallback when Gemini is unavailable.
5. Users can open a browser-local handover chat, generate a QR asset tag, and mark an item returned.

The application is built with the Next.js App Router. Server route handlers provide authentication, profile, OTP, and Gemini capabilities. Prisma stores identity and authentication records in PostgreSQL. The recovery workspace is currently a browser-side prototype rather than a database-backed report service.

## Features

### Lost and found reporting

- Create `LOST` or `FOUND` reports from the dashboard.
- Capture title, category, description, colors, brand, venue, area, city, occurrence time, reward, custody location, OCR text, and verification questions.
- Upload one image as a browser data URL. If no image is supplied, the UI uses a Picsum placeholder.
- Reports receive client-generated IDs, timestamps, and QR IDs.
- Current limitation: reports are not stored in Prisma or sent to a report API. Items are kept in React state and persisted to `localStorage` under `lost_and_found_items`.

### Gemini item analysis

`POST /api/gemini/analyze-item` can analyze text and an optional image. It returns structured metadata for the report form, including category, colors, brand, OCR-oriented text, tags, a summary, verification questions, and sensitive-document detection.

If the Gemini request fails or is rate limited, the route returns a keyword-based fallback for category and color detection. The fallback is useful for local development but is not equivalent to visual AI analysis.

### AI matching and visual search

- Pair lost and found reports with `POST /api/gemini/match-items`.
- Run matching automatically after a new report, or manually through the global AI scan.
- Review match score, verdict, reasoning, and score breakdown in the dashboard.
- Upload a photo through the visual-search modal. `POST /api/gemini/visual-search` compares it with the current browser item list and returns up to five candidates.
- Matching falls back to category, color, brand, venue, and word-overlap heuristics.
- Visual-search fallback returns up to five candidates from the supplied list with synthetic descending scores.

### Claim verification and handover

- A claimant answers the verification questions attached to an item.
- `POST /api/gemini/verify-claim` returns a score, recommendation, feedback, and reasoning.
- A successful claim changes the item to `CLAIMED` in the client store and opens a local conversation.
- The chat supports messages and a `Confirm Return` action that changes the item to `RETURNED` locally.
- Current limitation: claims and messages are not persisted, encrypted, or backed by a server conversation service despite the UI label `ENCRYPTED`.

### Authentication and profile management

- Google OAuth through Auth.js.
- Email/password registration with a six-digit email verification OTP.
- Login OTP for devices that are not trusted.
- Optional trusted-device records lasting 30 days.
- Password reset by six-digit OTP; successful reset deletes existing Prisma sessions.
- Profile read/update and password change flows.
- Admin role support through the Prisma `Role` enum and a hard-coded admin-email allowlist.

### Dashboard tools

- Search report title, description, category, venue, OCR text, and brand.
- Filter by report type, category, status, and venue.
- View all reports, lost reports, found reports, AI matches, and the current user's items.
- Admin-only client view for marking items returned, deleting local listings, and running a global AI scan.
- Generate and download a QR image containing the current origin and an item query parameter.

## Technology Stack

Versions below are the versions declared in `package.json`; caret ranges may resolve to newer compatible patch/minor releases when installing without the lockfile.

| Technology | Purpose | Version |
| --- | --- | --- |
| TypeScript | Application language | `5.9.3` |
| React / React DOM | Client UI | `^19.2.1` |
| Next.js | App Router, server actions, route handlers | `^15.4.9` |
| Auth.js / NextAuth | OAuth, credentials authentication, JWT sessions | `^5.0.0-beta.32` |
| Prisma / Prisma Client | ORM and authentication persistence | `^7.9.1` |
| PostgreSQL / `pg` | Relational database | PostgreSQL; `pg ^8.22.0` |
| `@google/genai` | Gemini item analysis and matching | `^2.4.0` |
| Zod | Server-side auth/profile validation | `^4.4.3` |
| `bcryptjs` | Password hashing and comparison | `^3.0.3` |
| Nodemailer | Gmail SMTP email delivery | `^8.0.11` |
| Tailwind CSS | Styling | `4.1.11` |
| PostCSS | CSS processing | `^8.5.6` |
| `lucide-react` | UI icons | `^0.553.0` |
| `motion` | Motion package, transpiled by Next config | `^12.23.24` |
| `qrcode` | QR data URL generation | `^1.5.4` |
| `canvas-confetti` | Return confirmation effect | `^1.9.4` |
| ESLint | Linting | `9.39.1` |
| npm | Dependency and script runner | `package-lock.json` present |

There is no Redis/cache package, Docker configuration, test framework, migration directory, queue, worker, or CI workflow in the repository.

## Architecture

```mermaid
flowchart LR
      Browser[Next.js browser UI]
      Actions[Server Actions]
      Routes[App Router route handlers]
      Auth[Auth.js JWT session]
      Prisma[Prisma Client + pg adapter]
      DB[(PostgreSQL)]
      Gemini[Google Gemini API]
      SMTP[Gmail SMTP via Nodemailer]
      Local[(Browser localStorage)]

      Browser --> Actions
      Browser --> Routes
      Browser --> Local
      Actions --> Auth
      Actions --> Prisma
      Routes --> Auth
      Routes --> Prisma
      Prisma --> DB
      Routes --> Gemini
      Actions --> SMTP
      Auth --> Prisma
```

### Frontend

The home page is a client component wrapped by `AppStoreProvider`. It composes the navbar, filters, sidebars, item cards, admin view, and modal workflows. `lib/store-context.tsx` owns reports, matches, claims, messages, notifications, filters, and modal state.

### Backend and API layer

The backend is implemented with App Router route handlers under `app/api`, server actions under `app/actions`, Auth.js configuration in `auth.ts` and `auth.config.ts`, and reusable services under `lib`. API routes are dynamic where declared and the OTP routes explicitly use the Node.js runtime.

### Persistence and external services

- PostgreSQL stores users and Auth.js/OTP/trusted-device records.
- Gemini is called server-side from the four `/api/gemini/*` handlers.
- Gmail SMTP is used when `EMAIL_PASS` is configured; otherwise OTPs are logged to the server console.
- The client stores item and match JSON in browser `localStorage`.
- No cache, Redis, object storage, job processor, or background worker is configured.

## Project Structure

```text
.
├── app/
│   ├── actions/              Server actions for auth, profile, and report UI operations
│   ├── api/                  Auth, OTP, profile, and Gemini route handlers
│   ├── login/                Combined sign-in, registration, and login-OTP UI
│   ├── register/             Registration page
│   ├── verify-email/         Email verification page
│   ├── forgot-password/      Password-reset request page
│   ├── reset-password/       Password-reset completion page
│   ├── profile/               Authenticated profile and local report management
│   ├── page.tsx               Main dashboard
│   ├── layout.tsx             Metadata and AuthProvider root layout
│   └── globals.css            Tailwind imports and scrollbar styles
├── components/               Dashboard, authentication, modal, and navigation components
├── emails/                   React email templates and shared email components
├── lib/
│   ├── auth/                 Role and authorization helpers
│   ├── email/                SMTP transport, services, and templates
│   ├── otp/                  OTP creation, hashing, expiry, and verification
│   ├── validation/            Zod schemas for authentication inputs
│   ├── gemini.ts              Gemini client factory
│   ├── prisma.ts              Prisma PostgreSQL client
│   ├── store-context.tsx      Client application store and local persistence
│   └── sample-data.ts         Seed-like browser demo data, not a database seed
├── prisma/
│   └── schema.prisma          PostgreSQL schema for identity and authentication data
├── types/                     Shared TypeScript domain/session types
├── auth.ts                    Full Auth.js providers, adapter, and callbacks
├── auth.config.ts             Edge-compatible Auth.js configuration
├── middleware.ts              Route redirects and admin checks
├── next.config.ts             Next, image, standalone, and HMR configuration
├── prisma.config.ts           Prisma schema and DATABASE_URL configuration
├── package.json               Scripts and dependencies
└── tsconfig.json              Strict TypeScript and `@/*` path alias
```

## Application Workflows

### Registration and email verification

1. The registration form validates name, email, password, and confirmation with Zod.
2. Passwords must be at least eight characters and contain uppercase, lowercase, number, and special characters.
3. A six-digit OTP is generated with Node `crypto`, hashed with SHA-256, stored for five minutes, and sent by Nodemailer when configured.
4. The OTP is limited to five attempts and resend requests have a 60-second cooldown.
5. Verification creates or updates the Prisma `User`, marks email verification complete, deletes the OTP, and schedules a welcome email.

### Login and trusted devices

1. Credentials are normalized and checked against the Prisma user record.
2. Passwords are compared with `bcryptjs`; unverified or Google-only accounts receive an explanatory result.
3. A device token in `localStorage` can bypass the login OTP while its database record is valid.
4. Otherwise a five-minute login OTP is sent. Successful verification can create a `TrustedDevice` record for 30 days.
5. Auth.js creates the JWT session and redirects to the requested callback URL.

### Reporting and matching

1. The report modal reads an image as a data URL and optionally calls item analysis.
2. The report is inserted at the front of the client item array and saved to `localStorage` after store initialization.
3. After a short client timeout, opposite-type candidates are sent one at a time to `/api/gemini/match-items`.
4. Scores at or above 70 create a local notification for the lost-item reporter.
5. Existing item/match IDs prevent duplicate pairings in the current browser session.

### Claim and return

1. The claimant submits answers from the item verification questions.
2. The client calls `/api/gemini/verify-claim`.
3. The result becomes a local `ClaimRequest`; approval is based on Gemini's recommendation or a score of at least 75.
4. A local system message opens a conversation. `Confirm Return` changes the item status and adds a local confirmation message.

### Profile and report management

Authenticated profile pages use server actions for user profile reads, name changes, and password changes. The profile page filters the browser item array for the current user. `updateUserReport` and `deleteUserReport` currently return success after validation but do not persist changes to a database; the page then mutates local state.

## API Reference

All JSON endpoints use `Content-Type: application/json` for request bodies. Authenticated routes use the Auth.js session cookie. The API does not expose a separate bearer-token contract.

### `GET|POST /api/auth/[...nextauth]`

Auth.js handler for Google OAuth, credentials sign-in, session operations, and sign-out. The exact request and response format is Auth.js-managed. The configured sign-in and error pages are `/login`.

### `POST /api/auth/otp/send`

Sends an email-verification, password-reset, or login OTP.

```json
{
   "email": "user@example.com",
   "type": "LOGIN",
   "name": "Example User",
   "password": "Only for registration"
}
```

`type` may be `LOGIN`, `PASSWORD_RESET`, or omitted for email verification. Success returns `{ "success": true, ... }`. The route returns `400` for missing email or a failed service result and `500` for an exception. OTP service responses may include `devOtp` in the current implementation.

### `POST /api/auth/otp/verify`

Verifies an email, login, or password-reset OTP.

```json
{
   "email": "user@example.com",
   "otp": "123456",
   "type": "LOGIN",
   "rememberDevice": true
}
```

For `PASSWORD_RESET`, include `newPassword`. Success returns the service result with HTTP `200`; missing fields, expired/invalid OTPs, and service failures return `400`; unexpected exceptions return `500`.

### `GET /api/profile`

Requires an authenticated session. Returns the selected user profile, a derived username, and currently zero-valued usage fields (`chats`, `aiRequests`, `projects`, `tokensUsed`). Returns `401` when unauthenticated, `404` when the user record is missing, and `500` for an unexpected error.

### `PATCH /api/profile`

Requires an authenticated session. Accepts an optional name of at least two characters and an optional nullable absolute image URL.

```json
{
   "name": "Example User",
   "image": "https://example.com/avatar.png"
}
```

Returns `{ "success": true, "message": "Profile updated successfully", "user": ... }`. Statuses are `200`, `400` for Zod validation, `401` for no session, and `500` for unexpected errors.

### `POST /api/gemini/analyze-item`

Unauthenticated route used by the report form. Accepts `title`, `description`, `imageBase64`, and `itemType`. The response is `{ success, analysis }`; `isFallback: true` indicates keyword-based fallback analysis. Missing `GEMINI_API_KEY` or provider failures fall back rather than failing the request. Outer failures return `500`.

### `POST /api/gemini/match-items`

Unauthenticated route accepting `{ lostItem, foundItem }`. Returns `{ success, matchResult }`, optionally with `isFallback: true`. Missing either item returns `400`; provider or outer failures return `500`. AI scoring is requested with visual/item type 35%, text/OCR 25%, location/time 25%, and color/brand 15% weights.

### `POST /api/gemini/verify-claim`

Unauthenticated route accepting `{ item, userAnswers }`; the handler also reads an optional `questions` field. Returns `{ success, evaluation }`, optionally with `isFallback: true`. Missing item or answers returns `400`; outer failures return `500`.

### `POST /api/gemini/visual-search`

Unauthenticated route accepting `{ imageBase64, itemsList, searchType }`. Returns `{ success, visualSearchResults }`, optionally with `isFallback: true`. Missing image or an array item list returns `400`; outer failures return `500`.

### Server actions

These are not public REST endpoints, but are called by the UI:

- `app/actions/auth-actions.ts`: registration, OTP verification/resend, credentials login, login OTP verification, Google login, password recovery, reset, and logout.
- `app/actions/profile-actions.ts`: authenticated profile read/update and password change.
- `app/actions/report-actions.ts`: authenticated context lookup and currently non-persistent report update/delete acknowledgements.

## Database

The configured provider is PostgreSQL. Prisma 7 uses the `@prisma/adapter-pg` adapter and a `pg` connection pool. The schema currently models identity and authentication only:

| Model | Purpose | Important constraints |
| --- | --- | --- |
| `User` | Account, role, profile, provider metadata | CUID primary key; unique nullable email; `Role` defaults to `USER` |
| `Account` | Auth.js OAuth account link | Unique `[provider, providerAccountId]`; cascades from `User` |
| `Session` | Auth.js session record | Unique `sessionToken`; cascades from `User` |
| `VerificationToken` | Auth.js verification token | Unique token and unique `[identifier, token]` |
| `PasswordResetToken` | Legacy/token-style reset record | Unique token; index on email |
| `EmailVerificationOTP` | Registration/link-password OTP | Unique email; index on email; expiry and attempt count |
| `PasswordResetOTP` | Password recovery OTP | Unique email; index on email; expiry and attempt count |
| `LoginOTP` | Login second-factor OTP | Unique email; index on email; expiry and attempt count |
| `TrustedDevice` | Remembered login device | Unique device token; index on user ID; cascades from `User` |

`User` has one-to-many relations to `Account`, `Session`, and `TrustedDevice`. Deleting a user cascades to those related rows. There are no Prisma models for items, matches, claims, messages, notifications, uploaded images, or audit events.

```mermaid
erDiagram
      User ||--o{ Account : has
      User ||--o{ Session : has
      User ||--o{ TrustedDevice : trusts
      User {
            string id PK
            string email UK
            enum role
            datetime emailVerified
      }
      Account {
            string id PK
            string userId FK
            string provider
            string providerAccountId
      }
      Session {
            string id PK
            string userId FK
            string sessionToken UK
            datetime expires
      }
      TrustedDevice {
            string id PK
            string userId FK
            string deviceToken UK
            datetime expiresAt
      }
```

## Authentication and Security

- Auth.js uses JWT sessions and Prisma for the adapter.
- Providers are Google OAuth and credentials.
- Passwords are hashed with `bcryptjs` using cost factor 10.
- OTPs are generated with `crypto.randomInt`, stored as SHA-256 hashes, expire after five minutes, and are invalidated after five failed attempts.
- OTP resend requests are subject to a 60-second cooldown.
- Login OTP can create a trusted device for 30 days.
- Middleware redirects unauthenticated requests for `/dashboard`, `/profile`, and `/settings`, and restricts `/admin` to `ADMIN` sessions. The matcher excludes API routes, static assets, and common image extensions.
- `requireAuth`, `requireAdmin`, `requireRole`, and `requireOwnership` helpers exist for server-side authorization, although the current report actions do not use ownership enforcement.
- Profile PATCH input is validated with Zod. Auth input schemas validate email, password policy, confirmation, and six-digit OTP format.
- No rate limiter, CORS policy, security-header layer, upload-size limit, or API authentication is implemented for the Gemini routes.
- OTPs are returned as `devOtp` and placed in URL query parameters by the current development UI. OTPs are also logged to the server console when email delivery is unavailable. Do not use this behavior unchanged in production.
- Google OAuth has `allowDangerousEmailAccountLinking: true`; review this setting before production use.
- The admin allowlist contains email addresses in source code. Move admin assignment to managed configuration or database administration before production use.

## Environment Variables

The workspace contains a local `.env` file. Secret values are intentionally not reproduced here. Use a local `.env.local` or another secret-management mechanism and never commit credentials.

| Variable | Description | Required | Example |
| --- | --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma and `pg` | Yes | `postgresql://user:password@localhost:5432/orbit_ai` |
| `AUTH_SECRET` | Auth.js signing/encryption secret | Yes | `replace-with-a-long-random-value` |
| `NEXTAUTH_SECRET` | Fallback secret name read by `auth.config.ts` | No if `AUTH_SECRET` is set | `replace-with-a-long-random-value` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Required for Google login | `google-client-id` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Required for Google login | `google-client-secret` |
| `GEMINI_API_KEY` | Google Gemini API key | Required for Gemini; fallback logic still exists | `gemini-api-key` |
| `EMAIL_USER` | Gmail SMTP sender account | Optional for console-only OTP development | `no-reply@example.com` |
| `EMAIL_PASS` | Gmail SMTP password/app password | Optional for console-only OTP development | `smtp-app-password` |
| `AUTH_URL` | Auth.js URL convention present in local environment | No direct source read found | `http://localhost:3000` |
| `AUTH_TRUST_HOST` | Auth.js host trust convention present in local environment | No direct source read found | `true` |
| `APP_URL` | Application URL present in local environment | No direct source read found | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Public application URL present in local environment | No direct source read found | `http://localhost:3000` |
| `DISABLE_HMR` | Disables development file watching when exactly `true` | No | `false` |
| `NODE_ENV` | Node/Next runtime environment | Set by Next.js | `development` |

When SMTP is not configured, the email service intentionally reports success while logging OTPs to the server console. This is convenient for development only.

## Installation

### Prerequisites

- Node.js compatible with the installed Next.js and TypeScript versions.
- npm.
- A PostgreSQL database reachable through `DATABASE_URL`.
- Google OAuth credentials for Google sign-in, if that provider is enabled.
- A Gemini API key for provider-backed analysis; local fallbacks work for some AI routes without it.
- Gmail SMTP credentials if OTP and notification emails should be delivered rather than logged.

### Setup

```powershell
git clone <repository-url>
cd lostandfoundai
npm install
```

Create `.env.local` with the variables above. Do not copy real credentials into documentation or source control.

Generate the Prisma client and apply the current schema to a development PostgreSQL database:

```powershell
npx prisma generate
npx prisma db push
```

There is no migration directory, seed script, or database-creation script in this repository. Create the PostgreSQL database through your provider or local PostgreSQL installation before running `db push`. `lib/sample-data.ts` supplies browser demo data; it is not a Prisma seed.

Start the development server:

```powershell
npm run dev
```

Open `http://localhost:3000` unless Next.js selects another port.

## Running the Project

### Development

```powershell
npm run dev
```

### Production build and server

```powershell
npm run build
npm run start
```

The Next configuration uses `output: 'standalone'`. No Dockerfile, Docker Compose file, container definition, or deployment manifest is included.

### Prisma inspection

```powershell
npx prisma generate
npx prisma db push
npx prisma studio
```

`prisma studio` is a Prisma CLI command for local inspection; it is not a project script.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Generate Prisma client, then build Next.js |
| `npm run start` | Start the built Next.js server |
| `npm run lint` | Run ESLint across the repository |
| `npm run postinstall` | Generate the Prisma client after dependency installation |
| `npm run clean` | Run `next clean` |

There is no `test`, `seed`, `migrate`, or `docker` script.

## Error Handling and Logging

- Zod validation returns the first user-facing issue in server-action results or HTTP `400` JSON responses for profile/OTP routes.
- Outer route-handler failures generally return `{ success: false, error: ... }` or `{ error: ... }` with HTTP `500`.
- Gemini provider errors are logged with `console.warn` and use route-specific deterministic fallbacks.
- Authentication, profile, action, OTP, email, localStorage, and UI failures are logged with `console.error`.
- SMTP failures for OTP messages are treated as successful delivery because the OTP is logged for development.
- There is no structured logger, request ID, centralized error boundary, metrics pipeline, response-latency logger, or external error-monitoring integration.

## Testing

No test files, test configuration, coverage configuration, or test script were found. The available automated check is:

```powershell
npm run lint
```

For local smoke testing, verify registration/OTP, Google configuration, password reset, profile PATCH, each Gemini route, report creation, AI matching, claim submission, and reload behavior. A future production version should add unit, route, database, and browser integration tests before relying on the current client-only recovery state.

## Performance and Scalability

### Currently implemented

- Prisma uses a shared development client and a `pg` connection pool.
- Several authentication/OTP lookup fields are unique or indexed, including user email, OTP email, reset email, and trusted-device user ID.
- Gemini calls run asynchronously from the client workflow.
- New-report matching and OTP cleanup are triggered through short-lived timers/fire-and-forget promises.
- The home page filters the current in-memory item list by text, category, status, and venue.

### Current constraints

- Reports and matches are sent as complete JSON payloads and kept in browser storage; there is no pagination, shared cache, durable queue, or horizontal-scaling coordination.
- Global matching loops through lost items and candidate pairs serially, which can become slow and expensive as the browser list grows.
- Gemini endpoints accept arbitrary payloads and image data without a documented size limit or rate limit.
- No Redis or other caching layer exists.

### Potential improvements

- Persist domain entities and images in a server-owned data model/object store.
- Add pagination, server-side filtering, authenticated report APIs, ownership checks, and database transactions.
- Queue AI matching and email delivery, then add provider retries and rate limits.
- Add structured logging, metrics, tracing, and a shared cache only where measured latency or provider cost justifies it.

## Request and Response Examples

### Analyze an item

```powershell
$body = @{
   title = 'Blue leather wallet'
   description = 'Tri-fold wallet with a scratched corner'
   itemType = 'LOST'
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/gemini/analyze-item `
   -ContentType 'application/json' -Body $body
```

Representative success shape:

```json
{
   "success": true,
   "analysis": {
      "suggestedTitle": "Midnight Blue Leather Wallet",
      "category": "Wallets & Bags",
      "primaryColor": "Blue",
      "aiTags": ["blue-leather", "wallet"],
      "summaryDescription": "...",
      "suggestedVerificationQuestions": ["..."],
      "isSensitiveDocument": false
   }
}
```

### Verify a claim

```json
{
   "item": {
      "id": "item_102",
      "title": "Dark Blue Leather Wallet with Campus Cards",
      "category": "Wallets & Bags",
      "description": "Found near the library entrance"
   },
   "userAnswers": {
      "q_0": "The library card has my university name and a blue stripe.",
      "q_1": "The inner zipper lining is dark brown."
   }
}
```

The response is `{ "success": true, "evaluation": { "verificationScore", "recommendation", "feedback", "detailedReasoning" } }`; the route may include `isFallback: true`.

## Configuration

- `package.json`: dependency versions and supported npm scripts.
- `tsconfig.json`: strict TypeScript, bundler resolution, incremental compilation, Next plugin, and `@/*` alias.
- `next.config.ts`: strict mode, standalone output, remote image hosts, Motion transpilation, build-time TypeScript behavior, and optional HMR disabling.
- `prisma.config.ts`: Prisma schema path and `DATABASE_URL` datasource.
- `prisma/schema.prisma`: PostgreSQL provider, Prisma client generator, auth/OTP models, relations, indexes, and constraints.
- `postcss.config.mjs`: Tailwind/PostCSS integration.
- `eslint.config.mjs` and `.eslintrc.json`: lint configuration files present in the repository.
- `auth.ts` and `auth.config.ts`: Auth.js providers, JWT/session callbacks, adapter, pages, and secret configuration.
- `middleware.ts`: protected-route redirects and admin-route checks.
- `metadata.json`: Orbit AI product metadata and declared Gemini capability.

## Development Workflow

1. Install dependencies and configure `.env.local`.
2. Ensure PostgreSQL is reachable, then run `npx prisma generate` and `npx prisma db push` after schema changes.
3. Start `npm run dev` and exercise the dashboard/auth flows in the browser.
4. Check server output for OTPs when SMTP is intentionally disabled.
5. Run `npm run lint` before submitting changes.
6. Run `npm run build` to validate Prisma generation and the production Next.js build.

When changing an API route, update the corresponding client caller and this README's API section. When changing persistence, inspect both `prisma/schema.prisma` and `lib/store-context.tsx`; they currently represent separate data domains.

## Troubleshooting

### Prisma cannot connect

Check that PostgreSQL is running and `DATABASE_URL` includes the correct host, port, database, user, and password. Then rerun:

```powershell
npx prisma generate
npx prisma db push
```

### OTP email is not received

Set `EMAIL_USER` and `EMAIL_PASS` to valid Gmail SMTP credentials or an app password. Without `EMAIL_PASS`, inspect the development server console for the OTP. The current implementation logs OTPs by design when SMTP is unavailable.

### Google sign-in fails

Check `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`, and the Google OAuth callback configuration for the running host. Auth.js errors redirect to `/login`.

### Gemini routes use fallback results

Set `GEMINI_API_KEY`, confirm the provider/model is available, and inspect server warnings. Fallback responses include `isFallback: true`.

### Reports disappear after a different browser or server restart

This is expected with the current architecture. Reports and matches use browser `localStorage`; claims, messages, and notifications are in-memory only. They are not shared across users or devices.

### Build or lint issues

Run `npm install`, `npx prisma generate`, `npm run lint`, and then `npm run build`. Check that the installed Node.js version is compatible with the declared Next.js and TypeScript versions.

### Port conflict

Start Next.js on another port with the standard Next CLI option, for example `npm run dev -- -p 3001`, and update local OAuth callback settings if using Google sign-in.

## Future Improvements

These are not implemented today:

- Add Prisma models and authenticated APIs for items, matches, claims, conversations, messages, notifications, and audit history.
- Replace `localStorage` and data URLs with server persistence and object storage.
- Enforce ownership and admin authorization on every report and claim mutation.
- Remove development OTP exposure from response bodies, URLs, and logs.
- Add API authentication, input schemas, upload limits, rate limiting, CORS/security headers, and abuse protection to Gemini routes.
- Replace the hard-coded admin email list with managed roles and administrative tooling.
- Add background jobs for matching, email delivery, expiry cleanup, and retries.
- Add automated unit, route, database, and browser tests plus CI.
- Add structured logging, monitoring, tracing, and production deployment/container documentation.
