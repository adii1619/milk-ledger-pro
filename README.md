# Milk Ledger Pro

Milk Ledger Pro is a React and Supabase application for tracking milk suppliers, customers, daily quantities, rates, and payments in one place. It includes separate village supply and city demand workflows, plus AI-powered analytics for forecasting supply, demand, and profit trends.

## Features

- Email/password authentication with Supabase Auth
- Add, view, and remove village and city customers
- Record milk quantities, dates, and per-liter rates
- Calculate entry totals and review dashboard summaries
- Configure automatic monthly receipts per customer
- Generate AI analytics for supply, demand, profit, and seasonal insights
- Responsive interface built with Tailwind CSS and shadcn/ui components

## Tech Stack

- React 18 with TypeScript
- Vite
- Supabase Auth, PostgreSQL, Row Level Security, and Edge Functions
- TanStack Query
- Tailwind CSS and Radix UI
- Vitest and Playwright

## Prerequisites

- Node.js 18 or newer
- npm
- A Supabase project

## Getting Started

1. Install dependencies:

	```bash
	npm install
	```

2. Create a `.env.local` file in the project root:

	```env
	VITE_SUPABASE_URL=https://your-project-ref.supabase.co
	VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
	```

	Use the project URL and publishable/anon key from Supabase Project Settings > API. Never expose a Supabase service-role key in the frontend.

3. Apply the database migrations in `supabase/migrations` to your Supabase project. With the Supabase CLI, link the project and run:

	```bash
	supabase link --project-ref your-project-ref
	supabase db push
	```

4. Start the development server:

	```bash
	npm run dev
	```

	Vite will print the local URL, normally `http://localhost:5173`.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run build:dev` | Create a development-mode build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/login` | Public | Sign in |
| `/signup` | Public | Create an account |
| `/dashboard` | Authenticated | Manage customers and milk entries |
| `/analytics` | Authenticated | Generate predictive analytics |

## Supabase Analytics Function

The analytics page invokes the `predict-analytics` Supabase Edge Function. Deploy it with the Supabase CLI when analytics are enabled:

```bash
supabase functions deploy predict-analytics
```

The function may require an AI provider secret configured in the Supabase project. Keep provider credentials in Supabase Edge Function secrets, not in `.env.local` or client-side code.

## Project Structure

```text
src/
  components/       Reusable dashboard and form components
  contexts/         Authentication state
  hooks/            Customer and milk-entry data hooks
  integrations/     Supabase client and generated database types
  lib/              Data-access helpers and utilities
  pages/            Landing, auth, dashboard, and analytics pages
supabase/
  functions/        Supabase Edge Functions
  migrations/       PostgreSQL schema and security policies
```

## Security Notes

Database tables use Supabase Row Level Security so users can access only their own customers and milk entries. Keep the publishable key in the frontend, but never commit `.env.local` or use service-role credentials in browser code.
