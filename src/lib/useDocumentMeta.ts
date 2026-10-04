import { useEffect } from 'react'
import { useLocation } from 'react-router'

export const SITE_URL = 'https://www.satyamsoni.com'

function upsert(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

export function useDocumentMeta(title: string, description?: string): void {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = title
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    const url = `${SITE_URL}${pathname}`
    upsert('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', url)
    upsert('meta[property="og:url"]', () => {
      const m = document.createElement('meta')
      m.setAttribute('property', 'og:url')
      return m
    }, 'content', url)
  }, [title, description, pathname])
}
