import type { Zone } from '../types/database'

export const DEFAULT_ZONES: Zone[] = [
  { label: 'Libertadores (fase de grupos)', color: '#2563eb', from_position: 1, to_position: 4 },
  { label: 'Pré-Libertadores', color: '#f97316', from_position: 5, to_position: 6 },
  { label: 'Sul-Americana', color: '#16a34a', from_position: 7, to_position: 12 },
  { label: 'Rebaixamento', color: '#dc2626', from_position: 17, to_position: 20 },
]
