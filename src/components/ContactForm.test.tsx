import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { AppProviders } from '@/AppProviders'
import type { SendResult } from '@/lib/contact'
import { ContactForm } from './ContactForm'

const fill = (name: string, email: string, message: string) => {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: name } })
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: message } })
}
const submit = () => fireEvent.click(screen.getByRole('button', { name: /send message/i }))
const mount = (props: Parameters<typeof ContactForm>[0]) => render(<AppProviders><ContactForm {...props} /></AppProviders>)
const MESSAGE = 'I would like to discuss a GenAI platform.'

describe('ContactForm', () => {
  test('shows field errors and sends nothing when the form is empty', () => {
    const send = vi.fn()
    mount({ accessKey: 'key', send })
    submit()
    expect(screen.getByText('Please enter your name.')).toBeInTheDocument()
    expect(screen.getByText('Please enter your email address.')).toBeInTheDocument()
    expect(screen.getByLabelText('Message')).toHaveAttribute('aria-invalid', 'true')
    expect(send).not.toHaveBeenCalled()
  })

  test('sends once, confirms and clears the form on success', async () => {
    let resolve!: (r: SendResult) => void
    const send = vi.fn(() => new Promise<SendResult>((r) => (resolve = r)))
    mount({ accessKey: 'key', send })
    fill('Ada', 'ada@example.com', MESSAGE)
    const button = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(button)
    // A second submit while the first is in flight (e.g. Enter key) must be ignored.
    fireEvent.submit(button.closest('form')!)
    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith({ name: 'Ada', email: 'ada@example.com', message: MESSAGE }, 'key')
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled()
    resolve({ ok: true })
    expect(await screen.findByRole('status')).toHaveTextContent(/Thanks/)
    expect(screen.getByLabelText('Message')).toHaveValue('')
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Another note' } })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  test('keeps the message and offers direct email when sending fails', async () => {
    const send = vi.fn().mockResolvedValue({ ok: false, error: "Couldn't send your message. Please try again, or email me directly." })
    mount({ accessKey: 'key', send })
    fill('Ada', 'ada@example.com', MESSAGE)
    submit()
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/Couldn't send/)
    expect(screen.getByLabelText('Message')).toHaveValue(MESSAGE)
    expect(screen.getByRole('link', { name: /email me directly/i })).toHaveAttribute('href', expect.stringMatching(/^mailto:satyamsoni@hotmail\.co\.uk\?subject=/))
    expect(screen.getByRole('button', { name: /send message/i })).toBeEnabled()
  })

  test('without an access key it opens a pre-filled email instead', () => {
    const send = vi.fn()
    const openMail = vi.fn()
    mount({ accessKey: '', send, openMail })
    fill('Ada', 'ada@example.com', MESSAGE)
    submit()
    expect(send).not.toHaveBeenCalled()
    expect(openMail).toHaveBeenCalledWith(expect.stringMatching(/^mailto:satyamsoni@hotmail\.co\.uk\?subject=/))
  })

  test('a filled honeypot is silently dropped', async () => {
    const send = vi.fn()
    const { container } = mount({ accessKey: 'key', send })
    fill('Bot', 'bot@example.com', MESSAGE)
    fireEvent.click(container.querySelector('input[name="botcheck"]')!)
    submit()
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument())
    expect(send).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Message')).toHaveValue(MESSAGE)
  })
})
