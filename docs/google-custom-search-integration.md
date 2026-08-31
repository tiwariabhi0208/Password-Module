# Dynamic Bank Login URL Resolution via Google Custom Search API

## Problem

`getDirectLoginUrl()` in [src/app/components/AccountModal.jsx](../src/app/components/AccountModal.jsx) only
returns a real login URL for banks that are hardcoded (ICICI, HDFC, SBI, Axis, Kotak, Yes, PNB, BoB). For
every other bank it falls back to a plain Google *search results* page, so the user still has to manually
find and click the right link.

The goal: given any bank name + account type (corporate/retail), automatically resolve and open the actual
login page — no hardcoded list, no manual searching.

## Approach

Use the **Google Programmable Search Engine (Custom Search JSON API)** server-side to fetch the top search
result for a query like `"<bank name> corporate netbanking login"`, then redirect the user straight to that
URL instead of showing them a search results page.

This is different from the "I'm Feeling Lucky" trick — that only redirects within Google's own search UI
and isn't scriptable. The Custom Search API instead returns structured JSON (title, link, snippet) for the
top N results, which your backend can parse and act on programmatically.

## How it works, end to end

1. **User picks a bank** in the frontend and selects account type (corporate/retail).
2. **Frontend calls your backend**, e.g. `GET /api/resolve-bank-url?bank=<name>&type=<type>`, instead of
   building a URL client-side.
3. **Backend builds a search query**: `"${bankName} ${accountType} netbanking login official site"`.
4. **Backend calls the Google Custom Search API**:
   ```
   GET https://www.googleapis.com/customsearch/v1
       ?key=YOUR_API_KEY
       &cx=YOUR_SEARCH_ENGINE_ID
       &q=<url-encoded query>
   ```
5. **Google returns JSON** with a `items[]` array — each item has a `link` (the URL), `title`, `snippet`,
   and `displayLink` (domain).
6. **Backend picks the best candidate.** Don't blindly trust `items[0]` — banking phishing/aggregator sites
   rank highly too. Apply a sanity filter:
   - Prefer results whose `displayLink` matches an expected pattern (e.g. contains the bank's known root
     domain, or ends in `.co.in` / `.com` / `.in` and contains the bank name).
   - Optionally maintain a small allow-list of verified root domains per bank (this can grow from a DB
     table, not hardcoded in the frontend) and only auto-redirect if the top result's domain matches one you
     trust; otherwise fall back to showing the search results page for a human to confirm.
7. **Backend returns the resolved URL** (or `null`/a fallback flag if nothing looked trustworthy) to the
   frontend.
8. **Frontend redirects/opens** the resolved URL in a new tab, exactly like it does today for the hardcoded
   banks. If resolution failed or was untrusted, fall back to the current Google search page (option 1
   behavior) so the user isn't sent somewhere unverified.

## What you need to set up

1. **Google Cloud project** with the "Custom Search API" enabled.
2. **API key** (from Google Cloud Console → Credentials). Store it as a backend env var
   (`GOOGLE_CSE_API_KEY`), never in frontend code.
3. **Programmable Search Engine** created at [programmablesearchengine.google.com](https://programmablesearchengine.google.com/)
   configured to search the entire web (not restricted to specific sites), which gives you a `cx` (Search
   Engine ID) to use as the `cx` parameter.

## What happens in practice

- **Common/well-known banks**: the top result is almost always the correct official netbanking domain, so
  auto-redirect works well.
- **Obscure/regional banks or NBFCs**: search results are noisier — official sites may rank below
  aggregators, comparison sites, or news articles. The domain-matching filter in step 6 is what keeps this
  safe; without it you risk auto-redirecting a user into a look-alike or unrelated site.
- **Rate limits / cost**: the free tier is capped at **100 queries/day**. Beyond that it's paid
  (~$5 per 1,000 queries, current as of last pricing check — verify in the Google Cloud Console before
  relying on this number). For a small internal tool this is usually fine; for high-traffic use you'd want
  to cache resolved URLs (e.g. in your existing bank table) so you only hit the API once per unique bank
  name/type combination, not on every login click.
- **Latency**: adds one external HTTP round-trip (typically 100–400ms) before the redirect happens, versus
  the instant client-side URL construction used for hardcoded banks.
- **Failure modes to handle**: API quota exceeded, no results returned, network timeout, or all results
  failing the trust filter — in every case, degrade gracefully to the existing "open Google search results"
  fallback rather than blocking the user or silently redirecting somewhere unverified.

## Security note

Never let the frontend call the Google API directly with the key embedded in client code — it would be
exposed to anyone inspecting network requests/bundle. All calls must go through your backend, which holds
the key server-side and applies the domain-trust filtering before handing a URL back to the client.

## Summary

| Aspect | Detail |
|---|---|
| What it replaces | The hardcoded `if (name.includes(...))` chain in `getDirectLoginUrl()` |
| Where it runs | Backend only (API key must not be exposed client-side) |
| Trust mechanism | Domain allow-list / pattern match on `displayLink` before auto-redirecting |
| Fallback | Existing Google search-results page, if no trusted result is found |
| Cost | Free up to 100 queries/day, paid beyond that |
| Caching | Store resolved URL per bank+type in DB after first successful resolution, to avoid repeat API calls |
