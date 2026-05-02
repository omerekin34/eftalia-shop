'use client'

import { notFound, useParams } from 'next/navigation'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { Bolt, Gem, Leaf, Package, Recycle, Scissors, Rows4, BadgeCheck, Shirt } from 'lucide-react'
import {
  AboutPremiumStory,
  type AboutPremiumContent,
} from '@/components/storefront/hikayemiz-story'

const zanaatimizPillarIcons: [typeof Scissors, typeof Rows4, typeof BadgeCheck] = [
  Scissors,
  Rows4,
  BadgeCheck,
]

const malzemelerPillarIcons: [typeof Gem, typeof Shirt, typeof Bolt] = [Gem, Shirt, Bolt]

const surdurulebilirlikPillarIcons: [typeof Leaf, typeof Recycle, typeof Package] = [Leaf, Recycle, Package]

const hikayemizContent: AboutPremiumContent = {
  eyebrow: 'Hakkımızda',
  title: 'Hikayemiz',
  lead:
    'Eftalia, detayın peşinde koşan bir merakla doğdu: cüzdanın avucunuzda bıraktığı sıcaklık, çantanın omzunuzdaki duruşu.',
  intro:
    'Cüzdan ve kartlıklarda seçkin deri işçiliği; çantalarda nefes alan gabardin kumaş. Biz, hızlı tüketim ritmine değil—yıllara yayılan bir kullanım ilişkisine inanıyoruz. Her parça, gerçek bir ihtiyaca cevap verirken estetiği ihmal etmez.',
  pillars: [
    'Deri ve gabardin, aynı titizlikle',
    'Zamansız, sade, güçlü silüetler',
    'Kaliteyi anlatmaktan çok, hissettirmek',
  ],
  details: [
    {
      title: 'Başlangıç noktamız',
      text: 'Markanın kalbinde “daha az ama daha iyi” ilkesi var. Cüzdan ve kartlıklar derinin sıcaklığını taşır; gabardin gövdeli çantalar ise günlük hayatta hafif ve kararlı bir duruş sunar. Biz üretiyoruz; siz yıllarca yanınızda taşıyorsunuz.',
    },
    {
      title: 'Tasarım felsefemiz',
      text: 'Duru çizgiler, dengeli oranlar ve gereksiz süslerden arınmış bir dil. Deride dokunun zarafetiyle gabardin kumaşın düzgün düşüşünü aynı çatı altında buluşturuyoruz. Trende göre değil, kimliğe göre—her koleksiyonda net bir Eftalia karakteri.',
    },
    {
      title: 'Bugün ve gelecek',
      text: 'Bugün Eftalia; şeffaf iletişim, özenli paketleme ve güvenli ödeme altyapısıyla büyüyor. Yarın da aynı netlikle: malzemeye saygı, işçiliğe sadakat, size karşı dürüstlük. Hikâye koleksiyonlarla yenilenir; sözümüz değişmez.',
    },
  ],
  closing:
    'Hikâyamız koleksiyonlarla yenilenir; özünde ise hep aynı değerler: kalite, sadelik ve güven. Bir deri detayı, bir gabardin çizgisi—Eftalia’nın imzası.',
}

const zanaatimizContent: AboutPremiumContent = {
  eyebrow: 'Atölye',
  title: 'Zanaatımız',
  lead:
    'Hız, bizim terazimizin kefesinde değil: terazinin diğer tarafında hassasiyet, sabır ve tekrar eden el disiplini var.',
  intro:
    'Cüzdan ve kartlıklarda deri; çantalarda gabardin—her malzeme kendi dilinde işlenir. Ölçüm, kesim ve dikiş aşamaları ürünün ömrünü belirler; son kontrol ise Eftalia’nın size verdiği sözün mührüdür.',
  pillars: [
    'Deri ve kumaşta aynı ölçü disiplini',
    'Çok adımlı kalite kontrol',
    'Paket öncesi son dokunuş',
  ],
  details: [
    {
      title: 'Kesim ve form',
      text: 'Deri takımları ile gabardin paneller, kalıp ve toleransa göre işaretlenir; kesim hatları hem görünümü hem taşıma gücünü tanımlar. Bir milimetrenin ürünün omuzda duruşuna etkisini bilerek çalışırız.',
    },
    {
      title: 'Dikiş disiplini',
      text: 'İplik, ara yükseltisi ve dikiş sıklığı; çantanın yük taşıma senaryolarına ve deri küçük ürünlerin günlük sürtünmesine göre seçilir. Omuz askıları, köşe birleşimleri ve kritik birleşimlerde ek güçlendirme ihmal edilmez.',
    },
    {
      title: 'Son kontrol',
      text: 'Yüzey homojenliği, aksesuar uyumu, fermuar akışı, iç bölmeler ve paket öncesi son bakım tek tek geçer. O kutunun içinden çıkan şey yalnızca bir ürün değil—Eftalia’nın size sunduğu güven.',
    },
  ],
  closing:
    'Zanaat bizde yalnızca teknik değil; ürünü son kullanıcıya terbiye ile teslim etmenin yolu. Her düğümde, her dikişte, her pakette aynı saygı.',
}

const malzemelerContent: AboutPremiumContent = {
  eyebrow: 'Kalite',
  title: 'Malzemeler',
  lead:
    'İyi bir ürün görünümle başlamaz; dokunuşla—derinin avucunuzda yumuşaması, gabardinin omuzda düzgün oturmasıyla.',
  intro:
    'Cüzdan ve kartlıklarda seçtiğimiz deriler; yaş aldıkça karakterini koruyan yüzey ve yapı sunar. Çantalarda kullandığımız gabardin kumaş ise nefes alan yapısıyla günlük kullanımda stabil bir gövde oluşturur. Her bileşen, ilk günkü çekiciliği yıllara yaymak için seçilir.',
  pillars: ['Seçkin deri ve gabardin kaynakları', 'Astar ve bölmelerde sürtünme testi', 'Metalde kaplama ve uyum kontrolü'],
  details: [
    {
      title: 'Deri seçimi',
      text: 'Cüzdan ve kartlık için yüzey düzeni, esneme ve yaş alma dengesi gözetilir; tok sesli parlaklıktan çok, zamanla güzelleşen bir patina hedeflenir. Deri, ürünün küçük gövdesinde bile “elin altında” kaliteli hissettirmelidir.',
    },
    {
      title: 'Gabardin, astar ve iç düzen',
      text: 'Gabardin panellerde gramaj ve dokuma sıklığı; çantanın omuzda düşüşünü ve yükle karşı duruşunu etkiler. İç astar ve bölmeler, sürtünmeye maruz kalan bölgelerde günlük kullanım senaryolarına göre seçilir; kart gözlükleri ve bölmeler ergonomiyi yükseltir.',
    },
    {
      title: 'Metal aksesuar ve bağlantılar',
      text: 'Toka, halka, fermuar ve askı donanımında dayanıklılığı doğrulanmış parçalar kullanılır. Kaplama kalitesi, renk uyumu ve mekanik akış son kontrolde tek tek incelenir—bir fermuarın bile sessiz ve güvenilir kapanması bizim için mühendislik değil, zarafet meselesidir.',
    },
  ],
  closing:
    'Doğru malzeme fotoğrafta parlamak için değil; her sabah elinize aldığınızda aynı güveni tekrar etmek için seçilir. Deride sıcaklık, gabardinde denge, metalde sessizlik—Eftalia’nın malzeme dili.',
}

const surdurulebilirlikContent: AboutPremiumContent = {
  eyebrow: 'Sorumluluk',
  title: 'Sürdürülebilirlik',
  lead:
    'Bizce gerçek israf, çok üretmekten çok—erken eskiyen, çabuk vazgeçilen üründür. Ölçütümüz: parçanızın yıllara yayılması.',
  intro:
    'Deri cüzdan ve kartlıklar doğru bakımla karakterini korur; gabardin çantalar ise günlük kullanımda uzun süre formunu sürdürebilir. Bu uzun ömür, yerine yenisi alınmayı geciktirerek kaynak kullanımını doğrudan etkiler. Yeşil slogan üretmekten çok; planlı üretim, şeffaf iletişim ve paketlemeyi sadeleştirmek gibi somut adımlarla ilerliyoruz.',
  pillars: [
    'Uzun ömürlü ürün = daha az yenileme',
    'Talebe yakın üretim planı',
    'Ambalaj ve lojistikte azaltma',
  ],
  details: [
    {
      title: 'Önce uzun ömür',
      text: 'Tek kullanımlık moda döngüsüne inanmıyoruz. Derinin zamanla güzelleşmesi, gabardin gövdenin yıpranmadan taşınması için malzeme ve işçilik seçiminde “yarını” düşünüyoruz. Bir ürünü sık sık değiştirmek yerine, onu iyi kullanmak—bizim sürdürülebilirlik tanımımızın merkezinde bu var.',
    },
    {
      title: 'Planlı üretim, kontrollü stok',
      text: 'Koleksiyonları abartılı arz yerine gerçek talep öngüsüyle dengeliyoruz. Gereksiz üretimi azaltmak hem kaynak israfını hem de depoda bekleyen ürün riskini düşürür. Her şeyi mükemmel iddia etmiyoruz; ölçülü ve düzenli kalmayı hedefliyoruz.',
    },
    {
      title: 'Bakım, paket, sürekli iyileştirme',
      text: 'Deri ve kumaş için bakım önerileriyle ürün ömrünü uzun tutmanıza yardımcı oluyoruz. Paketlemeyi gereksiz katmanlardan arındırmaya, koli ve dolgu malzemesini azaltmaya özen gösteriyoruz; sevkiyat ve operasyon tarafında da verimi ve atığı birlikte izliyoruz. Bu bir bitiş çizgisi değil—her sezon biraz daha iyiye gitme çabası.',
    },
  ],
  closing:
    'Sürdürülebilirlik bizce tek seferlik bir kampanya değil; “bu ürün ne kadar süre kullanılacak?” sorusuna verilen dürüst cevap. Eftalia’da o cevap: mümkün olduğunca uzun.',
}

export default function AboutDetailPage() {
  const params = useParams()
  const slug = String(params.slug || '')

  const isPremium =
    slug === 'hikayemiz' ||
    slug === 'zanaatimiz' ||
    slug === 'malzemeler' ||
    slug === 'surdurulebilirlik'

  if (!isPremium) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-20 pt-28 sm:pt-32">
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {slug === 'hikayemiz' ? (
            <AboutPremiumStory content={hikayemizContent} />
          ) : slug === 'zanaatimiz' ? (
            <AboutPremiumStory content={zanaatimizContent} pillarIcons={zanaatimizPillarIcons} />
          ) : slug === 'malzemeler' ? (
            <AboutPremiumStory content={malzemelerContent} pillarIcons={malzemelerPillarIcons} />
          ) : slug === 'surdurulebilirlik' ? (
            <AboutPremiumStory content={surdurulebilirlikContent} pillarIcons={surdurulebilirlikPillarIcons} />
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  )
}
