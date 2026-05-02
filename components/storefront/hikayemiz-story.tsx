'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { ArrowLeft, BadgeCheck, Feather, Layers3, Sparkles } from 'lucide-react'

export type AboutPremiumContent = {
  eyebrow: string
  title: string
  lead: string
  intro: string
  pillars: string[]
  details: { title: string; text: string }[]
  closing: string
}

/** @deprecated kullanım için AboutPremiumContent ile aynı */
export type HikayemizContent = AboutPremiumContent

const easeOut = [0.22, 1, 0.36, 1] as const

const fadeUp: import('framer-motion').Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: 0.06 * (typeof i === 'number' ? i : 0), ease: easeOut },
  }),
}

const DEFAULT_PILLAR_ICONS: [LucideIcon, LucideIcon, LucideIcon] = [Feather, Layers3, Sparkles]

type AboutPremiumStoryProps = {
  content: AboutPremiumContent
  pillarIcons?: [LucideIcon, LucideIcon, LucideIcon]
}

export function AboutPremiumStory({ content, pillarIcons = DEFAULT_PILLAR_ICONS }: AboutPremiumStoryProps) {
  const icons = pillarIcons

  return (
    <>
      <div className="mb-8">
        <Link
          href="/hakkimizda"
          className="inline-flex items-center gap-2 text-sm text-bronze/70 transition-colors hover:text-bronze"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Hakkımızda sayfasına dön
        </Link>
      </div>

      <section className="relative overflow-hidden rounded-[28px] border border-bronze/12 bg-gradient-to-br from-background via-ivory-warm/40 to-background shadow-[0_32px_80px_-48px_rgba(58,41,29,0.35)]">
        <div
          className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-rose/10 blur-3xl"
          aria-hidden
        />

        <div className="relative px-6 pb-12 pt-10 sm:px-10 sm:pb-14 sm:pt-12 lg:px-14">
          <motion.div custom={0} initial="hidden" animate="show" variants={fadeUp}>
            <p className="text-[11px] uppercase tracking-[0.35em] text-bronze/50">{content.eyebrow}</p>
            <h1 className="mt-4 max-w-[18ch] font-serif text-[2.35rem] leading-[1.08] tracking-tight text-bronze-dark sm:text-5xl lg:text-[3.25rem]">
              {content.title}
            </h1>
            <div className="mt-6 h-px max-w-[120px] bg-gradient-to-r from-gold/70 via-bronze/25 to-transparent" />
          </motion.div>

          <motion.div custom={1} initial="hidden" animate="show" variants={fadeUp} className="mt-8 space-y-5">
            <p className="font-serif text-xl italic leading-snug text-bronze-dark sm:text-2xl text-pretty">
              {content.lead}
            </p>
            <p className="max-w-3xl text-base leading-[1.75] text-bronze/75 sm:text-[17px]">{content.intro}</p>
          </motion.div>

          <motion.ul
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            variants={{
              show: { transition: { staggerChildren: 0.08 } },
            }}
            className="mt-10 grid gap-3 sm:grid-cols-3"
          >
            {content.pillars.map((pillar, i) => {
              const Icon = icons[i] ?? BadgeCheck
              return (
                <motion.li
                  key={pillar}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                  className="group relative overflow-hidden rounded-2xl border border-bronze/12 bg-white/75 px-4 py-5 shadow-sm backdrop-blur-[2px] transition-all duration-300 hover:border-gold/35 hover:shadow-[0_20px_50px_-38px_rgba(58,41,29,0.45)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative flex items-start gap-3">
                    <span className="mt-0.5 inline-flex rounded-lg border border-bronze/10 bg-ivory-warm/80 p-2 text-bronze/70 transition-colors group-hover:border-gold/30 group-hover:text-bronze">
                      <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                    </span>
                    <p className="text-sm font-medium leading-snug text-bronze-dark">{pillar}</p>
                  </div>
                </motion.li>
              )
            })}
          </motion.ul>
        </div>
      </section>

      <section className="mt-10 space-y-6 sm:mt-12">
        {content.details.map((detail, index) => {
          const isAlt = index % 2 === 1
          return (
            <motion.article
              key={detail.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className={`relative overflow-hidden rounded-2xl border px-6 py-7 sm:px-8 sm:py-8 ${
                isAlt
                  ? 'border-bronze/10 bg-gradient-to-br from-ivory-warm/60 via-background to-background'
                  : 'border-bronze/12 bg-white/90 shadow-[0_24px_60px_-44px_rgba(58,41,29,0.28)]'
              }`}
            >
              <span
                className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-gold/70 via-bronze/30 to-transparent"
                aria-hidden
              />
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-bronze/45">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h2 className="mt-2 font-serif text-2xl text-bronze-dark sm:text-[1.65rem]">{detail.title}</h2>
              <p className="mt-4 max-w-3xl text-sm leading-[1.8] text-bronze/75 sm:text-base">{detail.text}</p>
            </motion.article>
          )
        })}
      </section>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="relative mt-10 overflow-hidden rounded-2xl border border-bronze/20 bg-gradient-to-br from-bronze-dark via-bronze-dark to-[#2a1f18] px-6 py-8 sm:px-10 sm:py-10"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08),_transparent_55%)]" />
        <p className="relative max-w-3xl font-serif text-lg leading-[1.65] text-white/95 sm:text-xl">
          <span className="text-gold/90">“</span>
          {content.closing}
          <span className="text-gold/90">”</span>
        </p>
      </motion.div>
    </>
  )
}

export function HikayemizStory({ content }: { content: HikayemizContent }) {
  return <AboutPremiumStory content={content} />
}
