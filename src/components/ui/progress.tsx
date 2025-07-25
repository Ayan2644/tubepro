import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

// Adicionamos a prop 'indicatorClassName' ao tipo de props do componente Progress
interface CustomProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  CustomProgressProps // Usamos o novo tipo de props
>(({ className, value, indicatorClassName, ...props }, ref) => ( // Desestruturamos indicatorClassName
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      // Aplicamos o indicatorClassName diretamente aqui no className do Indicator
      className={cn(
        "h-full w-full flex-1 bg-primary transition-all",
        indicatorClassName // A prop é usada aqui!
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }