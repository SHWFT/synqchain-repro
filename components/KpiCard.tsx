import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  description?: string;
  className?: string;
}

export function KpiCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  description,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <span
                className={cn(
                  "text-sm font-medium",
                  changeType === "positive" && "text-green-600",
                  changeType === "negative" && "text-red-600",
                  changeType === "neutral" && "text-gray-500"
                )}
              >
                {change}
              </span>
            </div>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}