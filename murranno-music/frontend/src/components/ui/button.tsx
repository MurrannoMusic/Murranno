import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useHaptics } from "@/hooks/useHaptics"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary hover:shadow-glow rounded-2xl",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl",
        outline:
          "border border-border/30 bg-card/30 backdrop-blur-xl hover:bg-card/50 hover:shadow-soft rounded-2xl",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-2xl",
        ghost: "hover:bg-secondary/30 hover:text-foreground rounded-2xl",
        link: "text-primary underline-offset-4 hover:underline",
        pill: "bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold shadow-primary hover:shadow-glow transform hover:scale-105 active:scale-95",
        glass: "bg-card/30 backdrop-blur-xl text-foreground border border-border/30 hover:bg-card/50 hover:shadow-soft rounded-2xl",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2",
        lg: "h-14 px-8 py-4",
        icon: "h-12 w-12",
        pill: "px-8 py-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  disableHaptics?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, disableHaptics = false, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const { buttonPress } = useHaptics()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disableHaptics && !props.disabled) {
        buttonPress()
      }
      onClick?.(e)
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
