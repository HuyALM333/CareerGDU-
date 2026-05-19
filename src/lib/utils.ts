import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeWhitespace(str: string): string {
  if (typeof str !== 'string') return str
  return str.replace(/\s\s+/g, ' ').trim()
}

