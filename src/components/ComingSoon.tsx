'use client'
import CatMascot from './CatMascot'
import { Feature } from '@/lib/features'

export default function ComingSoon({ feature, onRequest }: { feature: Feature | undefined; onRequest: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', gap: 20 }}>
      <CatMascot mood="thinking" size={110}/>
      <div>
        <p style={{ fontSize: 22, fontWeight: 800, color: '#1C1917', margin: '0 0 10px' }}>Segera Hadir! 🚀</p>
        <p style={{ fontSize: 15, color: '#78716C', margin: 0, lineHeight: 1.7 }}>
          Fitur <strong style={{ color: '#F97316' }}>{feature?.label?.replace('\n', ' ')}</strong>
          <br/>lagi kami masak buat kamu 🍳<br/>Mau request duluan?
        </p>
      </div>
      <button onClick={onRequest}
        style={{ background: '#F97316', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 36px', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
        💡 Request Dong!
      </button>
      <p style={{ fontSize: 12, color: '#78716C', margin: 0 }}>Suaramu menentukan fitur berikutnya ✨</p>
    </div>
  )
}
