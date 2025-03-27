"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  icon?: React.ReactNode
  actionLabel?: string
  actionLink?: string
  actionOnClick?: () => void
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  actionLink,
  actionOnClick,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div className={cn("empty-state animate-fade-in", className)} {...props}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {actionLabel &&
        (actionLink || actionOnClick) &&
        (actionLink ? (
          <Button asChild>
            <Link href={actionLink}>{actionLabel}</Link>
          </Button>
        ) : (
          <Button onClick={actionOnClick}>{actionLabel}</Button>
        ))}
    </div>
  )
}

