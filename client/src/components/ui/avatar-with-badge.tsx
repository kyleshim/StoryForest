import React from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "flex items-center justify-center rounded-full",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        primary: "bg-primary text-primary-foreground",
        accent: "bg-accent text-accent-foreground",
        muted: "bg-muted text-muted-foreground",
      },
      size: {
        sm: "h-8 w-8 text-sm",
        md: "h-12 w-12 text-lg",
        lg: "h-16 w-16 text-xl",
        xl: "h-24 w-24 text-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const badgeVariants = cva(
  "absolute rounded-full shadow-sm flex items-center justify-center font-heading font-bold",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
      },
      size: {
        sm: "w-4 h-4 text-xs -bottom-1 -right-1",
        md: "w-6 h-6 text-xs -bottom-1 -right-1",
        lg: "w-8 h-8 text-sm -bottom-1 -right-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface AvatarWithBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  initial: string;
  badgeText?: string;
  badgeVariant?: VariantProps<typeof badgeVariants>["variant"];
  badgeSize?: VariantProps<typeof badgeVariants>["size"];
}

const AvatarWithBadge = React.forwardRef<HTMLDivElement, AvatarWithBadgeProps>(
  ({ className, initial, badgeText, variant, size, badgeVariant, badgeSize, ...props }, ref) => (
    <div className="relative inline-block" ref={ref} {...props}>
      <div className={cn(avatarVariants({ variant, size, className }))}>
        <span className="font-heading font-bold">{initial}</span>
      </div>
      {badgeText && (
        <div className={cn(badgeVariants({ variant: badgeVariant, size: badgeSize }))}>
          {badgeText}
        </div>
      )}
    </div>
  )
);

AvatarWithBadge.displayName = "AvatarWithBadge";

export { AvatarWithBadge };
