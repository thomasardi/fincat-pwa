'use client'
import { ReactNode, useEffect } from 'react'

export default function ModalShell({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  /* Prevent body scroll when modal is open */
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    <div
      className="anim-fadeIn"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 100,
        animation: 'fadeIn 0.22s ease both',
      }}
      onClick={onClose}
    >
      <div
        className="anim-slideUp"
        style={{
          background: '#fff',
          borderRadius: '24px 24px 0 0',
          padding: '6px 20px 40px',
          width: '100%', maxWidth: 480,
          maxHeight: '92dvh', overflowY: 'auto',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 6 }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: '#E7E5E4' }} />
        </div>

        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <button
            onClick={onClose}
            style={{
              background: '#F5F5F4', border: 'none',
              width: 30, height: 30, borderRadius: '50%',
              fontSize: 14, cursor: 'pointer', color: '#78716C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, transition: 'background 0.15s',
            }}
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
