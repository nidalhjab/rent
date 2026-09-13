/**
 * Single place to rebrand or re-target the marketplace: name, money formatting,
 * cities offered in the pickers, and the abuse limits applied to public forms.
 */
export const site = {
  name: "لُبسة",
  nameLatin: "Labsa",
  tagline: "استأجري فستان أحلامك، وأجّري فستانك",
  description:
    "منصة عربية لتأجير الفساتين المستعملة بحالة ممتازة وسعر مناسب، مع تجربة قياس ذكية بالذكاء الاصطناعي.",
  themeColor: "#c0426b",
  backgroundColor: "#fff9f7",
  currency: "ر.س",
  locale: "ar-SA",
  cities: [
    "الرياض",
    "جدة",
    "مكة المكرمة",
    "المدينة المنورة",
    "الدمام",
    "الخبر",
    "الأحساء",
    "الطائف",
    "بريدة",
    "تبوك",
    "أبها",
    "خميس مشيط",
    "حائل",
    "نجران",
    "جيزان",
    "ينبع",
  ],
  dressSizes: ["XS", "S", "M", "L", "XL", "XXL"],
  limits: {
    /** AI renders allowed per visitor per day. */
    rendersPerDay: 8,
    /** Item submissions allowed per visitor per day. */
    submissionsPerDay: 5,
    /** Reservation requests allowed per visitor per day. */
    reservationsPerDay: 10,
    /** Failed admin logins before the IP is locked out for 15 minutes. */
    loginAttempts: 5,
  },
} as const;

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const formatPrice = (amount: number) =>
  `${new Intl.NumberFormat(site.locale).format(amount)} ${site.currency}`;

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat(site.locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
