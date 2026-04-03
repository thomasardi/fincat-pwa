'use client'
import posthog from 'posthog-js'

let initialized = false

export const initPostHog = () => {
  if (initialized || typeof window === 'undefined') return
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return
  posthog.init(key, { api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com', capture_pageview: true })
  initialized = true
}

export const track = (event: string, props?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return
  try { posthog.capture(event, props) } catch {}
}
