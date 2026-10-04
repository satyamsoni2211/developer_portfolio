import { Globe, Mail } from 'lucide-react'
import { profile } from '@/data/profile'
import { cn } from '@/lib/utils'
import { GitHubIcon, LinkedInIcon, XIcon } from './icons'

const LINKS = [
  { label: 'GitHub', href: profile.github, Icon: GitHubIcon },
  { label: 'LinkedIn', href: profile.linkedin, Icon: LinkedInIcon },
  { label: 'X (Twitter)', href: profile.x, Icon: XIcon },
  { label: 'Website', href: profile.website, Icon: Globe },
  { label: 'Email', href: `mailto:${profile.email}`, Icon: Mail },
]

export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn('flex items-center gap-2', className)}>
      {LINKS.map(({ label, href, Icon }) => (
        <li key={label}>
          <a
            href={href}
            aria-label={label}
            title={label}
            {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-fg/[.06] hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Icon className="h-[18px] w-[18px]" />
          </a>
        </li>
      ))}
    </ul>
  )
}
