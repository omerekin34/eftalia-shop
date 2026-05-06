'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn, UserPlus, ShieldCheck, Truck, RotateCcw, Mail } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'

type AuthMode = 'login' | 'register'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (args: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string | number | boolean>
          ) => void
          prompt: () => void
        }
      }
    }
  }
}

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login'
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [recoverSuccessMessage, setRecoverSuccessMessage] = useState('')
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [recoverSubmitting, setRecoverSubmitting] = useState(false)
  const [acceptsPolicies, setAcceptsPolicies] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  const googleInitializedRef = useRef(false)
  const modeRef = useRef<AuthMode>(initialMode)
  const acceptsPoliciesRef = useRef(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  })

  const handleInputChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    acceptsPoliciesRef.current = acceptsPolicies
  }, [acceptsPolicies])

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) return

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return

      if (!googleInitializedRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            setErrorMessage('')
            setIsSubmitting(true)
            try {
              const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  credential,
                  acceptsPolicies: acceptsPoliciesRef.current,
                  mode: modeRef.current,
                }),
              })
              const data = (await response.json()) as { ok?: boolean; code?: string; error?: string }
              if (!response.ok || data?.ok === false) {
                throw new Error(data?.error || 'Google ile giriş başarısız oldu.')
              }
              window.dispatchEvent(new Event('auth:changed'))
              router.push('/account')
              router.refresh()
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Google ile giriş başarısız oldu.'
              const shouldSwitchToRegister = message.toLocaleLowerCase('tr').includes('üye ol sekmesine geç')
              if (shouldSwitchToRegister) {
                setMode('register')
                setErrorMessage('')
              } else {
                setErrorMessage(message)
              }
            } finally {
              setIsSubmitting(false)
            }
          },
        })
        googleInitializedRef.current = true
      }

      googleButtonRef.current.innerHTML = ''
      const buttonWidth = Math.max(240, Math.min(360, googleButtonRef.current.clientWidth || 360))
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: buttonWidth,
      })
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-identity="1"]')
    if (existingScript) {
      renderGoogleButton()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.googleIdentity = '1'
    script.onload = renderGoogleButton
    document.head.appendChild(script)
  }, [router])

  const handleRecoverPassword = async () => {
    setErrorMessage('')
    setRecoverSuccessMessage('')
    const email = form.email.trim()
    if (!email) {
      setErrorMessage('Şifre sıfırlaması için yukarıdaki e-posta alanını doldurun.')
      return
    }
    setRecoverSubmitting(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = (await response.json()) as { error?: string; message?: string }
      if (!response.ok) {
        throw new Error(data?.error || 'İstek gönderilemedi.')
      }
      setRecoverSuccessMessage(data?.message || 'İşlem tamamlandı.')
      setForgotPasswordOpen(false)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'İstek gönderilemedi.')
    } finally {
      setRecoverSubmitting(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setRecoverSuccessMessage('')
    if (mode === 'register' && !acceptsPolicies) {
      setErrorMessage('Üyelik için politika metinlerini kabul etmelisiniz.')
      return
    }
    setIsSubmitting(true)

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const payload =
        mode === 'login'
          ? { email: form.email, password: form.password }
          : {
              firstName: form.firstName,
              lastName: form.lastName,
              email: form.email,
              password: form.password,
              phone: form.phone,
              acceptsPolicies,
            }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(data?.error || 'İşlem sırasında bir hata oluştu.')
      }

      window.dispatchEvent(new Event('auth:changed'))
      router.push('/account')
      router.refresh()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'İşlem sırasında bir hata oluştu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pb-20 pt-32 sm:pt-36">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <nav className="flex items-center gap-2 text-sm text-bronze/60">
              <Link href="/" className="transition-colors hover:text-bronze">
                Ana Sayfa
              </Link>
              <span>/</span>
              <span className="text-bronze">Üye Girişi / Üye Ol</span>
            </nav>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-bronze/15 bg-white p-5 shadow-sm sm:p-7"
            >
              <div className="mb-6 flex items-center gap-2 rounded-full border border-bronze/15 p-1">
                <button
                  onClick={() => {
                    setMode('login')
                    setErrorMessage('')
                    setRecoverSuccessMessage('')
                    setForgotPasswordOpen(false)
                  }}
                  className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                    mode === 'login'
                      ? 'bg-bronze text-white'
                      : 'text-bronze/70 hover:bg-ivory-warm'
                  }`}
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => {
                    setMode('register')
                    setErrorMessage('')
                    setRecoverSuccessMessage('')
                    setForgotPasswordOpen(false)
                  }}
                  className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                    mode === 'register'
                      ? 'bg-bronze text-white'
                      : 'text-bronze/70 hover:bg-ivory-warm'
                  }`}
                >
                  Üye Ol
                </button>
              </div>

              <div className="mb-6">
                <h1 className="font-serif text-3xl text-bronze-dark">
                  {mode === 'login' ? 'Hesabına Hoş Geldin' : 'EFTALIA Ailesine Katıl'}
                </h1>
                <p className="mt-2 text-sm text-bronze/60">
                  {mode === 'login'
                    ? 'Siparişlerini, favorilerini ve adres bilgilerini kolayca yönet.'
                    : 'Dakikalar içinde hesabını oluştur, özel fırsatları ilk sen yakala.'}
                </p>
              </div>

              <div className="mb-5">
                <div
                  ref={googleButtonRef}
                  className="flex min-h-[44px] items-center justify-center"
                />
                {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                  <p className="mt-2 text-xs text-bronze/60">
                    Google girişi için NEXT_PUBLIC_GOOGLE_CLIENT_ID değişkenini ekleyin.
                  </p>
                ) : null}
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {mode === 'register' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-bronze">Ad</label>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Adınız"
                        className="w-full rounded-lg border border-bronze/20 bg-white px-4 py-3 text-sm text-bronze placeholder:text-bronze/45 focus:border-bronze/40 focus:outline-none"
                        required={mode === 'register'}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-bronze">Soyad</label>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Soyadınız"
                        className="w-full rounded-lg border border-bronze/20 bg-white px-4 py-3 text-sm text-bronze placeholder:text-bronze/45 focus:border-bronze/40 focus:outline-none"
                        required={mode === 'register'}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-bronze">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="ornek@eposta.com"
                    className="w-full rounded-lg border border-bronze/20 bg-white px-4 py-3 text-sm text-bronze placeholder:text-bronze/45 focus:border-bronze/40 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-bronze">
                    Şifre
                  </label>
                  <div className="flex items-center rounded-lg border border-bronze/20 bg-white pr-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 text-sm text-bronze placeholder:text-bronze/45 focus:outline-none"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="rounded-md p-1.5 text-bronze/60 transition-colors hover:bg-ivory-warm hover:text-bronze"
                      aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'login' && forgotPasswordOpen ? (
                  <div className="space-y-3 rounded-lg border border-bronze/25 bg-ivory-warm/80 p-4">
                    <p className="text-sm leading-relaxed text-bronze/80">
                      Bu adres hesabınızda kayıtlıysa, şifre sıfırlama bağlantısı e-postanıza gönderilir. Önce
                      yukarıdaki e-posta alanını doldurun, ardından gönderin.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void handleRecoverPassword()}
                        disabled={recoverSubmitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-bronze px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-bronze-dark disabled:opacity-60"
                      >
                        <Mail className="h-4 w-4" />
                        {recoverSubmitting ? 'Gönderiliyor...' : 'Sıfırlama bağlantısı gönder'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotPasswordOpen(false)
                          setErrorMessage('')
                        }}
                        className="rounded-lg border border-bronze/25 px-4 py-2.5 text-sm font-medium text-bronze transition-colors hover:bg-white"
                      >
                        Kapat
                      </button>
                    </div>
                  </div>
                ) : null}

                {mode === 'register' && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-bronze">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="w-full rounded-lg border border-bronze/20 bg-white px-4 py-3 text-sm text-bronze placeholder:text-bronze/45 focus:border-bronze/40 focus:outline-none"
                    />
                  </div>
                )}

                {mode === 'register' && (
                  <div className="space-y-2 rounded-lg border border-bronze/15 bg-ivory-warm/70 p-3">
                    <label className="flex items-start gap-2 text-sm text-bronze/75">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-bronze"
                        checked={acceptsPolicies}
                        onChange={(e) => setAcceptsPolicies(e.target.checked)}
                        required
                      />
                      <span>
                        <Link href="/gizlilik-politikasi" className="underline underline-offset-2 hover:text-bronze">
                          Gizlilik Politikası
                        </Link>
                        ,{' '}
                        <Link href="/sartlar" className="underline underline-offset-2 hover:text-bronze">
                          Şartlar
                        </Link>{' '}
                        ve{' '}
                        <Link href="/iade" className="underline underline-offset-2 hover:text-bronze">
                          İade Politikası
                        </Link>{' '}
                        metinlerini okudum ve kabul ediyorum.
                      </span>
                    </label>
                  </div>
                )}

                {recoverSuccessMessage ? (
                  <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    {recoverSuccessMessage}
                  </p>
                ) : null}

                {errorMessage ? (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {errorMessage}
                  </p>
                ) : null}

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-sm text-bronze/70">
                    <input type="checkbox" className="h-4 w-4 accent-bronze" />
                    Beni hatırla
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordOpen((open) => !open)
                        setErrorMessage('')
                      }}
                      className={`text-sm font-medium underline-offset-4 transition-colors hover:underline ${
                        forgotPasswordOpen ? 'text-bronze' : 'text-bronze/70 hover:text-bronze'
                      }`}
                    >
                      {forgotPasswordOpen ? 'Şifre sıfırlamayı kapat' : 'Şifremi unuttum'}
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-bronze px-4 py-3.5 text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-bronze-dark"
                >
                  {mode === 'login' ? (
                    <>
                      <LogIn className="h-4 w-4" />
                      {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      {isSubmitting ? 'Üyelik Oluşturuluyor...' : 'Üyeliği Oluştur'}
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="rounded-2xl border border-bronze/15 bg-ivory-warm p-6 sm:p-8"
            >
              <h2 className="font-serif text-2xl text-bronze-dark">Neden EFTALIA Hesabı?</h2>
              <p className="mt-3 text-sm leading-relaxed text-bronze/70">
                Hesabınla sipariş süreçlerini tek ekrandan takip eder, favori ürünlerini kaydeder
                ve sana özel kampanyalardan ilk sen haberdar olursun.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3 rounded-xl border border-bronze/15 bg-white p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-bronze" />
                  <div>
                    <p className="text-sm font-medium text-bronze-dark">Güvenli Ödeme</p>
                    <p className="mt-1 text-sm text-bronze/65">
                      Kart bilgileriniz güvenli altyapı ile korunur.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-bronze/15 bg-white p-4">
                  <Truck className="mt-0.5 h-5 w-5 text-bronze" />
                  <div>
                    <p className="text-sm font-medium text-bronze-dark">Hızlı Kargo</p>
                    <p className="mt-1 text-sm text-bronze/65">
                      Siparişleriniz kısa sürede hazırlanıp kargoya teslim edilir.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-bronze/15 bg-white p-4">
                  <RotateCcw className="mt-0.5 h-5 w-5 text-bronze" />
                  <div>
                    <p className="text-sm font-medium text-bronze-dark">Kolay İade</p>
                    <p className="mt-1 text-sm text-bronze/65">
                      14 gün içinde pratik iade/değişim desteği.
                    </p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  )
}
