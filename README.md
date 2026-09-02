# Niftit

Automatic support/resistance signals for NSE traders (Nifty, Bank Nifty, and more) — a TradingView Pine Script indicator paired with a subscription-gated web app for signal delivery.

Built with Next.js (App Router) and Supabase (Postgres + Auth).

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase project keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run `supabase/schema.sql` in your Supabase project's SQL editor to set up the database (tables in `supabase/*.sql` are incremental migrations for an already-running project — see comments in each file).
