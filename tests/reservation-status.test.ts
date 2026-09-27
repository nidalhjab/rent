import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ReservationStatus } from "../components/item/reservation-status";
import { site } from "../config/site";
import { itemDescription } from "../lib/seo";
import { t } from "../messages/ar";

test("dress card renders reserved plus the calculated next availability", () => {
  const html = renderToStaticMarkup(createElement(ReservationStatus, {
    availability: "AVAILABLE", bookedStarts: ["2026-09-30"], initialToday: "2026-09-28", compact: true,
  }));
  assert.ok(html.includes("محجوز"));
  assert.ok(html.includes("متاح للحجز من"));
  assert.match(html, /datetime="2026-10-03"/i);
});

test("expired reservations no longer show a reserved badge or date", () => {
  const html = renderToStaticMarkup(createElement(ReservationStatus, {
    availability: "AVAILABLE", bookedStarts: ["2026-09-30"], initialToday: "2026-10-03", compact: true,
  }));
  assert.equal(html, "");
});

test("manual unavailability is preserved without inventing a next date", () => {
  const html = renderToStaticMarkup(createElement(ReservationStatus, {
    availability: "RENTED", bookedStarts: [], initialToday: "2026-10-03",
  }));
  assert.ok(html.includes(t.enums.availability.RENTED));
  assert.ok(!html.includes("<time"));
});

test("public copy and SEO do not describe the availability gap as a rental duration", () => {
  const description = itemDescription({
    id: "dress", title: "فستان", description: null, city: "الخليل", size: "M", color: "أحمر",
    pricePerDay: 100, availability: "AVAILABLE", images: [],
  });
  for (const text of [site.description, description, JSON.stringify(t)]) {
    assert.doesNotMatch(text, /مدة الحجز|لمدة ٣ أيام|نحجز لك ٣ أيام|٣ أيام متتالية/);
  }
});
