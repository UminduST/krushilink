# KrushiLink

KrushiLink is a farm-to-market marketplace for connecting farmers with retailers in Sri Lanka. It includes harvest listings, district matching, demand pools, payment flows, SMS notifications, and role-based dashboards.

## Run locally

Requirements: Node.js 20 or newer.

```powershell
cd my-app
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Add the Supabase values to `my-app/.env.local`. Never commit that file or any service-role key. The project includes local fallback behavior for AI, SMS, and PayHere demo flows when live provider credentials are not configured.

## Useful commands

```powershell
cd my-app
npm run lint
npm run build
npm run start
```

## Production checklist

- Configure Supabase production credentials and apply the migrations in `supabase/migrations`.
- Replace demo PayHere and SMS settings with verified provider credentials and webhook handling.
- Add Sinhala and Tamil localization before onboarding a broad farmer audience.
- Configure deployment environment variables and review Supabase row-level security policies.
