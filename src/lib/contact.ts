export type ContactFields = { name: string; email: string; message: string }
export type ContactErrors = Partial<Record<keyof ContactFields, string>>
export type SendResult = { ok: true } | { ok: false; error: string }

export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
export const LIMITS = { name: 100, email: 254, messageMin: 10, message: 5000 } as const
export const SEND_FAILED = "Couldn't send your message. Please try again, or email me directly."

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TIMEOUT_MS = 15_000

const subjectFor = (name: string) => `Portfolio enquiry from ${name.trim()}`

export function validateContact(fields: ContactFields): ContactErrors {
  const errors: ContactErrors = {}
  const name = fields.name.trim()
  const email = fields.email.trim()
  const message = fields.message.trim()
  if (!name) errors.name = 'Please enter your name.'
  else if (name.length > LIMITS.name) errors.name = `Keep your name under ${LIMITS.name} characters.`
  if (!email) errors.email = 'Please enter your email address.'
  else if (email.length > LIMITS.email || !EMAIL.test(email)) errors.email = 'That email address does not look right.'
  if (message.length < LIMITS.messageMin) errors.message = `Please write at least ${LIMITS.messageMin} characters.`
  else if (message.length > LIMITS.message) errors.message = `Keep your message under ${LIMITS.message} characters.`
  return errors
}

/** Fallback when the form service is not configured: a pre-filled email draft. */
export function mailtoHref(to: string, fields: ContactFields): string {
  const body = `${fields.message.trim()}\n\n— ${fields.name.trim()} (${fields.email.trim()})`
  return `mailto:${to}?subject=${encodeURIComponent(subjectFor(fields.name))}&body=${encodeURIComponent(body)}`
}

/** Sends the message through Web3Forms, which emails it to the address the access key belongs to. */
export async function sendContact(fields: ContactFields, accessKey: string, fetchImpl: typeof fetch = fetch): Promise<SendResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetchImpl(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: accessKey,
        name: fields.name.trim(),
        email: fields.email.trim(),
        message: fields.message.trim(),
        subject: subjectFor(fields.name),
        from_name: 'satyamsoni.com',
      }),
      signal: controller.signal,
    })
    const data = (await res.json().catch(() => null)) as { success?: boolean } | null
    return res.ok && data?.success === true ? { ok: true } : { ok: false, error: SEND_FAILED }
  } catch {
    return { ok: false, error: SEND_FAILED }
  } finally {
    clearTimeout(timer)
  }
}
