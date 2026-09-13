import { ConfirmButton } from "@/components/admin/confirm-button";
import { ConditionBadge } from "@/components/item/item-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CloudImage } from "@/components/ui/cloud-image";
import { formatDate, formatPrice } from "@/config/site";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { t } from "@/messages/ar";
import { approveSubmission, declineSubmission } from "../actions";

export const instant = false;

export default async function AdminSubmissionsPage() {
  await requireAdmin();

  const submissions = await prisma.item.findMany({
    where: { moderation: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { images: true },
  });

  if (submissions.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-border bg-surface p-12 text-center text-muted">
        {t.admin.noPendingSubmissions}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {submissions.map((item) => (
        <article
          key={item.id}
          className="grid gap-6 rounded-card border border-border bg-surface p-5 lg:grid-cols-[320px_1fr]"
        >
          <div className="grid grid-cols-3 gap-2">
            {item.images.map((image) => (
              <div
                key={image.id}
                className="relative aspect-3/4 overflow-hidden rounded-xl bg-subtle"
              >
                <CloudImage
                  src={image.publicId}
                  alt={t.item.imageRoles[image.role]}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
                <span className="absolute inset-x-0 bottom-0 bg-foreground/60 py-0.5 text-center text-[10px] text-white">
                  {t.item.imageRoles[image.role]}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{t.enums.category[item.category]}</Badge>
              <ConditionBadge condition={item.condition} />
              <span className="text-xs text-muted">
                {t.admin.submittedAt}: {formatDate(item.createdAt)}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-semibold">{item.title}</h2>
              {item.description ? (
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              ) : null}
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted">{t.item.size}</dt>
                <dd className="font-medium">{item.size}</dd>
              </div>
              <div>
                <dt className="text-muted">{t.item.color}</dt>
                <dd className="font-medium">{item.color}</dd>
              </div>
              <div>
                <dt className="text-muted">{t.item.city}</dt>
                <dd className="font-medium">{item.city}</dd>
              </div>
              <div>
                <dt className="text-muted">{t.item.perDay}</dt>
                <dd className="font-medium">
                  {formatPrice(item.pricePerDay)}
                </dd>
              </div>
              {item.depositAmount ? (
                <div>
                  <dt className="text-muted">{t.item.deposit}</dt>
                  <dd className="font-medium">
                    {formatPrice(item.depositAmount)}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted">{t.item.condition}</dt>
                <dd className="font-medium">
                  {t.item.timesWorn(item.timesWorn)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">{t.admin.owner}</dt>
                <dd className="font-medium">{item.ownerName}</dd>
              </div>
              <div>
                <dt className="text-muted">{t.admin.phone}</dt>
                <dd className="font-medium" dir="ltr">
                  <a href={`tel:${item.ownerPhone}`}>{item.ownerPhone}</a>
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-2 pt-1">
              <form action={approveSubmission}>
                <input type="hidden" name="id" value={item.id} />
                <Button type="submit" variant="success" size="sm">
                  {t.admin.approve}
                </Button>
              </form>

              <form action={declineSubmission}>
                <input type="hidden" name="id" value={item.id} />
                <ConfirmButton
                  type="submit"
                  variant="danger"
                  size="sm"
                  message={t.admin.confirmDecline}
                >
                  {t.admin.decline}
                </ConfirmButton>
              </form>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
