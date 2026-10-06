import { describe, expect, test, vi } from 'vitest'
import { mailtoHref, sendContact, validateContact, WEB3FORMS_ENDPOINT } from './contact'

const good = { name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello, I would like to talk about a project.' }
const reply = (status: number, body: unknown) =>
  vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))

describe('validateContact', () => {
  test('accepts a complete message', () => {
    expect(validateContact(good)).toEqual({})
  })

  test('rejects empty and whitespace-only fields', () => {
    expect(Object.keys(validateContact({ name: '   ', email: '', message: ' \n ' })).sort()).toEqual(['email', 'message', 'name'])
  })

  test('rejects malformed email addresses', () => {
    for (const email of ['ada', 'ada@', '@example.com', 'ada@example', 'a da@example.com']) {
      expect(validateContact({ ...good, email }).email, email).toBeTruthy()
    }
  })

  test('rejects a too-short message and oversized fields', () => {
    expect(validateContact({ ...good, message: 'Hi' }).message).toBeTruthy()
    expect(validateContact({ ...good, message: 'x'.repeat(5001) }).message).toBeTruthy()
    expect(validateContact({ ...good, name: 'x'.repeat(101) }).name).toBeTruthy()
  })
})

describe('mailtoHref', () => {
  test('encodes subject and body', () => {
    const href = mailtoHref('me@example.com', { ...good, message: 'Line one\nLine & two' })
    expect(href.startsWith('mailto:me@example.com?subject=')).toBe(true)
    expect(href).toContain(encodeURIComponent('Portfolio enquiry from Ada Lovelace'))
    expect(href).toContain(encodeURIComponent('Line one\nLine & two'))
    expect(href).not.toContain(' ')
  })
})

describe('sendContact', () => {
  test('posts trimmed JSON with the access key and reports success', async () => {
    const fetchImpl = reply(200, { success: true })
    const result = await sendContact({ ...good, name: '  Ada Lovelace ' }, 'key-123', fetchImpl)
    expect(result).toEqual({ ok: true })
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe(WEB3FORMS_ENDPOINT)
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toMatchObject({
      access_key: 'key-123',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: good.message,
      subject: 'Portfolio enquiry from Ada Lovelace',
    })
  })

  test('reports failure when the service says success: false', async () => {
    expect(await sendContact(good, 'key', reply(200, { success: false, message: 'Invalid key' }))).toMatchObject({ ok: false })
  })

  test('reports failure on a server error with a non-JSON body', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 }))
    expect(await sendContact(good, 'key', fetchImpl)).toMatchObject({ ok: false })
  })

  test('reports failure when the network request rejects', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    const result = await sendContact(good, 'key', fetchImpl)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/email me directly/)
  })
})
