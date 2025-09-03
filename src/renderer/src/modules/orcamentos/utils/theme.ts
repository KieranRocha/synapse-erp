// theme.ts
export type Theme = 'light' | 'dark' | 'system'

export function setTheme(t: Theme) {
  const root = document.documentElement
  const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = t === 'system' ? (sysDark ? 'dark' : 'light') : t
  root.setAttribute('data-theme', resolved)
  localStorage.theme = t
}
