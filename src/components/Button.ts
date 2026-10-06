import { cn } from '@/lib/utils'

export function buttonClass(variant: 'primary' | 'secondary' = 'primary', className?: string): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-medium transition-[transform,background-color,color] duration-200 active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
    variant === 'primary' ? 'border border-transparent bg-accent-fill text-white hover:bg-accent-fill/90' : 'border border-line bg-fg/[.06] text-fg backdrop-blur-md hover:bg-fg/[.1]',
    className,
  )
}
