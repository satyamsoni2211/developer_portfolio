export const TIPS: Record<string, string> = {
  hero: "Hi, I'm Satyam 👋 Let me show you around.",
  about: 'Ten years across finance, telecom and real estate — here’s the short version.',
  experience: 'Click any role to read the full story.',
  projects: 'The big tiles are my collaborations — open one for the full case study.',
  opensource: 'Nine packages on PyPI — each one is a pip install away.',
  writing: 'Longer write-ups of the things I build.',
  recommendations: 'Don’t just take my word for it.',
  speaking: 'I love teaching what I build — these are my workshops.',
  skills: 'Python is home base, but I’m comfortable across the stack.',
  education: 'Where it all started — Indore, 2016.',
  contact: 'Say hi! Use the form or grab my email below.',
  'project:defect-detection': '97% accuracy in under 5 seconds — on hardware that stays in-house.',
  'project:stryve': 'MediaPipe pose extraction, fanned out across Celery workers.',
  'project:crickbuzz': 'EMA smoothing plus backfill recovers frames the detector misses.',
  'project:*': 'Scroll down for the architecture and the results.',
}

export function tipFor(context: string): string | null {
  if (TIPS[context]) return TIPS[context]
  if (context.startsWith('project:')) return TIPS['project:*']
  return null
}

export function nextTip(context: string, shown: Set<string>): string | null {
  if (shown.has(context)) return null
  const tip = tipFor(context)
  if (tip) shown.add(context)
  return tip
}

/** Tip for a companion that has come to rest — never consumed while it is faded out (unseen). */
export function restTip(context: string, shown: Set<string>, visible: boolean): string | null {
  return visible ? nextTip(context, shown) : null
}
