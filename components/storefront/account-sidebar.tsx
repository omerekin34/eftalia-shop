'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Gift, Heart, LogOut, MapPin, Package, Star, User, UserCog } from 'lucide-react'

export type AccountNavTabKey = 'dashboard' | 'orders' | 'profile' | 'addresses' | 'coupons' | 'favorites'

type SidebarEntry =
  | { type: 'tab'; key: AccountNavTabKey; label: string; icon: typeof User }
  | { type: 'link'; href: string; label: string; icon: typeof Star }

const sidebarEntries: SidebarEntry[] = [
  { type: 'tab', key: 'dashboard', label: 'Panel', icon: User },
  { type: 'tab', key: 'orders', label: 'Siparişlerim', icon: Package },
  { type: 'tab', key: 'profile', label: 'Üyelik Bilgilerim', icon: UserCog },
  { type: 'tab', key: 'addresses', label: 'Adres Defterim', icon: MapPin },
  { type: 'tab', key: 'coupons', label: 'Kuponlarım', icon: Gift },
  { type: 'link', href: '/account/reviews', label: 'Değerlendirmelerim', icon: Star },
  { type: 'tab', key: 'favorites', label: 'Favorilerim', icon: Heart },
]

function tabHref(key: AccountNavTabKey) {
  if (key === 'dashboard') return '/account'
  return `/account?tab=${key}`
}

function getTabFromParam(value: string | null): AccountNavTabKey {
  if (value === 'orders') return 'orders'
  if (value === 'favorites') return 'favorites'
  if (value === 'addresses') return 'addresses'
  if (value === 'coupons') return 'coupons'
  if (value === 'profile') return 'profile'
  return 'dashboard'
}

export function AccountSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const onReviewsPage = pathname === '/account/reviews'
  const activeTab = getTabFromParam(searchParams.get('tab'))

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  const itemClass = (isActive: boolean) =>
    `flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
      isActive ? 'bg-[#5B1F2A] text-white shadow-sm' : 'text-[#6d4f35] hover:bg-white/70'
    }`

  return (
    <aside className="rounded-2xl border border-[#9b7a57]/25 bg-[#fffaf2] p-4">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[#8a6b4b]">Hesap Menüsü</h2>
      <div className="space-y-1.5">
        {sidebarEntries.map((entry) => {
          if (entry.type === 'link') {
            const isActive = onReviewsPage
            return (
              <Link key={entry.href} href={entry.href} className={itemClass(isActive)}>
                <entry.icon className="h-4 w-4 shrink-0" />
                {entry.label}
              </Link>
            )
          }
          const isActive = !onReviewsPage && activeTab === entry.key
          return (
            <Link key={entry.key} href={tabHref(entry.key)} scroll={false} className={itemClass(isActive)}>
              <entry.icon className="h-4 w-4 shrink-0" />
              {entry.label}
            </Link>
          )
        })}
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-left text-sm text-rose-700 transition-colors hover:bg-rose-100"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Güvenli Çıkış
        </button>
      </div>
    </aside>
  )
}
