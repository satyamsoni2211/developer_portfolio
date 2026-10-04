type Store = 'local' | 'session'

function area(store: Store): Storage {
  return store === 'local' ? window.localStorage : window.sessionStorage
}

export function safeGet(key: string, store: Store = 'local'): string | null {
  try {
    return area(store).getItem(key)
  } catch {
    return null
  }
}

export function safeSet(key: string, value: string, store: Store = 'local'): void {
  try {
    area(store).setItem(key, value)
  } catch {
    // storage unavailable (private mode / blocked) — preference simply isn't remembered
  }
}

export function safeRemove(key: string, store: Store = 'local'): void {
  try {
    area(store).removeItem(key)
  } catch {
    // ignore
  }
}
