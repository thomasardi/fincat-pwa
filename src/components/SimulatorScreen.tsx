'use client'
import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { buildRows, getMonthlyTopup, fmtIDR, fmtAxis, rawIDR, rawNum, liveFormatIDR } from '@/lib/calc'
import { track } from '@/lib/posthog'
import AdSlot from './AdSlot'

const C = { orange: '#F97316', green: '#16A34A', blue: '#3B82F6', text: '#1C1917', muted: '#78716C', border: '#E7E5E4', card: '#fff' }

function MetricCard({ label, value, highlight, color }: { label: string; value: string; highlight?: boolean; color?: string }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${highlight ? C.orange + '50' : C.border}`, borderRadius: 14, padding: '12px 14px' }}>
      <p style={{ fontSize: 11, color: C.muted, margin: '0 0 4px', fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: color || (highlight ? C.orange : C.text) }}>{value}</p>
    </div>
  )
}
function Divider({ label, color, sub }: { label: string; color: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 0 14px' }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }}/>
      <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{label}</span>
      {sub && <span style={{ fontSize: 11, color: C.muted }}>{sub}</span>}
      <div style={{ flex: 1, height: 1, background: C.border }}/>
    </div>
  )
}
function RangeHints({ left, right }: { left: string; right: string }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, marginTop: 2 }}><span>{left}</span><span>{right}</span></div>
}

export default function SimulatorScreen({ onFeedback }: { onFeedback: () => void }) {
  const [principal,   setPrincipal]   = useState('10.000.000')
  const [rate,        setRate]        = useState('7')
  const [period,      setPeriod]      = useState('5')
  const [unit,        setUnit]        = useState<'tahun'|'bulan'>('tahun')
  const [topupAmt,    setTopupAmt]    = useState('0')
  const [topupFreq,   setTopupFreq]   = useState('bulanan')

  const isBulan   = unit === 'bulan'
  const pr        = rawIDR(principal)
  const rt        = rawNum(rate)
  const pd        = parseInt(period) || 1
  const mTopup    = getMonthlyTopup(rawIDR(topupAmt), topupFreq)
  const hasTopup  = rawIDR(topupAmt) > 0

  const rows = useMemo(() => {
    if (!pr || !rt || !pd) return []
    const r = buildRows(pr, rt, pd, isBulan, mTopup)
    track('simulation_run', { principal: pr, rate: rt, period: pd, unit, has_topup: hasTopup })
    return r
  }, [pr, rt, pd, isBulan, mTopup])

  const last   = rows[rows.length - 1] || { balance: 0, cumulativeInterest: 0, cumulativeTopup: 0 }
  const growth = pr > 0 ? (((last.balance - pr) / pr) * 100).toFixed(1) : '0.0'
  const ul     = isBulan ? 'bulan' : 'tahun'
  const ulC    = isBulan ? 'bln' : 'thn'

  const maxBars = 14
  const step    = Math.max(1, Math.ceil(pd / maxBars))
  const chartData = rows.filter((_, i) => i % step === 0 || i === pd).map(r => ({
    name:  ulC + ' ' + r.period,
    modal: r.balance - r.cumulativeTopup - r.cumulativeInterest,
    topup: r.cumulativeTopup,
    bunga: r.cumulativeInterest,
  }))

  const inp = { flex: 1, minWidth: 0, padding: '8px 10px', fontSize: 15, fontWeight: 600, border: `1.5px solid ${C.border}`, borderRadius: 10, background: C.card, color: C.text, outline: 'none' } as const
  const lbl = { fontSize: 12, color: C.muted, marginBottom: 5, fontWeight: 500, display: 'block' } as const

  return (
    <div style={{ padding: '0 16px 32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <MetricCard label="Modal Awal"  value={fmtIDR(pr)} />
        <MetricCard label="Saldo Akhir" value={fmtIDR(last.balance)} highlight />
      </div>
      <div style={{ background: C.card, borderRadius: 14, padding: '14px 16px', marginBottom: 12, border: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <p style={{ fontSize: 11, color: C.muted, margin: '0 0 4px', fontWeight: 500 }}>Total Bunga <span style={{ fontWeight: 400 }}>({pd} {ul})</span></p>
          <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: C.green }}>{fmtIDR(last.cumulativeInterest)}</p>
        </div>
        <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>▲ +{growth}%</span>
      </div>
      {hasTopup && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <MetricCard label="Total Top-up"   value={fmtIDR(last.cumulativeTopup)}              color={C.blue} />
          <MetricCard label="Total Investasi" value={fmtIDR(pr + last.cumulativeTopup)} />
        </div>
      )}

      <Divider label="Modal Awal" color={C.orange} />
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Jumlah modal</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>Rp</span>
          <input style={inp} type="text" value={principal} inputMode="numeric" onChange={e => setPrincipal(liveFormatIDR(e.target.value))} />
        </div>
        <input type="range" min={1000000} max={1000000000} step={1000000} value={pr}
          onChange={e => setPrincipal((+e.target.value).toLocaleString('id-ID'))} style={{ width: '100%', accentColor: C.orange }} />
        <RangeHints left="Rp 1 jt" right="Rp 1 M" />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Bunga per tahun</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
          <input style={{ ...inp, maxWidth: 100 }} type="text" value={rate} inputMode="decimal"
            onChange={e => { const v = e.target.value.replace(/[^0-9.]/g, ''); setRate(v) }} />
          <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>% / tahun</span>
        </div>
        <input type="range" min={0.1} max={30} step={0.1} value={rt}
          onChange={e => setRate(String(+e.target.value))} style={{ width: '100%', accentColor: C.orange }} />
        <RangeHints left="0.1%" right="30%" />
      </div>
      <div style={{ marginBottom: 4 }}>
        <label style={lbl}>Jangka waktu</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
          <input style={{ ...inp, maxWidth: 90 }} type="text" value={period} inputMode="numeric"
            onChange={e => setPeriod(e.target.value.replace(/[^0-9]/g, ''))} />
          <select value={unit} onChange={e => { const u = e.target.value as 'tahun'|'bulan'; setPeriod(p => String(u === 'bulan' ? Math.min((parseInt(p)||1)*12,120) : Math.max(1,Math.round((parseInt(p)||1)/12)))); setUnit(u) }}
            style={{ fontSize: 14, padding: '8px 10px', borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.card, color: C.text }}>
            <option value="tahun">Tahun</option>
            <option value="bulan">Bulan</option>
          </select>
        </div>
        <input type="range" min={1} max={isBulan ? 120 : 50} step={1} value={pd}
          onChange={e => setPeriod(String(+e.target.value))} style={{ width: '100%', accentColor: C.orange }} />
        <RangeHints left={isBulan ? '1 bln' : '1 thn'} right={isBulan ? '120 bln' : '50 thn'} />
      </div>

      <Divider label="Top-up Rutin" color={C.blue} sub="(opsional)" />
      <div style={{ marginBottom: 12 }}>
        <label style={lbl}>Jumlah top-up per periode</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>Rp</span>
          <input style={inp} type="text" value={topupAmt} inputMode="numeric" onChange={e => setTopupAmt(liveFormatIDR(e.target.value))} />
        </div>
      </div>
      <div style={{ marginBottom: 4 }}>
        <label style={lbl}>Frekuensi top-up</label>
        <select value={topupFreq} onChange={e => setTopupFreq(e.target.value)}
          style={{ width: '100%', fontSize: 14, padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.card, color: C.text }}>
          <option value="harian">Harian (Daily)</option>
          <option value="mingguan">Mingguan (Weekly)</option>
          <option value="bulanan">Bulanan (Monthly)</option>
          <option value="tahunan">Tahunan (Yearly)</option>
        </select>
      </div>

      <div style={{ marginTop: 24 }}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barSize={Math.max(8, Math.min(32, 300 / chartData.length))} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#78716C' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 10, fill: '#78716C' }} axisLine={false} tickLine={false} width={52} />
            <Tooltip formatter={(v: number, name: string) => [fmtIDR(v), name === 'modal' ? 'Modal awal' : name === 'topup' ? 'Top-up kumulatif' : 'Bunga kumulatif']}
              contentStyle={{ borderRadius: 10, border: '1px solid #E7E5E4', fontSize: 12 }} />
            <Bar dataKey="modal" stackId="a" fill={C.orange} radius={[0,0,3,3]} />
            <Bar dataKey="topup" stackId="a" fill={C.blue}   radius={[0,0,0,0]} />
            <Bar dataKey="bunga" stackId="a" fill={C.green}  radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8, fontSize: 11, color: C.muted }}>
          {([[C.orange,'Modal awal'],[C.blue,'Top-up'],[C.green,'Bunga']] as [string,string][]).map(([c,l]) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }}/>{l}
            </span>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #E7E5E4', borderRadius: 12, marginTop: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: 460 }}>
          <thead>
            <tr style={{ background: '#F5F5F4', borderBottom: '1px solid #E7E5E4' }}>
              {[isBulan ? 'Bulan' : 'Tahun', 'Modal', ...(hasTopup ? ['Top-up Kum.'] : []), 'Bunga Periode', 'Total Bunga', 'Total Saldo'].map((h,i) => (
                <th key={h} style={{ padding: '9px 10px', textAlign: i===0?'left':'right', fontWeight: 600, color: C.muted, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.period} style={{ background: i%2 ? '#FAFAF9' : 'transparent', borderBottom: '1px solid #F5F5F4' }}>
                <td style={{ padding: '8px 10px', color: C.muted }}>{r.period === 0 ? '0 (awal)' : r.period}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right' }}>{fmtIDR(r.principal)}</td>
                {hasTopup && <td style={{ padding: '8px 10px', textAlign: 'right', color: r.cumulativeTopup > 0 ? C.blue : C.muted }}>{r.period===0?'—':fmtIDR(r.cumulativeTopup)}</td>}
                <td style={{ padding: '8px 10px', textAlign: 'right', color: r.periodInterest > 0 ? C.green : C.muted }}>{r.period===0?'—':fmtIDR(r.periodInterest)}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: r.cumulativeInterest > 0 ? '#15803D' : C.muted, fontWeight: 600 }}>{r.period===0?'—':fmtIDR(r.cumulativeInterest)}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>{fmtIDR(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdSlot />
      <button onClick={onFeedback} style={{ background: C.orange, color: '#fff', border: 'none', borderRadius: 12, padding: '13px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', width: '100%', marginTop: 20 }}>
        ⭐ Kasih Feedback
      </button>
    </div>
  )
}
