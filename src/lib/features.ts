export type Feature = {
  id: string
  icon: string
  label: string
  available: boolean | 'request'
  color: string
}

export const FEATURES: Feature[] = [
  { id: 'compound',  icon: 'ð', label: 'Compound\nInterest',   available: true,      color: '#F97316' },
  { id: 'catetduit', icon: 'ð', label: 'CatetDuit',            available: false,     color: '#16A34A' },
  { id: 'instrumen', icon: 'ð¹', label: 'Instrumen\nInvestasi', available: false,     color: '#3B82F6' },
  { id: 'kpr',       icon: 'ð ', label: 'Hitung\nKPR',          available: false,     color: '#8B5CF6' },
  { id: 'request1',  icon: 'ð¡', label: 'Request\nDong!',       available: 'request', color: '#EC4899' },
]
