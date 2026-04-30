'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Loader2, Lock, MapPin, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { useCart } from '@/components/storefront/cart-context'

type CheckoutSavedAddress = {
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

type ShippingPolicySummary = {
  title?: string
  url?: string
  excerpt?: string
} | null

export default function OdemePage() {
  const { items, totalItems, clearCart } = useCart()
  const [phase, setPhase] = useState<'idle' | 'redirecting' | 'error'>('idle')
  const [checkoutError, setCheckoutError] = useState('')
  const [addressesLoaded, setAddressesLoaded] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<CheckoutSavedAddress[]>([])
  const [defaultAddressId, setDefaultAddressId] = useState('')
  const [selectedCustomerAddressId, setSelectedCustomerAddressId] = useState('')
  const [shippingPolicy, setShippingPolicy] = useState<ShippingPolicySummary>(null)
  const attemptRef = useRef<string | null>(null)

  const linesKey = useMemo(
    () => items.map((item) => `${item.id}:${item.quantity}`).sort().join('|'),
    [items]
  )

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 99.9
  const total = subtotal + shipping
  const needsAddressChoice = savedAddresses.length > 1

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const response = await fetch('/api/account/checkout-addresses', { credentials: 'same-origin' })
        const data = (await response.json()) as {
          addresses?: CheckoutSavedAddress[]
          defaultAddressId?: string | null
        }
        if (cancelled) return
        const list = Array.isArray(data.addresses) ? data.addresses : []
        setSavedAddresses(list)
        const def = data.defaultAddressId || ''
        setDefaultAddressId(def)
        const initial =
          def && list.some((a) => a.id === def) ? def : list[0]?.id || ''
        setSelectedCustomerAddressId(initial)
      } catch {
        if (!cancelled) {
          setSavedAddresses([])
          setDefaultAddressId('')
          setSelectedCustomerAddressId('')
        }
      } finally {
        if (!cancelled) setAddressesLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const response = await fetch('/api/storefront/shipping-policy', { cache: 'no-store' })
        const data = (await response.json()) as { shippingPolicy?: ShippingPolicySummary }
        if (!cancelled) {
          setShippingPolicy(data.shippingPolicy || null)
        }
      } catch {
        if (!cancelled) {
          setShippingPolicy(null)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const startShopifyCheckout = useCallback(
    async (explicitCustomerAddressId?: string) => {
      setCheckoutError('')
      if (!items.length) return

      const customerAddressId =
        explicitCustomerAddressId ??
        (savedAddresses.length > 1 ? selectedCustomerAddressId : undefined)

      setPhase('redirecting')
      try {
        const response = await fetch('/api/shopify/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            lines: items.map((item) => ({
              merchandiseId: item.id,
              quantity: item.quantity,
            })),
            ...(customerAddressId ? { customerAddressId } : {}),
          }),
        })
        const data = (await response.json()) as { checkoutUrl?: string; error?: string }
        if (!response.ok) {
          throw new Error(data?.error || 'Ödeme sayfasına geçilemedi.')
        }
        if (!data.checkoutUrl) {
          throw new Error('Ödeme bağlantısı alınamadı.')
        }
        // Shopify checkout'a geçerken sepeti temizle; sipariş dönüşünde ürünler tekrar görünmesin.
        clearCart()
        window.location.assign(data.checkoutUrl)
      } catch (err) {
        setCheckoutError(err instanceof Error ? err.message : 'Bir hata oluştu.')
        setPhase('error')
      }
    },
    [items, savedAddresses.length, selectedCustomerAddressId, clearCart]
  )

  useEffect(() => {
    if (!linesKey || !items.length) {
      setPhase('idle')
      return
    }
    if (!addressesLoaded) return
    if (needsAddressChoice) return
    if (attemptRef.current === linesKey) return
    attemptRef.current = linesKey
    void startShopifyCheckout()
  }, [linesKey, items.length, addressesLoaded, needsAddressChoice, startShopifyCheckout])

  const handleRetry = () => {
    attemptRef.current = null
    void startShopifyCheckout()
  }

  const confirmAddressAndCheckout = () => {
    if (!linesKey) return
    attemptRef.current = linesKey
    void startShopifyCheckout(selectedCustomerAddressId)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pb-20 pt-28 sm:pt-32">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <nav className="flex items-center gap-2 text-sm text-bronze/60">
              <Link href="/" className="transition-colors hover:text-bronze">
                Ana Sayfa
              </Link>
              <span>/</span>
              <Link href="/tum-urunler" className="transition-colors hover:text-bronze">
                Alışveriş
              </Link>
              <span>/</span>
              <span className="text-bronze">Ödeme</span>
            </nav>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border border-bronze/15 bg-white p-6 shadow-sm sm:p-8"
            >
              <h1 className="font-serif text-3xl text-bronze-dark sm:text-4xl">Güvenli ödeme</h1>
              <p className="mt-2 text-sm leading-relaxed text-bronze/65">
                Ödemeniz <strong className="font-medium text-bronze-dark">Shopify Checkout</strong> üzerinden
                tamamlanır. Kart ve kişisel ödeme bilgileriniz bu sitede işlenmez; bankacılık düzeyinde şifreleme ile
                mağazanızın resmi ödeme ekranında güvende kalır.
              </p>

              {items.length > 0 ? (
                <div className="mt-8 rounded-2xl border border-bronze/10 bg-gradient-to-br from-[#fffdf9] to-[#fff5ec] p-6">
                  <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start sm:gap-5">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-bronze/15 bg-white shadow-sm"
                      aria-hidden
                    >
                      {phase === 'redirecting' || !addressesLoaded ? (
                        <Loader2 className="h-7 w-7 animate-spin text-bronze" />
                      ) : needsAddressChoice ? (
                        <MapPin className="h-7 w-7 text-bronze" />
                      ) : (
                        <Lock className="h-7 w-7 text-bronze" />
                      )}
                    </div>
                    <div className="mt-4 min-w-0 sm:mt-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bronze/60">
                        {!addressesLoaded
                          ? 'Hazırlanıyor'
                          : phase === 'redirecting'
                            ? 'Yönlendirme'
                            : phase === 'error'
                              ? 'Bağlantı sorunu'
                              : needsAddressChoice
                                ? 'Teslimat'
                                : 'Hazırlanıyor'}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-bronze-dark">
                        {!addressesLoaded
                          ? 'Hesabınız ve adresler kontrol ediliyor…'
                          : phase === 'redirecting'
                            ? 'Güvenli ödeme sayfasına aktarılıyorsunuz…'
                            : phase === 'error'
                              ? 'Ödeme bağlantısı kurulamadı'
                              : needsAddressChoice
                                ? 'Teslimat adresinizi seçin'
                                : 'Sepetiniz doğrulanıyor…'}
                      </p>
                      <p className="mt-2 text-sm text-bronze/70">
                        {!addressesLoaded
                          ? 'Adres defteriniz varsa ödeme ekranında kullanılacak şekilde bağlanır.'
                          : phase === 'redirecting'
                            ? 'Sayfa birkaç saniye içinde açılmazsa aşağıdaki düğmeyi kullanın.'
                            : phase === 'error'
                              ? 'Bağlantıyı yeniden kurmayı veya manuel açmayı deneyebilirsiniz.'
                              : needsAddressChoice
                                ? 'Shopify ödeme ekranında kargo yöntemi ve teslimat seçenekleri gösterilir.'
                                : 'Otomatik yönlendirme başlatılıyor; lütfen bu ekranda kalın.'}
                      </p>
                    </div>
                  </div>

                  {addressesLoaded && needsAddressChoice ? (
                    <div className="mt-6 space-y-3 rounded-xl border border-bronze/15 bg-white/80 p-4 text-left">
                      <p className="text-xs font-medium uppercase tracking-wide text-bronze/55">
                        Adres defterim
                      </p>
                      <ul className="space-y-2">
                        {savedAddresses.map((address) => {
                          const line = [
                            address.address1,
                            address.address2,
                            address.city,
                            address.province,
                            address.zip,
                          ]
                            .filter(Boolean)
                            .join(', ')
                          const label =
                            [address.firstName, address.lastName].filter(Boolean).join(' ') || 'Adres'
                          return (
                            <li key={address.id}>
                              <label className="flex cursor-pointer gap-3 rounded-lg border border-bronze/15 bg-ivory-warm/80 p-3 transition-colors has-[:checked]:border-bronze/40 has-[:checked]:bg-white">
                                <input
                                  type="radio"
                                  name="checkout-address"
                                  className="mt-1 shrink-0 accent-bronze"
                                  checked={selectedCustomerAddressId === address.id}
                                  onChange={() => setSelectedCustomerAddressId(address.id)}
                                />
                                <span className="min-w-0 text-sm">
                                  <span className="font-medium text-bronze-dark">{label}</span>
                                  {address.id === defaultAddressId ? (
                                    <span className="ml-2 rounded-md bg-bronze/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-bronze">
                                      Varsayılan
                                    </span>
                                  ) : null}
                                  <span className="mt-1 block text-bronze/75">{line}</span>
                                </span>
                              </label>
                            </li>
                          )
                        })}
                      </ul>
                      <Link
                        href="/account?tab=addresses"
                        className="inline-block text-xs font-medium text-bronze underline-offset-2 hover:underline"
                      >
                        Adres defterinde düzenle
                      </Link>
                    </div>
                  ) : null}

                  {addressesLoaded ? (
                    <div className="mt-6 rounded-xl border border-[#9b7a57]/20 bg-gradient-to-br from-[#fffdf8] via-white to-[#f8efe1] p-4 text-left shadow-[0_22px_44px_-36px_rgba(83,58,39,0.45)]">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-bronze/55">Kargo adımı</p>
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#9b7a57]/20 bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#6d4f35]">
                          <Sparkles className="h-3 w-3 text-[#b8956a]" />
                          Shopify checkout
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-bronze/75">
                        Kargo yöntemi, ücret ve tahmini teslim süresi resmi Shopify ödeme ekranında seçilir ve kesinleşir.
                      </p>
                      {shippingPolicy?.excerpt ? (
                        <p className="mt-2 rounded-lg border border-bronze/15 bg-white/80 px-3 py-2 text-xs leading-relaxed text-bronze/70">
                          {shippingPolicy.excerpt}
                        </p>
                      ) : null}
                      {shippingPolicy?.url ? (
                        <Link
                          href={shippingPolicy.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex text-xs font-medium text-bronze underline-offset-2 hover:underline"
                        >
                          {shippingPolicy.title || 'Kargo politikası'} kaynağını görüntüle
                        </Link>
                      ) : null}
                    </div>
                  ) : null}

                  <ul className="mt-6 grid gap-3 text-sm text-bronze/80 sm:grid-cols-3">
                    <li className="flex items-start gap-2 rounded-xl border border-white/60 bg-white/70 px-3 py-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
                      <span>PCI uyumlu altyapı, 3D Secure ve kart sağlayıcı güvenliği</span>
                    </li>
                    <li className="flex items-start gap-2 rounded-xl border border-white/60 bg-white/70 px-3 py-3">
                      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
                      <span>Kart bilgisi Eftalia sitesinde saklanmaz veya görüntülenmez</span>
                    </li>
                    <li className="flex items-start gap-2 rounded-xl border border-white/60 bg-white/70 px-3 py-3">
                      <Truck className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
                      <span>Teslimat ve fatura adımları aynı güvenli ödeme akışında</span>
                    </li>
                  </ul>

                  {checkoutError ? (
                    <p className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                      {checkoutError}
                    </p>
                  ) : null}

                  <div className="mt-6 rounded-xl border border-[#9b7a57]/18 bg-white/75 p-3 shadow-[0_18px_40px_-34px_rgba(83,58,39,0.45)]">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                        <ShieldCheck className="h-3 w-3" />
                        Güvenli ödeme
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#9b7a57]/20 bg-[#fff9ef] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#6d4f35]">
                        <Lock className="h-3 w-3" />
                        SSL korumalı
                      </span>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                    {phase === 'error' ? (
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="inline-flex flex-1 items-center justify-center rounded-xl bg-bronze px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-bronze-dark"
                      >
                        Tekrar dene
                      </button>
                    ) : null}
                    {addressesLoaded && phase !== 'error' ? (
                      <button
                        type="button"
                        onClick={() => void confirmAddressAndCheckout()}
                        disabled={
                          phase === 'redirecting' || (needsAddressChoice && !selectedCustomerAddressId)
                        }
                        className="inline-flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-[#5B1F2A] via-[#7f2b3b] to-[#5B1F2A] px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_16px_34px_-22px_rgba(91,31,42,0.75)] transition-all hover:brightness-105 hover:shadow-[0_22px_44px_-26px_rgba(91,31,42,0.85)] disabled:opacity-60"
                      >
                        {phase === 'redirecting' ? 'Yönlendiriliyor…' : 'Güvenli ödeme ekranına geç'}
                      </button>
                    ) : null}
                    {addressesLoaded && phase === 'error' ? (
                      <button
                        type="button"
                        onClick={() => void startShopifyCheckout()}
                        className="inline-flex flex-1 items-center justify-center rounded-xl border border-bronze/25 bg-white px-6 py-3.5 text-sm font-medium text-bronze transition-colors hover:bg-ivory-warm disabled:opacity-60"
                      >
                        Ödeme sayfasını elle aç
                      </button>
                    ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 rounded-xl border border-bronze/15 bg-ivory-warm p-6 text-center sm:text-left">
                  <p className="text-sm text-bronze/75">Sepetiniz boş. Önce ürün ekleyerek güvenli ödemeye geçebilirsiniz.</p>
                  <Link
                    href="/tum-urunler"
                    className="mt-4 inline-flex items-center justify-center rounded-xl bg-bronze px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-bronze-dark"
                  >
                    Alışverişe git
                  </Link>
                </div>
              )}

              <p className="mt-6 text-xs text-bronze/50">
                Eski tarayıcı verisinde geçersiz ürün kimliği kaldıysa sepeti temizleyip ürünleri yeniden ekleyin.
              </p>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.06 }}
              className="h-fit rounded-2xl border border-bronze/15 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-medium text-bronze-dark">Sipariş özeti</h2>
              <p className="mt-1 text-xs text-bronze/55">{totalItems} ürün</p>

              <div className="mt-4 space-y-3">
                {items.length > 0 ? (
                  items.map((item) => (
                    <div key={`${item.id}-${item.color || 'renksiz'}`} className="flex gap-3 rounded-lg border border-bronze/10 bg-ivory-warm p-3">
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-bronze/15 bg-white">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-bronze-dark">{item.name}</p>
                        <p className="text-xs text-bronze/60">Adet: {item.quantity}</p>
                        <p className="text-xs text-bronze/70">
                          {(item.price * item.quantity).toLocaleString('tr-TR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          TL
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg border border-bronze/15 bg-ivory-warm p-3 text-sm text-bronze/70">
                    Sepetinizde ürün bulunmuyor.
                  </p>
                )}
              </div>

              <div className="mt-5 space-y-2 border-t border-bronze/10 pt-4 text-sm">
                <div className="flex items-center justify-between text-bronze/70">
                  <span>Ara toplam</span>
                  <span>
                    {subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                  </span>
                </div>
                <div className="flex items-center justify-between text-bronze/70">
                  <span>Kargo (tahmini)</span>
                  <span>
                    {shipping === 0
                      ? 'Ücretsiz'
                      : `${shipping.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-bronze/50">
                  {shippingPolicy?.excerpt
                    ? `${shippingPolicy.excerpt} Kesin kargo ücreti ve teslimat seçenekleri Shopify ödeme adımında hesaplanır.`
                    : 'Kesin kargo ücreti, kargo yöntemi, vergi ve indirimler Shopify ödeme adımında hesaplanır.'}
                </p>
                <div className="flex items-center justify-between pt-1 text-base font-semibold text-bronze-dark">
                  <span>Genel toplam (tahmini)</span>
                  <span>
                    {total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-2 rounded-lg border border-bronze/10 bg-ivory-warm p-3 text-xs text-bronze/70">
                <p className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 shrink-0" /> Ödeme: Shopify güvenli altyapısı
                </p>
                <p className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5 shrink-0" /> Kargo seçenekleri ödeme sırasında
                </p>
                <p className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> Mağaza politikalarınıza uygun iade süreçleri
                </p>
              </div>
            </motion.aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
