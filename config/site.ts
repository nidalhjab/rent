/**
 * Single place to rebrand or re-target the marketplace: name, money formatting,
 * cities offered in the pickers, and the abuse limits applied to public forms.
 */
export const site = {
  name: "لُبسة",
  nameLatin: "Labsa",
  tagline: "استأجري فستان أحلامك، وأجّري فستانك",
  description:
    "تصفّحي فساتين مستعملة للإيجار في فلسطين على لُبسة. فساتين سهرة ومناسبات بحالة ممتازة وأسعار بالشيكل، مع البحث حسب المدينة والمقاس والاطلاع على مواعيد الحجز المتاحة.",
  themeColor: "#c0426b",
  backgroundColor: "#fff9f7",
  currency: "₪",
  locale: "ar-PS",
  cities: [
    "الخليل",
    "القدس",
    "أريحا",
    "بيت لحم",
    "جنين",
    "نابلس",
    "رام الله",
    "قلقيلية",
    "رام الله و البيرة",
    "سلفيت",
    "طوباس",
    "طولكرم",
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

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://rent-jade-sigma.vercel.app",
).origin;

export const formatPrice = (amount: number) =>
  `${new Intl.NumberFormat(site.locale, { numberingSystem: "latn" }).format(amount)}${site.currency}`;

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat(site.locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Hebron",
  }).format(date);
