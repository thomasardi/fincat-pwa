'use client'
import { useEffect, useState } from 'react'
import CatMascot from '@/components/CatMascot'
import FeatureSlider from '@/components/FeatureSlider'
import SimulatorScreen from '@/components/SimulatorScreen'
import ComingSoon from '@/components/ComingSoon'
import FeedbackModal from '@/components/FeedbackModal'
import RequestModal from '@/components/RequestModal'
import { FEATURES } from '@/lib/features'
import { initPostHog, track } from '@/lib/posthog'

export default function Home() {
  const [activeFeature, setActiveFeature]   = useState('compound')
  const [showFeedback,  setShowFeedback]    = useState(false)
  const [showRequest,   setShowRequest]     = useState(false)
  const [requestFeatId, setRequestFeatId]  = useState<string | undefined>()

  useEffect(() => { initPostHog(); track('page_view', { page: 'home' }) }, [])

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
    <div style={{ background: '#FFFBF5', minHeight: '100vh', fontFamily: "'Nunito', 'Poppins', system-ui, sans-serif", maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E7E5E4', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CatMascot mood="idle" size={38} />
          <div>
            <p style={{ fontSize: 17, fontWeight: 800, margin: 0, color: '#F97316' }}>FinCat</p>
            <p style={{ fontSize: 10, color: '#78716C', margin: 0 }}>Investasi bareng si Kucing 🐱</p>
          </div>
        </div>
        <button onClick={() => setShowFeedback(true)}
          style={{ background: 'none', border: '1.5px solid #E7E5E4', borderRadius: 20, padding: '5px 14px', fontSize: 12, cursor: 'pointer', color: '#78716C', fontWeight: 700 }}>
          ⭐ Feedback
        </button>
      </div>

      {/* Feature Slider */}
      <div style={{ background: '#fff', paddingTop: 14, paddingBottom: 4, borderBottom: '1px solid #E7E5E4' }}>
        <p style={{ fontSize: 11, color: '#78716C', margin: '0 0 10px 16px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pilih Fitur</p>
        <FeatureSlider active={activeFeature} onSelect={handleSelect} />
      </div>

      {/* Content */}
      <div style={{ paddingTop: 16 }}>
        {currentFeature?.available === true
          ? <SimulatorScreen onFeedback={() => setShowFeedback(true)} />
          : <ComingSoon feature={currentFeature} onRequest={() => { setRequestFeatId(activeFeature); setShowRequest(true) }} />
        }
      </div>

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      {showRequest  && <RequestModal featureId={requestFeatId} onClose={() => setShowRequest(false)} />}
    </div>
  )
}
