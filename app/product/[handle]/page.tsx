import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { ProductDetailClient } from '@/components/storefront/product-detail-client'
import { getProduct } from '@/lib/shopify'

type PageProps = {
  params: Promise<{ handle: string }>
}

export default async function ProductByHandlePage({ params }: PageProps) {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pb-20 pt-24">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-bronze/60">
            <Link href="/" className="transition-colors hover:text-bronze">
              Ana Sayfa
            </Link>
            <span>/</span>
            <Link href="/tum-urunler" className="transition-colors hover:text-bronze">
              Ürünler
            </Link>
            <span>/</span>
            <span className="text-bronze">{product.name}</span>
          </nav>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProductDetailClient product={product} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
