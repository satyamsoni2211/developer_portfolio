export const SECTIONS = [
  { id: 'about', label: 'About', nav: true },
  { id: 'experience', label: 'Experience', nav: true },
  { id: 'projects', label: 'Projects', nav: true },
  { id: 'opensource', label: 'Open Source', nav: true },
  { id: 'writing', label: 'Writing', nav: true },
  { id: 'speaking', label: 'Speaking', nav: true },
  { id: 'recommendations', label: 'Recommendations', nav: false },
  { id: 'skills', label: 'Skills', nav: true },
  { id: 'education', label: 'Education', nav: false },
  { id: 'contact', label: 'Contact', nav: true },
] as const

export type SectionId = 'hero' | (typeof SECTIONS)[number]['id']

export const SECTION_IDS: SectionId[] = ['hero', ...SECTIONS.map((s) => s.id)]

export const NAV_SECTIONS = SECTIONS.filter((s) => s.nav)
