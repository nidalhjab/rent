import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import { ITEMS_FOLDER } from "../lib/cloudinary";
import { prisma } from "../lib/db";
import type { Condition, ImageRole } from "../lib/generated/prisma/enums";

type SeedItem = {
  title: string;
  description: string;
  color: string;
  size: string;
  condition: Condition;
  timesWorn: number;
  pricePerDay: number;
  depositAmount?: number;
  city: string;
  ownerName: string;
  ownerPhone: string;
  approved: boolean;
};

const items: SeedItem[] = [
  {
    title: "فستان سواريه طويل كحلي بأكمام طويلة",
    description:
      "قماش كريب فخم، مبطن بالكامل، مناسب لحفلات الزواج والمناسبات الرسمية. لُبس مرة واحدة فقط في حفل تخرج.",
    color: "كحلي",
    size: "M",
    condition: "LIKE_NEW",
    timesWorn: 1,
    pricePerDay: 120,
    depositAmount: 300,
    city: "الرياض",
    ownerName: "نورة",
    ownerPhone: "0551234567",
    approved: true,
  },
  {
    title: "فستان زفاف أبيض بتفاصيل دانتيل",
    description:
      "تفاصيل دانتيل مطرزة يدوياً مع ذيل قصير. تم كويه وتغليفه بعد آخر استخدام.",
    color: "أبيض",
    size: "S",
    condition: "EXCELLENT",
    timesWorn: 1,
    pricePerDay: 350,
    depositAmount: 800,
    city: "جدة",
    ownerName: "لمى",
    ownerPhone: "0562223344",
    approved: true,
  },
  {
    title: "فستان مخمل زمردي بقصة ضيقة",
    description: "مخمل ثقيل بلون زمردي غامق، مثالي لمناسبات الشتاء.",
    color: "أخضر زمردي",
    size: "L",
    condition: "GOOD",
    timesWorn: 2,
    pricePerDay: 95,
    city: "الدمام",
    ownerName: "هيا",
    ownerPhone: "0503334455",
    approved: true,
  },
  {
    title: "فستان شيفون وردي فاتح للمناسبات النهارية",
    description: "خفيف وواسع، مناسب للحفلات النهارية والاستقبالات.",
    color: "وردي",
    size: "M",
    condition: "EXCELLENT",
    timesWorn: 1,
    pricePerDay: 80,
    depositAmount: 150,
    city: "المدينة المنورة",
    ownerName: "دانة",
    ownerPhone: "0577778899",
    approved: true,
  },
  {
    title: "فستان أسود كلاسيكي بقصة A",
    description: "قصة كلاسيكية تناسب معظم المناسبات، مع جيوب مخفية.",
    color: "أسود",
    size: "XL",
    condition: "GOOD",
    timesWorn: 3,
    pricePerDay: 70,
    city: "أبها",
    ownerName: "ريم",
    ownerPhone: "0591112233",
    approved: false,
  },
  {
    title: "فستان ذهبي بترتر للحفلات",
    description: "ترتر ذهبي كامل، لافت جداً في الصور. يحتاج تنظيف جاف بعد الاستخدام.",
    color: "ذهبي",
    size: "S",
    condition: "FAIR",
    timesWorn: 4,
    pricePerDay: 60,
    city: "الخبر",
    ownerName: "شهد",
    ownerPhone: "0544445566",
    approved: false,
  },
];

const ROLES: ImageRole[] = ["FRONT", "BACK", "DETAIL"];

function configureCloudinary() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Seeding needs NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/** Placeholder photography, fetched by Cloudinary straight from the source URL. */
async function uploadPlaceholder(seed: string) {
  const result = await cloudinary.uploader.upload(
    `https://picsum.photos/seed/${seed}/900/1200`,
    { folder: ITEMS_FOLDER },
  );
  return {
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

async function main() {
  configureCloudinary();

  const existing = await prisma.item.count();
  if (existing > 0) {
    console.log(`Skipping seed: ${existing} items already exist.`);
    return;
  }

  for (const [index, item] of items.entries()) {
    const images = await Promise.all(
      ROLES.map(async (role, roleIndex) => ({
        role,
        ...(await uploadPlaceholder(`labsa-${index}-${roleIndex}`)),
      })),
    );

    const created = await prisma.item.create({
      data: {
        title: item.title,
        description: item.description,
        color: item.color,
        size: item.size,
        condition: item.condition,
        timesWorn: item.timesWorn,
        pricePerDay: item.pricePerDay,
        depositAmount: item.depositAmount,
        city: item.city,
        ownerName: item.ownerName,
        ownerPhone: item.ownerPhone,
        moderation: item.approved ? "APPROVED" : "PENDING",
        approvedAt: item.approved ? new Date() : null,
        images: { create: images },
      },
    });

    console.log(`Created ${created.moderation} item: ${created.title}`);
  }

  const firstApproved = await prisma.item.findFirst({
    where: { moderation: "APPROVED" },
    select: { id: true },
  });

  if (firstApproved) {
    await prisma.reservation.create({
      data: {
        itemId: firstApproved.id,
        renterName: "سارة",
        renterPhone: "0509998877",
        note: "أحتاجه ليوم الخميس القادم إن أمكن.",
      },
    });
    console.log("Created a pending reservation request.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
