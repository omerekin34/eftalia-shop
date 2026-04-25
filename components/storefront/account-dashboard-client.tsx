'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Gift, Heart, MapPin, Package, Star, User, UserCog } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AccountSidebar, type AccountNavTabKey } from '@/components/storefront/account-sidebar'

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
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  addresses?: CustomerAddress[]
}

type CustomerOrder = {
  id: string
  orderNumber: number
  processedAt?: string
  financialStatus?: string
  fulfillmentStatus?: string
  totalPrice?: {
    amount?: string
    currencyCode?: string
  }
}

type TabKey = AccountNavTabKey

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
    key: 'coupons',
    title: 'Kuponlarım',
    description: 'Hesabınıza tanımlı indirim kuponlarını buradan takip edin.',
    icon: Gift,
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

function formatMoney(amount?: string, currency = 'TRY') {
  const numeric = Number(amount || 0)
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(numeric)
}

function formatOrderDate(date?: string) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

function getTabFromParam(value: string | null): TabKey {
  if (value === 'orders') return 'orders'
  if (value === 'favorites') return 'favorites'
  if (value === 'addresses') return 'addresses'
  if (value === 'coupons') return 'coupons'
  if (value === 'profile') return 'profile'
  return 'dashboard'
}

export function AccountDashboardClient({
  customer,
  orders,
}: {
  customer: CustomerDetails
  orders: CustomerOrder[]
}) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
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
              <h2 className="font-serif text-2xl text-[#4d3523]">Panel</h2>
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
              <h2 className="font-serif text-2xl text-[#4d3523]">Siparişlerim</h2>
              <div className="mt-5 space-y-3">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order.id} className="rounded-xl border border-[#9b7a57]/20 bg-white/75 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[#4d3523]">Sipariş #{order.orderNumber}</p>
                        <span className="rounded-full border border-[#9b7a57]/25 px-2.5 py-1 text-xs text-[#6d4f35]">
                          {order.fulfillmentStatus || order.financialStatus || 'Hazırlanıyor'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[#7d5f45]">{formatOrderDate(order.processedAt)}</p>
                      <p className="mt-1 text-sm font-medium text-[#4d3523]">
                        {formatMoney(order?.totalPrice?.amount, order?.totalPrice?.currencyCode)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-[#9b7a57]/25 bg-white/60 p-5 text-sm text-[#7d5f45]">
                    Henüz bir siparişiniz bulunmamaktadır.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 className="font-serif text-2xl text-[#4d3523]">Üyelik Bilgilerim</h2>
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
                <input
                  value={addressForm.city}
                  onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.target.value }))}
                  className="rounded-lg border border-[#9b7a57]/30 bg-white px-3 py-2.5 text-sm text-[#4d3523] outline-none focus:border-[#6d4f35]"
                  placeholder="İl"
                />
                <input
                  value={addressForm.province}
                  onChange={(e) => setAddressForm((prev) => ({ ...prev, province: e.target.value }))}
                  className="rounded-lg border border-[#9b7a57]/30 bg-white px-3 py-2.5 text-sm text-[#4d3523] outline-none focus:border-[#6d4f35]"
                  placeholder="İlçe"
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
                  <div className="rounded-xl border border-dashed border-[#9b7a57]/25 bg-white/60 p-5 text-sm text-[#7d5f45]">
                    Henüz kayıtlı bir adresiniz bulunmuyor.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'coupons' && (
            <div>
              <h2 className="font-serif text-2xl text-[#4d3523]">Kuponlarım</h2>
              <div className="mt-5 rounded-xl border border-dashed border-[#9b7a57]/25 bg-white/60 p-5 text-sm text-[#7d5f45]">
                Bu alanda hesabınıza tanımlı indirim kuponları görünecektir.
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <h2 className="font-serif text-2xl text-[#4d3523]">Favorilerim</h2>
              <div className="mt-5 rounded-xl border border-dashed border-[#9b7a57]/25 bg-white/60 p-5 text-sm text-[#7d5f45]">
                Favori listeniz henüz boş.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
