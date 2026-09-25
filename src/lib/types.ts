// Shapes returned by the public CMS API.

export interface Profile {
  name: string
  headline: string
  roles: string[]
  summary: string
  bio: string
  location: string | null
  email: string | null
  avatarUrl: string | null
  resumeUrl: string | null
  availability: string | null
  isAvailable: boolean
}

export interface ProcessStep {
  title: string
  description: string
}

export interface SiteSettings {
  siteTitle: string
  siteDescription: string
  ogImageUrl: string | null
  heroTitle: string
  heroSubtitle: string
  processSteps: ProcessStep[]
  contactTitle: string
  contactText: string
  footerNote: string | null
}

export interface SocialLink {
  id: string
  label: string
  url: string
  icon: string
}

export interface Stat {
  id: string
  value: string
  label: string
}

export interface SiteData {
  profile: Profile
  settings: SiteSettings
  socials: SocialLink[]
  stats: Stat[]
}

export interface ProjectSummary {
  id: string
  slug: string
  title: string
  summary: string
  role: string | null
  client: string | null
  category: string | null
  year: string | null
  coverUrl: string | null
  coverAlt: string | null
  stack: string[]
  deliverables: string[]
  isFeatured: boolean
}

export interface ProjectDetail extends ProjectSummary {
  content: string
  liveUrl: string | null
  repoUrl: string | null
  updatedAt: string
}

export interface Neighbour {
  slug: string
  title: string
}

export interface ProjectResponse {
  project: ProjectDetail
  previous: Neighbour | null
  next: Neighbour | null
}

export interface Experience {
  id: string
  company: string
  companyUrl: string | null
  role: string
  employmentType: string | null
  location: string | null
  period: string
  isCurrent: boolean
  summary: string | null
  highlights: string[]
  tags: string[]
}

export interface SkillGroup {
  id: string
  title: string
  description: string | null
  items: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string | null
  period: string
  description: string | null
}

export interface Certification {
  id: string
  name: string
  issuer: string | null
  year: string | null
  credentialUrl: string | null
}

export interface Organization {
  id: string
  name: string
  role: string
  period: string
  description: string | null
}

export interface PostSummary {
  id: string
  slug: string
  title: string
  excerpt: string
  coverUrl: string | null
  tags: string[]
  readingMinutes: number
  publishedAt: string | null
}

export interface PostDetail extends PostSummary {
  content: string
  updatedAt: string
}

export interface PostListResponse {
  data: PostSummary[]
  meta: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    tags: string[]
  }
}

export interface PostResponse {
  post: PostDetail
  previous: Neighbour | null
  next: Neighbour | null
}
