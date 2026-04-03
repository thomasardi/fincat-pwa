export type SimRow = {
  period: number
  balance: number
  principal: number
  periodInterest: number
  cumulativeInterest: number
  cumulativeTopup: number
}

export function buildRows(
  principal: number,
  annualRate: number,
  periods: number,
  isBulan: boolean,
  mTopup: number
): SimRow[] {
  const rows: SimRow[] = []
  let bal = principal, cum = 0, cumTop = 0
  const monthlyR = annualRate / 100 / 12

  rows.push({ period: 0, balance: Math.round(principal), principal: Math.round(principal), periodInterest: 0, cumulativeInterest: 0, cumulativeTopup: 0 })

  if (isBulan) {
    for (let p = 1; p <= periods; p++) {
      const interest = bal * monthlyR
      bal += interest + mTopup
      cum += interest; cumTop += mTopup
      rows.push({ period: p, balance: Math.round(bal), principal: Math.round(principal), periodInterest: Math.round(interest), cumulativeInterest: Math.round(cum), cumulativeTopup: Math.round(cumTop) })
    }
  } else {
    for (let y = 1; y <= periods; y++) {
      let yInt = 0
      for (let m = 0; m < 12; m++) {
        const interest = bal * monthlyR
        bal += interest + mTopup
        yInt += interest; cum += interest; cumTop += mTopup
      }
      rows.push({ period: y, balance: Math.round(bal), principal: Math.round(principal), periodInterest: Math.round(yInt), cumulativeInterest: Math.round(cum), cumulativeTopup: Math.round(cumTop) })
    }
  }
  return rows
}

export function getMonthlyTopup(amount: number, freq: string): number {
  if (!amount) return 0
  if (freq === 'harian') return amount * (365 / 12)
  if (freq === 'mingguan') return amount * (52 / 12)
  if (freq === 'tahunan') return amount / 12
  return amount // bulanan
}

export const fmtIDR = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID')
export const fmtAxis = (n: number) => {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + ' T'
  if (n >= 1e9)  return (n / 1e9).toFixed(1)  + ' M'
  if (n >= 1e6)  return (n / 1e6).toFixed(0)  + ' jt'
  return Math.round(n).toLocaleString('id-ID')
}
export const rawIDR = (s: string) => +String(s).replace(/\./g, '').replace(/[^0-9]/g, '') || 0
export const rawNum = (s: string) => parseFloat(String(s).replace(',', '.')) || 0
export const fmtInput = (n: number) => Math.round(n).toLocaleString('id-ID')
export function liveFormatIDR(raw: string): string {
  const num = parseInt(raw.replace(/\./g, '').replace(/[^0-9]/g, '')) || 0
  return num.toLocaleString('id-ID')
}
