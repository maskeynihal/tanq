import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DataCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: React.ReactNode
  colorVariant?: "default" | "green" | "orange" | "purple" | "red"
  isCompact?: boolean
}

export function DataCard({
  title,
  description,
  icon,
  colorVariant = "default",
  isCompact = false,
  className,
  children,
  ...props
}: DataCardProps) {
  return (
    <Card
      className={cn("stat-card card-hover overflow-hidden", colorVariant !== "default" && colorVariant, className)}
      {...props}
    >
      <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", isCompact && "p-4")}>
        <div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent className={cn(isCompact && "p-4 pt-0")}>{children}</CardContent>
    </Card>
  )
}

