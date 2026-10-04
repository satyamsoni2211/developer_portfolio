import { RevealGroup, RevealItem } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { Tag } from '@/components/Tag'
import { marqueeSkills, skillCategories } from '@/data/skills'

export function Skills() {
  return (
    <Section id="skills" eyebrow="Skills" title="Python at the core. Comfortable across the stack.">
      <div className="marquee relative -mx-4 overflow-hidden py-2 sm:-mx-6 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <ul className="marquee-track flex w-max gap-10 text-2xl font-semibold tracking-tight text-muted/70 sm:text-3xl" aria-label="Key technologies">
          {[...marqueeSkills, ...marqueeSkills].map((s, i) => (
            <li key={`${s}-${i}`} aria-hidden={i >= marqueeSkills.length}>
              {s}
            </li>
          ))}
        </ul>
      </div>
      <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {skillCategories.map((cat) => (
          <RevealItem key={cat.id} className="card p-6">
            <h3 className="font-semibold">{cat.label}</h3>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {cat.items.map((item) => (
                <li key={item}>
                  <Tag>{item}</Tag>
                </li>
              ))}
            </ul>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  )
}
