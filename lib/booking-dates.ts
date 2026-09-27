// Bookings use Palestinian calendar dates, never the visitor/server timezone.
// Minimum gap between reservation dates; this does not define rental duration.
export const RESERVATION_GAP_DAYS = 3;
export const BOOKING_WINDOW_DAYS = 365;
export const BOOKING_TIME_ZONE = "Asia/Hebron";

export function todayInPalestine(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BOOKING_TIME_ZONE,
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((entry) => entry.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const dateValue = (value: string) => new Date(`${value}T00:00:00.000Z`);

export function addDays(value: string, days: number): string {
  const date = dateValue(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function overlapsBooking(start: string, bookedStart: string): boolean {
  return start < addDays(bookedStart, RESERVATION_GAP_DAYS) &&
    addDays(start, RESERVATION_GAP_DAYS) > bookedStart;
}

export function firstAvailableDate(from: string, bookedStarts: string[]): string {
  let candidate = from;
  for (const start of [...bookedStarts].sort()) {
    if (overlapsBooking(candidate, start)) candidate = addDays(start, RESERVATION_GAP_DAYS);
  }
  return candidate;
}

/** Next availability after the first outstanding reservation, including a
 * future reservation. Expired dates stop showing as reserved automatically. */
export function nextAvailabilityAfterReservation(today: string, bookedStarts: string[]): string | null {
  const outstanding = bookedStarts
    .filter((start) => addDays(start, RESERVATION_GAP_DAYS) > today)
    .sort();
  return outstanding.length ? firstAvailableDate(outstanding[0], outstanding) : null;
}

export const formatBookingDate = (value: string | Date) =>
  new Intl.DateTimeFormat("ar-PS", {
    dateStyle: "long", timeZone: "UTC",
  }).format(typeof value === "string" ? dateValue(value) : value);
