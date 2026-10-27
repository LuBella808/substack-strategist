# The Substack Strategist

Lucinda Rae's $37 AI strategy studio. Buyers move through six guided stages and receive a personal Publication Blueprint, then return anytime for strategy sessions. Next.js on Vercel, Claude through the Anthropic API, Upstash Redis for saved progress, Resend for login emails, Kartra for purchases.

## How a buyer gets in

1. They buy in Kartra.
2. Kartra posts the purchase to `/api/webhooks/kartra?key=SECRET&event=purchase`, and the app gives that email access.
3. They go to strategist.hellolucinda.com, enter their email and click the login link sent to their inbox. Sessions last 90 days.

Point the Kartra thank-you page and the purchase confirmation email at `https://strategist.hellolucinda.com/login`.

## Launch checklist

1. **Code to GitHub.** Push this folder to a new private repo.
2. **Vercel.** New Project > import the repo. Framework: Next.js.
3. **Storage.** In the project: Storage > Marketplace > Upstash for Redis > connect. The `KV_REST_API_*` variables appear on their own.
4. **Environment variables.** Copy everything from `.env.example` into Settings > Environment Variables and fill them in. Redeploy.
5. **Domain.** Settings > Domains > add `strategist.hellolucinda.com`, then add the CNAME record Vercel shows you at your DNS host.
6. **Email.** In Resend, add and verify `hellolucinda.com`, then set `RESEND_API_KEY` and `EMAIL_FROM`.
7. **Kartra purchase webhook.** On the Strategist product, add an IPN / webhook (or a Zapier step on purchase) that POSTs to
   `https://strategist.hellolucinda.com/api/webhooks/kartra?key=YOUR_KARTRA_WEBHOOK_SECRET&event=purchase`
   The app reads the buyer's email from `lead[email]`, `email` or similar fields, as JSON or form data.
8. **Profit Mastery confirmation (optional).** Send the masterclass registration to the same URL with `&event=profit_mastery_registered`. This is the only way a registration is counted; clicking the button counts as a click.
9. **Test.** Buy with a 100% coupon, confirm the email arrives, and walk all six stages.

## Giving access by hand

```
curl -X POST https://strategist.hellolucinda.com/api/admin/grant \
  -H "x-admin-key: YOUR_ADMIN_KEY" -H "content-type: application/json" \
  -d '{"email":"name@example.com","firstName":"Name"}'
```

## Events

| Event | Where it's confirmed |
|---|---|
| strategist_purchased | Kartra webhook |
| profit_mastery_registered | Kartra webhook |
| assessment_started, assessment_completed | App |
| blueprint_downloaded | App (Download PDF clicked) |
| profit_mastery_clicked, society_clicked, substack_day_clicked | App (link clicked) |
| recommended_society, recommended_substack_day | App (Stage 6 result) |

App events are saved per buyer, can apply a Kartra tag (names in `src/config/offers.ts`) when the Kartra API keys are set, and are sent to `EVENTS_WEBHOOK_URL` if you add one. See totals at `GET /api/admin/stats` with the `x-admin-key` header.

## Where to change things

- Offer names, prices, blurbs, links and Kartra tag names: `src/config/offers.ts` (links read from environment variables).
- The six stages, their opening questions and what each saves: `src/config/stages.ts`.
- The strategist's personality and rules: `src/lib/prompts.ts`.
- Look and feel: `src/app/globals.css`.

## Costs and safety

- Claude usage is billed to your Anthropic account. A full six-stage run is a few dozen calls; `MONTHLY_MESSAGE_LIMIT` caps each buyer's AI turns per month.
- The API key only ever lives on the server.
- Stored per buyer: email, first name, answers, blueprint and session messages. No payment details.

## Local preview

```
npm install
npm run dev
```

Without an Anthropic key the strategist uses example replies, and any email can log in locally (the login link shows on screen).
