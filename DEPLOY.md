# Deploying FlowForge — Step-by-Step Guide

This guide gets FlowForge live on the internet in about 30 minutes, with no
server management. Everything runs on free or cheap cloud services.

---

## What you'll set up

| Service | What it does | Cost |
|---------|-------------|------|
| **Vercel** | Hosts the website | Free |
| **Supabase** | Database + user accounts | Free |
| **Anthropic** | AI that powers the agents | Pay per use (~$0.35/run) |
| **Stripe** | Handles payments | Free + 2.9% per transaction |
| **GitHub** | Stores the code | Free |

---

## Step 1 — Push the code to GitHub

If you haven't already:

1. Go to [github.com](https://github.com) → sign in → click **New repository**
2. Name it `flowforge` → **Private** → click **Create repository**
3. On your computer, open Terminal and run:

```bash
cd flowforge
git remote set-url origin https://github.com/YOUR_USERNAME/flowforge.git
git push -u origin main
```

---

## Step 2 — Set up Supabase (database)

1. Go to [supabase.com](https://supabase.com) → **Start your project** → sign in with GitHub
2. Click **New project** → fill in:
   - **Name**: `flowforge`
   - **Database Password**: make a strong one, save it somewhere
   - **Region**: pick the one closest to your users
3. Wait ~2 minutes for the project to be ready
4. Go to **SQL Editor** (left sidebar) → **New query**
5. Open the file `supabase/schema.sql` from your project folder, copy everything, paste it in, click **Run**
6. Go to **Project Settings → API** and copy:
   - **Project URL** → save as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → save as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → save as `SUPABASE_SERVICE_ROLE_KEY` *(keep this secret)*
7. Go to **Authentication → URL Configuration**:
   - **Site URL**: `https://your-app-name.vercel.app` (you'll set this after Vercel step)
   - **Redirect URLs**: add `https://your-app-name.vercel.app/**`

---

## Step 3 — Get your Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com) → sign up
2. Add a payment method (required to use the API)
3. Click **API Keys** → **Create Key** → name it `flowforge`
4. Copy the key (starts with `sk-ant-...`) → save as `ANTHROPIC_API_KEY`

> **Cost note**: Each full project run (simulate + build) costs roughly $0.35 in
> API credits. With the Studio Pack pricing ($59 for 5 runs), your margin is very healthy.

---

## Step 4 — Set up Stripe (payments)

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) → sign up
2. Complete the account setup (name, business details, bank account for payouts)
3. Make sure you're in **Live mode** (toggle top-right) for real payments, or keep
   **Test mode** on while testing
4. Go to **Developers → API Keys**:
   - Copy **Secret key** (`sk_live_...` or `sk_test_...`) → save as `STRIPE_SECRET_KEY`
5. Go to **Developers → Webhooks → Add endpoint**:
   - **Endpoint URL**: `https://your-app-name.vercel.app/api/stripe/webhook`
   - **Events to listen for**: select `checkout.session.completed`
   - Click **Add endpoint** → copy the **Signing secret** (`whsec_...`) → save as `STRIPE_WEBHOOK_SECRET`

---

## Step 5 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub
2. Click **Add New Project** → select your `flowforge` repository → click **Import**
3. Before clicking Deploy, click **Environment Variables** and add all these:

```
NEXT_PUBLIC_SUPABASE_URL        = https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJ...
SUPABASE_SERVICE_ROLE_KEY       = eyJ...
ANTHROPIC_API_KEY               = sk-ant-...
STRIPE_SECRET_KEY               = sk_live_...
STRIPE_WEBHOOK_SECRET           = whsec_...
NEXT_PUBLIC_APP_URL             = https://your-app-name.vercel.app
```

4. Click **Deploy** — Vercel builds and deploys automatically (~2 min)
5. Once deployed, copy the URL (e.g. `flowforge.vercel.app`)

---

## Step 6 — Update URLs with your real domain

After you have your Vercel URL:

1. **Supabase** → Authentication → URL Configuration:
   - Update Site URL to your real Vercel URL
   - Update Redirect URL to `https://yourapp.vercel.app/**`

2. **Stripe** → Webhooks → your endpoint:
   - Update the URL to `https://yourapp.vercel.app/api/stripe/webhook`

3. **Vercel** → your project → Settings → Environment Variables:
   - Update `NEXT_PUBLIC_APP_URL` to your real URL
   - Click **Redeploy** for it to take effect

---

## Step 7 — Add a custom domain (optional, recommended)

1. Buy a domain at [Namecheap](https://namecheap.com) (~$10/year)
2. In Vercel → your project → **Domains** → **Add Domain** → type your domain
3. Vercel shows you DNS records to add — go to Namecheap → Advanced DNS → add them
4. Takes 5–30 minutes to go live
5. Update your Supabase and Stripe URLs to use the custom domain

---

## Step 8 — Run the Supabase permissions fix

After your first sign-up, run this once in the Supabase SQL Editor:

```sql
-- Grant permissions (already in schema.sql but run again to be safe)
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant execute on all functions in schema public to authenticated;

-- Give existing users 2 free credits
update public.profiles set credits = 2 where credits = 0;
```

---

## You're live! ✅

Your app is now running at your domain. Users can:
1. Sign up (get 2 free credits)
2. Create a project, run a simulation
3. Build the deliverables (logo, website, marketing)
4. Buy more credits via Stripe when they run out

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Failed to fetch" on signup | Check Supabase URL Configuration has your domain in redirect URLs |
| "Permission denied" database error | Run the SQL in Step 8 |
| "No credits" error immediately | Run `update public.profiles set credits = 2` in SQL Editor |
| Stripe webhook not working | Check the signing secret matches in Vercel env vars |
| Site not updating after code change | Vercel auto-deploys on every git push — just push your changes |

---

## Updating the app

Whenever you make changes to the code:

```bash
git add -A
git commit -m "describe what you changed"
git push
```

Vercel automatically detects the push and redeploys in ~2 minutes.

---

## Costs at scale

| Users/month | Anthropic cost | Stripe fees | Profit |
|-------------|---------------|-------------|--------|
| 10 users, 1 run each | $3.50 | ~$5 | ~$130 |
| 50 users, 2 runs each | $35 | ~$25 | ~$750 |
| 200 users, 3 runs each | $210 | ~$100 | ~$3,500 |

*(Based on Studio Pack: $59 for 5 credits)*
