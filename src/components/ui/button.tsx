import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] disabled:pointer-events-none disabled:opacity-50 gap-2",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] text-[#06060a] font-semibold hover:opacity-90 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]",
        destructive:
          "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive))]/90",
        outline:
          "border border-[rgba(255,255,255,0.1)] bg-transparent hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.15)] text-[#f4f4f6]",
        secondary:
          "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] text-[#a1a1aa] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f4f4f6] hover:border-[rgba(255,255,255,0.15)]",
        green:
          "bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.25)] text-[#10b981] hover:bg-[rgba(16,185,129,0.18)]",
        ghost: "hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f4f4f6] text-[#a1a1aa]",
        link: "text-[#00d4ff] underline-offset-4 hover:underline",
        icon: "border border-[rgba(255,255,255,0.1)] bg-transparent hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.15)]",
      },
      size: {
        default: "h-10 px-5 py-2 rounded-lg",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
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
