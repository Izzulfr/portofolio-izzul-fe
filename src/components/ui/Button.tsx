import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router'
import { cn, isExternalUrl } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'inverted'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-canvas hover:bg-ink/85',
  secondary: 'border border-line-strong/45 bg-surface/60 text-ink hover:border-ink hover:bg-surface',
  ghost: 'text-ink hover:bg-subtle',
  accent: 'bg-accent text-on-accent hover:bg-accent/90',
  inverted: 'border border-canvas/25 text-canvas hover:border-canvas/70 hover:bg-canvas/5',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 gap-1.5 px-4 text-sm',
  md: 'h-11 gap-2 px-5 text-[0.9375rem]',
  lg: 'h-13 gap-2.5 px-6 text-base',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(
    'group/button relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full font-medium tracking-[-0.01em]',
    'transition-[background-color,border-color,color,scale] duration-300 ease-out-quint active:scale-[0.97]',
    'disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  )
}

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

export const Button = forwardRef<
  HTMLButtonElement,
  CommonProps & ButtonHTMLAttributes<HTMLButtonElement>
>(function Button({ variant, size, className, type = 'button', ...props }, ref) {
  return <button ref={ref} type={type} className={buttonClass(variant, size, className)} {...props} />
})

type ButtonLinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    to: string
  }

/** Internal routes render a router Link; http(s), mailto: and file links a plain anchor. */
export function ButtonLink({ to, variant, size, className, ...props }: ButtonLinkProps) {
  const classes = buttonClass(variant, size, className)

  // Files in /media (a CV PDF, say) are static assets, not routes of this app.
  if (isExternalUrl(to) || /^(mailto:|tel:)/i.test(to) || to.startsWith('/media/')) {
    const newTab = isExternalUrl(to) || to.startsWith('/media/')
    return (
      <a
        href={to}
        className={classes}
        {...(newTab ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
        {...props}
      />
    )
  }

  return <Link to={to} className={classes} {...props} />
}

/** Arrow that nudges forward when its button is hovered. */
export function ButtonArrow({ external = false }: { external?: boolean }) {
  const Icon = external ? ArrowUpRight : ArrowRight
  return (
    <Icon
      aria-hidden
      className={cn(
        'size-4 transition-transform duration-300 ease-out-quint',
        external
          ? 'group-hover/button:-translate-y-0.5 group-hover/button:translate-x-0.5'
          : 'group-hover/button:translate-x-0.5',
      )}
    />
  )
}
