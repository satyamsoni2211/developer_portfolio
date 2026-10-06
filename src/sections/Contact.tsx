import { useRef, useState } from 'react'
import { Check, Copy, Mail } from 'lucide-react'
import { buttonClass } from '@/components/Button'
import { ContactForm } from '@/components/ContactForm'
import { Reveal } from '@/components/Reveal'
import { SocialLinks } from '@/components/SocialLinks'
import { useToast } from '@/components/Toast'
import { profile } from '@/data/profile'
import { copyText } from '@/lib/clipboard'

export function Contact() {
  const toast = useToast()
  const emailRef = useRef<HTMLSpanElement>(null)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (await copyText(profile.email)) {
      setCopied(true)
      toast('Email copied')
      window.setTimeout(() => setCopied(false), 2000)
      return
    }
    if (emailRef.current) window.getSelection()?.selectAllChildren(emailRef.current)
    toast('Press ⌘C to copy')
  }

  return (
    <section id="contact" aria-labelledby="contact-title" className="py-28 sm:py-40">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Reveal>
          <p className="text-sm font-semibold text-accent">Contact</p>
          <h2 id="contact-title" className="mt-3 text-display font-semibold">
            Let&apos;s build something.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-muted">{profile.contactBlurb}</p>
        </Reveal>
        <Reveal className="mx-auto mt-12 max-w-2xl">
          <ContactForm />
        </Reveal>
        <p className="mt-10 text-sm text-muted">Prefer your own mail client?</p>
        <Reveal className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href={`mailto:${profile.email}`} className={buttonClass('primary')}>
            <Mail aria-hidden className="h-4 w-4" />
            <span ref={emailRef}>{profile.email}</span>
          </a>
          <button type="button" onClick={copy} aria-label="Copy email address" className={buttonClass('secondary')}>
            {copied ? <Check aria-hidden className="h-4 w-4" /> : <Copy aria-hidden className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </Reveal>
        <Reveal className="mt-10 flex flex-col items-center gap-6">
          <SocialLinks />
          <p className="text-sm text-muted">{profile.resumeNote}</p>
        </Reveal>
      </div>
    </section>
  )
}
