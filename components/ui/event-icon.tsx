import {
  ArrowLeftRight,
  CircleCheck,
  CircleX,
  Goal,
  Square,
  Target,
  Volleyball,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MatchEventType } from "@/types/database";

type EventVisual = {
  Icon: LucideIcon;
  className: string;
  filled?: boolean;
  fillClassName?: string;
};

export const MATCH_EVENT_VISUALS: Record<MatchEventType, EventVisual> = {
  goal: { Icon: Volleyball, className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  own_goal: { Icon: Goal, className: "border-orange-200 bg-orange-50 text-orange-700" },
  assist: { Icon: Target, className: "border-sky-200 bg-sky-50 text-sky-700" },
  yellow_card: {
    Icon: Square,
    className: "border-amber-200 bg-amber-50 text-amber-500",
    filled: true,
    fillClassName: "fill-amber-400",
  },
  red_card: {
    Icon: Square,
    className: "border-rose-200 bg-rose-50 text-rose-500",
    filled: true,
    fillClassName: "fill-rose-500",
  },
  substitution: { Icon: ArrowLeftRight, className: "border-violet-200 bg-violet-50 text-violet-700" },
  penalty_goal: { Icon: CircleCheck, className: "border-teal-200 bg-teal-50 text-teal-700" },
  penalty_miss: { Icon: CircleX, className: "border-red-200 bg-red-50 text-red-700" },
};

export function getMatchEventVisual(type: MatchEventType): EventVisual {
  return MATCH_EVENT_VISUALS[type];
}

export function EventIcon({
  type,
  className,
  iconClassName,
}: {
  type: MatchEventType;
  className?: string;
  iconClassName?: string;
}) {
  const visual = getMatchEventVisual(type);
  const { Icon } = visual;
  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm",
        visual.className,
        className
      )}
    >
      <Icon
        className={cn("h-4 w-4", visual.filled ? visual.fillClassName : undefined, iconClassName)}
        aria-hidden
      />
    </span>
  );
}
