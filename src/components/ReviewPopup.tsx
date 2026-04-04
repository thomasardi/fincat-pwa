'use client'
import { useEffect, useState } from 'react'
import ModalShell from './ModalShell'
import CatMascot from './CatMascot'
import { saveReview } from '@/lib/supabase'
import { track } from '@/lib/posthog'

const STORAGE_KEY = 'fincat_reviewed'
const DELAY_MS    = 20_000   // 20 seconds

export default function ReviewPopup() {
  const [show,    setShow]    = useState(false)
  const [rating,  setRating]  = useState(0)
  const [hover,   setHover]   = useState(0)
  const [message, setMessage] = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Don't show if already reviewed this session
    if (typeof window !== 'undefined' && sessionStorage.getItem(STORAGE_KEY)) return

    const timer = setTimeout(() => {
      setShow(true)
      track('review_popup_shown', { trigger: '20s_dwell' })
    }, DELAY_MS)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    sessionStorage.setItem(STORAGE_KEY, '1')
    setShow(false)
    track('review_popup_dismissed')
  }

  const handleSubmit = async () => {
    if (rating === 0 || loading) return
    setLoading(true)
    await saveReview({ rating, message: message || undefined })
    track('review_submitted', { rating, has_message: !!message })
    sessionStorage.setItem(STORAGE_KEY, '1')
    setSent(true)
    setLoading(false)
    setTimeout(() => setShow(false), 2200)
  }

  if (!show) return null

  if (sent) return (
    <ModalShell onClose={handleClose}>
      <div className="anim-pop" style={{ textAlign: 'center', padding: '28px 0 8px' }}>
        <div className="anim-bounce">
          <CatMascot mood="celebrating" size={90} />
        </div>
        <p style={{ fontSize: 20, fontWeight: 800, color: '#16A34A', margin: '16px 0 6px' }}>
          Makasih banyak! ð
        </p>
        <p style={{ color: '#78716C', fontSize: 14, margin: 0 }}>
          Penilaianmu sangat berarti!
        </p>
      </div>
    </ModalShell>
  )

  return (
    <ModalShell onClose={handleClose}>
      <div className="anim-slideUp">
        {/* Cat + heading */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div className="anim-bounce" style={{ display: 'inline-block' }}>
            <CatMascot mood="excited" size={72} />
          </div>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#1C1917', margin: '10px 0 4px' }}>
            Gimana FinCat-nya? â­
          </p>
          <p style={{ fontSize: 13, color: '#78716C', margin: 0 }}>
            Butuh 10 detik doang, bantu kami berkembang!
          </p>
        </div>

        {/* Stars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 18 }}>
          {[1, 2, 3, 4, 5].map(s => {
            const active = (hover || rating) >= s
            return (
              <button
                key={s}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                  fontSize: 34,
                  transform: active ? 'scale(1.22)' : 'scale(1)',
                  transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1)',
                  filter: active ? 'drop-shadow(0 2px 6px rgba(250,204,21,0.6))' : 'none',
                }}
              >
                {active ? 'â­' : 'â'}
              </button>
            )
          })}
        </div>

        {/* Optional message */}
        {rating > 0 && (
          <div className="anim-fadeInUp">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={rating >= 4 ? 'Fitur apa yang paling kamu suka?' : 'Ada yang bisa kami perbaiki?'}
              rows={2}
              style={{
                width: '100%', padding: '10px 12px',
                borderRadius: 12, border: '1.5px solid #E7E5E4',
                fontSize: 14, resize: 'none', outline: 'none',
                fontFamily: 'inherit', marginBottom: 12,
                transition: 'border-color 0.2s',
              }}
            />
          </div>
        )}

        {/* Submit */}
        <button
          className="btn-tap anim-pulseGlow"
          onClick={handleSubmit}
          disabled={rating === 0 || loading}
          style={{
            width: '100%',
            background: rating === 0
              ? '#E7E5E4'
              : 'linear-gradient(135deg, #F97316, #FB923C)',
            color: rating === 0 ? '#A8A29E' : '#fff',
            border: 'none', borderRadius: 14,
            padding: '14px 24px',
            fontSize: 15, fontWeight: 800, cursor: rating === 0 ? 'default' : 'pointer',
            boxShadow: rating > 0 ? '0 4px 18px rgba(249,115,22,0.35)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          {loading ? 'Mengirim...' : rating === 0 ? 'Pilih bintang dulu â­' : 'Kirim Penilaian ð'}
        </button>

        <button
          onClick={handleClose}
          style={{
            width: '100%', background: 'none', border: 'none',
            color: '#A8A29E', fontSize: 13, marginTop: 10, cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Nanti saja
        </button>
      </div>
    </ModalShell>
  )
}
