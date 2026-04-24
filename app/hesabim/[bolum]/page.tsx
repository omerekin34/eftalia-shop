'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Gift,
  Heart,
  MapPin,
  MessageSquare,
  Package,
  RefreshCw,
  Settings,
  ShoppingCart,
  Star,
  Truck,
  User,
} from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { useCart } from '@/components/storefront/cart-context'

const sectionContent: Record<string, { title: string; description: string; icon: string }> = {
  ayarlar: {
    title: 'Hesap Ayarları',
    description: 'Kişisel bilgilerinizi, şifre ayarlarınızı ve iletişim tercihlerinizi buradan güncelleyebilirsiniz.',
    icon: 'Ayar',
  },
  siparisler: {
    title: 'Siparişlerim',
    description: 'Geçmiş ve aktif siparişlerinizin durumunu bu ekrandan takip edebilirsiniz.',
    icon: 'Sipariş',
  },
  'iade-talepleri': {
    title: 'İade Taleplerim',
    description: 'İade/değişim başvurularınızı görüntüleyebilir ve süreç adımlarını izleyebilirsiniz.',
    icon: 'İade',
  },
  favoriler: {
    title: 'Favorilerim',
    description: 'Beğendiğiniz ürünleri favorilere ekleyip daha sonra hızlıca ulaşabilirsiniz.',
    icon: 'Favori',
  },
  yorumlar: {
    title: 'Yorumlarım',
    description: 'Ürünlere yaptığınız yorumlar ve değerlendirmeler burada listelenir.',
    icon: 'Yorum',
  },
  'adres-defteri': {
    title: 'Adres Defterim',
    description: 'Teslimat ve fatura adreslerinizi ekleyebilir, düzenleyebilir veya silebilirsiniz.',
    icon: 'Adres',
  },
  'odeme-yontemleri': {
    title: 'Ödeme Yöntemlerim',
    description: 'Kayıtlı kartlarınızı ve ödeme tercihlerinizi bu bölümden yönetebilirsiniz.',
    icon: 'Ödeme',
  },
  'bildirim-tercihleri': {
    title: 'Bildirim Tercihlerim',
    description: 'Kampanya, sipariş ve bilgilendirme bildirim ayarlarınızı kişiselleştirin.',
    icon: 'Bildirim',
  },
  'destek-talepleri': {
    title: 'Destek Taleplerim',
    description: 'Destek kayıtlarınızı takip edebilir, yeni bir destek talebi oluşturabilirsiniz.',
    icon: 'Destek',
  },
  'uyelik-bilgileri': {
    title: 'Üyelik Bilgilerim',
    description: 'Üyelik profil bilgileriniz ve hesap detaylarınız bu bölümde yer alır.',
    icon: 'Üyelik',
  },
  'hediye-cekleri': {
    title: 'Hediye Çeklerim',
    description: 'Tanımlı hediye çeklerinizi görüntüleyebilir ve kullanım durumunu kontrol edebilirsiniz.',
    icon: 'Hediye',
  },
  'para-puanlar': {
    title: 'Para Puanlarım',
    description: 'Kazandığınız para puanları ve kullanım geçmişinizi bu alandan görüntüleyebilirsiniz.',
    icon: 'Puan',
  },
  sepetim: {
    title: 'Alışveriş Sepetim',
    description: 'Sepetinizdeki ürünleri düzenleyebilir ve ödeme adımına devam edebilirsiniz.',
    icon: 'Sepet',
  },
}

const quickSectionLinks = [
  { label: 'Siparişler', href: '/hesabim/siparisler', icon: Package },
  { label: 'Favoriler', href: '/hesabim/favoriler', icon: Heart },
  { label: 'Adresler', href: '/hesabim/adres-defteri', icon: MapPin },
  { label: 'Ödeme', href: '/hesabim/odeme-yontemleri', icon: CreditCard },
  { label: 'Puanlar', href: '/hesabim/para-puanlar', icon: Star },
  { label: 'Destek', href: '/hesabim/destek-talepleri', icon: CircleHelp },
]

function renderSectionBody(
  bolum: string,
  cartItems: { name: string; quantity: number; price: number; color?: string; image?: string }[],
  totalAmount: number
) {
  switch (bolum) {
    case 'siparisler':
      return (
        <div className="space-y-4">
          {[
            { no: 'EFT-10245', date: '21 Nisan 2026', status: 'Kargoda', total: '1.899,90 TL' },
            { no: 'EFT-10178', date: '11 Nisan 2026', status: 'Teslim Edildi', total: '949,90 TL' },
          ].map((order) => (
            <div key={order.no} className="rounded-xl border border-bronze/15 bg-ivory-warm p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-bronze-dark">Sipariş #{order.no}</p>
                  <p className="text-xs text-bronze/60">{order.date}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-bronze">
                  {order.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-bronze/75">Toplam: {order.total}</p>
            </div>
          ))}
        </div>
      )
    case 'favoriler':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {['Lina Çapraz Çanta - Krem', 'Mina Kartlık - Taba', 'Lora Omuz Çantası - Siyah'].map((item) => (
            <div key={item} className="rounded-xl border border-bronze/15 bg-ivory-warm p-4">
              <p className="text-sm font-medium text-bronze-dark">{item}</p>
              <p className="mt-1 text-xs text-bronze/60">Favorilere eklenme: Son 7 gün</p>
              <div className="mt-3 flex gap-2">
                <button className="rounded-md bg-bronze px-3 py-1.5 text-xs text-white">Sepete ekle</button>
                <button className="rounded-md border border-bronze/20 px-3 py-1.5 text-xs text-bronze">Kaldır</button>
              </div>
            </div>
          ))}
        </div>
      )
    case 'adres-defteri':
      return (
        <div className="space-y-4">
          {[
            { title: 'Ev Adresi', text: 'Atatürk Mah. 101 Sk. No:12 D:5, İzmir' },
            { title: 'Ofis', text: 'Kültür Mah. 45/2, İstanbul' },
          ].map((address) => (
            <div key={address.title} className="rounded-xl border border-bronze/15 bg-ivory-warm p-4">
              <p className="text-sm font-semibold text-bronze-dark">{address.title}</p>
              <p className="mt-1 text-sm text-bronze/70">{address.text}</p>
            </div>
          ))}
          <button className="rounded-md border border-bronze/25 px-4 py-2 text-sm text-bronze">+ Yeni adres ekle</button>
        </div>
      )
    case 'odeme-yontemleri':
      return (
        <div className="space-y-3">
          {['**** **** **** 4210 - Visa', '**** **** **** 9912 - MasterCard'].map((card) => (
            <div key={card} className="flex items-center justify-between rounded-xl border border-bronze/15 bg-ivory-warm p-4">
              <p className="text-sm text-bronze-dark">{card}</p>
              <span className="text-xs text-bronze/55">Kayıtlı</span>
            </div>
          ))}
          <button className="rounded-md border border-bronze/25 px-4 py-2 text-sm text-bronze">+ Yeni kart ekle</button>
        </div>
      )
    case 'iade-talepleri':
      return (
        <div className="space-y-4">
          <div className="rounded-xl border border-bronze/15 bg-ivory-warm p-4">
            <p className="text-sm font-semibold text-bronze-dark">#IAD-2091 - Değerlendirmede</p>
            <p className="mt-1 text-sm text-bronze/70">Lina Çapraz Çanta / Boyut beklentisi nedeniyle iade talebi.</p>
          </div>
          <button className="rounded-md bg-bronze px-4 py-2 text-sm text-white">Yeni iade talebi oluştur</button>
        </div>
      )
    case 'yorumlar':
      return (
        <div className="space-y-4">
          {[
            { product: 'Lina Çapraz Çanta', rating: '5/5', text: 'Kalitesi harika, çok kullanışlı.' },
            { product: 'Mina Kartlık', rating: '4/5', text: 'Minimal ve çok şık bir ürün.' },
          ].map((comment) => (
            <div key={comment.product} className="rounded-xl border border-bronze/15 bg-ivory-warm p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-bronze-dark">{comment.product}</p>
                <span className="text-xs text-bronze/60">{comment.rating}</span>
              </div>
              <p className="mt-2 text-sm text-bronze/70">{comment.text}</p>
            </div>
          ))}
        </div>
      )
    case 'bildirim-tercihleri':
      return (
        <div className="space-y-3">
          {['Kampanya bildirimleri', 'Sipariş durumu bildirimleri', 'Stok geri geldi uyarıları'].map((item, index) => (
            <label key={item} className="flex items-center justify-between rounded-xl border border-bronze/15 bg-ivory-warm px-4 py-3">
              <span className="text-sm text-bronze-dark">{item}</span>
              <input type="checkbox" defaultChecked={index < 2} className="h-4 w-4 accent-bronze" />
            </label>
          ))}
        </div>
      )
    case 'destek-talepleri':
      return (
        <div className="space-y-4">
          <div className="rounded-xl border border-bronze/15 bg-ivory-warm p-4">
            <p className="text-sm font-semibold text-bronze-dark">#DST-448 - Kargo Durumu</p>
            <p className="mt-1 text-sm text-bronze/70">Talebiniz yanıtlandı. Detay için destek geçmişini görüntüleyin.</p>
          </div>
          <button className="rounded-md bg-bronze px-4 py-2 text-sm text-white">Yeni destek talebi oluştur</button>
        </div>
      )
    case 'uyelik-bilgileri':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['Ad Soyad', 'Eftelia Üyesi'],
            ['E-posta', 'uye@eftelia.com'],
            ['Telefon', '05XX XXX XX XX'],
            ['Üyelik Tarihi', 'Ocak 2026'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-bronze/15 bg-ivory-warm p-4">
              <p className="text-xs uppercase tracking-wide text-bronze/55">{label}</p>
              <p className="mt-1 text-sm font-medium text-bronze-dark">{value}</p>
            </div>
          ))}
        </div>
      )
    case 'hediye-cekleri':
      return (
        <div className="space-y-3">
          <div className="rounded-xl border border-bronze/15 bg-ivory-warm p-4">
            <p className="text-sm font-semibold text-bronze-dark">EFTELIA100</p>
            <p className="mt-1 text-sm text-bronze/70">100 TL indirim - Son kullanım: 31 Mayıs 2026</p>
          </div>
          <div className="rounded-xl border border-dashed border-bronze/20 p-4">
            <p className="text-sm text-bronze/70">Yeni hediye çeki kodunu aşağıdan ekleyebilirsin.</p>
          </div>
        </div>
      )
    case 'para-puanlar':
      return (
        <div className="space-y-4">
          <div className="rounded-xl border border-bronze/15 bg-ivory-warm p-4">
            <p className="text-xs uppercase tracking-wide text-bronze/55">Mevcut Puan</p>
            <p className="mt-1 text-2xl font-semibold text-bronze-dark">1.280</p>
          </div>
          <div className="rounded-xl border border-bronze/15 p-4">
            <p className="text-sm text-bronze/70">Son hareket: Sipariş #EFT-10245 ile +120 puan.</p>
          </div>
        </div>
      )
    case 'sepetim':
      return (
        <div className="space-y-4">
          {cartItems.length > 0 ? (
            <>
              {cartItems.map((item) => (
                <div key={`${item.name}-${item.color || 'renk-yok'}`} className="rounded-xl border border-bronze/15 bg-ivory-warm p-4">
                  <div className="flex gap-3">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-bronze/15 bg-white">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-bronze/45">
                          Görsel
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-bronze-dark">{item.name}</p>
                      <p className="mt-1 text-sm text-bronze/70">
                        Adet: {item.quantity}
                        {item.color ? ` • Renk: ${item.color}` : ''} • {(item.price * item.quantity).toLocaleString('tr-TR')} TL
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="rounded-xl border border-bronze/15 p-4">
                <p className="text-sm text-bronze/70">
                  Toplam Tutar: <span className="font-semibold text-bronze-dark">{totalAmount.toLocaleString('tr-TR')} TL</span>
                </p>
              </div>
              <Link href="/odeme" className="inline-block rounded-md bg-bronze px-4 py-2 text-sm text-white">
                Ödemeyi Tamamla
              </Link>
            </>
          ) : (
            <div className="rounded-xl border border-bronze/15 bg-ivory-warm p-4">
              <p className="text-sm text-bronze/70">Sepetiniz şu anda boş görünüyor.</p>
            </div>
          )}
        </div>
      )
    case 'ayarlar':
    default:
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="rounded-xl border border-bronze/15 bg-ivory-warm p-4">
            <p className="text-xs uppercase tracking-wide text-bronze/55">Ad Soyad</p>
            <input className="mt-2 w-full bg-transparent text-sm text-bronze-dark focus:outline-none" defaultValue="Eftelia Üyesi" />
          </label>
          <label className="rounded-xl border border-bronze/15 bg-ivory-warm p-4">
            <p className="text-xs uppercase tracking-wide text-bronze/55">E-posta</p>
            <input className="mt-2 w-full bg-transparent text-sm text-bronze-dark focus:outline-none" defaultValue="uye@eftelia.com" />
          </label>
          <button className="sm:col-span-2 w-fit rounded-md bg-bronze px-4 py-2 text-sm text-white">Değişiklikleri kaydet</button>
        </div>
      )
  }
}

export default function HesabimBolumPage() {
  const params = useParams()
  const bolum = (params.bolum as string) || ''
  const { items } = useCart()
  const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const content = sectionContent[bolum] || {
    title: 'Hesap Bölümü',
    description: 'Bu bölüm yakında aktif olacaktır.',
    icon: 'Hesap',
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pb-20 pt-28 sm:pt-32">
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/hesabim"
              className="inline-flex items-center gap-2 text-sm text-bronze/70 transition-colors hover:text-bronze"
            >
              <ChevronLeft className="h-4 w-4" />
              Hesabıma dön
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-bronze/15 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-serif text-3xl text-bronze-dark sm:text-4xl">{content.title}</h1>
              <span className="rounded-full border border-bronze/20 bg-ivory-warm px-3 py-1 text-xs tracking-wide text-bronze">
                {content.icon}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-bronze/70 sm:text-base">{content.description}</p>

            <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {quickSectionLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex items-center justify-between rounded-lg border border-bronze/15 bg-ivory-warm px-3 py-2 text-sm text-bronze transition-colors hover:border-bronze/30"
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-bronze/45" />
                </Link>
              ))}
            </div>

            <div className="mt-8">{renderSectionBody(bolum, items, totalAmount)}</div>

            <div className="mt-8 rounded-xl border border-bronze/15 bg-ivory-warm p-4">
              <div className="flex items-start gap-3">
                <Truck className="mt-0.5 h-5 w-5 text-bronze/70" />
                <p className="text-sm text-bronze/70">
                  Tüm hesap işlemleriniz güvenli şekilde korunur. Yardım için canlı destek veya
                  iletişim sayfamız üzerinden bize ulaşabilirsiniz.
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
