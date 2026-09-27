import assert from "node:assert/strict";
import { test } from "node:test";
import { addDays, firstAvailableDate, isCalendarDate, nextAvailabilityAfterReservation, overlapsBooking, todayInPalestine } from "../lib/booking-dates";
import { reservationSchema } from "../lib/validation";

test("September 30 reservation calculates October 3 as the next available date", () => {
  assert.equal(addDays("2026-09-30", 3), "2026-10-03");
  for (const date of ["2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02"]) {
    assert.equal(overlapsBooking(date, "2026-09-30"), true, date);
  }
  assert.equal(overlapsBooking("2026-09-27", "2026-09-30"), false);
  assert.equal(overlapsBooking("2026-10-03", "2026-09-30"), false);
  assert.equal(firstAvailableDate("2026-09-30", ["2026-09-30"]), "2026-10-03");
});

test("maintains the availability gap across adjacent and unordered reservation dates", () => {
  assert.equal(firstAvailableDate("2026-09-29", ["2026-10-03", "2026-09-30"]), "2026-10-06");
  assert.equal(firstAvailableDate("2026-09-27", ["2026-09-30"]), "2026-09-27");
  assert.equal(firstAvailableDate("2026-10-10", ["2026-09-30"]), "2026-10-10");
});

test("reserved notice includes future bookings and disappears on the availability date", () => {
  assert.equal(nextAvailabilityAfterReservation("2026-09-28", ["2026-09-30"]), "2026-10-03");
  assert.equal(nextAvailabilityAfterReservation("2026-10-02", ["2026-09-30"]), "2026-10-03");
  assert.equal(nextAvailabilityAfterReservation("2026-10-03", ["2026-09-30"]), null);
  assert.equal(nextAvailabilityAfterReservation("2026-09-30", ["2026-10-03", "2026-09-30"]), "2026-10-06");
  assert.equal(nextAvailabilityAfterReservation("2026-10-03", []), null);
});

test("calendar arithmetic is stable across year, leap day, and Palestinian DST boundaries", () => {
  assert.equal(addDays("2026-12-30", 3), "2027-01-02");
  assert.equal(addDays("2028-02-28", 3), "2028-03-02");
  assert.equal(addDays("2026-10-23", 3), "2026-10-26");
  assert.equal(todayInPalestine(new Date("2026-09-29T21:30:00Z")), "2026-09-30");
});

test("rejects missing, malformed, impossible, past, and out-of-window booking dates", () => {
  assert.equal(isCalendarDate("2026-02-30"), false);
  assert.equal(isCalendarDate("2026-09-30T00:00:00Z"), false);
  const base = { itemId: "item", renterName: "Test User", renterPhone: "0599999999" };
  const today = todayInPalestine();
  for (const preferredDate of [undefined, "", "2026-02-30", addDays(today, -1), addDays(today, 366)]) {
    assert.equal(reservationSchema.safeParse({ ...base, preferredDate }).success, false);
  }
  assert.equal(reservationSchema.safeParse({ ...base, preferredDate: today }).success, true);
  assert.equal(reservationSchema.safeParse({ ...base, preferredDate: addDays(today, 365) }).success, true);
});
