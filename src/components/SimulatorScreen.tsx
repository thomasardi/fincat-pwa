'use client'
import { useMemo, useState, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { buildRows, getMonthlyTopup, fmtIDR, fmtAxis, rawIDR, rawNum, liveFormatIDR } from '@/lib/calc'
import { track } from '@/lib/posthog'
import AdSlot from './AdSlot'
import ShareCard, { ShareData } from './ShareCard'

/* âââ Design tokens ââââââââââââââââââââââââââââââââââââââ */
const C = {
  orange: '#F97316', green: '#16A34A', blue: '#3B82F6',
  text: '#1C1917', muted: '#78716C', border: '#E7E5E4',
  bg: '#FFFBF5', card: '#fff',
}

/* âââ Sub-components âââââââââââââââââââââââââââââââââââââ */
function MetricCard({ label, value, sub, highlight, color, delay = 0 }: {
  label: string; value: string; sub?: string
  highlight?: boolean; color?: string; delay?: number
}) {
  return (
    <div
      className="anim-fadeInUp"
      style={{
        background: highlight
          ? 'linear-gradient(135deg, #FFF7ED, #FFEDD5)'
          : C.card,
        border: `1.5px solid ${highlight ? '#FED7AA' : C.border}`,
        borderRadius: 16,
        padding: '14px 14px 12px',
        boxShadow: highlight
          ? '0 4px 20px rgba(249,115,22,0.12)'
          : '0 2px 8px rgba(0,0,0,0.04)',
        animationDelay: `${delay}s`,
      }}
    >
      <p style={{ fontSize: 11, color: C.muted, margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</p>
      <p style={{ fontSize: 16, fontWeight: 800, margin: 0, color: color || (highlight ? C.orange : C.text), letterSpacing: -0.3 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0', fontWeight: 500 }}>{sub}</p>}
    </div>
  )
}

function SectionLabel({ icon, label, color, sub }: { icon: string; label: string; color: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '22px 0 12px' }}>
      <div style={{
        width: 30, height: 30, borderRadius: 10,
        background: color + '20',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, flexShrink: 0,
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{label}</span>
      {sub && <span style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>{sub}</span>}
      <div style={{ flex: 1, height: 1.5, background: C.border, borderRadius: 99 }} />
    </div>
  )
}

function RangeHints({ left, right }: { left: string; right: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#A8A29E', marginTop: 4, fontWeight: 500 }}>
      <span>{left}</span><span>{right}</span>
    </div>
  )
}

/* âââ Touch-safe range slider wrapper ââââââââââââââââââââ */
function SafeRange(props: React.InputHTMLAttributes<HTMLInputElement> & { accentColor?: string }) {
  const { accentColor = C.orange, style, ...rest } = props
  const startY = useRef(0)

  const onTouchStart = (e: React.TouchEvent) => { startY.current = e.touches[0].clientY }
  const onTouchMove  = (e: React.TouchEvent) => {
    const dy = Math.abs(e.touches[0].clientY - startY.current)
    const dx = Math.abs(e.touches[0].clientX - (e.touches[0].clientX)) // always 0 but typesafe
    if (dy > 8) { /* let page scroll */ } else e.stopPropagation()
  }

  return (
    <input
      type="range"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      style={{ accentColor, ...style }}
      {...rest}
    />
  )
}

/* âââ Input style ââââââââââââââââââââââââââââââââââââââââââ */
const inp = {
  flex: 1, minWidth: 0,
  padding: '10px 12px',
  fontSize: 15, fontWeight: 700,
  border: `1.5px solid ${C.border}`,
  borderRadius: 12, background: C.card,
  color: C.text, outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
} as const

const lbl = {
  fontSize: 12, color: C.muted, marginBottom: 6,
  fontWeight: 700, display: 'block',
  textTransform: 'uppercase' as const, letterSpacing: 0.3,
}

/* âââ Main component âââââââââââââââââââââââââââââââââââââââ */
export default function SimulatorScreen({ onFeedback }: { onFeedback: () => void }) {
  const [principal, setPrincipal] = useState('10.000.000')
  const [rate,      setRate]      = useState('7')
  const [period,    setPeriod]    = useState('5')
  const [unit,      setUnit]      = useState<'tahun' | 'bulan'>('tahun')
  const [topupAmt,  setTopupAmt]  = useState('0')
  const [topupFreq, setTopupFreq] = useState('bulanan')
  const [shareData, setShareData] = useState<ShareData | null>(null)

  const isBulan  = unit === 'bulan'
  const pr       = rawIDR(principal)
  const rt       = rawNum(rate)
  const pd       = parseInt(period) || 1
  const mTopup   = getMonthlyTopup(rawIDR(topupAmt), topupFreq)
  const hasTopup = rawIDR(topupAmt) > 0

  const rows = useMemo(() => {
    if (!pr || !rt || !pd) return []
    const r = buildRows(pr, rt, pd, isBulan, mTopup)
    track('simulation_run', { principal: pr, rate: rt, period: pd, unit, has_topup: hasTopup })
    return r
  }, [pr, rt, pd, isBulan, mTopup])

  const last   = rows[rows.length - 1] || { balance: 0, cumulativeInterest: 0, cumulativeTopup: 0 }
  const growth = pr > 0 ? ((last.balance - pr) / pr) * 100 : 0
  const ul     = isBulan ? 'bulan' : 'tahun'
  const ulC    = isBulan ? 'bln' : 'thn'

  const maxBars = 14
  const step    = Math.max(1, Math.ceil(pd / maxBars))
  const chartData = rows
    .filter((_, i) => i % step === 0 || i === pd)
    .map(r => ({
      name:  ulC + ' ' + r.period,
      modal: r.balance - r.cumulativeTopup - r.cumulativeInterest,
      topup: r.cumulativeTopup,
      bunga: r.cumulativeInterest,
    }))

  const handleShare = () => {
    const sd: ShareData = {
      principal: pr, rate: rt, period: pd, unit,
      finalBalance: last.balance,
      totalInterest: last.cumulativeInterest,
      growth,
    }
    setShareData(sd)
    track('share_card_opened')
  }

  return (
    <div style={{ padding: '0 16px 40px' }}>

      {/* âââ Metric cards ââââââââââââââââââââââââââââ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <MetricCard label="Modal Awal"  value={fmtIDR(pr)}           delay={0.05} />
        <MetricCard label="Saldo Akhir" value={fmtIDR(last.balance)} highlight delay={0.1} />
      </div>

      {/* Growth banner */}
      <div
        className="anim-fadeInUp"
        style={{
          background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
          border: '1.5px solid #86EFAC',
          borderRadius: 16, padding: '14px 16px', marginBottom: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 4px 16px rgba(22,163,74,0.10)',
          animationDelay: '0.12s',
        }}
      >
        <div>
          <p style={{ fontSize: 11, color: C.muted, margin: '0 0 3px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>
            Total Bunga <span style={{ fontWeight: 400 }}>({pd} {ul})</span>
          </p>
          <p style={{ fontSize: 20, fontWeight: 900, margin: 0, color: C.green, letterSpacing: -0.5 }}>
            {fmtIDR(last.cumulativeInterest)}
          </p>
        </div>
        <div style={{
          background: C.green,
          color: '#fff', fontSize: 13, fontWeight: 800,
          padding: '8px 14px', borderRadius: 20,
          boxShadow: '0 4px 12px rgba(22,163,74,0.30)',
        }}>
          â² +{growth.toFixed(1)}%
        </div>
      </div>

      {hasTopup && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <MetricCard label="Total Top-up"    value={fmtIDR(last.cumulativeTopup)}     color={C.blue} delay={0.15} />
          <MetricCard label="Total Investasi" value={fmtIDR(pr + last.cumulativeTopup)} delay={0.18} />
        </div>
      )}

      {/* âââ Modal Awal ââââââââââââââââââââââââââââââ */}
      <SectionLabel icon="ð°" label="Modal Awal" color={C.orange} />

      <div style={{ marginBottom: 16 }}>
        <label style={lbl}>Jumlah modal</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <span style={{
            background: '#FFF7ED', border: `1.5px solid #FED7AA`,
            borderRadius: 12, padding: '10px 12px',
            fontSize: 13, color: C.orange, fontWeight: 800,
          }}>Rp</span>
          <input style={inp} type="text" value={principal} inputMode="numeric"
            onChange={e => setPrincipal(liveFormatIDR(e.target.value))} />
        </div>
        <SafeRange min={1000000} max={1000000000} step={1000000} value={pr}
          onChange={e => setPrincipal((+e.target.value).toLocaleString('id-ID'))} />
        <RangeHints left="Rp 1 jt" right="Rp 1 M" />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={lbl}>Bunga per tahun</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <input style={{ ...inp, maxWidth: 100 }} type="text" value={rate} inputMode="decimal"
            onChange={e => setRate(e.target.value.replace(/[^0-9.]/g, ''))} />
          <span style={{ fontSize: 13, color: C.muted, fontWeight: 700 }}>% / tahun</span>
        </div>
        <SafeRange min={0.1} max={30} step={0.1} value={rt}
          onChange={e => setRate(String(+e.target.value))} />
        <RangeHints left="0.1%" right="30%" />
      </div>

      <div style={{ marginBottom: 4 }}>
        <label style={lbl}>Jangka waktu</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <input style={{ ...inp, maxWidth: 90 }} type="text" value={period} inputMode="numeric"
            onChange={e => setPeriod(e.target.value.replace(/[^0-9]/g, ''))} />
          <select
            value={unit}
            onChange={e => {
              const u = e.target.value as 'tahun' | 'bulan'
              setPeriod(p => String(u === 'bulan'
                ? Math.min((parseInt(p) || 1) * 12, 120)
                : Math.max(1, Math.round((parseInt(p) || 1) / 12))))
              setUnit(u)
            }}
            style={{
              fontSize: 14, padding: '10px 28px 10px 12px',
              borderRadius: 12, border: `1.5px solid ${C.border}`,
              background: C.card, color: C.text, fontWeight: 700,
              outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="tahun">Tahun</option>
            <option value="bulan">Bulan</option>
          </select>
        </div>
        <SafeRange min={1} max={isBulan ? 120 : 50} step={1} value={pd}
          onChange={e => setPeriod(String(+e.target.value))} />
        <RangeHints left={isBulan ? '1 bln' : '1 thn'} right={isBulan ? '120 bln' : '50 thn'} />
      </div>

      {/* âââ Top-up section ââââââââââââââââââââââââââ */}
      <SectionLabel icon="â" label="Top-up Rutin" color={C.blue} sub="(opsional)" />

      <div style={{ marginBottom: 12 }}>
        <label style={lbl}>Jumlah top-up per periode</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            background: '#EFF6FF', border: '1.5px solid #BFDBFE',
            borderRadius: 12, padding: '10px 12px',
            fontSize: 13, color: C.blue, fontWeight: 800,
          }}>Rp</span>
          <input style={inp} type="text" value={topupAmt} inputMode="numeric"
            onChange={e => setTopupAmt(liveFormatIDR(e.target.value))} />
        </div>
      </div>

      <div style={{ marginBottom: 4 }}>
        <label style={lbl}>Frekuensi top-up</label>
        <select value={topupFreq} onChange={e => setTopupFreq(e.target.value)}
          style={{
            width: '100%', fontSize: 14,
            padding: '11px 28px 11px 12px', borderRadius: 12,
            border: `1.5px solid ${C.border}`, background: C.card,
            color: C.text, fontWeight: 700, outline: 'none',
          }}>
          <option value="harian">Harian (Daily)</option>
          <option value="mingguan">Mingguan (Weekly)</option>
          <option value="bulanan">Bulanan (Monthly)</option>
          <option value="tahunan">Tahunan (Yearly)</option>
        </select>
      </div>

      {/* âââ Chart âââââââââââââââââââââââââââââââââââ */}
      <SectionLabel icon="ð" label="Grafik Pertumbuhan" color={C.green} />

      <div style={{
        background: C.card, borderRadius: 16, padding: '16px 8px 8px',
        border: `1px solid ${C.border}`,
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      }}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={chartData}
            barSize={Math.max(8, Math.min(28, 280 / chartData.length))}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#A8A29E' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 10, fill: '#A8A29E' }} axisLine={false} tickLine={false} width={50} />
            <Tooltip
              formatter={(v: number, name: string) => [
                fmtIDR(v),
                name === 'modal' ? 'Modal awal' : name === 'topup' ? 'Top-up kumulatif' : 'Bunga kumulatif',
              ]}
              contentStyle={{ borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            />
            <Bar dataKey="modal" stackId="a" fill={C.orange} radius={[0, 0, 4, 4]} />
            <Bar dataKey="topup" stackId="a" fill={C.blue}   radius={[0, 0, 0, 0]} />
            <Bar dataKey="bunga" stackId="a" fill={C.green}  radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', padding: '4px 8px 6px', fontSize: 11, color: C.muted }}>
          {([[C.orange, 'Modal awal'], [C.blue, 'Top-up'], [C.green, 'Bunga']] as [string, string][]).map(([c, l]) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: c, display: 'inline-block' }} />
              <span style={{ fontWeight: 600 }}>{l}</span>
            </span>
          ))}
        </div>
      </div>

      {/* âââ Table âââââââââââââââââââââââââââââââââââ */}
      <SectionLabel icon="ð" label="Detail per Periode" color="#8B5CF6" />

      <div style={{
        overflowX: 'auto', border: `1px solid ${C.border}`,
        borderRadius: 14, touchAction: 'pan-x',
        overscrollBehaviorX: 'contain',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: 460 }}>
          <thead>
            <tr style={{ background: '#F5F5F4', borderBottom: `1px solid ${C.border}` }}>
              {[isBulan ? 'Bulan' : 'Tahun', 'Modal', ...(hasTopup ? ['Top-up Kum.'] : []), 'Bunga Periode', 'Total Bunga', 'Saldo'].map((h, i) => (
                <th key={h} style={{ padding: '10px 10px', textAlign: i === 0 ? 'left' : 'right', fontWeight: 700, color: C.muted, whiteSpace: 'nowrap', fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.period} style={{ background: i % 2 ? '#FAFAF9' : 'transparent', borderBottom: `1px solid #F5F5F4` }}>
                <td style={{ padding: '8px 10px', color: C.muted, fontWeight: 600 }}>{r.period === 0 ? '0 (awal)' : r.period}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right' }}>{fmtIDR(r.principal)}</td>
                {hasTopup && <td style={{ padding: '8px 10px', textAlign: 'right', color: r.cumulativeTopup > 0 ? C.blue : C.muted }}>{r.period === 0 ? 'â' : fmtIDR(r.cumulativeTopup)}</td>}
                <td style={{ padding: '8px 10px', textAlign: 'right', color: r.periodInterest > 0 ? C.green : C.muted }}>{r.period === 0 ? 'â' : fmtIDR(r.periodInterest)}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: r.cumulativeInterest > 0 ? '#15803D' : C.muted, fontWeight: 700 }}>{r.period === 0 ? 'â' : fmtIDR(r.cumulativeInterest)}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: C.text }}>{fmtIDR(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* âââ AdSense âââââââââââââââââââââââââââââââââ */}
      <AdSlot />

      {/* âââ Share Card Button ââââââââââââââââââââââââ */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          className="btn-tap anim-pulseGlow"
          onClick={handleShare}
          style={{
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            color: '#fff', border: 'none', borderRadius: 16,
            padding: '16px 24px', fontSize: 16, fontWeight: 800,
            cursor: 'pointer', width: '100%',
            boxShadow: '0 6px 24px rgba(37,211,102,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            letterSpacing: -0.2,
          }}
        >
          <span style={{ fontSize: 20 }}>ð</span>
          Bagikan Hasil ke WhatsApp
          <span style={{ fontSize: 20 }}>ð¬</span>
        </button>

        <button
          className="btn-tap"
          onClick={onFeedback}
          style={{
            background: 'none', color: C.muted,
            border: `1.5px solid ${C.border}`,
            borderRadius: 12, padding: '11px 20px',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          â­ Kasih Feedback
        </button>
      </div>

      {/* Share Card Modal */}
      {shareData && (
        <ShareCard data={shareData} onClose={() => setShareData(null)} />
      )}
    </div>
  )
}
