import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Link, useParams } from 'react-router'
import { AnimatedHeadline } from '@/components/ui/AnimatedHeadline'
import { ButtonArrow, ButtonLink } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Chip'
import Markdown from '@/components/ui/Markdown'
import { ProjectCover } from '@/components/ui/ProjectCover'
import { Reveal } from '@/components/ui/Reveal'
import { ErrorState } from '@/components/ui/States'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { ApiError } from '@/lib/api'
import { ease } from '@/lib/motion'
import { queries } from '@/lib/queries'
import type { Neighbour } from '@/lib/types'
import NotFoundPage from './NotFoundPage'

function DetailSkeleton() {
  return (
    <div aria-hidden className="container-page pb-24 pt-32 md:pt-44">
      <div className="skeleton h-4 w-28 rounded-full" />
      <div className="skeleton mt-10 h-16 w-3/4 rounded-2xl" />
      <div className="skeleton mt-6 h-6 w-1/2 rounded-full" />
      <div className="skeleton mt-16 aspect-16/9 rounded-[1.5rem]" />
    </div>
  )
}

function NextProject({ next }: { next: Neighbour }) {
  return (
    <section aria-label="Next project" className="border-t border-line">
      <Link to={`/projects/${next.slug}`} className="group/next block">
        <div className="container-page flex items-end justify-between gap-8 py-20 md:py-28">
          <div>
            <p className="eyebrow">Next project</p>
            <p className="mt-5 text-title font-medium transition-transform duration-700 ease-out-quint group-hover/next:translate-x-3">
              {next.title}
            </p>
          </div>
          <span className="grid size-14 shrink-0 place-items-center rounded-full border border-line transition-[background-color,border-color,color] duration-500 group-hover/next:border-ink group-hover/next:bg-ink group-hover/next:text-canvas md:size-20">
            <ArrowRight
              aria-hidden
              className="size-6 transition-transform duration-500 ease-out-quint group-hover/next:translate-x-1 md:size-7"
            />
          </span>
        </div>
      </Link>
    </section>
  )
}

export default function ProjectDetailPage() {
  const { slug = '' } = useParams()
  const { data, isPending, isError, error, refetch } = useQuery(queries.project(slug))
  const project = data?.project

  useDocumentMeta({ title: project?.title, description: project?.summary, image: project?.coverUrl })

  if (isError) {
    if (error instanceof ApiError && error.status === 404) return <NotFoundPage />
    return (
      <div className="container-page pb-24 pt-40">
        <ErrorState onRetry={() => void refetch()} />
      </div>
    )
  }

  if (isPending || !project) return <DetailSkeleton />

  const facts = [
    { label: 'Role', value: project.role },
    { label: 'Client', value: project.client },
    { label: 'Category', value: project.category },
    { label: 'Year', value: project.year },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value))

  return (
    <article>
      <header className="container-page pt-28 md:pt-40">
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease }}>
          <Link
            to="/projects"
            className="group/back eyebrow inline-flex items-center gap-2 transition-colors hover:text-ink"
          >
            <ArrowLeft
              aria-hidden
              className="size-3.5 transition-transform duration-300 group-hover/back:-translate-x-0.5"
            />
            All projects
          </Link>
        </motion.div>

        <AnimatedHeadline
          text={project.title}
          className="mt-10 max-w-5xl text-[clamp(2.5rem,1.35rem+4.6vw,5.75rem)] font-medium leading-[1] tracking-[-0.045em]"
        />

        <motion.p
          className="mt-8 max-w-3xl text-lead text-ink-muted"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.3 }}
        >
          {project.summary}
        </motion.p>

        {facts.length > 0 && (
          <motion.dl
            className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-8 md:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
          >
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="eyebrow">{fact.label}</dt>
                <dd className="mt-2 font-medium">{fact.value}</dd>
              </div>
            ))}
          </motion.dl>
        )}
      </header>

      <Reveal className="container-page mt-12 md:mt-16">
        <div className="aspect-4/3 overflow-hidden rounded-[1.5rem] border border-line sm:aspect-16/10">
          <ProjectCover project={project} priority size="hero" />
        </div>
      </Reveal>

      <div className="container-page grid gap-14 py-20 md:grid-cols-12 md:py-28">
        <aside className="md:col-span-4">
          <div className="space-y-10 md:sticky md:top-28">
            {project.deliverables.length > 0 && (
              <div>
                <p className="eyebrow">Deliverables</p>
                <ol className="mt-4 space-y-2">
                  {project.deliverables.map((item, index) => (
                    <li key={item} className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-ink-subtle">{String(index + 1).padStart(2, '0')}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {project.stack.length > 0 && (
              <div>
                <p className="eyebrow">Tools</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.stack.map((tool) => (
                    <li key={tool}>
                      <Tag>{tool}</Tag>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(project.liveUrl || project.repoUrl) && (
              <div className="flex flex-wrap gap-3">
                {project.liveUrl && (
                  <ButtonLink to={project.liveUrl} size="sm">
                    Visit site
                    <ButtonArrow external />
                  </ButtonLink>
                )}
                {project.repoUrl && (
                  <ButtonLink to={project.repoUrl} size="sm" variant="secondary">
                    Repository
                    <ArrowUpRight aria-hidden className="size-4" />
                  </ButtonLink>
                )}
              </div>
            )}
          </div>
        </aside>

        <Reveal className="md:col-span-8">
          {project.content ? (
            <Markdown>{project.content}</Markdown>
          ) : (
            <p className="text-ink-muted">The full case study is on its way.</p>
          )}
        </Reveal>
      </div>

      {data.next && <NextProject next={data.next} />}
    </article>
  )
}
