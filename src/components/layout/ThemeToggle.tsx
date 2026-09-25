import { Moon, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { MouseEvent } from 'react'
import { ease } from '@/lib/motion'
import { toggleTheme, useTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme()

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    // Keyboard activation has no pointer position: grow from the button's centre.
    const box = event.currentTarget.getBoundingClientRect()
    const fromPointer = event.detail > 0
    toggleTheme({
      x: fromPointer ? event.clientX : box.left + box.width / 2,
      y: fromPointer ? event.clientY : box.top + box.height / 2,
    })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className={cn(
        'relative grid size-10 place-items-center overflow-hidden rounded-full text-ink transition-colors duration-300 hover:bg-subtle',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 14, rotate: -45, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -14, rotate: 45, opacity: 0 }}
          transition={{ duration: 0.28, ease }}
          className="grid place-items-center"
        >
          {theme === 'dark' ? (
            <Moon aria-hidden className="size-[1.125rem]" strokeWidth={1.75} />
          ) : (
            <Sun aria-hidden className="size-[1.125rem]" strokeWidth={1.75} />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
