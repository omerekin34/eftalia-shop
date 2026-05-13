'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { TurkiyeIlIlceFields } from '@/components/storefront/turkiye-il-ilce-fields'

export type MembershipProfileExtension = {
  country?: string
  city?: string
  district?: string
  education?: string
  profession?: string
  gender?: string
  birthdate?: string
  hideBirthdate?: boolean
  smsOptIn?: boolean
}

type CustomerMembershipSource = {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  acceptsMarketing?: boolean
  membershipProfile?: MembershipProfileExtension | null
}

const EDUCATION_OPTIONS = [
  '',
  'İlkokul',
  'Ortaokul',
  'Lise',
  'Ön Lisans',
  'Lisans',
  'Yüksek Lisans',
  'Doktora',
  'Diğer',
]

function phoneLocalFromE164(phone?: string) {
  const p = String(phone || '').trim()
  if (!p) return ''
  const digits = p.replace(/\D/g, '')
  if (digits.startsWith('90') && digits.length >= 12) return digits.slice(2)
  if (digits.startsWith('0') && digits.length === 11) return digits.slice(1)
  if (digits.length === 10 && digits.startsWith('5')) return digits
  return digits.replace(/^90/, '')
}

export function AccountMembershipForm({
  customer,
  onProfileUpdated,
}: {
  customer: CustomerMembershipSource
  onProfileUpdated?: (patch: { firstName: string; lastName: string; phone: string; email: string }) => void
}) {
  const mp = customer.membershipProfile || {}

  const [firstName, setFirstName] = useState(customer.firstName || '')
  const [lastName, setLastName] = useState(customer.lastName || '')
  const [phoneLocal, setPhoneLocal] = useState(() => phoneLocalFromE164(customer.phone))
  const [password, setPassword] = useState('')
  const [country, setCountry] = useState(mp.country || 'Türkiye')
  const [city, setCity] = useState(mp.city || '')
  const [district, setDistrict] = useState(mp.district || '')
  const [education, setEducation] = useState(mp.education || '')
  const [profession, setProfession] = useState(mp.profession || '')
  const [gender, setGender] = useState<'female' | 'male' | 'unspecified'>(
    mp.gender === 'female' || mp.gender === 'male' ? mp.gender : 'unspecified'
  )
  const [birthdate, setBirthdate] = useState(mp.birthdate || '')
  const [hideBirthdate, setHideBirthdate] = useState(Boolean(mp.hideBirthdate))
  const [marketingEmail, setMarketingEmail] = useState(Boolean(customer.acceptsMarketing))
  const [marketingSms, setMarketingSms] = useState(Boolean(mp.smsOptIn))
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaNonce, setCaptchaNonce] = useState(() => Date.now())

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteEmail, setDeleteEmail] = useState('')

  useEffect(() => {
    setFirstName(customer.firstName || '')
    setLastName(customer.lastName || '')
    setPhoneLocal(phoneLocalFromE164(customer.phone))
    setMarketingEmail(Boolean(customer.acceptsMarketing))
    const next = customer.membershipProfile || {}
    setCountry(next.country || 'Türkiye')
    setCity(next.city || '')
    setDistrict(next.district || '')
    setEducation(next.education || '')
    setProfession(next.profession || '')
    setGender(next.gender === 'female' || next.gender === 'male' ? next.gender : 'unspecified')
    setBirthdate(next.birthdate || '')
    setHideBirthdate(Boolean(next.hideBirthdate))
    setMarketingSms(Boolean(next.smsOptIn))
  }, [customer])

  const captchaSrc = useMemo(
    () => `/api/account/profile-captcha?n=${captchaNonce}`,
    [captchaNonce]
  )

  const refreshCaptcha = useCallback(() => {
    setCaptchaNonce(Date.now())
    setCaptchaAnswer('')
  }, [])

  const fieldClass =
    'w-full rounded-lg border border-[#9b7a57]/30 bg-white px-3 py-2.5 text-sm text-[#4d3523] outline-none focus:border-[#6d4f35]'
  const labelClass = 'mb-1 block text-xs font-medium text-[#6d4f35]'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          firstName,
          lastName,
          phoneLocal,
          password: password.trim() || undefined,
          acceptsMarketing: marketingEmail,
          captchaAnswer,
          membership: {
            country,
            city,
            district,
            education,
            profession,
            gender,
            birthdate: hideBirthdate ? '' : birthdate,
            hideBirthdate,
            smsOptIn: marketingSms,
          },
        }),
      })
      const data = (await response.json()) as { error?: string; ok?: boolean }
      if (!response.ok) throw new Error(data?.error || 'Kayıt başarısız.')
      if (data?.error) {
        setMessage(data.error)
      } else {
        setMessage('Üyelik bilgileriniz Shopify hesabınıza kaydedildi.')
      }
      setPassword('')
      refreshCaptcha()
      onProfileUpdated?.({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phoneLocal,
        email: String(customer.email || ''),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız.')
      refreshCaptcha()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch('/api/account/profile', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ confirmation: deleteEmail.trim() }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(data?.error || 'Hesap silinemedi.')
      window.location.href = '/'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hesap silinemedi.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <h2 className="font-serif text-2xl text-[#4d3523]">Üyelik Bilgilerim</h2>
      <p className="mt-2 text-sm text-[#7d5f45]">
        Bilgileriniz Shopify müşteri kaydınızla senkron tutulur; her girişte güncel veriler yüklenir.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid gap-5 lg:grid-cols-2 lg:gap-8">
          <div className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="m-first">
                Adınız <span className="text-rose-600">*</span>
              </label>
              <input
                id="m-first"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={fieldClass}
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="m-last">
                Soyadınız <span className="text-rose-600">*</span>
              </label>
              <input
                id="m-last"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={fieldClass}
                autoComplete="family-name"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="m-phone">
                Cep telefonunuz
              </label>
              <div className="flex gap-2">
                <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#9b7a57]/30 bg-[#f5ede2] px-3 py-2.5 text-sm text-[#4d3523]">
                  <span aria-hidden>🇹🇷</span> +90
                </span>
                <input
                  id="m-phone"
                  value={phoneLocal}
                  onChange={(e) => setPhoneLocal(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className={fieldClass}
                  placeholder="5xx xxx xx xx"
                  inputMode="numeric"
                  autoComplete="tel-national"
                />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="m-email">
                E-posta adresiniz
              </label>
              <input
                id="m-email"
                readOnly
                value={customer.email || ''}
                className="cursor-not-allowed rounded-lg border border-[#9b7a57]/20 bg-[#f0e8dc] px-3 py-2.5 text-sm text-[#6d4f35]"
              />
            </div>
            <fieldset>
              <legend className={`${labelClass} mb-2`}>Cinsiyet</legend>
              <div className="flex flex-wrap gap-4 text-sm text-[#4d3523]">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    checked={gender === 'female'}
                    onChange={() => setGender('female')}
                    className="accent-[#5B1F2A]"
                  />
                  Kadın
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    checked={gender === 'male'}
                    onChange={() => setGender('male')}
                    className="accent-[#5B1F2A]"
                  />
                  Erkek
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    checked={gender === 'unspecified'}
                    onChange={() => setGender('unspecified')}
                    className="accent-[#5B1F2A]"
                  />
                  Belirtmek istemiyorum
                </label>
              </div>
            </fieldset>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="m-country">
                Ülke
              </label>
              <select
                id="m-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={fieldClass}
              >
                <option value="Türkiye">Türkiye</option>
              </select>
            </div>
            <div className="space-y-2">
              <p className={labelClass}>Şehir ve ilçe</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <TurkiyeIlIlceFields
                  ilValue={city}
                  ilceValue={district}
                  mahalleValue=""
                  showMahalle={false}
                  onIlChange={(il) => {
                    setCity(il)
                    setDistrict('')
                  }}
                  onIlceChange={setDistrict}
                  onMahalleChange={() => {}}
                />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="m-edu">
                Öğrenim durumu
              </label>
              <select
                id="m-edu"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className={fieldClass}
              >
                {EDUCATION_OPTIONS.map((opt) => (
                  <option key={opt || 'empty'} value={opt}>
                    {opt || 'Seçiniz'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="m-job">
                Meslek
              </label>
              <input
                id="m-job"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className={fieldClass}
                placeholder="Mesleğiniz"
              />
            </div>
            <div className="space-y-3 rounded-lg border border-[#9b7a57]/15 bg-white/60 p-3 text-sm text-[#4d3523]">
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={hideBirthdate}
                  onChange={(e) => setHideBirthdate(e.target.checked)}
                  className="mt-0.5 accent-[#5B1F2A]"
                />
                <span>Doğum tarihi belirtmek istemiyorum</span>
              </label>
              {!hideBirthdate ? (
                <div>
                  <label className={labelClass} htmlFor="m-bd">
                    Doğum tarihi
                  </label>
                  <input
                    id="m-bd"
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              ) : null}
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={marketingEmail}
                  onChange={(e) => setMarketingEmail(e.target.checked)}
                  className="mt-0.5 accent-[#5B1F2A]"
                />
                <span>Kampanya, duyuru ve bilgilendirmelerden e-posta ile haberdar olmak istiyorum.</span>
              </label>
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={marketingSms}
                  onChange={(e) => setMarketingSms(e.target.checked)}
                  className="mt-0.5 accent-[#5B1F2A]"
                />
                <span>Kampanya, duyuru ve bilgilendirmelerden SMS ile haberdar olmak istiyorum.</span>
              </label>
              <p className="text-[11px] leading-snug text-[#8a6b4b]">
                E-posta tercihi Shopify müşteri kaydındaki pazarlama izniyle eşlenir. SMS tercihi profil
                verinizde saklanır; operasyonel mesajlar için ayrıca iletişim kurulabilir.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-0 flex-1">
                <label className={labelClass} htmlFor="m-captcha-img">
                  Güvenlik kodu
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative h-14 w-[200px] overflow-hidden rounded-lg border border-[#9b7a57]/25 bg-[#f5ede2]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={captchaNonce}
                    src={captchaSrc}
                    alt="Güvenlik kodu"
                    className="h-full w-full object-contain"
                  />
                </div>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#9b7a57]/30 bg-white text-[#6d4f35] hover:bg-[#f8efe1]"
                    aria-label="Yeni güvenlik kodu"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="w-full sm:w-48">
                <label className={labelClass} htmlFor="m-captcha">
                  Kodu yazın
                </label>
                <input
                  id="m-captcha"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  className={fieldClass}
                  placeholder="Kod"
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="m-pass">
                Yeni şifre (opsiyonel)
              </label>
              <input
                id="m-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldClass}
                placeholder="Değiştirmek istemiyorsanız boş bırakın"
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>

        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : null}
        {message ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}

        <p className="text-xs leading-relaxed text-[#7d5f45]">
          Üyelik bilgilerini sildiğinizde kişisel verilerin korunması kanunu gereği tüm bilgileriniz sistemden
          silinmekte olup, yeniden üye olmanız gerekmektedir.
        </p>

        <div className="flex flex-col-reverse items-stretch justify-end gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => {
              setDeleteOpen(true)
              setDeleteEmail('')
            }}
            className="rounded-lg bg-[#c41e3a] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a91830]"
          >
            Üyelik bilgilerimi sil
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-black px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-70"
          >
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      </form>

      {deleteOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4">
          <div className="max-w-md rounded-2xl border border-[#9b7a57]/30 bg-[#fffaf2] p-6 shadow-xl">
            <h3 className="font-serif text-xl text-[#4d3523]">Hesabı kalıcı sil</h3>
            <p className="mt-2 text-sm text-[#7d5f45]">
              Bu işlem Shopify&apos;daki müşteri kaydınızı siler; oturumunuz kapanır ve sipariş geçmişi
              yönetim paneli politikalarınıza bağlı olarak kısıtlanabilir. Devam etmek için e-posta adresinizi
              aynen yazın:
            </p>
            <p className="mt-1 text-xs font-medium text-[#5B1F2A]">{customer.email}</p>
            <input
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
              className="mt-4 w-full rounded-lg border border-[#9b7a57]/30 bg-white px-3 py-2.5 text-sm"
              placeholder="E-posta adresiniz"
              autoComplete="off"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="rounded-lg border border-[#9b7a57]/30 bg-white px-4 py-2 text-sm text-[#6d4f35]"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="rounded-lg bg-[#c41e3a] px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
              >
                {deleting ? 'Siliniyor…' : 'Evet, sil'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
