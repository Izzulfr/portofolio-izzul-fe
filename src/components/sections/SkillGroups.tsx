import { motion } from 'motion/react'
import { fadeUp, inViewOnce, stagger } from '@/lib/motion'
import type { SkillGroup } from '@/lib/types'
import { cn, pad } from '@/lib/utils'

export function SkillGroups({ groups, className }: { groups: SkillGroup[]; className?: string }) {
  return (
    <motion.ul
      className={cn('grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3', className)}
      variants={stagger(0.08)}
      initial="hidden"
      whileInView="visible"
      viewport={inViewOnce}
    >
      {groups.map((group, index) => (
        <motion.li key={group.id} variants={fadeUp} className="group/skill border-t border-line pt-6">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-ink-subtle transition-colors duration-300 group-hover/skill:text-accent-ink">
              {pad(index + 1)}
            </span>
            <h3 className="text-lg font-medium tracking-[-0.015em]">{group.title}</h3>
          </div>
          {group.description && <p className="mt-2 text-sm text-ink-muted">{group.description}</p>}
          <ul className="mt-5 flex flex-wrap gap-2">
            {group.items.map((item) => (
              <li
                key={item}
                className="rounded-full border border-line bg-surface px-3 py-1 text-[0.8125rem] leading-5 text-ink-muted transition-[border-color,color,translate] duration-300 hover:-translate-y-0.5 hover:border-line-strong/70 hover:text-ink"
              >
                {item}
              </li>
            ))}
          </ul>
        </motion.li>
      ))}
    </motion.ul>
  )
}
