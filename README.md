# لُبسة — dress rentals in Palestine

Arabic (`ar-PS`), RTL marketplace using Next.js 16, Prisma/Neon PostgreSQL,
and Cloudinary. Public site: https://rent-jade-sigma.vercel.app.

## Development

Copy `.env.example` to `.env`, supply your own credentials, and run
`npm install`, `npm run db:deploy`, then `npm run dev`.
`NEXT_PUBLIC_SITE_URL` must contain the public origin. The default is
`https://rent-jade-sigma.vercel.app`. Update it when adopting a custom domain,
and redirect the old domain to the new one.

Never commit credentials. Rotate any previously committed credential;
replacing the example does not remove repository history.

## Booking rules

- Start dates are required and interpreted as Palestinian calendar days
  (`Asia/Hebron`), independent of browser/server timezones.
- Three days is the availability gap after a reservation date, not a rental
  duration. For September 30, 2026, the next available date is October 3.
  Cards and detail pages show `محجوز` and a small calculated availability note.
  The notice clears automatically when that date arrives (Palestinian time).
- Pending and approved requests both hold dates. Rejection releases pending
  dates. Pending holds are not automatically approved/cancelled, so review
  requests promptly.
- Visitors may choose today through the following 365 days. Availability is
  loaded live and checked again transactionally on submission.
- Item row locks serialize requests/admin decisions across server instances.
  A PostgreSQL GiST exclusion constraint independently rejects overlaps.
- Approval changes only that request; it does not reject bookings on other
  dates or permanently reserve the dress. Stale admin forms cannot change a
  request that is no longer pending.
- Manual RESERVED, RENTED, and HIDDEN statuses block new bookings. Set the item
  back to AVAILABLE to accept future date-based bookings.

## Database migration

`npm run build` runs migrations before compilation. Use `npx next build` to
compile without changing the database.

The `202609280001_booking_calendar` migration requires PostgreSQL `btree_gist`.
It converts `preferredDate` to a date, adds the overlap constraint/index, and
releases permanent RESERVED flags created by old dated approvals. It preserves
manual blocks and undated legacy approvals. Old undated pending requests cannot
be approved; reject and rebook with a date instead of guessing.

The migration aborts and rolls back if existing active requests overlap. It
never silently cancels bookings. Review conflicts before deploying:

```sql
SELECT a.id AS first_id, b.id AS second_id, a."itemId",
       a."preferredDate" AS first_start, b."preferredDate" AS second_start
FROM "Reservation" a JOIN "Reservation" b
  ON a."itemId" = b."itemId" AND a.id < b.id
WHERE a.status IN ('PENDING', 'APPROVED')
  AND b.status IN ('PENDING', 'APPROVED')
  AND a."preferredDate" IS NOT NULL AND b."preferredDate" IS NOT NULL
  AND daterange(a."preferredDate"::date, a."preferredDate"::date + 3, '[)')
    && daterange(b."preferredDate"::date, b."preferredDate"::date + 3, '[)');
```

After resolving conflicts, if Prisma recorded a failed migration, run
`prisma migrate resolve --rolled-back 202609280001_booking_calendar`, then
`npm run db:deploy`. Never mark it applied unless its SQL succeeded.

## Search visibility

Server-rendered Arabic metadata, canonical links, sharing tags, and safe
WebSite, Organization, Product/rental Offer, and BreadcrumbList JSON-LD describe
the content. `/sitemap.xml` includes public approved listings and photos;
hidden listings return not found. `/robots.txt` advertises the sitemap.
Admin pages are noindex but crawlable so crawlers can read that directive.
Search/filter variants are noindex/follow; pagination has its own canonical URL.

Set `GOOGLE_SITE_VERIFICATION` for a Search Console HTML token. After deployment,
verify ownership and submit `/sitemap.xml` in Google Search Console. Inspect a
dress using URL Inspection and Rich Results Test. Indexing/ranking are Google's
decisions. Use accurate Arabic descriptions and never fabricate ratings.

## Performance

Cloudinary serves automatic formats/quality at responsive widths. Offscreen
images load lazily and the main photo loads eagerly; aspect ratios avoid layout
shifts. Uploads resize in the browser, time out, and cannot overwrite newer
selections. Catalog data is cached, while calendars, APIs, and admin pages bypass
service-worker caching. Database connections/statements have bounded timeouts.
Public page errors have an Arabic retry action.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npx next build
npm run test:browser
```

Database tests use isolated in-memory PostgreSQL (PGlite), never the live DB.
They cover date boundaries/timezones, overlap constraints, legacy migration
safety, atomic rate limits, and JSON-LD escaping. PGlite queues connections:
these tests verify constraints rather than simulate multi-server contention.

Browser checks start a production server on port 3100 with installed Chrome.
They require a published available dress with front/back photos, read only the
public catalog, and never submit bookings/uploads. They cover 320/375/768/1440px
layouts, the fullscreen viewer, date inputs, and rendered SEO. Change
`PLAYWRIGHT_CHANNEL` to use another installed supported browser.
