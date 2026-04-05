'use client'
import { useEffect, useRef, useState } from 'react'
import { track } from '@/lib/posthog'

declare global {
  interface Window { adsbygoogle: unknown[] }
}

export default function AdSlot() {
  const adRef   = useRef<HTMLModElement>(null)
  const pushed  = useRef(false)
  const [visible, setVisible] = useState(true)
  const [ready,   setReady]   = useState(false)

  useEffect(() => {
    // Wait a tick for the AdSense script to be ready
    const timer = setTimeout(() => {
      try {
        if (pushed.current) return
        pushed.current = true
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        setReady(true)
        track('ad_impression')
      } catch {
        setVisible(false)
      }
    }, 1800)

    // If ad slot stays empty after 5s, hide the frame
    const hideTimer = setTimeout(() => {
      const el = adRef.current
      if (el && el.offsetHeight < 10) {
        setVisible(false)
        track('ad_blocked_or_empty')
      }
    }, 5000)

    return () => { clearTimeout(timer); clearTimeout(hideTimer) }
  }, [])

  if (!visible) return null

  return (
    <div
      style={{
        marginTop: 16,
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid #E7E5E4',
        background: '#FAFAF9',
        minHeight: ready ? undefined : 60,
        transition: 'min-height 0.3s ease',
      }}
    >
      <div style={{
        padding: '3px 10px',
        background: '#F5F5F4',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        <span style={{ fontSize: 9, color: '#A8A29E', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Iklan
        </span>
      </div>

      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1808788356045617"
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />

      {!ready && (
        <div style={{
          padding: '16px',
          textAlign: 'center',
          color: '#D6D3D1',
          fontSize: 12,
        }}>
          ···
        </div>
      )}
    </div>
  )
}
