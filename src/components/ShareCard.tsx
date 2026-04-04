'use client'
import { useState } from 'react'
import ModalShell from './ModalShell'
import { track } from '@/lib/posthog'

const APP_URL = 'https://fincat-pwa.vercel.app'

function fmt(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} M`
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)} jt`
  if (n >= 1_000)         return `${(n / 1_000).toFixed(0)} rb`
  return n.toLocaleString('id-ID')
}

export type ShareData = {
  principal: number
  rate: number
  period: number
  unit: 'tahun' | 'bulan'
  finalBalance: number
  totalInterest: number
  growth: number
}

export default function ShareCard({ data, onClose }: { data: ShareData; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  const waText = encodeURIComponent(
    `ð± Aku pakai FinCat buat simulasi investasi!\n\n` +
    `ð° Modal: Rp ${fmt(data.principal)}\n` +
    `ð Bunga: ${data.rate}% / tahun\n` +
    `â³ Selama: ${data.period} ${data.unit}\n\n` +
    `ð¯ Saldo akhir: Rp ${fmt(data.finalBalance)}\n` +
    `â¨ Total bunga: Rp ${fmt(data.totalInterest)}\n` +
    `ð Return: +${data.growth.toFixed(1)}%\n\n` +
    `Hitung sendiri di: ${APP_URL}`
  )

  const waUrl = `https://wa.me/?text=${waText}`

  const handleWA = () => {
    track('share_whatsapp', { growth: data.growth })
    window.open(waUrl, '_blank', 'noopener')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(APP_URL)
      setCopied(true)
      track('share_copy_link')
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // fallback: select text
    }
  }

  const handleOtherShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'FinCat â Simulasi Investasi',
        text: `Saldo investasiku bisa jadi Rp ${fmt(data.finalBalance)} dalam ${data.period} ${data.unit}! Hitung sendiri ð`,
        url: APP_URL,
      }).then(() => track('share_native'))
    }
  }

  return (
    <ModalShell onClose={onClose}>
      {/* Result card visual */}
      <div style={{
        background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
        border: '1.5px solid #FED7AA',
        borderRadius: 20,
        padding: '20px 18px',
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 100, height: 100, borderRadius: '50%',
          background: 'rgba(249,115,22,0.08)',
        }}/>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 22 }}>ð±</span>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#F97316' }}>FinCat</p>
            <p style={{ margin: 0, fontSize: 10, color: '#A8A29E' }}>fincat-pwa.vercel.app</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {[
            { label: 'Modal Awal',    val: `Rp ${fmt(data.principal)}`,    color: '#78716C' },
            { label: 'Bunga / tahun', val: `${data.rate}%`,               color: '#78716C' },
            { label: 'Jangka Waktu',  val: `${data.period} ${data.unit}`, color: '#78716C' },
            { label: 'Saldo Akhir',   val: `Rp ${fmt(data.finalBalance)}`, color: '#F97316' },
          ].map(item => (
            <div key={item.label}>
              <p style={{ margin: 0, fontSize: 10, color: '#A8A29E', fontWeight: 500 }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: item.color }}>{item.val}</p>
            </div>
          ))}
        </div>

        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, color: '#A8A29E', fontWeight: 500 }}>Total Bunga</p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#16A34A' }}>
              Rp {fmt(data.totalInterest)}
            </p>
          </div>
          <div style={{
            background: '#DCFCE7',
            color: '#15803D',
            fontSize: 13,
            fontWeight: 800,
            padding: '6px 14px',
            borderRadius: 20,
          }}>
            +{data.growth.toFixed(1)}% ð
          </div>
        </div>
      </div>

      <p style={{ fontSize: 16, fontWeight: 800, color: '#1C1917', margin: '0 0 4px', textAlign: 'center' }}>
        Bagikan hasilmu! ð
      </p>
      <p style={{ fontSize: 13, color: '#78716C', margin: '0 0 18px', textAlign: 'center' }}>
        Ajak teman melek finansial bareng
      </p>

      {/* WA share â primary */}
      <button
        className="btn-tap"
        onClick={handleWA}
        style={{
          width: '100%', marginBottom: 10,
          background: 'linear-gradient(135deg, #25D366, #128C7E)',
          color: '#fff', border: 'none',
          borderRadius: 14, padding: '14px 20px',
          fontSize: 15, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 4px 18px rgba(37,211,102,0.35)',
        }}
      >
        <span style={{ fontSize: 20 }}>ð¬</span> Share ke WhatsApp
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* Copy link */}
        <button
          className="btn-tap"
          onClick={handleCopy}
          style={{
            background: copied ? '#DCFCE7' : '#F5F5F4',
            color: copied ? '#15803D' : '#44403C',
            border: `1.5px solid ${copied ? '#86EFAC' : '#E7E5E4'}`,
            borderRadius: 12, padding: '12px 8px',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.2s ease',
          }}
        >
          {copied ? 'â Tersalin!' : 'ð Salin Link'}
        </button>

        {/* Native share (if available) */}
        {typeof navigator !== 'undefined' && 'share' in navigator ? (
          <button
            className="btn-tap"
            onClick={handleOtherShare}
            style={{
              background: '#F5F5F4', color: '#44403C',
              border: '1.5px solid #E7E5E4',
              borderRadius: 12, padding: '12px 8px',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            ð¤ Lainnya
          </button>
        ) : (
          <button
            className="btn-tap"
            onClick={onClose}
            style={{
              background: '#F5F5F4', color: '#44403C',
              border: '1.5px solid #E7E5E4',
              borderRadius: 12, padding: '12px 8px',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Tutup
          </button>
        )}
      </div>
    </ModalShell>
  )
}
