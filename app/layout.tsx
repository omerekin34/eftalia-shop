import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

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
  title: "B'ETUI EFTELIA | Luxury Leather Goods",
  description:
    'Detayın sanatını keşfedin. El yapımı deri ürünlerde küresel standartlar. Premium deri defter kılıfları, çantalar ve aksesuarlar.',
  keywords: ['luxury leather', 'handcrafted', 'leather goods', 'handbags', 'journal covers', 'artisan'],
  generator: 'v0.app',
  openGraph: {
    title: "B'ETUI EFTELIA | Luxury Leather Goods",
    description: 'Detayın sanatını keşfedin. El yapımı deri ürünlerde küresel standartlar.',
    type: 'website',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
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
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
