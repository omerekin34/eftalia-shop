'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, ShoppingBag, Menu, X, LogIn, RotateCcw, Heart, Package, Mail } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const menuCategories = [
  { name: 'TÜM ÜRÜNLER', href: '/tum-urunler' },
  { name: 'YENİ GELENLER', href: '/tum-urunler?filtre=yeni', badge: 'fire' },
  { name: 'ÇOK SATANLAR', href: '/tum-urunler?filtre=cok-satanlar' },
  { name: 'SÜET ÇANTA', href: '/tum-urunler?kategori=suet-canta' },
  { name: 'OMUZ ÇANTASI', href: '/tum-urunler?kategori=omuz-cantasi' },
  { name: 'ÇAPRAZ ÇANTA', href: '/tum-urunler?kategori=capraz-canta' },
  { name: 'BAGET ÇANTA', href: '/tum-urunler?kategori=baget-canta' },
  { name: 'CÜZDAN VE KARTLIKLAR', href: '/tum-urunler?kategori=cuzdan-kartlik' },
]

const accountLinks = [
  { name: 'Hesabım', href: '/hesabim', icon: User },
  { name: 'Üye Girişi / Üye Ol', href: '/giris', icon: LogIn },
  { name: 'Kolay İade', href: '/iade', icon: RotateCcw },
  { name: 'Favorilerim', href: '/favoriler', icon: Heart },
  { name: 'Siparişlerim', href: '/siparislerim', icon: Package },
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
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSearchCategories = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('tr')
    if (!query) return searchCategories
    return searchCategories.filter((category) =>
      category.name.toLocaleLowerCase('tr').includes(query)
    )
  }, [searchQuery])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when full-screen panels are open
  useEffect(() => {
    if (isMobileMenuOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen, isSearchOpen])

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
              <button 
                className="group hidden p-2 transition-colors sm:block"
                aria-label="Hesabım"
              >
                <User className="h-5 w-5 text-bronze transition-colors group-hover:text-gold" strokeWidth={1.5} />
              </button>
              <button 
                className="group relative p-2 transition-colors"
                aria-label="Alışveriş çantası"
              >
                <ShoppingBag className="h-5 w-5 text-bronze transition-colors group-hover:text-gold" strokeWidth={1.5} />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose text-[9px] font-medium text-bronze-dark">
                  0
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
                <ul className="space-y-1">
                  {accountLinks.map((item, i) => (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }}
                    >
                      <Link 
                        href={item.href}
                        className="flex items-center gap-3 py-3 text-[15px] text-bronze transition-colors hover:text-gold"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5" strokeWidth={1.5} />
                        <span>{item.name}</span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Footer Brand */}
              <div className="mt-auto border-t border-bronze/10 px-6 py-6">
                <Image
                  src="/images/logo.jpg"
                  alt="B'ETUI EFTELIA"
                  width={60}
                  height={60}
                  className="h-14 w-14 object-contain"
                />
                <p className="mt-3 text-xs tracking-wider text-bronze/40">
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
