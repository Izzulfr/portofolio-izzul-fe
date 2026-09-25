import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { ContactCta } from '@/components/sections/ContactCta'
import { ProjectCard, ProjectCardSkeleton } from '@/components/sections/ProjectCard'
import { FilterChips } from '@/components/ui/Chip'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { ease } from '@/lib/motion'
import { queries } from '@/lib/queries'

const ALL = 'all'

export default function ProjectsPage() {
  const { data, isPending, isError, refetch } = useQuery(queries.projects())
  const [searchParams, setSearchParams] = useSearchParams()
  const active = searchParams.get('category') ?? ALL

  useDocumentMeta({
    title: 'Projects',
    description: 'Case studies of the systems Izzul Faturrizky analysed, documented and coordinated.',
  })

  const options = useMemo(() => {
    const counts = new Map<string, number>()
    for (const project of data ?? []) {
      if (project.category) counts.set(project.category, (counts.get(project.category) ?? 0) + 1)
    }
    return [
      { value: ALL, label: 'All', count: data?.length ?? 0 },
      ...[...counts].map(([category, count]) => ({ value: category, label: category, count })),
    ]
  }, [data])

  const visible = active === ALL ? data : data?.filter((project) => project.category === active)

  function select(category: string) {
    setSearchParams(category === ALL ? {} : { category }, { replace: true, preventScrollReset: true })
  }

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Systems, *documented* and delivered."
        description="Each project started with a need and ended with something people use. These are the requirements, processes and plans I brought to them."
      />

      <section aria-label="Project list" className="container-page pb-12 md:pb-20">
        {isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : (
          <>
            {data && options.length > 2 && (
              <FilterChips
                label="Filter projects by category"
                layoutId="project-filter"
                options={options}
                value={active}
                onChange={select}
              />
            )}

            <p aria-live="polite" className="sr-only">
              {visible ? `${visible.length} projects shown` : ''}
            </p>

            {isPending ? (
              <div className="mt-12 grid gap-x-8 gap-y-16 md:grid-cols-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <ProjectCardSkeleton key={index} />
                ))}
              </div>
            ) : visible && visible.length > 0 ? (
              <motion.ul layout className="mt-12 grid gap-x-8 gap-y-16 md:grid-cols-2">
                <AnimatePresence mode="popLayout" initial={false}>
                  {visible.map((project, index) => (
                    <motion.li
                      key={project.id}
                      layout
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.5, ease, delay: index * 0.04 }}
                    >
                      <ProjectCard project={project} index={index} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            ) : (
              <EmptyState className="mt-12" title="No projects here yet">
                Nothing is published in this category.
              </EmptyState>
            )}
          </>
        )}
      </section>

      <ContactCta />
    </>
  )
}
