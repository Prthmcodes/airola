# Airola — Airbnb Turnover Cleaning (airola.co.uk)

Marketing site + host portal for Airola, a turnover cleaning service for short-let hosts in London.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- Supabase (auth + Postgres database with Row Level Security) — project "Airola", region eu-west-2 (London)
- Google Sheets (write-only backup log via Apps Script — see `docs/google-apps-script.gs`)

## Run locally

1. `npm install`
2. `npm run dev` → http://localhost:3000

Environment variables live in `.env` (Supabase URL/key, Apps Script URL + token).

## Accounts & roles

- Visitors can request quotes and enter the giveaway without an account.
- Hosts sign up on the site (Log In → Sign Up); their properties/bookings are private to them (enforced by RLS).
- Admin: sign up with the admin email (jhansapratham@gmail.com or admin@airola.co.uk) — the account is automatically granted the admin role and sees the Command Center.

## Google Sheets backup

Quote and giveaway submissions are also appended to your Google Sheet as a backup log.
The old public read endpoint has been removed for data protection. Install the updated
script from `docs/google-apps-script.gs` and set the same secret token there and in the
`SHEETS_TOKEN` Vercel env var (server-only, read by `api/sheets.ts`) — change it from the default value.

## New-quote alerts (email + phone push)

Every successful quote request also triggers `api/notify-quote.ts`, which emails the team (via Resend)
and, optionally, sends a phone push (via ntfy). It is fire-and-forget: if alerts fail or aren't configured,
the customer's submission is unaffected. Recipients come only from server env vars, never from the request.

Server-only Vercel env vars (never prefix these with `VITE_`):

| Name | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key (sending access) |
| `NOTIFY_EMAILS` | Comma-separated team addresses that receive the alert |
| `NOTIFY_FROM` | Sender, e.g. `Airola Alerts <alerts@airola.co.uk>` (domain must be verified in Resend) |
| `NTFY_TOPIC` | Optional. Hard-to-guess ntfy.sh topic for phone pushes (no contact details are sent) |

With none of them set the endpoint returns 503 and the site works as before. For a local dry run
(no email or push sent), POST to the function with the header `x-dry-run: 1` while `NODE_ENV` is not `production`.
