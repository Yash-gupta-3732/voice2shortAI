import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-950/50 text-zinc-50 shadow-sm backdrop-blur-md",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

export { Card }
