/** BestWay Delivery (vi.bestway-delivery.tn) helpers */

export const BESTWAY_API_BASE = 'https://vi.bestway-delivery.tn'

/**
 * Codes postaux BestWay (/API/code_postal).
 * Obligatoire dans le body `code` — sans ce champ l’API BestWay plante (Undefined property: code).
 */
export const BESTWAY_POSTAL_CODES: Record<string, string> = {
  Ariana: '2080',
  Béja: '9000',
  Beja: '9000',
  'Ben Arous': '2013',
  Bizerte: '7000',
  Gabès: '6000',
  Gabes: '6000',
  Gafsa: '2100',
  Jendouba: '8100',
  Kairouan: '3100',
  Kasserine: '1200',
  Kébili: '4200',
  Kebili: '4200',
  'La Manouba': '2010',
  Manouba: '2010',
  'Le Kef': '7100',
  Mahdia: '5100',
  Médenine: '4100',
  Medenine: '4100',
  Monastir: '5000',
  Nabeul: '8000',
  Sfax: '3000',
  'Sidi Bouzid': '9100',
  Siliana: '6100',
  Sousse: '4000',
  Tataouine: '3200',
  Tozeur: '2200',
  Tunis: '1000',
  Zaghouan: '1100',
}

export function bestwayPostalCode(governorateName: string | null | undefined): string | null {
  if (!governorateName?.trim()) return null
  const name = governorateName.trim()
  if (BESTWAY_POSTAL_CODES[name]) return BESTWAY_POSTAL_CODES[name]
  const hit = Object.keys(BESTWAY_POSTAL_CODES).find(
    k => k.toLowerCase() === name.toLowerCase()
  )
  return hit ? BESTWAY_POSTAL_CODES[hit] : null
}

/** Strip to 8-digit TN mobile for BestWay */
export function bestwayPhone(raw: string | null | undefined): string {
  const digits = (raw || '').replace(/\D/g, '')
  if (digits.startsWith('216') && digits.length >= 11) return digits.slice(-8)
  return digits.slice(-8)
}

export type BestwayAddPayload = {
  login: string
  password: string
  reference: string
  designation: string
  montant_reception: string
  modalite: string
  contenuEchange: string
  /** Code postal gouvernorat (obligatoire côté BestWay) */
  code: string
  tel: string
  adresse: string
  nom: string
  nombre_piece: number
  open_parcel: number
  fragile: number
}

export type BestwayAddResponse = {
  code_barre?: string
  pck_code?: string
  barcode_out?: string
  success?: number
  message?: string
  error?: string
}

export async function bestwayAddParcel(payload: BestwayAddPayload): Promise<BestwayAddResponse> {
  const res = await fetch(`${BESTWAY_API_BASE}/API/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const text = await res.text()
  let data: BestwayAddResponse = {}
  try {
    data = JSON.parse(text) as BestwayAddResponse
  } catch {
    const hint = text.includes('Undefined property') && text.includes('code')
      ? ' (champ code / code postal manquant)'
      : ''
    throw new Error(`BestWay réponse invalide${hint}: ${text.replace(/<[^>]+>/g, ' ').slice(0, 180)}`)
  }
  if (!res.ok) {
    throw new Error(data.message || data.error || `BestWay HTTP ${res.status}`)
  }
  if (!data.code_barre && !data.pck_code) {
    throw new Error(data.message || data.error || 'BestWay: pas de code-barres reçu')
  }
  return data
}

export async function bestwayTrack(barcode: string): Promise<unknown> {
  const res = await fetch(`${BESTWAY_API_BASE}/API/tracking/${encodeURIComponent(barcode)}`, {
    method: 'GET',
  })
  if (!res.ok) throw new Error(`BestWay tracking HTTP ${res.status}`)
  return res.json()
}
