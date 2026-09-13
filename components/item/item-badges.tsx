import { Badge } from "@/components/ui/badge";
import type { Availability, Condition } from "@/lib/generated/prisma/enums";
import { t } from "@/messages/ar";

const conditionTone = {
  LIKE_NEW: "success",
  EXCELLENT: "primary",
  GOOD: "neutral",
  FAIR: "warning",
} as const;

const availabilityTone = {
  AVAILABLE: "success",
  RESERVED: "warning",
  RENTED: "danger",
  HIDDEN: "neutral",
} as const;

export function ConditionBadge({ condition }: { condition: Condition }) {
  return (
    <Badge tone={conditionTone[condition]}>
      {t.enums.condition[condition]}
    </Badge>
  );
}

export function AvailabilityBadge({
  availability,
}: {
  availability: Availability;
}) {
  return (
    <Badge tone={availabilityTone[availability]}>
      {t.enums.availability[availability]}
    </Badge>
  );
}
