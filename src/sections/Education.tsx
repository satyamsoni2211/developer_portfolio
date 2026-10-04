import { GraduationCap } from 'lucide-react'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { education } from '@/data/education'

export function Education() {
  return (
    <Section id="education" eyebrow="Education" title="Where it started.">
      <Reveal className="card flex flex-col gap-6 p-8 sm:flex-row sm:items-center">
        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <GraduationCap aria-hidden className="h-7 w-7" />
        </span>
        <div className="flex-1">
          <h3 className="text-xl font-semibold tracking-tight">{education.degree}</h3>
          <p className="mt-1 text-muted">
            {education.school} · {education.location}
          </p>
        </div>
        <div className="text-sm text-muted sm:text-right">
          <p>{education.period}</p>
          <p className="mt-1 font-medium text-fg">Score {education.gpa}</p>
        </div>
      </Reveal>
    </Section>
  )
}
