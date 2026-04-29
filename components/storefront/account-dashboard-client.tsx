'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Copy, Heart, MapPin, Package, Star, TicketPercent, User, UserCog } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AccountSidebar, type AccountNavTabKey } from '@/components/storefront/account-sidebar'
import { TurkiyeIlIlceFields } from '@/components/storefront/turkiye-il-ilce-fields'
import { AccountOrdersSection, type AccountOrder } from '@/components/storefront/account-orders-section'
import { useFavorites } from '@/components/storefront/favorites-context'

type CustomerAddress = {
  id: string
  firstName?: string
  lastName?: string
  address1?: string
  address2?: string
  city?: string
  province?: string
  country?: string
  zip?: string
  phone?: string
}

type CustomerDetails = {
  id?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  addresses?: CustomerAddress[]
  spinWheelRewardRaw?: string
}

type TabKey = AccountNavTabKey
type SpinRewardEntry = { code: string; label: string; usedAt?: string; spinIndex?: number }

const dashboardCards: Array<{
  key: Exclude<TabKey, 'dashboard'> | 'reviews'
  title: string
  description: string
  icon: typeof User | typeof Star
  href?: string
}> = [
  {
    key: 'orders',
    title: 'Siparişlerim',
    description: 'Tüm sipariş geçmişinizi premium takip ekranında görüntüleyin.',
    icon: Package,
  },
  {
    key: 'profile',
    title: 'Üyelik Bilgilerim',
    description: 'Kişisel bilgilerinizi ve şifrenizi güvenle güncelleyin.',
    icon: UserCog,
  },
  {
    key: 'addresses',
    title: 'Adres Defterim',
    description: 'Adres ekleme, düzenleme ve silme işlemlerini yönetin.',
    icon: MapPin,
  },
  {
    key: 'reviews',
    title: 'Değerlendirmelerim',
    description: 'Ürünlerimize bıraktığınız yorumları premium listede inceleyin.',
    icon: Star,
    href: '/account/reviews',
  },
  {
    key: 'favorites',
    title: 'Favorilerim',
    description: 'Favori ürünlerinizi tek ekran üzerinden görüntüleyin.',
    icon: Heart,
  },
]

function getTabFromParam(value: string | null): TabKey {
  if (value === 'orders') return 'orders'
  if (value === 'favorites') return 'favorites'
  if (value === 'coupons') return 'coupons'
  if (value === 'addresses') return 'addresses'
  if (value === 'profile') return 'profile'
  return 'dashboard'
}

export function AccountDashboardClient({
  customer,
  orders,
}: {
  customer: CustomerDetails
  orders: AccountOrder[]
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { favorites, removeFavorite } = useFavorites()

  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false)
  const [googleLinkMessage, setGoogleLinkMessage] = useState('')
  const [googleLinkError, setGoogleLinkError] = useState('')
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [addresses, setAddresses] = useState<CustomerAddress[]>(customer.addresses || [])
  const [addressMessage, setAddressMessage] = useState('')
  const [addressError, setAddressError] = useState('')
  const [editingAddressId, setEditingAddressId] = useState('')
  const [isAddressSubmitting, setIsAddressSubmitting] = useState(false)
  const [profileForm, setProfileForm] = useState({
    firstName: customer.firstName || '',
    lastName: customer.lastName || '',
    email: customer.email || '',
    phone: customer.phone || '',
    password: '',
  })
  const [spinState, setSpinState] = useState<{
    rewards: SpinRewardEntry[]
    totalSpend: number
    availableSpins: number
    usedSpins: number
    remainingSpins: number
    message: string
  }>(() => {
    if (!customer.spinWheelRewardRaw) {
      return { rewards: [], totalSpend: 0, availableSpins: 0, usedSpins: 0, remainingSpins: 0, message: '' }
    }
    try {
      const parsed = JSON.parse(customer.spinWheelRewardRaw) as
        | { rewards?: SpinRewardEntry[] }
        | { code?: string; label?: string }
      const rewards = Array.isArray((parsed as { rewards?: SpinRewardEntry[] })?.rewards)
        ? ((parsed as { rewards?: SpinRewardEntry[] }).rewards || []).filter((reward) => reward?.code)
        : []
      if (rewards.length) {
        return {
          rewards,
          totalSpend: 0,
          availableSpins: rewards.length,
          usedSpins: rewards.length,
          remainingSpins: 0,
          message: 'Çarkıfelek haklarınızı kullandınız.',
        }
      }
      if (!(parsed as { code?: string })?.code) {
        return { rewards: [], totalSpend: 0, availableSpins: 0, usedSpins: 0, remainingSpins: 0, message: '' }
      }
      return {
        rewards: [
          {
            code: String((parsed as { code?: string }).code || ''),
            label: String((parsed as { label?: string }).label || 'Ödül Kuponu'),
            spinIndex: 1,
          },
        ],
        totalSpend: 0,
        availableSpins: 1,
        usedSpins: 1,
        remainingSpins: 0,
        message: 'Çarkıfelek hakkınızı daha önce kullandınız.',
      }
    } catch {
      return { rewards: [], totalSpend: 0, availableSpins: 0, usedSpins: 0, remainingSpins: 0, message: '' }
    }
  })
  const [couponMessage, setCouponMessage] = useState('')
  const [addressForm, setAddressForm] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    province: '',
    country: 'Türkiye',
    zip: '',
    phone: '',
  })

  const fullName = useMemo(
    () => [profileForm.firstName, profileForm.lastName].filter(Boolean).join(' ').trim(),
    [profileForm.firstName, profileForm.lastName]
  )

  useEffect(() => {
    const tab = getTabFromParam(searchParams.get('tab'))
    if (tab !== activeTab) {
      setActiveTab(tab)
    }
  }, [searchParams, activeTab])

  useEffect(() => {
    if (activeTab !== 'profile') return
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) return

    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity="1"]')
    if (existing) return

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.googleIdentity = '1'
    document.head.appendChild(script)
  }, [activeTab])

  useEffect(() => {
    let active = true
    const syncSpinStatus = async () => {
      try {
        const response = await fetch('/api/account/spin-wheel', { cache: 'no-store' })
        const data = (await response.json()) as {
          rewardsWon?: SpinRewardEntry[]
          totalSpend?: number
          availableSpins?: number
          usedSpins?: number
          remainingSpins?: number
        }
        if (!active || !response.ok) return
        const rewardsWon = Array.isArray(data.rewardsWon) ? data.rewardsWon.filter((reward) => reward?.code) : []
        setSpinState((prev) => ({
          ...prev,
          rewards: rewardsWon.length ? rewardsWon : prev.rewards,
          totalSpend: typeof data.totalSpend === 'number' ? data.totalSpend : prev.totalSpend,
          availableSpins: typeof data.availableSpins === 'number' ? data.availableSpins : prev.availableSpins,
          usedSpins: typeof data.usedSpins === 'number' ? data.usedSpins : prev.usedSpins,
          remainingSpins: typeof data.remainingSpins === 'number' ? data.remainingSpins : prev.remainingSpins,
        }))
      } catch {
        // no-op
      }
    }
    const handleSpinUpdated = () => {
      void syncSpinStatus()
    }
    void syncSpinStatus()
    window.addEventListener('eftalia:spin-wheel-updated', handleSpinUpdated)
    return () => {
      active = false
      window.removeEventListener('eftalia:spin-wheel-updated', handleSpinUpdated)
    }
  }, [])

  const setTab = (tab: TabKey) => {
    setActiveTab(tab)
    const path = tab === 'dashboard' ? '/account' : `/account?tab=${tab}`
    router.push(path, { scroll: false })
  }

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSavingProfile(true)
    setProfileError('')
    setProfileMessage('')
    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          phone: profileForm.phone,
          password: profileForm.password || undefined,
        }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(data?.error || 'Bilgiler güncellenemedi.')
      setProfileMessage('Üyelik bilgileriniz güncellendi.')
      setProfileForm((prev) => ({ ...prev, password: '' }))
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Bilgiler güncellenemedi.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleLinkGoogle = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId || !window.google?.accounts?.id) {
      setGoogleLinkError('Google bağlantısı için yapılandırma eksik görünüyor.')
      return
    }

    setGoogleLinkError('')
    setGoogleLinkMessage('')

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }: { credential: string }) => {
        setIsLinkingGoogle(true)
        try {
          const response = await fetch('/api/auth/google/link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential }),
          })
          const data = (await response.json()) as { error?: string }
          if (!response.ok) throw new Error(data?.error || 'Google hesabı bağlanamadı.')
          setGoogleLinkMessage('Google hesabınız başarıyla bağlandı. Artık Google ile giriş yapabilirsiniz.')
        } catch (error) {
          setGoogleLinkError(error instanceof Error ? error.message : 'Google hesabı bağlanamadı.')
        } finally {
          setIsLinkingGoogle(false)
        }
      },
    })

    window.google.accounts.id.prompt()
  }

  const resetAddressForm = () => {
    setAddressForm({
      firstName: '',
      lastName: '',
      address1: '',
      address2: '',
      city: '',
      province: '',
      country: 'Türkiye',
      zip: '',
      phone: '',
    })
    setEditingAddressId('')
  }

  const handleAddressSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsAddressSubmitting(true)
    setAddressError('')
    setAddressMessage('')
    try {
      const method = editingAddressId ? 'PUT' : 'POST'
      const payload = editingAddressId
        ? { id: editingAddressId, address: addressForm }
        : addressForm
      const response = await fetch('/api/account/address', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(data?.error || 'Adres kaydedilemedi.')

      if (editingAddressId) {
        setAddresses((prev) =>
          prev.map((address) => (address.id === editingAddressId ? { ...address, ...addressForm } : address))
        )
        setAddressMessage('Adres güncellendi.')
      } else {
        const tempId = `temp-${Date.now()}`
        setAddresses((prev) => [{ id: tempId, ...addressForm }, ...prev])
        setAddressMessage('Adres eklendi.')
      }
      resetAddressForm()
    } catch (error) {
      setAddressError(error instanceof Error ? error.message : 'Adres kaydedilemedi.')
    } finally {
      setIsAddressSubmitting(false)
    }
  }

  const handleEditAddress = (address: CustomerAddress) => {
    setEditingAddressId(address.id)
    setAddressForm({
      firstName: address.firstName || '',
      lastName: address.lastName || '',
      address1: address.address1 || '',
      address2: address.address2 || '',
      city: address.city || '',
      province: address.province || '',
      country: address.country || 'Türkiye',
      zip: address.zip || '',
      phone: address.phone || '',
    })
    setTab('addresses')
  }

  const handleDeleteAddress = async (id: string) => {
    setAddressError('')
    setAddressMessage('')
    try {
      const response = await fetch('/api/account/address', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(data?.error || 'Adres silinemedi.')
      setAddresses((prev) => prev.filter((address) => address.id !== id))
      setAddressMessage('Adres silindi.')
    } catch (error) {
      setAddressError(error instanceof Error ? error.message : 'Adres silinemedi.')
    }
  }

  const handleOpenSpinWheel = () => {
    window.dispatchEvent(new CustomEvent('eftalia:open-spin-wheel'))
  }

  const handleCopyCoupon = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCouponMessage(`${code} panoya kopyalandı.`)
    } catch {
      setCouponMessage('Kopyalama başarısız. Kodu manuel olarak kopyalayabilirsiniz.')
    }
  }

  const spendForReward = Math.max(0, 5000 - spinState.totalSpend)

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-2xl border border-[#9b7a57]/25 bg-[#fdf8f0] p-6 shadow-[0_20px_60px_-40px_rgba(83,58,39,0.45)]">
        <p className="text-xs uppercase tracking-[0.22em] text-[#8a6b4b]">Eftalia Deri Atölyesi</p>
        <h1 className="mt-2 font-serif text-3xl text-[#4d3523] sm:text-4xl">Merhaba {fullName || 'Değerli Üyemiz'}</h1>
        <p className="mt-2 text-sm text-[#7d5f45]">{profileForm.email}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
        <AccountSidebar />

        <div className="rounded-2xl border border-[#9b7a57]/25 bg-[#fffaf2] p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl text-[#4d3523]">Hesabım</h2>
              <div className="rounded-2xl border border-[#9b7a57]/25 bg-white/80 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[#8a6b4b]">Şans Çarkı</p>
                <h3 className="mt-2 text-lg font-semibold text-[#4d3523]">
                  5.000 TL üzeri alışverişte tek seferlik çark hakkı
                </h3>
                <p className="mt-2 text-sm text-[#7d5f45]">
                  Kullanıcı başına sadece 1 kez kullanılabilir.
                </p>
                <div className="mt-3 rounded-lg border border-[#9b7a57]/20 bg-[#f8efe1] px-3 py-2 text-sm text-[#6d4f35]">
                  Durum:{' '}
                  <strong>{spinState.remainingSpins > 0 ? 'Kullanılabilir' : spinState.usedSpins ? 'Kullanıldı' : 'Kilitli'}</strong>
                </div>
                {spinState.message ? (
                  <p className="mt-3 rounded-lg border border-[#9b7a57]/20 bg-[#f8efe1] px-3 py-2 text-sm text-[#6d4f35]">
                    {spinState.message}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={handleOpenSpinWheel}
                  className="mt-4 rounded-lg bg-[#5B1F2A] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4a1822] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Çarkıfeleğe Git
                </button>
                <Link
                  href="/tum-urunler"
                  className="ml-2 mt-4 inline-flex rounded-lg border border-[#9b7a57]/30 bg-white px-4 py-2.5 text-sm font-medium text-[#6d4f35] transition-colors hover:bg-[#f7f0e6]"
                >
                  Alışverişe Devam Et
                </Link>
                {spinState.usedSpins > 0 ? (
                  <p className="mt-3 text-sm text-emerald-700">
                    Çark hakkınız kullanıldı, kuponunuz hesabınızda kayıtlı.
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-[#7d5f45]">
                    Çark hakkını açmak için kalan: <strong>{spendForReward.toLocaleString('tr-TR')} TL</strong>
                  </p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {dashboardCards.map((card) => {
                  const className =
                    'rounded-2xl border border-[#9b7a57]/25 bg-white/75 p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-20px_rgba(83,58,39,0.55)]'
                  const inner = (
                    <>
                      <card.icon className="h-6 w-6 text-[#8a6b4b]" />
                      <p className="mt-4 text-lg font-semibold text-[#4d3523]">{card.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-[#7d5f45]">{card.description}</p>
                    </>
                  )
                  if (card.href) {
                    return (
                      <Link key={card.key} href={card.href} className={className}>
                        {inner}
                      </Link>
                    )
                  }
                  return (
                    <button
                      key={card.key}
                      type="button"
                      onClick={() => setTab(card.key as TabKey)}
                      className={className}
                    >
                      {inner}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <AccountOrdersSection orders={orders} />
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 className="font-serif text-2xl text-[#4d3523]">Üyelik Bilgilerim</h2>
              <div className="mt-4 rounded-xl border border-[#9b7a57]/20 bg-white/80 p-4">
                <p className="text-sm font-medium text-[#4d3523]">Google hesabı bağlantısı</p>
                <p className="mt-1 text-xs leading-relaxed text-[#7d5f45]">
                  Hesabınızı Google ile bağladığınızda bir sonraki girişte e-posta/şifre yazmadan devam edebilirsiniz.
                </p>
                <button
                  type="button"
                  onClick={handleLinkGoogle}
                  disabled={isLinkingGoogle}
                  className="mt-3 rounded-lg border border-[#9b7a57]/30 bg-[#fff9ef] px-4 py-2 text-sm font-medium text-[#6d4f35] transition-colors hover:bg-white disabled:opacity-70"
                >
                  {isLinkingGoogle ? 'Google bağlantısı kuruluyor...' : 'Google hesabını bağla'}
                </button>
                {googleLinkError ? (
                  <p className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    {googleLinkError}
                  </p>
                ) : null}
                {googleLinkMessage ? (
                  <p className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                    {googleLinkMessage}
                  </p>
                ) : null}
              </div>
              <form onSubmit={handleProfileSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
                <input
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                  className="rounded-lg border border-[#9b7a57]/30 bg-white px-4 py-3 text-sm text-[#4d3523] outline-none focus:border-[#6d4f35]"
                  placeholder="Ad"
                />
                <input
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                  className="rounded-lg border border-[#9b7a57]/30 bg-white px-4 py-3 text-sm text-[#4d3523] outline-none focus:border-[#6d4f35]"
                  placeholder="Soyad"
                />
                <input
                  value={profileForm.email}
                  readOnly
                  className="rounded-lg border border-[#9b7a57]/20 bg-[#f5ede2] px-4 py-3 text-sm text-[#6d4f35] sm:col-span-2"
                />
                <input
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="rounded-lg border border-[#9b7a57]/30 bg-white px-4 py-3 text-sm text-[#4d3523] outline-none focus:border-[#6d4f35]"
                  placeholder="Telefon"
                />
                <input
                  type="password"
                  value={profileForm.password}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="rounded-lg border border-[#9b7a57]/30 bg-white px-4 py-3 text-sm text-[#4d3523] outline-none focus:border-[#6d4f35]"
                  placeholder="Yeni Şifre (opsiyonel)"
                />
                {profileError ? (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">
                    {profileError}
                  </p>
                ) : null}
                {profileMessage ? (
                  <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 sm:col-span-2">
                    {profileMessage}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-fit rounded-lg bg-[#5B1F2A] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4a1822] disabled:opacity-70 sm:col-span-2"
                >
                  {isSavingProfile ? 'Kaydediliyor...' : 'Bilgileri Güncelle'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <h2 className="font-serif text-2xl text-[#4d3523]">Adres Defterim</h2>
              <form onSubmit={handleAddressSubmit} className="mt-5 grid gap-3 sm:grid-cols-2">
                <input
                  value={addressForm.firstName}
                  onChange={(e) => setAddressForm((prev) => ({ ...prev, firstName: e.target.value }))}
                  className="rounded-lg border border-[#9b7a57]/30 bg-white px-3 py-2.5 text-sm text-[#4d3523] outline-none focus:border-[#6d4f35]"
                  placeholder="Ad"
                />
                <input
                  value={addressForm.lastName}
                  onChange={(e) => setAddressForm((prev) => ({ ...prev, lastName: e.target.value }))}
                  className="rounded-lg border border-[#9b7a57]/30 bg-white px-3 py-2.5 text-sm text-[#4d3523] outline-none focus:border-[#6d4f35]"
                  placeholder="Soyad"
                />
                <input
                  value={addressForm.address1}
                  onChange={(e) => setAddressForm((prev) => ({ ...prev, address1: e.target.value }))}
                  className="rounded-lg border border-[#9b7a57]/30 bg-white px-3 py-2.5 text-sm text-[#4d3523] outline-none focus:border-[#6d4f35] sm:col-span-2"
                  placeholder="Adres"
                />
                <TurkiyeIlIlceFields
                  ilValue={addressForm.city}
                  ilceValue={addressForm.province}
                  mahalleValue={addressForm.address2}
                  onIlChange={(il) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      city: il,
                      province: '',
                      address2: '',
                    }))
                  }
                  onIlceChange={(ilce) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      province: ilce,
                      address2: '',
                    }))
                  }
                  onMahalleChange={(mahalle) =>
                    setAddressForm((prev) => ({ ...prev, address2: mahalle }))
                  }
                />
                {addressError ? (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">
                    {addressError}
                  </p>
                ) : null}
                {addressMessage ? (
                  <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 sm:col-span-2">
                    {addressMessage}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2 sm:col-span-2">
                  <button
                    type="submit"
                    disabled={isAddressSubmitting}
                    className="rounded-lg bg-[#5B1F2A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a1822] disabled:opacity-70"
                  >
                    {editingAddressId
                      ? isAddressSubmitting
                        ? 'Güncelleniyor...'
                        : 'Adresi Güncelle'
                      : isAddressSubmitting
                      ? 'Ekleniyor...'
                      : 'Yeni Adres Ekle'}
                  </button>
                  {editingAddressId ? (
                    <button
                      type="button"
                      onClick={resetAddressForm}
                      className="rounded-lg border border-[#9b7a57]/30 bg-white px-4 py-2 text-sm text-[#6d4f35]"
                    >
                      İptal
                    </button>
                  ) : null}
                </div>
              </form>

              <div className="mt-6 space-y-3">
                {addresses.length ? (
                  addresses.map((address) => (
                    <div key={address.id} className="rounded-xl border border-[#9b7a57]/20 bg-white/75 p-4">
                      <p className="text-sm font-semibold text-[#4d3523]">
                        {[address.firstName, address.lastName].filter(Boolean).join(' ') || 'Adres'}
                      </p>
                      <p className="mt-1 text-sm text-[#7d5f45]">
                        {[address.address1, address.address2, address.city, address.province, address.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditAddress(address)}
                          className="rounded-md border border-[#9b7a57]/30 px-3 py-1.5 text-xs text-[#6d4f35]"
                        >
                          Düzenle
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(address.id)}
                          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#9b7a57]/30 bg-gradient-to-br from-white to-[#f8efe1] p-6 text-[#7d5f45]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#8a6b4b]">İlk Adresini Kaydet</p>
                        <p className="mt-2 text-lg font-semibold text-[#4d3523]">Henüz kayıtlı bir adresiniz bulunmuyor.</p>
                        <p className="mt-1 text-sm leading-relaxed text-[#7d5f45]">
                          Hızlı ödeme ve kolay sipariş takibi için adres defterinize bir adres ekleyin.
                        </p>
                      </div>
                      <div className="rounded-xl border border-[#9b7a57]/25 bg-white/80 px-4 py-3 text-center">
                        <p className="text-2xl font-serif text-[#5B1F2A]">0</p>
                        <p className="text-xs uppercase tracking-[0.12em] text-[#8a6b4b]">Adres</p>
                      </div>
                    </div>
                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={() => {
                          resetAddressForm()
                          const firstName = profileForm.firstName.trim()
                          const lastName = profileForm.lastName.trim()
                          setAddressForm((prev) => ({
                            ...prev,
                            firstName: prev.firstName || firstName,
                            lastName: prev.lastName || lastName,
                            phone: prev.phone || profileForm.phone,
                          }))
                        }}
                        className="rounded-lg bg-[#5B1F2A] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4a1822]"
                      >
                        İlk Adresi Ekle
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <h2 className="font-serif text-2xl text-[#4d3523]">Favorilerim</h2>
              {favorites.length ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {favorites.map((item) => (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-[#9b7a57]/20 bg-white/80 shadow-[0_12px_28px_-22px_rgba(83,58,39,0.55)]"
                    >
                      <Link href={`/product/${item.slug}`} className="block">
                        <div className="relative aspect-[4/3] bg-[#f8efe2]">
                          {item.images[0] ? (
                            <Image
                              src={item.images[0]}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          ) : null}
                        </div>
                      </Link>
                      <div className="space-y-3 p-4">
                        <Link href={`/product/${item.slug}`} className="block">
                          <p className="line-clamp-2 text-sm font-medium text-[#4d3523]">{item.name}</p>
                        </Link>
                        <div className="flex items-center gap-2">
                          {typeof item.originalPrice === 'number' && item.originalPrice > item.price ? (
                            <span className="text-xs text-[#8f7b66] line-through">
                              {new Intl.NumberFormat('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                                minimumFractionDigits: 2,
                              }).format(item.originalPrice)}
                            </span>
                          ) : null}
                          <span className="text-base font-semibold text-[#5B1F2A]">
                            {new Intl.NumberFormat('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                              minimumFractionDigits: 2,
                            }).format(item.price)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-xs ${item.inStock === false ? 'text-rose-700' : 'text-[#7d5f45]'}`}>
                            {item.inStock === false ? 'Stokta yok' : 'Stokta'}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeFavorite(item.id)}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100"
                          >
                            Favoriden Çıkar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-[#9b7a57]/30 bg-gradient-to-br from-white to-[#f8efe1] p-6 text-[#7d5f45]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#8a6b4b]">Favori Listenizi Oluşturun</p>
                      <p className="mt-2 text-lg font-semibold text-[#4d3523]">Favori listeniz henüz boş.</p>
                      <p className="mt-1 text-sm leading-relaxed text-[#7d5f45]">
                        Beğendiğiniz ürünleri kalp ikonuna ekleyin, sonra tek ekrandan kolayca karşılaştırın.
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#9b7a57]/25 bg-white/80 px-4 py-3 text-center">
                      <p className="text-2xl font-serif text-[#5B1F2A]">0</p>
                      <p className="text-xs uppercase tracking-[0.12em] text-[#8a6b4b]">Favori</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href="/tum-urunler"
                      className="rounded-lg bg-[#5B1F2A] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4a1822]"
                    >
                      Ürünleri Keşfet
                    </Link>
                    <Link
                      href="/tum-urunler?sort=best"
                      className="rounded-lg border border-[#9b7a57]/30 bg-white px-4 py-2.5 text-sm font-medium text-[#6d4f35] transition-colors hover:bg-[#f7f0e6]"
                    >
                      Popüler Ürünleri Gör
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'coupons' && (
            <div>
              <h2 className="font-serif text-2xl text-[#4d3523]">Kuponlarım</h2>
              <p className="mt-2 text-sm text-[#7d5f45]">
                Çarkıfelek veya kampanyalardan kazandığınız kuponlar burada listelenir.
              </p>

              {spinState.rewards.length ? (
                <div className="mt-5 rounded-2xl border border-[#9b7a57]/20 bg-white/80 p-5">
                  <div className="space-y-3">
                    {spinState.rewards.map((reward, index) => (
                      <div
                        key={`${reward.code}-${index}`}
                        className="flex items-start justify-between gap-3 rounded-xl border border-[#9b7a57]/20 bg-[#fff9ef] p-3"
                      >
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-[#8a6b4b]">
                            {reward.label || 'Kupon'} • Hak #{reward.spinIndex || index + 1}
                          </p>
                          <p className="mt-2 font-mono text-xl font-semibold tracking-wide text-[#5B1F2A]">
                            {reward.code}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCoupon(reward.code)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#9b7a57]/30 bg-white px-3 py-2 text-xs font-medium text-[#6d4f35] transition-colors hover:bg-[#f7f0e6]"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Kopyala
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-lg border border-[#9b7a57]/20 bg-[#f8efe1] p-3 text-sm text-[#6d4f35]">
                    <p className="font-medium text-[#4d3523]">Nasıl kullanılır?</p>
                    <ol className="mt-2 list-decimal space-y-1 pl-5">
                      <li>Ürünleri sepete ekleyin ve ödeme adımına geçin.</li>
                      <li>“İndirim kodu” alanına kupon kodunu yapıştırın.</li>
                      <li>“Uygula” deyin; indirim toplam tutardan düşer.</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-[#9b7a57]/30 bg-gradient-to-br from-white to-[#f8efe1] p-6">
                  <div className="flex items-center gap-2 text-[#6d4f35]">
                    <TicketPercent className="h-5 w-5" />
                    <p className="text-sm">Henüz tanımlı bir kuponunuz yok.</p>
                  </div>
                  <p className="mt-2 text-sm text-[#7d5f45]">
                    Çarkıfelek uygunluğunu sağladığınızda kazandığınız kuponlar burada otomatik görünür.
                  </p>
                </div>
              )}

              {couponMessage ? (
                <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {couponMessage}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
