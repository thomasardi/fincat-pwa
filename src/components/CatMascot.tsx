'use client'
type Mood = 'idle' | 'excited' | 'thinking' | 'celebrating' | 'sleeping'

const MOODS: Record<Mood, { eyeL: string; eyeR: string; mouth: string; tail: string }> = {
  idle:        { eyeL: 'M22,28 Q24,24 26,28', eyeR: 'M34,28 Q36,24 38,28', mouth: 'M27,36 Q30,39 33,36', tail: 'M38,55 Q50,45 48,58' },
  excited:     { eyeL: 'M21,27 Q25,22 29,27', eyeR: 'M31,27 Q35,22 39,27', mouth: 'M25,35 Q30,41 35,35', tail: 'M38,50 Q55,35 50,55' },
  thinking:    { eyeL: 'M22,30 Q24,26 26,30', eyeR: 'M36,28 Q38,24 40,28', mouth: 'M28,37 Q30,36 32,37', tail: 'M38,55 Q45,48 43,60' },
  celebrating: { eyeL: 'M21,26 Q25,21 29,26', eyeR: 'M31,26 Q35,21 39,26', mouth: 'M24,34 Q30,42 36,34', tail: 'M38,48 Q58,32 52,52' },
  sleeping:    { eyeL: 'M22,30 Q24,30 26,30', eyeR: 'M34,30 Q36,30 38,30', mouth: 'M28,38 Q30,37 32,38', tail: 'M38,58 Q42,55 40,62' },
}

export default function CatMascot({ mood = 'idle', size = 80 }: { mood?: Mood; size?: number }) {
  const m = MOODS[mood]
  return (
    <svg width={size} height={size} viewBox="0 0 60 72" fill="none">
      <ellipse cx="30" cy="42" rx="22" ry="20" fill="#FEF3C7" stroke="#F97316" strokeWidth="2"/>
      <polygon points="10,26 16,10 22,26" fill="#FEF3C7" stroke="#F97316" strokeWidth="2"/>
      <polygon points="38,26 44,10 50,26" fill="#FEF3C7" stroke="#F97316" strokeWidth="2"/>
      <polygon points="12,24 16,14 20,24" fill="#FCA5A5"/>
      <polygon points="40,24 44,14 48,24" fill="#FCA5A5"/>
      <path d={m.eyeL} stroke="#1C1917" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d={m.eyeR} stroke="#1C1917" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <ellipse cx="30" cy="34" rx="3" ry="2" fill="#FDA4AF"/>
      <path d="M28,34 L22,32 M28,34 L18,35 M32,34 L38,32 M32,34 L42,35" stroke="#1C1917" strokeWidth="1.2" strokeLinecap="round"/>
      <path d={m.mouth} stroke="#1C1917" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d={m.tail} stroke="#F97316" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <circle cx="30" cy="50" r="5" fill="#FEF3C7" stroke="#F97316" strokeWidth="1.5"/>
      {mood === 'celebrating' && <>
        <circle cx="12" cy="20" r="2" fill="#F97316" opacity="0.8"/>
        <circle cx="48" cy="18" r="2" fill="#16A34A" opacity="0.8"/>
        <circle cx="8"  cy="30" r="1.5" fill="#3B82F6" opacity="0.8"/>
        <circle cx="52" cy="28" r="1.5" fill="#F97316" opacity="0.8"/>
        <path d="M10,15 L8,12 L12,11" stroke="#16A34A" strokeWidth="1.5" fill="none"/>
        <path d="M50,15 L52,12 L48,11" stroke="#F97316" strokeWidth="1.5" fill="none"/>
      </>}
      {mood === 'sleeping' && <text x="38" y="22" fontSize="10" fill="#78716C">z</text>}
    </svg>
  )
}
