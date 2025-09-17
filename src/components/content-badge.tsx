import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

type ContentBadgeProps = {
  type: "free" | "premium" | "pro";
};

export function ContentBadge({ type }: ContentBadgeProps) {
  if (type === "free") {
    return (
      <Badge
        variant="outline"
        className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      >
        Free
      </Badge>
    );
  }

  if (type === "premium") {
    return (
      <Badge
        variant="outline"
        className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
      >
        Premium
      </Badge>
    );
  }

  if (type === "pro") {
    return (
      <Badge
        variant="outline"
        className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 inline-flex items-center gap-1"
      >
        <Lock className="w-3 h-3" />
        Pro
      </Badge>
    );
  }

  return null;
}
