import { useState, useEffect } from 'react'
import { trekApi } from '@/lib/api'
import type { Trek, FilterState } from '@/types'

export function useTreks(filters?: Partial<FilterState>) {
  const [treks, setTreks] = useState<Trek[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    trekApi
      .getAll(filters)
      .then((data) => {
        if (!cancelled) setTreks(data)
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load treks')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [JSON.stringify(filters)])

  return { treks, loading, error }
}

export function useTrek(slug: string) {
  const [trek, setTrek] = useState<Trek | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    trekApi
      .getBySlug(slug)
      .then((data) => { if (!cancelled) setTrek(data) })
      .catch(() => { if (!cancelled) setError('Trek not found') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  return { trek, loading, error }
}
