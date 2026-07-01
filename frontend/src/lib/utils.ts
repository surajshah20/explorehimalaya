import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(usd: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(usd)
}

export function formatAltitude(metres: number): string {
  return `${metres.toLocaleString()}m / ${Math.round(metres * 3.281).toLocaleString()}ft`
}

export function difficultyToNumber(d: string): number {
  return { Easy: 1, Moderate: 2, Challenging: 3, Extreme: 4 }[d] ?? 0
}
