import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { CartProvider } from '@/components/storefront/cart-context'
import { FavoritesProvider } from '@/components/storefront/favorites-context'
import { SupportFab } from '@/components/storefront/support-fab'
import { SpinWheelLauncher } from '@/components/storefront/spin-wheel-launcher'

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'EFTALIA | Deri Aksesuar & Gabardin Çantalar',
  description:
    'Detayın sanatını keşfedin. Cüzdan ve kartlıklarda deri işçiliği; çantalarda gabardin kumaş. El yapımı aksesuar ve seçkin çanta koleksiyonu.',
  keywords: [
    'luxury leather',
    'gabardin çanta',
    'handcrafted',
    'leather wallets',
    'gabardine bags',
    'deri cüzdan',
    'artisan',
  ],
  generator: 'v0.app',
  openGraph: {
    title: 'EFTALIA | Deri Aksesuar & Gabardin Çantalar',
    description:
      'Cüzdan ve kartlıklarda deri; çantalarda gabardin kumaş. El yapımı kalite, zamansız zarafet.',
    type: 'website',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        type: 'image/png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        type: 'image/png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport = {
  themeColor: '#F7F4EF',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className={`${playfair.variable} ${inter.variable} bg-background`}>
      <body className="font-sans antialiased">
        <FavoritesProvider>
          <CartProvider>
            {children}
            <SupportFab />
            <SpinWheelLauncher />
          </CartProvider>
        </FavoritesProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
