import { useQuery } from '@tanstack/react-query'
import { ContactCta } from '@/components/sections/ContactCta'
import { ExperienceTimeline } from '@/components/sections/ExperienceTimeline'
import { Hero } from '@/components/sections/Hero'
import { PostList, PostListSkeleton } from '@/components/sections/PostList'
import { ProjectCard, ProjectCardSkeleton } from '@/components/sections/ProjectCard'
import { SkillGroups } from '@/components/sections/SkillGroups'
import { StatsStrip } from '@/components/sections/StatsStrip'
import { ButtonArrow, ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ErrorState } from '@/components/ui/States'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { queries } from '@/lib/queries'
import { cn } from '@/lib/utils'

function SelectedWork() {
  const { data, isPending, isError, refetch } = useQuery(queries.projects({ featured: true }))

  return (
    <section aria-labelledby="work-title" className="container-page py-24 md:py-36">
      <SectionHeading
        id="work-title"
        index="01"
        eyebrow="Selected work"
        title="Systems I helped *bring to life*."
        description="Requirements, process design and coordination behind products in education, business and the enterprise."
        action={
          <ButtonLink to="/projects" variant="secondary">
            All projects
            <ButtonArrow />
          </ButtonLink>
        }
      />

      {isError ? (
        <ErrorState className="mt-14" onRetry={() => void refetch()} />
      ) : (
        <div className="mt-14 grid gap-x-8 gap-y-16 md:mt-20 md:grid-cols-2 md:pb-24">
          {isPending
            ? Array.from({ length: 4 }, (_, index) => (
                <div key={index} className={cn(index % 2 === 1 && 'md:translate-y-24')}>
                  <ProjectCardSkeleton />
                </div>
              ))
            : data.map((project, index) => (
                <Reveal key={project.id} className={cn(index % 2 === 1 && 'md:translate-y-24')}>
                  <ProjectCard project={project} index={index} />
                </Reveal>
              ))}
        </div>
      )}
    </section>
  )
}

function Capabilities() {
  const { data, isError, refetch } = useQuery(queries.skills())

  return (
    <section aria-labelledby="skills-title" className="border-t border-line bg-surface/60">
      <div className="container-page py-24 md:py-32">
        <SectionHeading
          id="skills-title"
          index="02"
          eyebrow="Capabilities"
          title="Where business meets *delivery*."
          description="The methods and tools I use to turn a need into scope, a process into a diagram, and a plan into a release."
        />
        {isError ? (
          <ErrorState className="mt-14" onRetry={() => void refetch()} />
        ) : (
          data && <SkillGroups groups={data} className="mt-14 md:mt-20" />
        )}
      </div>
    </section>
  )
}

function ExperiencePreview() {
  const { data, isError, refetch } = useQuery(queries.experiences())

  return (
    <section aria-labelledby="experience-title" className="container-page py-24 md:py-36">
      <SectionHeading
        id="experience-title"
        index="03"
        eyebrow="Experience"
        title="Where I have been *doing the work*."
        action={
          <ButtonLink to="/about#experience" variant="secondary">
            Full experience
            <ButtonArrow />
          </ButtonLink>
        }
      />
      <div className="mt-14 md:mt-20">
        {isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : (
          data && <ExperienceTimeline items={data.slice(0, 4)} compact />
        )}
      </div>
    </section>
  )
}

function LatestWriting() {
  const { data, isPending, isError, refetch } = useQuery(queries.posts({ pageSize: 3 }))

  if (!isPending && !isError && data.data.length === 0) return null

  return (
    <section aria-labelledby="writing-title" className="border-t border-line">
      <div className="container-page py-24 md:py-32">
        <SectionHeading
          id="writing-title"
          index="04"
          eyebrow="Writing"
          title="Notes from the *requirements side*."
          action={
            <ButtonLink to="/blog" variant="secondary">
              All articles
              <ButtonArrow />
            </ButtonLink>
          }
        />
        <div className="mt-14 md:mt-16">
          {isError ? (
            <ErrorState onRetry={() => void refetch()} />
          ) : isPending ? (
            <PostListSkeleton />
          ) : (
            <PostList posts={data.data} />
          )}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const { data: site, isError, refetch } = useQuery(queries.site())
  useDocumentMeta({})

  if (isError) {
    return (
      <div className="container-page pb-24 pt-40">
        <ErrorState
          title="The portfolio could not load"
          message="The content service did not respond. If it has been asleep, it usually wakes within a minute."
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  return (
    <>
      <Hero site={site} />
      {site && <StatsStrip stats={site.stats} />}
      <SelectedWork />
      <Capabilities />
      <ExperiencePreview />
      <LatestWriting />
      <ContactCta />
    </>
  )
}
