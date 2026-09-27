import assert from "node:assert/strict";
import { test } from "node:test";
import { itemStructuredData, pageMetadata, serializeJsonLd } from "../lib/seo";

test("Arabic Palestinian metadata has canonical and sharing information", () => {
  const metadata = pageMetadata({ title: "فستان للإيجار في الخليل", path: "/items/dress" });
  assert.equal(metadata.alternates?.canonical, "/items/dress");
  assert.equal(metadata.alternates?.languages?.["ar-PS"], "/items/dress");
  assert.equal((metadata.openGraph as { locale: string }).locale, "ar_PS");
});

test("user-provided dress content cannot escape JSON-LD into executable markup", () => {
  const title = '</script><script>alert("xss")</script>';
  const serialized = serializeJsonLd(itemStructuredData({
    id: "dress", title, description: null, city: "الخليل", size: "M", color: "أحمر",
    pricePerDay: 100, availability: "AVAILABLE", images: [],
  }));
  assert.equal(serialized.includes("<"), false);
  assert.equal(JSON.parse(serialized)["@graph"][0].name, title);
  assert.equal(JSON.parse(serialized)["@graph"][0].offers.priceCurrency, "ILS");
  assert.equal(JSON.parse(serialized)["@graph"][0].offers.businessFunction, "http://purl.org/goodrelations/v1#LeaseOut");
});
