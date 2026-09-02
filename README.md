# KrushiLink

KrushiLink is a farm-to-market marketplace for Sri Lanka. It connects farmers directly with retailers so farmers can publish upcoming harvests, retailers can find nearby produce, and both sides can coordinate demand, payment, and delivery.

## Features

- Farmer and retailer registration with role-based access.
- Supabase authentication with server-side session handling.
- Farmer dashboard for farm profile, crop listings, and orders.
- Harvest listings with quantity, price, MOQ, availability dates, and descriptions.
- Automatic demand-pool creation for new harvest listings.
- Retailer marketplace with district filtering and nearby-district matching.
- Retailer pool orders and committed-quantity tracking.
- PayHere checkout payload generation with a local demo mode when credentials are absent.
- AI assistant endpoint with local KrushiLink replies.
- SMS endpoint with Textbelt integration and local demo mode.
- Protected farmer and retailer routes through Next.js middleware.
- Supabase Row Level Security policies for users, farms, listings, pools, and orders.
- Responsive interface for desktop and mobile screens.

## Technology

- Next.js 16 App Router and Turbopack
- React 19 and TypeScript
- Supabase Auth and PostgreSQL
- Supabase SSR client
- Tailwind CSS 4
- React Hook Form and Zod validation
- React Leaflet for district map views
- PayHere and Textbelt provider integrations

## Project structure

```text
.
├── my-app/                 # Next.js application
│   ├── src/app/             # Pages and API routes
│   ├── src/components/     # Shared UI components
│   ├── src/lib/            # Auth, Supabase, validation, maps, and providers
│   └── package.json
├── supabase/migrations/    # Database schema and RLS migrations
├── ARCHITECTURE.md         # Product and data model notes
└── README.md
```

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- A Supabase project for authentication and database features

## Run locally

From the repository root:

```powershell
cd my-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Create `my-app/.env.local`. Never commit this file or expose the service-role key to browser code.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional production integrations
PAYHERE_MERCHANT_ID=your-payhere-merchant-id
PAYHERE_SECRET=your-payhere-secret
TEXTBELT_API_KEY=your-textbelt-key
```

Without PayHere or Textbelt credentials, the application uses demo responses for local development. Do not use demo payment or SMS responses as proof of a real transaction in production.

## Supabase setup

Run these files in the Supabase SQL Editor, in this order:

1. [`supabase/migrations/20250603120000_fix_user_signup_trigger.sql`](supabase/migrations/20250603120000_fix_user_signup_trigger.sql)
2. [`supabase/migrations/20250604120000_farms_and_listings.sql`](supabase/migrations/20250604120000_farms_and_listings.sql)

The migrations create the user profile, farm, harvest listing, demand pool, and pool order tables, together with enums, indexes, RLS policies, and the listing-to-pool trigger.

After applying them, test registration, listing creation, and retailer browsing with separate farmer and retailer accounts.

## Scripts

Run from `my-app`:

```powershell
npm run dev       # Start development server
npm run lint      # Run ESLint
npm run build     # Create a production build
npm run start     # Start the production server
```

## Deploy to Vercel

1. Import the GitHub repository [`UminduST/krushilink`](https://github.com/UminduST/krushilink).
2. Set **Root Directory** to `my-app`.
3. Use `npm ci` as the install command.
4. Use `npm run build` as the build command.
5. Leave Output Directory empty/default.
6. Add the required environment variables for the Production environment.
7. Set `NEXT_PUBLIC_APP_URL` to the deployed Vercel URL.

The current `main` branch is the deployment branch. The project also allows the required `sharp` and `unrs-resolver` install scripts through `package.json` for npm script approval warnings.

## Current scope

The current application implements the public, farmer, and retailer workflows listed above. Admin and logistics concepts are documented in [`ARCHITECTURE.md`](ARCHITECTURE.md), but their dedicated dashboards and delivery automation are not yet implemented. Payment webhooks, escrow release, production SMS sending, and transactional pool updates should be completed and reviewed before handling real money or production orders.

## Security notes

- Keep `SUPABASE_SERVICE_ROLE_KEY`, PayHere secrets, and provider keys server-side.
- Apply and review Supabase RLS policies before production use.
- Use real PayHere webhook verification before marking payments as held or released.
- Validate all user-controlled values before database writes.
- Use separate test accounts for farmer and retailer acceptance testing.

## License

This repository is private and currently has no open-source license. Contact the repository owner before redistributing the code.
