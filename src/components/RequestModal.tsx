'use client'
import { useState } from 'react'
import CatMascot from './CatMascot'
import ModalShell from './ModalShell'
import { saveFeatureRequest } from '@/lib/supabase'
import { track } from '@/lib/posthog'

export default function RequestModal({ featureId, onClose }: { featureId?: string; onClose: () => void }) {
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!text.trim() || loading) return
    setLoading(true)
    await saveFeatureRequest({ feature_id: featureId, message: text })
    track('feature_request_submitted', { feature_id: featureId })
    setSent(true); setLoading(false)
  }

  if (sent) return (
    <ModalShell onClose={onClose}>
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <CatMascot mood="celebrating" size={90}/>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#16A34A', margin: '16px 0 8px' }}>Makasih banyak! 🎉</p>
        <p style={{ color: '#78716C', fontSize: 14, marginBottom: 20 }}>Requestmu udah kami catat. Stay tuned ya!</p>
        <button onClick={onClose} style={{ background: '#16A34A', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', width: '100%' }}>Tutup</button>
      </div>
    </ModalShell>
  )

  return (
    <ModalShell onClose={onClose}>
      <p style={{ fontSize: 17, fontWeight: 700, color: '#1C1917', margin: '0 0 4px' }}>Request Fitur 💡</p>
      <p style={{ fontSize: 13, color: '#78716C', margin: '0 0 16px' }}>Fitur apa yang kamu mau? Kami dengerin!</p>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={4}
        placeholder="Contoh: saya mau ada fitur hitung cicilan kartu kredit..."
        style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid #E7E5E4', fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'inherit', marginBottom: 14 }}/>
      <button onClick={handleSend} disabled={!text.trim() || loading}
        style={{ background: !text.trim() || loading ? '#D6D3D1' : '#F97316', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 24px', fontSize: 15, fontWeight: 700, cursor: !text.trim() ? 'default' : 'pointer', width: '100%' }}>
        {loading ? 'Mengirim...' : 'Kirim Request ✨'}
      </button>
    </ModalShell>
  )
}
