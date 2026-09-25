import { useQueryClient } from '@tanstack/react-query'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { Tag } from '@/components/ui/Chip'
import { ProjectCover } from '@/components/ui/ProjectCover'
import { queries } from '@/lib/queries'
import type { ProjectSummary } from '@/lib/types'
import { pad } from '@/lib/utils'

export function ProjectCard({ project, index }: { project: ProjectSummary; index: number }) {
  const queryClient = useQueryClient()
  // Hovering a card starts loading its case study, so the page opens instantly.
  const prefetch = () => void queryClient.prefetchQuery(queries.project(project.slug))

  return (
    <article className="group/card relative" onMouseEnter={prefetch}>
      <div className="relative aspect-4/3 overflow-hidden rounded-[1.25rem] border border-line bg-subtle transition-[border-color,box-shadow] duration-500 group-hover/card:border-line-strong/40 group-hover/card:shadow-lifted">
        <div className="size-full transition-[scale] duration-[900ms] ease-out-quint group-hover/card:scale-[1.02]">
          <ProjectCover project={project} />
        </div>
        <span
          aria-hidden
          className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-ink text-canvas opacity-0 shadow-soft transition-[opacity,scale,rotate] duration-500 ease-out-quint [scale:0.6] group-hover/card:opacity-100 group-hover/card:[scale:1] group-focus-within/card:opacity-100 group-focus-within/card:[scale:1]"
        >
          <ArrowUpRight className="size-5" />
        </span>
      </div>

      <div className="mt-6 flex items-baseline justify-between gap-4">
        <p className="eyebrow">
          {pad(index + 1)}
          {project.category && <span className="text-ink-subtle"> · {project.category}</span>}
        </p>
        <p className="eyebrow text-right text-ink-subtle">{project.year ?? project.client}</p>
      </div>

      <h3 className="mt-3 text-headline font-medium">
        <Link
          to={`/projects/${project.slug}`}
          onFocus={prefetch}
          className="outline-none after:absolute after:inset-0 after:rounded-[1.25rem] focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-accent"
        >
          <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 ease-out-quint group-hover/card:bg-[length:100%_1px]">
            {project.title}
          </span>
        </Link>
      </h3>
      <p className="mt-3 max-w-xl text-ink-muted">{project.summary}</p>

      {project.deliverables.length > 0 && (
        <ul aria-label="Deliverables" className="mt-5 flex flex-wrap gap-2">
          {project.deliverables.map((item) => (
            <li key={item}>
              <Tag>{item}</Tag>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

export function ProjectCardSkeleton() {
  return (
    <div aria-hidden>
      <div className="skeleton aspect-4/3 rounded-[1.25rem]" />
      <div className="skeleton mt-6 h-3 w-32 rounded-full" />
      <div className="skeleton mt-4 h-7 w-3/4 rounded-lg" />
      <div className="skeleton mt-3 h-4 w-full rounded-full" />
      <div className="skeleton mt-2 h-4 w-2/3 rounded-full" />
    </div>
  )
}
