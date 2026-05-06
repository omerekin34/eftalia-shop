import { RefreshCw, ShieldCheck, CalendarClock, ClipboardCheck } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { mergeStorePolicyClaims } from '@/lib/policy-claims'
import { getShopPolicyClaimsFromMetafield } from '@/lib/shopify-admin'

export default async function IadePage() {
  const storeClaims = mergeStorePolicyClaims(await getShopPolicyClaimsFromMetafield())
  const supportEmail = storeClaims.supportEmail

  return (
    <main className="min-h-screen bg-ivory">
      <Navbar />
      <section className="border-b border-bronze/10 bg-ivory-warm pt-32 sm:pt-36">
        <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.25em] text-bronze/70">DESTEK</p>
          <h1 className="mt-3 font-serif text-4xl text-bronze">İade ve Değişim</h1>
          <p className="mt-4 max-w-3xl text-sm text-bronze/75 sm:text-base">
            {storeClaims.returnWindow} {storeClaims.returnCondition}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-bronze/15 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-2xl text-bronze-dark sm:text-3xl">İade Politikası</h2>
          </div>

          <article className="mt-6 space-y-6 text-sm leading-relaxed text-bronze/80 sm:text-base">
            <div>
              <p>
                {storeClaims.returnWindow}
              </p>
            </div>

            <div>
              <p className="font-medium text-bronze-dark">İade edebilmeniz için ürünün:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>kullanılmamış ve giyilmemiş olması,</li>
                <li>etiketli olması,</li>
                <li>orijinal ambalajında bulunması,</li>
                <li>satın alma belgesi/makbuz ile birlikte gönderilmesi gerekir.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p>
                İade başlatmak için bizimle şu e-posta adresinden iletişime geçebilirsiniz:{' '}
                <a className="underline underline-offset-2" href={`mailto:${supportEmail}`}>
                  {supportEmail}
                </a>
              </p>
              <p>İade adresi: [İADE ADRESİNİ GİRİN]</p>
              <p>
                İadeniz onaylandığında size iade kargo etiketi ve gönderim talimatları iletilir. Önceden iade talebi
                oluşturulmadan gönderilen ürünler kabul edilmez.
              </p>
              <p>
                İade ve değişim sorularınız için:{' '}
                <a className="underline underline-offset-2" href={`mailto:${supportEmail}`}>
                  {supportEmail}
                </a>
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl text-bronze-dark">Hasarlar ve Sorunlar</h3>
              <p className="mt-2">
                Siparişinizi teslim aldığınızda lütfen kontrol ediniz. Ürün kusurlu, hasarlı veya yanlış geldiyse en
                kısa sürede bizimle iletişime geçin; durumu değerlendirip gerekli çözümü sağlayalım.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl text-bronze-dark">İstisnalar / İade Edilemeyen Ürünler</h3>
              <p className="mt-2">Aşağıdaki ürünlerde iade kabul edilmez:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Bozulabilir ürünler (ör. yiyecek, çiçek, bitki)</li>
                <li>Özel üretim / kişiselleştirilmiş ürünler</li>
                <li>Kişisel bakım ürünleri (ör. güzellik ürünleri)</li>
                <li>Tehlikeli maddeler, yanıcı sıvılar veya gazlar</li>
                <li>İndirimli ürünler</li>
                <li>Hediye kartları</li>
              </ul>
              <p className="mt-2">Belirli bir ürün için emin değilseniz bizimle iletişime geçebilirsiniz.</p>
            </div>

            <div>
              <h3 className="font-serif text-xl text-bronze-dark">Değişim</h3>
              <p className="mt-2">
                Değişim için en hızlı yöntem, mevcut ürünü iade edip iade onayından sonra yeni ürün için ayrı sipariş
                oluşturmaktır.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl text-bronze-dark">Avrupa Birliği İçin 14 Günlük Cayma Hakkı</h3>
              <p className="mt-2">
                Avrupa Birliği’ne gönderilen siparişlerde, ürünü teslim aldıktan sonra <strong>14 gün</strong> içinde
                herhangi bir gerekçe göstermeden iptal veya iade talep edebilirsiniz. Ürün, kullanılmamış, etiketli,
                orijinal ambalajında ve satın alma belgesi ile birlikte olmalıdır.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl text-bronze-dark">Para İadesi</h3>
              <p className="mt-2">
                İade ürününüz tarafımıza ulaşıp incelendikten sonra, iadenizin onay durumu size bildirilir.{' '}
                {storeClaims.refundWindow}
              </p>
              <p className="mt-2">
                Bankanızın veya kart sağlayıcınızın işlem süresi ek zaman alabilir. İade onayından sonra{' '}
                <strong>15 iş günü</strong> geçtiği halde ücret hesabınıza yansımadıysa lütfen bizimle iletişime
                geçin:{' '}
                <a className="underline underline-offset-2" href={`mailto:${supportEmail}`}>
                  {supportEmail}
                </a>
              </p>
            </div>
          </article>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-bronze/10 bg-white p-5">
            <RefreshCw className="h-5 w-5 text-bronze" />
            <p className="mt-2 text-sm text-bronze/70">Başvurunuzu Shopify iade akışıyla başlatabilirsiniz.</p>
          </div>
          <div className="rounded-xl border border-bronze/10 bg-white p-5">
            <ClipboardCheck className="h-5 w-5 text-bronze" />
            <p className="mt-2 text-sm text-bronze/70">İnceleme sonrası iade/değişim sonucu tarafınıza bildirilir.</p>
          </div>
          <div className="rounded-xl border border-bronze/10 bg-white p-5">
            <CalendarClock className="h-5 w-5 text-bronze" />
            <p className="mt-2 text-sm text-bronze/70">Süreç durumunu hesabınız ve e-posta bildirimlerinden takip edebilirsiniz.</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-bronze/15 bg-ivory-warm p-5 text-sm text-bronze/75">
          <div className="mb-2 flex items-center gap-2 text-bronze">
            <ShieldCheck className="h-4 w-4" /> Güvenli süreç
          </div>
          İade sürecinde tüm bilgi akışı kayıt altındadır. İhtiyaç durumunda destek ekibimiz sürecin her adımında
          yanınızdadır.
        </div>
      </section>
      <Footer />
    </main>
  )
}
