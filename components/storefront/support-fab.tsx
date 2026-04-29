'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MessageCircle, Mail, X } from 'lucide-react'

const supportEmail = 'eftalia.case.destek@gmail.com'
const whatsappNumber = '905527138213'
const whatsappHref = `https://wa.me/${whatsappNumber}?text=Merhaba%2C%20EFTALIA%20destek%20ekibi%20ile%20g%C3%B6r%C3%BC%C5%9Fmek%20istiyorum.`

export function SupportFab() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-5 right-5 z-[90]">
      {isOpen ? (
        <div className="mb-3 w-[280px] rounded-2xl border border-bronze/15 bg-white p-4 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-bronze-dark">Canlı Destek</p>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-bronze/60 transition-colors hover:bg-ivory-warm hover:text-bronze"
              aria-label="Destek panelini kapat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs leading-relaxed text-bronze/70">
            Hemen yardım almak için e-posta gönderebilir veya iletişim formunu kullanabilirsiniz.
          </p>

          <div className="mt-3 space-y-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 transition-colors hover:bg-emerald-100"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp ile yaz
            </a>
            <a
              href={`mailto:${supportEmail}`}
              className="flex items-center gap-2 rounded-lg border border-bronze/15 px-3 py-2 text-sm text-bronze transition-colors hover:bg-ivory-warm"
            >
              <Mail className="h-4 w-4" />
              E-posta ile ulaş
            </a>
            <Link
              href="/iletisim"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg border border-bronze/15 px-3 py-2 text-sm text-bronze transition-colors hover:bg-ivory-warm"
            >
              <MessageCircle className="h-4 w-4" />
              İletişim sayfasına git
            </Link>
          </div>
        </div>
      ) : null}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-full bg-bronze px-4 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-bronze-dark"
        aria-label="Canlı destek panelini aç"
      >
        <MessageCircle className="h-4 w-4" />
        Canlı Destek
      </button>
    </div>
  )
}
