import { ArrowUpRight } from 'lucide-react'
import { Section } from '@/components/Section'
import { TiltCard } from '@/components/TiltCard'
import { YearGroups } from '@/components/YearGroups'
import { packages, pypiProfile } from '@/data/opensource'
import { formatMonth } from '@/lib/dates'

const LINK =
  'inline-flex items-center gap-1 rounded text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

export function OpenSource() {
  return (
    <Section
      id="opensource"
      eyebrow="Open Source"
      title="Libraries I maintain."
      intro={`${packages.length} Python packages published on PyPI, grouped by latest release.`}
    >
      <YearGroups label="Open Source" items={packages} getKey={(p) => p.name}>
        {(p) => (
          <TiltCard>
            <article className="card flex h-full flex-col p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h4 className="break-all font-mono text-lg font-semibold tracking-tight">{p.name}</h4>
                <span className="text-xs text-muted">Released {formatMonth(p.released)}</span>
              </div>
              <p className="mt-3 text-muted">{p.summary}</p>
              <code className="mt-4 block break-all rounded-xl bg-fg/[.05] px-3 py-2 font-mono text-[13px]">
                {`pip install ${p.name}`}
              </code>
              <div className="mt-auto flex gap-5 pt-6">
                <a href={p.pypi} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} on PyPI`} className={LINK}>
                  PyPI <ArrowUpRight aria-hidden className="h-4 w-4" />
                </a>
                {p.repo && (
                  <a href={p.repo} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} source on GitHub`} className={LINK}>
                    Source <ArrowUpRight aria-hidden className="h-4 w-4" />
                  </a>
                )}
              </div>
            </article>
          </TiltCard>
        )}
      </YearGroups>
      <p className="mt-12">
        <a href={pypiProfile} target="_blank" rel="noopener noreferrer" className={LINK}>
          All packages on PyPI <ArrowUpRight aria-hidden className="h-4 w-4" />
        </a>
      </p>
    </Section>
  )
}
