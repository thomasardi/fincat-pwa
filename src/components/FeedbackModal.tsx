'use client'
import { useState } from 'react'
import CatMascot from './CatMascot'
import ModalShell from './ModalShell'
import { saveFeedback } from '@/lib/supabase'
import { track } from '@/lib/posthog'

const btn = (bg: string, disabled = false) => ({
  background: disabled ? '#D6D3D1' : bg, color: '#fff', border: 'none', borderRadius: 12,
  padding: '13px 24px', fontSize: 15, fontWeight: 700, cursor: disabled ? 'default' : 'pointer', width: '100%'
} as const)

export default function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover]   = useState(0)
  const [msg, setMsg]       = useState('')
  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0 || loading) return
    setLoading(true)
    await saveFeedback({ rating, message: msg || undefined, name: name || undefined, email: email || undefined })
    track('feedback_submitted', { rating, has_message: !!msg })
    setSent(true); setLoading(false)
  }

  if (sent) return (
    <ModalShell onClose={onClose}>
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <CatMascot mood="celebrating" size={90}/>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#16A34A', margin: '16px 0 8px' }}>Terima kasih! 🌟</p>
        <p style={{ color: '#78716C', fontSize: 14, marginBottom: 20 }}>Feedbackmu sangat berarti buat kami berkembang.</p>
        <button onClick={onClose} style={btn('#16A34A')}>Tutup</button>
      </div>
    </ModalShell>
  )

  return (
    <ModalShell onClose={onClose}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <CatMascot mood="excited" size={70}/>
        <p style={{ fontSize: 17, fontWeight: 700, margin: '8px 0 4px', color: '#1C1917' }}>Gimana pengalamanmu? ⭐</p>
        <p style={{ fontSize: 13, color: '#78716C', margin: 0 }}>Bantu kami lebih baik dengan feedbackmu</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
        {[1,2,3,4,5].map(s => (
          <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
            style={{ background: 'none', border: 'none', fontSize: 32, cursor: 'pointer', transform: (hover||rating) >= s ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.15s' }}>
            {(hover||rating) >= s ? '⭐' : '☆'}
          </button>
        ))}
      </div>
      {[
        { val: msg,   set: setMsg,   ph: 'Ada saran atau kesan? (opsional)', rows: 3 },
      ].map((t, i) => (
        <textarea key={i} value={t.val} onChange={e => t.set(e.target.value)} placeholder={t.ph} rows={t.rows}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid #E7E5E4', fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'inherit', marginBottom: 8 }}/>
      ))}
      {[{ val: name, set: setName, ph: 'Nama (opsional)' }, { val: email, set: setEmail, ph: 'Email (opsional)', type: 'email' }].map((f, i) => (
        <input key={i} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} type={(f as any).type || 'text'}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid #E7E5E4', fontSize: 14, outline: 'none', marginBottom: 8 }}/>
      ))}
      <button onClick={handleSubmit} disabled={rating === 0 || loading} style={btn('#F97316', rating === 0 || loading)}>
        {loading ? 'Mengirim...' : 'Kirim Feedback 🚀'}
      </button>
      {rating === 0 && <p style={{ fontSize: 12, color: '#EF4444', textAlign: 'center', margin: '6px 0 0' }}>Pilih bintang dulu ya!</p>}
    </ModalShell>
  )
}
