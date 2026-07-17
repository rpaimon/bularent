# BulaRent v0.2

BulaRent is a mobile-first, long-term rental marketplace for Fiji. This release implements the trustworthy-listings beta: public browsing, filters, property details, landlord/agent submission, image storage, administrator approval, reports, listing status management and review notifications.

## Stack

- Next.js 16, React 19, TypeScript and Tailwind CSS
- Supabase Auth, Postgres, Storage and row-level security
- Vercel-ready deployment

## Local setup

1. Install Node.js 22 or newer, then dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Add the Supabase project URL and public anon key. Never add the service-role key to this file.
4. Apply `supabase/migrations/202607170001_bularent_v02.sql` in a clean Supabase project or through the Supabase CLI.
5. Run `npm run dev`.

Without environment variables, public pages run in safe preview mode with local demonstration listings. Accounts and writes remain disabled.

## First administrator

Create a normal account in the application, edit the email in `scripts/make-admin.sql`, and run that one statement in Supabase SQL Editor. The public signup flow intentionally cannot create administrators.

## Deployment

Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the Vercel project, then deploy. The Supabase Authentication Site URL and redirect URLs must include the production Vercel domain and any custom domain.

## Release checks

- `npm run typecheck`
- `npm run build`
- Confirm anonymous users see only approved listings.
- Confirm owners cannot approve or verify their own listings.
- Confirm one owner cannot read or update another owner's private listings.
- Confirm administrators can approve/reject listings and resolve reports.
