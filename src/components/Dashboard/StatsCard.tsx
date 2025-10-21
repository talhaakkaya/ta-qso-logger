import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ColorVariant = "blue" | "purple" | "green" | "orange";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: ColorVariant;
}

const gradientMap: Record<ColorVariant, { from: string; to: string }> = {
  blue: { from: "#60a5fa", to: "#2563eb" },
  purple: { from: "#c084fc", to: "#9333ea" },
  green: { from: "#4ade80", to: "#16a34a" },
  orange: { from: "#fb923c", to: "#ea580c" },
};

const bgGradientMap: Record<ColorVariant, string> = {
  blue: "from-blue-400/10 to-blue-600/10",
  purple: "from-purple-400/10 to-purple-600/10",
  green: "from-green-400/10 to-green-600/10",
  orange: "from-orange-400/10 to-orange-600/10",
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color = "blue",
}) => {
  const gradientId = `icon-gradient-${color}`;

  return (
    <Card className="h-full">
      <CardContent className="flex items-center p-6">
        <div className="flex-grow">
          <h6 className="text-muted-foreground mb-2 text-xs uppercase font-semibold tracking-wider">
            {title}
          </h6>
          <h3 className="mb-0 font-bold text-3xl">
            {value.toLocaleString("tr-TR")}
          </h3>
        </div>
        <div className="relative flex items-center justify-center w-[60px] h-[60px]">
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br rounded-xl",
              bgGradientMap[color]
            )}
          />
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient
                id={gradientId}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={gradientMap[color].from} />
                <stop offset="100%" stopColor={gradientMap[color].to} />
              </linearGradient>
            </defs>
          </svg>
          <Icon
            className="w-10 h-10 relative z-10"
            strokeWidth={1.5}
            style={{ stroke: `url(#${gradientId})` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
