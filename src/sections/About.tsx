import { Reveal, RevealGroup, RevealItem } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { Tag } from '@/components/Tag'
import { profile } from '@/data/profile'

export function About() {
  return (
    <Section id="about" eyebrow="About" title="A decade of turning messy data into dependable systems.">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_.9fr]">
        <RevealGroup className="space-y-5 text-lg leading-relaxed text-muted">
          {profile.bio.map((paragraph) => (
            <RevealItem key={paragraph.slice(0, 24)}>
              <p>{paragraph}</p>
            </RevealItem>
          ))}
        </RevealGroup>
        <RevealGroup as="ul" className="grid gap-4">
          {profile.pillars.map((pillar) => (
            <RevealItem as="li" key={pillar.title} className="card p-6">
              <h3 className="text-lg font-semibold">{pillar.title}</h3>
              <p className="mt-2 text-muted">{pillar.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
      <Reveal className="mt-14">
        <h3 className="text-sm font-medium text-muted">Industries</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {profile.industries.map((industry) => (
            <li key={industry}>
              <Tag>{industry}</Tag>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}
