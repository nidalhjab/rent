BEGIN;

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- A preferred date is a calendar day, not an instant in the browser's timezone.
ALTER TABLE "Reservation" ALTER COLUMN "preferredDate" TYPE DATE
  USING "preferredDate"::date;

-- Stop rather than silently cancel or move any existing customer's booking.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "Reservation" a JOIN "Reservation" b
      ON a."itemId" = b."itemId" AND a."id" < b."id"
    WHERE a."status" IN ('PENDING', 'APPROVED')
      AND b."status" IN ('PENDING', 'APPROVED')
      AND a."preferredDate" IS NOT NULL AND b."preferredDate" IS NOT NULL
      AND daterange(a."preferredDate", a."preferredDate" + 3, '[)')
        && daterange(b."preferredDate", b."preferredDate" + 3, '[)')
  ) THEN
    RAISE EXCEPTION 'Overlapping legacy reservations exist. Review and reject conflicting requests before deploying the booking calendar migration.';
  END IF;
END $$;

ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_no_overlapping_dates"
  EXCLUDE USING gist (
    "itemId" WITH =,
    daterange("preferredDate", "preferredDate" + 3, '[)') WITH &&
  ) WHERE ("status" IN ('PENDING', 'APPROVED') AND "preferredDate" IS NOT NULL);

CREATE INDEX "Reservation_itemId_status_preferredDate_idx"
  ON "Reservation" ("itemId", "status", "preferredDate");

-- Old approvals permanently set RESERVED. Dated reservations now own the
-- calendar; preserve manual blocks and any unresolved undated approvals.
UPDATE "Item" i SET "availability" = 'AVAILABLE'
WHERE i."availability" = 'RESERVED'
  AND EXISTS (SELECT 1 FROM "Reservation" r WHERE r."itemId" = i."id"
    AND r."status" = 'APPROVED' AND r."preferredDate" IS NOT NULL)
  AND NOT EXISTS (SELECT 1 FROM "Reservation" r WHERE r."itemId" = i."id"
    AND r."status" = 'APPROVED' AND r."preferredDate" IS NULL);

COMMIT;
