'use client'
import { FEATURES } from '@/lib/features'

export default function FeatureSlider({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div className="overflow-x-auto" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ display: 'flex', gap: 12, padding: '4px 16px 8px' }}>
        {FEATURES.map((f) => {
          const isActive = active === f.id
          return (
            <button key={f.id} onClick={() => onSelect(f.id)}
              style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 10px', borderRadius: 16, border: `2px solid ${isActive ? f.color : '#E7E5E4'}`, background: isActive ? f.color + '18' : '#fff', cursor: 'pointer', minWidth: 76, transition: 'all 0.2s', outline: 'none' }}>
              <span style={{ fontSize: 24 }}>{f.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? f.color : '#78716C', textAlign: 'center', lineHeight: 1.3, whiteSpace: 'pre-line' }}>{f.label}</span>
              {isActive && <div style={{ width: 6, height: 6, borderRadius: '50%', background: f.color }} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
