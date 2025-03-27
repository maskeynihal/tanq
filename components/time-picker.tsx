"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Input } from "@/components/ui/input"

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  disabled?: boolean
}

export function TimePickerDemo({ value = "", onChange, disabled = false }: TimePickerProps) {
  const [time, setTime] = React.useState<string>(value || "")

  // Update internal state when value prop changes
  React.useEffect(() => {
    if (value !== time) {
      setTime(value)
    }
  }, [value, time])

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTime(newTime)
    onChange?.(newTime)
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="grid gap-1.5">
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4 opacity-70" />
          <Input type="time" value={time} onChange={handleTimeChange} className="w-full" disabled={disabled} />
        </div>
      </div>
    </div>
  )
}

