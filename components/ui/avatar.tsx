import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-muted-foreground",
  {
    variants: {
      size: {
        default: "h-9 w-9",
        sm: "h-8 w-8",
        lg: "h-10 w-10",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

function Avatar({
  className,
  size,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof avatarVariants>) {
  return (
    <div className={cn(avatarVariants({ size, className }))} {...props} />
  );
}

function AvatarImage({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
