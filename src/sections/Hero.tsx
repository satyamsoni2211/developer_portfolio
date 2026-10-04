import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { buttonClass } from '@/components/Button'
import { CountUp } from '@/components/CountUp'
import { RevealGroup, RevealItem } from '@/components/Reveal'
import { experience } from '@/data/experience'
import { profile } from '@/data/profile'
import { projects } from '@/data/projects'
import { HeroCharacter } from '@/guide/HeroCharacter'
import { scrollToId } from '@/lib/scroll'

const STATS = [
  { value: 10, suffix: '+', label: 'years building software' },
  { value: experience.length, label: 'companies' },
  { value: projects.length, label: 'featured projects' },
  { value: 10, suffix: '+', label: 'engineers led' },
]

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yTitle = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -120])
  const yPitch = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0])

  return (
    <section id="hero" ref={ref} aria-labelledby="hero-title" className="relative overflow-hidden pb-16 pt-28 sm:pt-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.25fr_.75fr]">
        <motion.div style={{ y: yTitle, opacity: fade }}>
          <RevealGroup>
            <RevealItem>
              <p className="text-sm font-medium text-muted">
                {profile.role} · {profile.location}
              </p>
            </RevealItem>
            <RevealItem>
              <h1 id="hero-title" className="mt-4 text-display font-semibold">
                {profile.name}
                <span className="text-accent">.</span>
              </h1>
            </RevealItem>
            <RevealItem>
              <motion.p style={{ y: yPitch }} className="mt-6 max-w-xl text-2xl leading-snug text-muted sm:text-3xl">
                {profile.pitch}
              </motion.p>
            </RevealItem>
            <RevealItem className="mt-10 flex flex-wrap gap-3">
              <button type="button" onClick={() => scrollToId('projects')} className={buttonClass('primary')}>
                View work
              </button>
              <button type="button" onClick={() => scrollToId('contact')} className={buttonClass('secondary')}>
                Get in touch
              </button>
            </RevealItem>
          </RevealGroup>

          <dl className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col-reverse justify-end">
                <dt className="mt-1 text-sm text-muted">{s.label}</dt>
                <dd className="text-4xl font-semibold tracking-tight">
                  <CountUp value={s.value} suffix={s.suffix} />
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <div className="flex justify-center lg:justify-end">
          <HeroCharacter />
        </div>
      </div>
    </section>
  )
}
