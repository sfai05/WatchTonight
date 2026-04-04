import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 hover:bg-primary/95",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_10px_30px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 hover:bg-destructive/90",
        outline:
          "border border-[#e4d8ab]/16 bg-[rgba(19,34,32,0.88)] text-brand-cream shadow-[0_10px_26px_rgba(0,0,0,0.16)] hover:-translate-y-0.5 hover:bg-[rgba(29,86,80,0.72)] hover:text-brand-cream-light",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_10px_24px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 hover:bg-secondary/90",
        ghost: "text-brand-text-soft hover:bg-[rgba(228,216,171,0.06)] hover:text-brand-cream",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
