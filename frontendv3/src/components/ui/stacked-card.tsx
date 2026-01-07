import { cn } from "../../lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";

interface StackedCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  stackColor?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export function StackedCard({
  children,
  className,
  title,
  description,
  stackColor = "bg-muted",
  interactive = false,
  onClick,
}: StackedCardProps) {
  const Component = interactive ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={cn(
        "relative group",
        interactive && "cursor-pointer text-left w-full"
      )}
    >
      {/* Bottom stack layer - flat color, moves diagonally on hover */}
      <div
        className={cn(
          "absolute inset-0 rounded transition-transform duration-200",
          stackColor,
          interactive
            ? "translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3"
            : "translate-x-2 translate-y-2"
        )}
      />

      {/* Top card */}
      <Card className={cn("relative z-10", className)}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent className={!title && !description ? "pt-6" : undefined}>
          {children}
        </CardContent>
      </Card>
    </Component>
  );
}
