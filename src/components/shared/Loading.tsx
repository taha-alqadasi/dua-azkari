'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function Loading({ size = 'md', text, className }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loading size="lg" text="جاري التحميل..." />
    </div>
  )
}

export function ComponentLoading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loading text="جاري التحميل..." />
    </div>
  )
}
