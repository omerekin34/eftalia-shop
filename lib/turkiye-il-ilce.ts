import {
  cityNamesByCode,
  getDistrictsByCityCode,
  getNeighbourhoodsByCityCodeAndDistrict,
} from 'turkey-neighbourhoods'

/** İl adı → plaka (Türkiye karşılaştırması) */
export function getPlakaByIlAdi(ilAdi: string): string | undefined {
  const trimmed = ilAdi.trim()
  if (!trimmed) return undefined
  for (const [code, name] of Object.entries(cityNamesByCode)) {
    if (name.localeCompare(trimmed, 'tr', { sensitivity: 'accent' }) === 0) {
      return code
    }
  }
  return undefined
}

/** Alfabetik sıralı tüm il isimleri */
export function getTumIlIsimleri(): string[] {
  const names = Object.values(cityNamesByCode) as string[]
  return [...new Set(names)].sort((a, b) => a.localeCompare(b, 'tr', { sensitivity: 'base' }))
}

/** Seçilen ile ait ilçeler (alfabetik) */
export function getIlcelerSorted(ilAdi: string): string[] {
  const plaka = getPlakaByIlAdi(ilAdi)
  if (!plaka) return []
  const list = getDistrictsByCityCode(plaka)
  return [...list].sort((a, b) => a.localeCompare(b, 'tr', { sensitivity: 'base' }))
}

/** Seçilen il + ilçeye göre mahalle listesi (alfabetik) */
export function getMahallelerSorted(ilAdi: string, ilceAdi: string): string[] {
  const plaka = getPlakaByIlAdi(ilAdi)
  if (!plaka || !ilceAdi.trim()) return []
  const list = getNeighbourhoodsByCityCodeAndDistrict(plaka, ilceAdi.trim())
  return [...list].sort((a, b) => a.localeCompare(b, 'tr', { sensitivity: 'base' }))
}
