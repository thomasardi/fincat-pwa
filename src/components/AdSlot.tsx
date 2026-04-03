'use client'
import { useEffect, useRef, useState } from 'react'
import { track } from '@/lib/posthog'

export default function AdSlot() {
  const [ready, setReady]       = useState(false)
  const [blocked, setBlocked]   = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const lastClick                = useRef(0)
  const mountTime                = useRef(Date.now())

  useEffect(() => {
    // 30s delay before ad becomes clickable
    const timer = setTimeout(() => setReady(true), 30000)
    const onScroll = () => { if (window.scrollY > 120) setScrolled(true) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll) }
  }, [])

  const handleClick = () => {
    if (!ready || !scrolled) return
    const now = Date.now()
    // 60s cooldown between clicks
    if (now - lastClick.current < 60000) {
      setBlocked(true)
      setTimeout(() => setBlocked(false), 4000)
      return
    }
    lastClick.current = now
    track('ad_click_verified', { time_since_mount: now - mountTime.current })
    // TODO: trigger actual ad SDK here
  }

  return (
    <div style={{ marginTop: 16, borderRadius: 12, overflow: 'hidden', border: '1px solid #E7E5E4', background: '#F9FAFB' }}>
      <div style={{ padding: '5px 10px', background: '#E7E5E4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: '#78716C' }}>Iklan</span>
        {!ready && <span style={{ fontSize: 10, color: '#78716C' }}>⏳ {Math.round(30)}s</span>}
      </div>
      <div onClick={handleClick}
        style={{ padding: '16px', textAlign: 'center', cursor: ready && scrolled ? 'pointer' : 'default', minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {blocked
          ? <span style={{ fontSize: 12, color: '#EF4444' }}>Tunggu 60 detik sebelum klik lagi ⏱</span>
          : !ready
          ? <span style={{ fontSize: 13, color: '#A8A29E' }}>Menyiapkan iklan...</span>
          : !scrolled
          ? <span style={{ fontSize: 13, color: '#A8A29E' }}>Scroll untuk aktifkan iklan</span>
          : <span style={{ fontSize: 13, color: '#78716C' }}>[ AdMob / Unity Ads Slot ]</span>
        }
      </div>
    </div>
  )
}
