'use client'
import { useRef } from 'react'
import { FEATURES } from '@/lib/features'

export default function FeatureSlider({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)

  /* Prevent vertical page scroll while swiping horizontally on this row */
  const handleTouchStart = (e: React.TouchEvent) => {
    const el = containerRef.current
    if (!el) return
    const startX = e.touches[0].clientX
    const startY = e.touches[0].clientY
    const startScrollLeft = el.scrollLeft

    const onMove = (mv: TouchEvent) => {
      const dx = mv.touches[0].clientX - startX
      const dy = mv.touches[0].clientY - startY
      if (Math.abs(dx) > Math.abs(dy)) {
        mv.preventDefault()
        el.scrollLeft = startScrollLeft - dx
      }
    }
    const onEnd = () => {
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
    }
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd)
  }

  return (
    <div
      ref={containerRef}
      className="scroll-x"
      onTouchStart={handleTouchStart}
      style={{ display: 'flex', gap: 10, padding: '4px 16px 10px' }}
    >
      {FEATURES.map((f, idx) => {
        const isActive = active === f.id
        const isRequest = f.available === 'request'
        return (
          <button
            key={f.id}
            onClick={() => onSelect(f.id)}
            className="btn-tap"
            style={{
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              padding: '11px 10px 9px',
              borderRadius: 18,
              border: `2.5px solid ${isActive ? f.color : isRequest ? f.color + '60' : '#E7E5E4'}`,
              background: isActive
                ? `linear-gradient(145deg, ${f.color}22, ${f.color}10)`
                : isRequest ? f.color + '08' : '#fff',
              cursor: 'pointer',
              minWidth: 76,
              outline: 'none',
              boxShadow: isActive ? `0 4px 16px ${f.color}30` : '0 1px 4px rgba(0,0,0,0.05)',
              transform: isActive ? 'translateY(-2px)' : 'none',
              transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
              animationDelay: `${idx * 0.05}s`,
            }}
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>{f.icon}</span>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: isActive ? f.color : isRequest ? f.color : '#78716C',
              textAlign: 'center',
              lineHeight: 1.3,
              whiteSpace: 'pre-line',
            }}>
              {f.label}
            </span>
            {isActive && (
              <div style={{
                width: 20, height: 3, borderRadius: 99,
                background: f.color,
                transition: 'all 0.2s ease',
              }} />
            )}
          </button>
        )
      })}
    </div>
  )
}
