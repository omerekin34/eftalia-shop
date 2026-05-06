import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    redirect('/giris')
  }

  return (
    <div className="min-h-screen bg-[#f7f1e7]">
      <Navbar />
      <main className="pb-20 pt-32 sm:pt-36">{children}</main>
      <Footer />
    </div>
  )
}
