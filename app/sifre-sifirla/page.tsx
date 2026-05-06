'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resetUrlFromQuery = searchParams.get('reset_url')?.trim() || ''

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 5) {
      setError('Şifre en az 5 karakter olmalıdır.')
      return
    }
    if (password !== passwordConfirm) {
      setError('Şifreler eşleşmiyor.')
      return
    }
    if (!resetUrlFromQuery) {
      setError('Geçerli bir sıfırlama bağlantısı bulunamadı.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetUrl: resetUrlFromQuery, password }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(data?.error || 'Şifre sıfırlanamadı.')
      }
      window.dispatchEvent(new Event('auth:changed'))
      router.push('/account')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Şifre sıfırlanamadı.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pb-20 pt-32 sm:pt-36">
        <section className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <nav className="flex items-center gap-2 text-sm text-bronze/60">
              <Link href="/" className="transition-colors hover:text-bronze">
                Ana Sayfa
              </Link>
              <span>/</span>
              <Link href="/giris" className="transition-colors hover:text-bronze">
                Giriş
              </Link>
              <span>/</span>
              <span className="text-bronze">Şifre sıfırlama</span>
            </nav>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-bronze/15 bg-white p-6 shadow-sm sm:p-8"
          >
            <h1 className="font-serif text-2xl text-bronze-dark sm:text-3xl">Yeni şifre belirle</h1>
            <p className="mt-2 text-sm text-bronze/65">
              Şifrenizi güncelledikten sonra hesabınıza otomatik giriş yapılır.
            </p>

            {!resetUrlFromQuery ? (
              <div className="mt-6 space-y-4 rounded-lg border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950">
                <p>
                  Bağlantıda <code className="rounded bg-white/80 px-1 py-0.5 text-xs">reset_url</code> parametresi
                  yok. Şifre sıfırlama e-postasındaki adresin sizi bu sayfaya yönlendirmesi için Shopify Admin’de
                  bildirim şablonunu güncellemeniz gerekir.
                </p>
                <p className="font-medium">Örnek (Müşteri hesabı parola sıfırlama e-postası):</p>
                <pre className="overflow-x-auto rounded-md border border-amber-200/80 bg-white/90 p-3 text-xs leading-relaxed">
                  {`<a href="{{ shop.url }}/sifre-sifirla?reset_url={{ customer.reset_password_url | url_encode }}">
  Parolamı sıfırla
</a>`}
                </pre>
                <p className="text-amber-900/90">
                  Headless kullanıyorsanız <code className="text-xs">shop.url</code> yerine canlı sitenizin tam adresini
                  (örn. <code className="text-xs">https://siteniz.com</code>) yazın. Özel alan adında gelen sıfırlama
                  linkleri için .env dosyasında{' '}
                  <code className="text-xs">NEXT_PUBLIC_SITE_URL</code> veya{' '}
                  <code className="text-xs">SHOPIFY_PASSWORD_RESET_ALLOWED_HOSTS</code> tanımlayın.
                </p>
                <Link
                  href="/giris"
                  className="inline-block text-sm font-medium text-bronze underline-offset-4 hover:underline"
                >
                  Giriş sayfasına dön
                </Link>
              </div>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={(e) => void handleSubmit(e)}>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-bronze">Yeni şifre</label>
                  <div className="flex items-center rounded-lg border border-bronze/20 bg-white pr-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      minLength={5}
                      required
                      className="w-full px-4 py-3 text-sm text-bronze placeholder:text-bronze/45 focus:outline-none"
                      placeholder="En az 5 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="rounded-md p-1.5 text-bronze/60 transition-colors hover:bg-ivory-warm hover:text-bronze"
                      aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-bronze">Yeni şifre (tekrar)</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    autoComplete="new-password"
                    minLength={5}
                    required
                    className="w-full rounded-lg border border-bronze/20 bg-white px-4 py-3 text-sm text-bronze placeholder:text-bronze/45 focus:border-bronze/40 focus:outline-none"
                    placeholder="Tekrar yazın"
                  />
                </div>

                {error ? (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-bronze px-4 py-3.5 text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-bronze-dark disabled:opacity-60"
                >
                  <KeyRound className="h-4 w-4" />
                  {submitting ? 'Kaydediliyor...' : 'Şifreyi güncelle ve giriş yap'}
                </button>
              </form>
            )}
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default function SifreSifirlaPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  )
}
