'use client'
import { useEffect, useState } from 'react'
import CatMascot from '@/components/CatMascot'
import FeatureSlider from '@/components/FeatureSlider'
import SimulatorScreen from '@/components/SimulatorScreen'
import ComingSoon from '@/components/ComingSoon'
import FeedbackModal from '@/components/FeedbackModal'
import RequestModal from '@/components/RequestModal'
import ReviewPopup from '@/components/ReviewPopup'
import { FEATURES } from '@/lib/features'
import { initPostHog, track } from '@/lib/posthog'

export default function Home() {
  const [activeFeature, setActiveFeature] = useState('compound')
  const [showFeedback,  setShowFeedback]  = useState(false)
  const [showRequest,   setShowRequest]   = useState(false)
  const [requestFeatId, setRequestFeatId] = useState<string | undefined>()

  useEffect(() => {
    initPostHog()
    track('page_view', { page: 'home' })
  }, [])

  const currentFeature = FEATURES.find(f => f.id === activeFeature)

  const handleSelect = (id: string) => {
    const feat = FEATURES.find(f => f.id === id)
    if (feat?.available === 'request') {
      setRequestFeatId(id)
      setShowRequest(true)
      return
    }
    setActiveFeature(id)
    track('feature_selected', { feature_name: id })
  }

  return (
    <div style={{
      background: '#FFFBF5',
      minHeight: '100dvh',
      fontFamily: "'Nunito', 'Poppins', system-ui, sans-serif",
      maxWidth: 480,
      margin: '0 auto',
      position: 'relative',
    }}>

      {/* ─── Header ───────────────────────────────────── */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #F0EDE8',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="anim-bounce">
            <CatMascot mood="idle" size={36} />
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 900, margin: 0, color: '#F97316', letterSpacing: -0.5 }}>FinCat</p>
            <p style={{ fontSize: 10, color: '#A8A29E', margin: 0, fontWeight: 600 }}>Investasi bareng si Kucing 🐱</p>
          </div>
        </div>

        <button
          className="btn-tap"
          onClick={() => setShowFeedback(true)}
          style={{
            background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)',
            border: '1.5px solid #FED7AA',
            borderRadius: 20, padding: '7px 14px',
            fontSize: 12, cursor: 'pointer',
            color: '#F97316', fontWeight: 800,
            display: 'flex', alignItems: 'center', gap: 4,
            boxShadow: '0 2px 8px rgba(249,115,22,0.15)',
          }}
        >
          ⭐ Feedback
        </button>
      </div>

      {/* ─── Feature Slider ───────────────────────────── */}
      <div style={{
        background: '#fff',
        paddingTop: 12, paddingBottom: 0,
        borderBottom: '1px solid #F0EDE8',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}>
        <p style={{
          fontSize: 10, color: '#A8A29E', margin: '0 0 8px 16px',
          fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8,
        }}>
          Pilih Fitur
        </p>
        <FeatureSlider active={activeFeature} onSelect={handleSelect} />
      </div>

      {/* ─── Content ──────────────────────────────────── */}
      <div style={{ paddingTop: 16 }} className="anim-fadeInUp">
        {currentFeature?.available === true
          ? <SimulatorScreen onFeedback={() => setShowFeedback(true)} />
          : <ComingSoon
              feature={currentFeature}
              onRequest={() => { setRequestFeatId(activeFeature); setShowRequest(true) }}
            />
        }
      </div>

      {/* ─── Modals ───────────────────────────────────── */}
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      {showRequest  && <RequestModal featureId={requestFeatId} onClose={() => setShowRequest(false)} />}

      {/* ─── Auto review popup (20s dwell) ────────────── */}
      <ReviewPopup />
    </div>
  )
}
