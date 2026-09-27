import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";
import { rateLimitStatement } from "../lib/rate-limit-query";

const initial = () => readFile("prisma/migrations/0_init/migration.sql", "utf8");
const migration = () => readFile("prisma/migrations/202609280001_booking_calendar/migration.sql", "utf8");

async function seed(db: PGlite) {
  await db.exec(await initial());
  await db.exec(`INSERT INTO "Item" (id,title,color,size,condition,"pricePerDay",city,"ownerName","ownerPhone",moderation)
    VALUES ('dress','Test dress','red','M','GOOD',100,'الخليل','Owner','0599999999','APPROVED'),
    ('other','Other dress','red','M','GOOD',100,'الخليل','Owner','0599999999','APPROVED')`);
}

const reserve = (db: PGlite, id: string, date: string, item = "dress") => db.query(
  `INSERT INTO "Reservation" (id,"itemId","renterName","renterPhone","preferredDate") VALUES ($1,$2,'Renter','0599999999',$3)`,
  [id, item, date],
);

test("rate limits are atomic and reset only when their window expires", async () => {
  const db = new PGlite();
  try {
    await seed(db);
    const consume = (now: Date) => {
      const query = rateLimitStatement("test-ip", 3, 60_000, now);
      return db.query(query.text, query.values);
    };
    const now = new Date("2026-09-30T12:00:00Z");
    const results = await Promise.all(Array.from({ length: 12 }, () => consume(now)));
    assert.equal(results.filter((result) => result.rows.length === 1).length, 3);
    assert.equal((await consume(new Date("2026-09-30T12:00:59Z"))).rows.length, 0);
    assert.equal((await consume(new Date("2026-09-30T12:01:00Z"))).rows.length, 1);
  } finally { await db.close(); }
});

test("PostgreSQL enforces one active booking per overlapping range, including pending requests", async () => {
  const db = new PGlite({ extensions: { btree_gist } });
  try {
    await seed(db);
    await db.exec(await migration());
    const attempts = await Promise.allSettled([
      reserve(db, "first", "2026-09-30"), reserve(db, "second", "2026-09-30"), reserve(db, "third", "2026-10-02"),
    ]);
    assert.equal(attempts.filter((attempt) => attempt.status === "fulfilled").length, 1);
    for (const attempt of attempts) {
      if (attempt.status === "rejected") assert.equal(attempt.reason.code, "23P01");
    }
    await reserve(db, "next", "2026-10-03");
    await reserve(db, "previous", "2026-09-27");
    await reserve(db, "other-item", "2026-09-30", "other");
    await db.exec(`UPDATE "Reservation" SET status='APPROVED' WHERE id='first'`);
    await assert.rejects(reserve(db, "overlap-approved", "2026-10-01"), { code: "23P01" });
    await db.exec(`UPDATE "Reservation" SET status='REJECTED' WHERE id='first'`);
    await reserve(db, "replacement", "2026-09-30");
    await assert.rejects(db.exec(`UPDATE "Reservation" SET status='APPROVED' WHERE id='first'`), { code: "23P01" });
    const { rows } = await db.query<{ availability: string }>(`SELECT availability FROM "Item" WHERE id='dress'`);
    assert.equal(rows[0].availability, "AVAILABLE");
  } finally { await db.close(); }
});

test("migration preserves undated legacy blocks and releases the old permanent dated reservation flag", async () => {
  const db = new PGlite({ extensions: { btree_gist } });
  try {
    await seed(db);
    await reserve(db, "dated", "2026-09-30");
    await db.exec(`UPDATE "Reservation" SET status='APPROVED'; UPDATE "Item" SET availability='RESERVED';
      INSERT INTO "Reservation" (id,"itemId","renterName","renterPhone",status) VALUES ('legacy','other','Renter','0599999999','APPROVED')`);
    await db.exec(await migration());
    const { rows } = await db.query<{ id: string; availability: string }>(`SELECT id,availability FROM "Item" ORDER BY id`);
    assert.deepEqual(rows, [{ id: "dress", availability: "AVAILABLE" }, { id: "other", availability: "RESERVED" }]);
  } finally { await db.close(); }
});

test("migration aborts without cancelling customers when old bookings overlap", async () => {
  const db = new PGlite({ extensions: { btree_gist } });
  try {
    await seed(db);
    await reserve(db, "one", "2026-09-30");
    await reserve(db, "two", "2026-10-01");
    await assert.rejects(db.exec(await migration()), /Overlapping legacy reservations/);
    await db.exec("ROLLBACK");
    const { rows } = await db.query<{ count: number }>(`SELECT count(*)::int AS count FROM "Reservation" WHERE status='PENDING'`);
    assert.equal(rows[0].count, 2);
  } finally { await db.close(); }
});
