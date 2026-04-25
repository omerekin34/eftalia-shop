'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, ShoppingBag, Menu, X, LogIn, Heart, Package, Mail, ChevronRight, Minus, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/components/storefront/cart-context'

const menuCategories = [
  { name: 'TÜM ÜRÜNLER', href: '/tum-urunler' },
  { name: 'YENİ GELENLER', href: '/tum-urunler?filtre=yeni', badge: 'fire' },
  { name: 'ÇOK SATANLAR', href: '/tum-urunler?filtre=cok-satanlar' },
  { name: 'ÇANTA', href: '/tum-urunler?kategori=canta' },
  { name: 'SÜET ÇANTA', href: '/tum-urunler?kategori=suet-canta' },
  { name: 'OMUZ ÇANTASI', href: '/tum-urunler?kategori=omuz-cantasi' },
  { name: 'ÇAPRAZ ÇANTA', href: '/tum-urunler?kategori=capraz-canta' },
  { name: 'BAGET ÇANTA', href: '/tum-urunler?kategori=baget-canta' },
  { name: 'EL ÇANTASI', href: '/tum-urunler?kategori=el-cantasi' },
  { name: 'MAKYAJ ÇANTASI', href: '/tum-urunler?kategori=makyaj-cantasi' },
  { name: 'LAPTOP ÇANTASI', href: '/tum-urunler?kategori=laptop-cantasi' },
  { name: 'SPOR ÇANTASI', href: '/tum-urunler?kategori=spor-cantasi' },
  { name: 'CÜZDAN VE KARTLIKLAR', href: '/tum-urunler?kategori=cuzdan-kartlik' },
  { name: 'TARAK', href: '/tum-urunler?kategori=tarak' },
  { name: 'AHŞAP TARAK', href: '/tum-urunler?kategori=ahsap-tarak' },
  { name: 'KEMİK TARAK', href: '/tum-urunler?kategori=kemik-tarak' },
  { name: 'CEP TARAĞI', href: '/tum-urunler?kategori=cep-taragi' },
  { name: 'SAÇ FIRÇASI', href: '/tum-urunler?kategori=sac-fircasi' },
]

const accountLinks = [
  { name: 'Hesabım', href: '/account', icon: User },
  { name: 'Favorilerim', href: '/account?tab=favorites', icon: Heart },
  { name: 'Siparişlerim', href: '/account?tab=orders', icon: Package },
  { name: 'İletişim', href: '/iletisim', icon: Mail },
]

const searchCategories = [
  { name: 'Süet Çanta', href: '/tum-urunler?kategori=suet-canta' },
  { name: 'Omuz Çantası', href: '/tum-urunler?kategori=omuz-cantasi' },
  { name: 'Çapraz Çanta', href: '/tum-urunler?kategori=capraz-canta' },
  { name: 'Baget Çanta', href: '/tum-urunler?kategori=baget-canta' },
  { name: 'El Çantası', href: '/tum-urunler?kategori=el-cantasi' },
  { name: 'Makyaj Çantası', href: '/tum-urunler?kategori=makyaj-cantasi' },
  { name: 'Laptop Çantası', href: '/tum-urunler?kategori=laptop-cantasi' },
  { name: 'Spor Çantası', href: '/tum-urunler?kategori=spor-cantasi' },
  { name: 'Cüzdan ve Kartlıklar', href: '/tum-urunler?kategori=cuzdan-kartlik' },
  { name: 'Kadın Cüzdan', href: '/tum-urunler?kategori=kadin-cuzdan' },
  { name: 'Erkek Cüzdan', href: '/tum-urunler?kategori=erkek-cuzdan' },
  { name: 'Kartlık', href: '/tum-urunler?kategori=kartlik' },
  { name: 'Pasaportluk', href: '/tum-urunler?kategori=pasaportluk' },
  { name: 'Telefon Cüzdanı', href: '/tum-urunler?kategori=telefon-cuzdani' },
  { name: 'Ahşap Tarak', href: '/tum-urunler?kategori=ahsap-tarak' },
  { name: 'Kemik Tarak', href: '/tum-urunler?kategori=kemik-tarak' },
  { name: 'Cep Tarağı', href: '/tum-urunler?kategori=cep-taragi' },
  { name: 'Saç Fırçası', href: '/tum-urunler?kategori=sac-fircasi' },
]

const helperSearches = ['Yeni Gelenler', 'Çok Satanlar', 'Mint Çanta', 'Kartlık', 'Süet Çanta']

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const { items, totalItems, removeItem, updateItemQuantity } = useCart()
  const cartTotalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const filteredSearchCategories = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('tr')
    if (!query) return searchCategories
    return searchCategories.filter((category) =>
      category.name.toLocaleLowerCase('tr').includes(query)
    )
  }, [searchQuery])

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' })
        const data = (await response.json()) as {
          authenticated?: boolean
          customer?: { firstName?: string; lastName?: string } | null
        }
        const authenticated = Boolean(data?.authenticated)
        setIsAuthenticated(authenticated)
        if (authenticated) {
          const fullName = [data?.customer?.firstName, data?.customer?.lastName]
            .filter(Boolean)
            .join(' ')
            .trim()
          setCustomerName(fullName)
        } else {
          setCustomerName('')
        }
      } catch {
        setIsAuthenticated(false)
        setCustomerName('')
      } finally {
        setIsAuthLoading(false)
      }
    }

    loadSession()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when full-screen panels are open
  useEffect(() => {
    if (isMobileMenuOpen || isSearchOpen || isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen, isSearchOpen, isCartOpen])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setIsAuthenticated(false)
    setCustomerName('')
    setIsMobileMenuOpen(false)
    window.location.href = '/'
  }

  const authLink = isAuthenticated
    ? { href: '/account', label: customerName || 'Hesabım' }
    : { href: '/giris', label: 'Üye Girişi' }

  const menuAccountLinks = isAuthenticated
    ? accountLinks
    : [
        { name: 'Üye Girişi / Üye Ol', href: '/giris', icon: LogIn },
        { name: 'Hesabım', href: '/giris', icon: User },
        { name: 'Favorilerim', href: '/giris', icon: Heart },
        { name: 'Siparişlerim', href: '/giris', icon: Package },
        { name: 'İletişim', href: '/iletisim', icon: Mail },
      ]

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'glass border-b border-bronze/10 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between sm:h-24">
            {/* Left - Hamburger Menu */}
            <div className="flex items-center gap-4">
              <button 
                className="group p-2 transition-colors hover:text-gold"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Menüyü aç"
              >
                <Menu className="h-5 w-5 text-bronze transition-colors group-hover:text-gold" strokeWidth={1.5} />
              </button>
            </div>

            {/* Center - Brand Name */}
            <Link href="/" className="flex flex-col items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <h1 className="font-serif text-lg tracking-[0.35em] text-bronze-dark sm:text-xl md:text-2xl">
                  B&apos;ETUI EFTELIA
                </h1>
                <span className="mt-0.5 text-[9px] tracking-[0.4em] text-rose sm:text-[10px] md:text-xs">
                  LEATHER GOODS
                </span>
              </motion.div>
            </Link>

            {/* Right - Search, Account & Cart */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                className="group p-2 transition-colors"
                aria-label="Ürün ara"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5 text-bronze transition-colors group-hover:text-gold" strokeWidth={1.5} />
              </button>
              <Link
                href={authLink.href}
                className="group hidden items-center gap-2 p-2 transition-colors sm:flex"
                aria-label={authLink.label}
              >
                <User className="h-5 w-5 text-bronze transition-colors group-hover:text-gold" strokeWidth={1.5} />
                {!isAuthLoading ? (
                  <span className="hidden text-xs font-medium uppercase tracking-[0.08em] text-bronze/75 lg:inline">
                    {authLink.label}
                  </span>
                ) : null}
              </Link>
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="hidden text-[11px] font-medium uppercase tracking-[0.08em] text-bronze/70 transition-colors hover:text-rose lg:block"
                >
                  Çıkış
                </button>
              ) : null}
              <button
                onClick={() => setIsCartOpen(true)}
                className="group relative p-2 transition-colors"
                aria-label="Alışveriş çantası"
              >
                <ShoppingBag className="h-5 w-5 text-bronze transition-colors group-hover:text-gold" strokeWidth={1.5} />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose text-[9px] font-medium text-bronze-dark">
                  {totalItems}
                </span>
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[62] bg-black/30"
              onClick={() => setIsSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-x-0 top-0 z-[63] mx-auto w-full max-w-6xl rounded-b-xl border border-bronze/10 bg-background p-4 shadow-xl sm:p-6"
            >
              <div className="flex items-center gap-3 rounded-md border border-bronze/15 px-4 py-3">
                <Search className="h-5 w-5 text-bronze/60" strokeWidth={1.5} />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ürün, kategori veya model adı yazın (örn: Süet Çanta, Kartlık)"
                  className="w-full bg-transparent text-sm text-bronze placeholder:text-bronze/50 focus:outline-none"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-bronze/60 transition-colors hover:text-bronze"
                  aria-label="Aramayı kapat"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="mb-2 text-sm font-medium text-bronze">Arama Yardımı</p>
                  <div className="flex flex-wrap gap-2">
                    {helperSearches.map((item) => (
                      <button
                        key={item}
                        onClick={() => setSearchQuery(item)}
                        className="rounded-full border border-bronze/15 px-3 py-1.5 text-xs text-bronze/80 transition-colors hover:border-bronze/30 hover:text-bronze"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-bronze/10 pt-4">
                  <p className="mb-3 text-sm font-medium text-bronze">Filtre Kategorileri</p>
                  <div className="flex flex-wrap gap-2">
                    {filteredSearchCategories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        onClick={() => {
                          setIsSearchOpen(false)
                          setSearchQuery('')
                        }}
                        className="rounded-full border border-bronze/15 px-3 py-1.5 text-xs text-bronze transition-colors hover:border-bronze/35 hover:bg-ivory"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                  {filteredSearchCategories.length === 0 && (
                    <p className="text-sm text-bronze/60">
                      Bu aramaya uygun kategori bulunamadı.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[64] bg-black/35"
              onClick={() => setIsCartOpen(false)}
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 z-[65] h-full w-full max-w-md border-l border-bronze/15 bg-background shadow-2xl"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-bronze/10 px-5 py-4">
                  <div>
                    <h3 className="text-lg font-medium text-bronze-dark">Sepetim</h3>
                    <p className="text-xs text-bronze/55">{totalItems} ürün</p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="rounded-md p-2 text-bronze/70 transition-colors hover:bg-ivory-warm hover:text-bronze"
                    aria-label="Sepeti kapat"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {items.length === 0 ? (
                    <div className="rounded-xl border border-bronze/15 bg-ivory-warm p-5 text-center">
                      <p className="text-sm text-bronze/70">Sepetiniz şu anda boş.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={`${item.id}-${item.color || 'renksiz'}`} className="rounded-xl border border-bronze/15 bg-ivory-warm p-4">
                          <div className="flex gap-3">
                            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-bronze/15 bg-white">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs text-bronze/45">
                                  Görsel
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-bronze-dark">{item.name}</p>
                              <p className="mt-1 text-xs text-bronze/60">
                                {item.color ? `Renk: ${item.color}` : 'Standart'}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center border border-bronze/20 bg-white">
                              <button
                                onClick={() =>
                                  updateItemQuantity(item.id, item.color, Math.max(1, item.quantity - 1))
                                }
                                className="p-2 text-bronze/75"
                                aria-label="Adet azalt"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-8 text-center text-sm text-bronze">{item.quantity}</span>
                              <button
                                onClick={() =>
                                  updateItemQuantity(item.id, item.color, item.quantity + 1)
                                }
                                className="p-2 text-bronze/75"
                                aria-label="Adet artır"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-bronze-dark">
                                {(item.price * item.quantity).toLocaleString('tr-TR')} TL
                              </span>
                              <button
                                onClick={() => removeItem(item.id, item.color)}
                                className="text-bronze/55 transition-colors hover:text-rose"
                                aria-label="Ürünü kaldır"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-bronze/10 px-5 py-4">
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="text-bronze/65">Toplam</span>
                    <span className="font-semibold text-bronze-dark">
                      {cartTotalAmount.toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                  <Link
                    href="/odeme"
                    onClick={() => setIsCartOpen(false)}
                    className="block rounded-md bg-bronze px-4 py-3 text-center text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-bronze-dark"
                  >
                    Ödemeyi Tamamla
                  </Link>
                  <Link
                    href="/tum-urunler"
                    onClick={() => setIsCartOpen(false)}
                    className="mt-2 block rounded-md border border-bronze/25 px-4 py-3 text-center text-sm font-medium uppercase tracking-wide text-bronze transition-colors hover:bg-ivory-warm"
                  >
                    Alışverişe Geri Dön
                  </Link>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[55] bg-black/20"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 top-0 z-[60] h-full w-full max-w-md overflow-y-auto bg-background shadow-2xl sm:w-[85%]"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-bronze/10 bg-background px-6 py-5">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-bronze transition-colors hover:text-bronze-dark"
                  aria-label="Kapat"
                >
                  <X className="h-5 w-5" strokeWidth={1.5} />
                  <span className="text-sm font-medium tracking-wide">Kapat</span>
                </button>
              </div>

              {/* Categories */}
              <nav className="px-6 py-6">
                <ul className="space-y-1">
                  {menuCategories.map((item, i) => (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    >
                      <Link 
                        href={item.href}
                        className={`flex items-center gap-2 py-3 text-[15px] font-semibold tracking-wide transition-colors ${
                          item.isOutlet 
                            ? 'text-rose hover:text-rose/80' 
                            : 'text-bronze-dark hover:text-gold'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                        {item.badge === 'fire' && (
                          <span className="text-base">🔥</span>
                        )}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Divider */}
              <div className="mx-6 border-t border-bronze/15" />

              {/* Account Links */}
              <div className="px-6 py-6">
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bronze/50">
                    Hesap İşlemleri
                  </p>
                </div>
                <ul className="space-y-1">
                  {menuAccountLinks.map((item, i) => (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }}
                    >
                      {item.name === 'Üye Girişi / Üye Ol' ? (
                        <Link
                          href={item.href}
                          className="group flex items-center justify-between rounded-lg border border-bronze/20 bg-ivory-warm px-4 py-3.5 transition-all hover:border-bronze/40 hover:bg-ivory"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="rounded-md bg-bronze/10 p-2 text-bronze">
                              <item.icon className="h-5 w-5" strokeWidth={1.7} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[15px] font-medium text-bronze-dark">{item.name}</span>
                              <span className="text-xs text-bronze/60">Sipariş ve favori takibi için giriş yapın</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-bronze/40 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      ) : (
                      <Link 
                        href={item.href}
                        className="group flex items-center justify-between rounded-md px-2 py-3 text-[15px] text-bronze transition-colors hover:bg-ivory-warm hover:text-gold"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" strokeWidth={1.5} />
                          <span>{item.name}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 text-bronze/30 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                      )}
                    </motion.li>
                  ))}
                  {isAuthenticated && (
                    <motion.li
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8, duration: 0.3 }}
                    >
                      <button
                        onClick={handleLogout}
                        className="group flex w-full items-center justify-between rounded-md px-2 py-3 text-[15px] text-rose transition-colors hover:bg-ivory-warm hover:text-rose/80"
                      >
                        <span className="flex items-center gap-3">
                          <LogIn className="h-5 w-5 rotate-180" strokeWidth={1.5} />
                          <span>Çıkış Yap</span>
                        </span>
                        <ChevronRight className="h-4 w-4 text-rose/50 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </motion.li>
                  )}
                </ul>
              </div>

              {/* Footer Brand */}
              <div className="mt-auto border-t border-bronze/10 px-6 py-6">
                <div className="inline-flex items-center rounded-md border border-bronze/20 bg-ivory-warm px-4 py-2.5">
                  <span className="font-serif text-2xl tracking-[0.2em] text-bronze-dark">
                    B&amp;E
                  </span>
                </div>
                <p className="mt-3 text-xs tracking-[0.25em] text-bronze/45">
                  HER DETAYDA ZARAFET
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
