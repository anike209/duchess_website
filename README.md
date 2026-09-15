# Duchess Website (concept build)

React + Vite + Tailwind, backed by Supabase (database, auth, image storage).

## Local env vars
Copy `.env.example` to `.env` and fill in your Supabase Project URL + anon key
(Supabase → Settings → API). Not needed on Netlify — set the same two vars
under Site configuration → Environment variables instead.

## Admin
Visit `/admin` — logs in with the user created in Supabase → Authentication → Users.
