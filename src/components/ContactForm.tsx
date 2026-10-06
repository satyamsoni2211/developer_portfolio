import { useId, useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { profile } from '@/data/profile'
import { LIMITS, mailtoHref, sendContact, validateContact, type ContactErrors, type ContactFields } from '@/lib/contact'
import { buttonClass } from './Button'
import { useToast } from './Toast'

const EMPTY: ContactFields = { name: '', email: '', message: '' }
const ORDER: (keyof ContactFields)[] = ['name', 'email', 'message']

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string }

type Props = {
  accessKey?: string
  send?: typeof sendContact
  openMail?: (href: string) => void
}

export function ContactForm({
  accessKey = import.meta.env.VITE_WEB3FORMS_KEY ?? '',
  send = sendContact,
  openMail = (href) => window.location.assign(href),
}: Props) {
  const toast = useToast()
  const uid = useId()
  const [fields, setFields] = useState<ContactFields>(EMPTY)
  const [trap, setTrap] = useState(false)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const sending = status.kind === 'sending'
  const id = (name: string) => `${uid}-${name}`

  const set = (key: keyof ContactFields) => (e: { target: { value: string } }) => {
    setFields((f) => ({ ...f, [key]: e.target.value }))
    if (status.kind === 'sent' || status.kind === 'error') setStatus({ kind: 'idle' })
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (sending) return
    const found = validateContact(fields)
    setErrors(found)
    const firstBad = ORDER.find((key) => found[key])
    if (firstBad) {
      document.getElementById(id(firstBad))?.focus()
      return
    }
    // Bots fill every input; pretend it worked and send nothing.
    if (trap) {
      setStatus({ kind: 'sent' })
      return
    }
    if (!accessKey) {
      openMail(mailtoHref(profile.email, fields))
      return
    }
    setStatus({ kind: 'sending' })
    const result = await send(fields, accessKey)
    if (result.ok) {
      setFields(EMPTY)
      setStatus({ kind: 'sent' })
      toast('Message sent')
    } else {
      setStatus({ kind: 'error', message: result.error })
    }
  }

  const describe = (key: keyof ContactFields) => (errors[key] ? id(`${key}-error`) : undefined)
  const errorText = (key: keyof ContactFields) =>
    errors[key] && (
      <p id={id(`${key}-error`)} className="mt-1.5 text-sm text-danger">
        {errors[key]}
      </p>
    )

  return (
    <form noValidate onSubmit={onSubmit} className="card p-6 text-left sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={id('name')} className="mb-1.5 block text-sm font-medium">Name</label>
          <input
            id={id('name')}
            name="name"
            type="text"
            autoComplete="name"
            maxLength={LIMITS.name}
            value={fields.name}
            onChange={set('name')}
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={describe('name')}
            className="field"
          />
          {errorText('name')}
        </div>
        <div>
          <label htmlFor={id('email')} className="mb-1.5 block text-sm font-medium">Email</label>
          <input
            id={id('email')}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={LIMITS.email}
            value={fields.email}
            onChange={set('email')}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={describe('email')}
            className="field"
          />
          {errorText('email')}
        </div>
      </div>
      <div className="mt-5">
        <label htmlFor={id('message')} className="mb-1.5 block text-sm font-medium">Message</label>
        <textarea
          id={id('message')}
          name="message"
          rows={5}
          maxLength={LIMITS.message}
          value={fields.message}
          onChange={set('message')}
          aria-invalid={errors.message ? 'true' : undefined}
          aria-describedby={describe('message')}
          className="field resize-y"
        />
        {errorText('message')}
      </div>
      {/* Honeypot: hidden from people and assistive tech, irresistible to form-filling bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <input name="botcheck" type="checkbox" tabIndex={-1} autoComplete="off" checked={trap} onChange={(e) => setTrap(e.target.checked)} />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={sending} className={buttonClass('primary', 'disabled:cursor-not-allowed disabled:opacity-60')}>
          <Send aria-hidden className="h-4 w-4" />
          {sending ? 'Sending…' : 'Send message'}
        </button>
        {status.kind === 'sent' && (
          <p role="status" className="text-sm font-medium text-accent">
            Thanks — your message is on its way. I&apos;ll reply soon.
          </p>
        )}
        {status.kind === 'error' && (
          <p role="alert" className="text-sm text-danger">
            {status.message}{' '}
            <a href={mailtoHref(profile.email, fields)} className="font-medium underline">
              Email me directly
            </a>
          </p>
        )}
      </div>
    </form>
  )
}
