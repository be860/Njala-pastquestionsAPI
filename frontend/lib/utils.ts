import { clsx, type ClassValue } from 'clsx'
import { API_CONFIG } from '@/lib/api/config'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formats study duration for display (minutes-only, hours-only, or combined). */
export function formatStudyDuration(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes))
  if (minutes === 0) return '0 min'
  if (minutes < 60) return `${minutes} min`

  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  const hourLabel = hours === 1 ? 'hr' : 'hrs'

  if (remainder === 0) return `${hours} ${hourLabel}`
  return `${hours} ${hourLabel} ${remainder} min`
}

/**
 * Builds uppercase initials from a full name string.
 * Falls back to an empty string if no name is provided.
 */
export function getInitials(fullName?: string | null): string {
  if (!fullName) return ''

  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  const first = parts[0]?.[0] ?? ''
  const second = parts[1]?.[0] ?? ''

  const initials = `${first}${second}`.toUpperCase()
  return initials || fullName.trim().charAt(0).toUpperCase()
}

/**
 * Normalizes avatar URLs returned from the API.
 * - Preserves absolute URLs and data URLs.
 * - Prefixes relative paths with the API host (without the /api suffix).
 */
export function resolveAvatarUrl(avatarUrl?: string | null): string | null {
  if (!avatarUrl) return null

  if (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:')) {
    return avatarUrl
  }

  // Remove trailing /api from the configured base URL so we can serve static files
  const host = API_CONFIG.baseURL.replace(/\/api\/?$/, '')

  if (avatarUrl.startsWith('/')) {
    return `${host}${avatarUrl}`
  }

  return `${host}/${avatarUrl}`
}
