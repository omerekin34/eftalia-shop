'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Bell,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Gift,
  Heart,
  LogOut,
  MapPin,
  MessageSquare,
  Package,
  RefreshCw,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Star,
  User,
} from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'

const accountMenuItems = [
  { label: 'Hesap Ayarlarım', href: '/hesabim/ayarlar', icon: Settings },
  { label: 'Siparişlerim', href: '/hesabim/siparisler', icon: Package },
  { label: 'İade Taleplerim', href: '/hesabim/iade-talepleri', icon: RefreshCw },
  { label: 'Favorilerim', href: '/hesabim/favoriler', icon: Heart },
  { label: 'Yorumlarım', href: '/hesabim/yorumlar', icon: MessageSquare },
  { label: 'Adres Defterim', href: '/hesabim/adres-defteri', icon: MapPin },
  { label: 'Ödeme Yöntemlerim', href: '/hesabim/odeme-yontemleri', icon: CreditCard },
  { label: 'Bildirim Tercihlerim', href: '/hesabim/bildirim-tercihleri', icon: Bell },
  { label: 'Güvenli Çıkış', href: '/giris', icon: LogOut },
]

const quickActionCards = [
  { label: 'Destek Taleplerim', href: '/hesabim/destek-talepleri', icon: CircleHelp },
  { label: 'Siparişlerim', href: '/hesabim/siparisler', icon: Package },
  { label: 'Üyelik Bilgilerim', href: '/hesabim/uyelik-bilgileri', icon: User },
  { label: 'Adres Defterim', href: '/hesabim/adres-defteri', icon: MapPin },
  { label: 'Hediye Çeklerim', href: '/hesabim/hediye-cekleri', icon: Gift },
  { label: 'Para Puanlarım', href: '/hesabim/para-puanlar', icon: Star },
  { label: 'İade Taleplerim', href: '/hesabim/iade-talepleri', icon: RefreshCw },
  { label: 'Alışveriş Sepetim', href: '/hesabim/sepetim', icon: ShoppingCart },
]

export default function HesabimPage() {
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
              <span className="text-bronze">Hesabım</span>
            </nav>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border border-bronze/15 bg-white p-4 shadow-sm sm:p-5"
            >
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-bronze/50">
                Hesap Menüsü
              </h2>
              <ul className="space-y-1">
                {accountMenuItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-bronze transition-colors hover:bg-ivory-warm hover:text-bronze-dark"
                    >
                      <span className="flex items-center gap-2.5">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-bronze/30 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.aside>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
            >
              <div className="rounded-2xl border border-bronze/15 bg-white p-6 shadow-sm sm:p-8">
                <h1 className="font-serif text-3xl text-bronze-dark sm:text-4xl">
                  Merhaba Eftelia Üyesi
                </h1>
                <p className="mt-2 text-xl text-bronze">Hoş Geldiniz</p>
                <p className="mt-4 max-w-4xl text-sm leading-relaxed text-bronze/70 sm:text-base">
                  Hesabım sayfasından siparişlerinizi takip edebilir, iade/değişim işlemlerinizi
                  yönetebilir, adres ve iletişim bilgilerinizi güncelleyebilirsiniz. Ayrıca
                  favorilerinizi ve size özel avantajları tek noktadan görüntüleyebilirsiniz.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {quickActionCards.map((card, index) => (
                    <Link
                      key={card.label}
                      href={card.href}
                      className="group rounded-xl border border-bronze/15 bg-ivory-warm p-5 text-left transition-all hover:border-bronze/30 hover:bg-ivory hover:shadow-sm"
                    >
                      <card.icon className="h-7 w-7 text-bronze/80 transition-transform group-hover:scale-105" />
                      <p className="mt-5 text-sm font-medium text-bronze-dark">{card.label}</p>
                      <div className="mt-4 flex items-center text-xs text-bronze/50">
                        Hemen görüntüle
                        <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </div>
                      <span className="sr-only">Kart {index + 1}</span>
                    </Link>
                  ))}
                </div>

                <div className="mt-8 rounded-xl border border-bronze/15 bg-ivory-warm p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-bronze" />
                    <p className="text-sm leading-relaxed text-bronze/70">
                      Hesap güvenliğin için şifreni düzenli olarak güncellemeni öneririz. Şüpheli bir
                      durumda destek ekibimizle hemen iletişime geçebilirsin.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
