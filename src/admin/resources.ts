import {
  Award,
  ChartColumn,
  Briefcase,
  FileText,
  FolderKanban,
  GraduationCap,
  Settings,
  Share2,
  Sparkles,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type Row = Record<string, unknown> & { id: string }

export type FieldType =
  | 'text'
  | 'textarea'
  | 'markdown'
  | 'tags'
  | 'list'
  | 'select'
  | 'switch'
  | 'media'
  | 'url'
  | 'email'
  | 'slug'
  | 'repeater'
  | 'datetime'

export interface FieldConfig {
  name: string
  label: string
  type: FieldType
  required?: boolean
  hint?: string
  placeholder?: string
  maxLength?: number
  rows?: number
  options?: { value: string; label: string }[]
  /** Suggestions offered while typing in a text field. */
  suggestions?: string[]
  /** Placed in the narrow column next to the main form. */
  side?: boolean
  /** Spans the full width of the main column. */
  wide?: boolean
  accept?: 'image' | 'any'
  /** Media folder new uploads for this field go into. */
  folder?: 'projects' | 'posts' | 'profile' | 'site' | 'documents'
  itemFields?: FieldConfig[]
  itemLabel?: string
}

export interface ColumnConfig {
  key: string
  label: string
  kind?: 'text' | 'mono' | 'flag' | 'count'
}

export interface CollectionConfig {
  key: string
  label: string
  singular: string
  description: string
  icon: LucideIcon
  group: 'Content' | 'Site'
  titleKey: string
  subtitleKeys?: string[]
  columns: ColumnConfig[]
  fields: FieldConfig[]
  defaults: Record<string, unknown>
  sortable: boolean
  publicPath?: (row: Row) => string | null
}

export interface SingletonConfig {
  key: 'profile' | 'settings'
  label: string
  description: string
  icon: LucideIcon
  fields: FieldConfig[]
  publicPath: string
}

const published: FieldConfig = {
  name: 'isPublished',
  label: 'Published',
  type: 'switch',
  side: true,
  hint: 'Visible on the public site.',
}

export const collections: CollectionConfig[] = [
  {
    key: 'projects',
    label: 'Projects',
    singular: 'Project',
    description: 'Case studies shown on the Projects page. Featured ones also appear on the home page.',
    icon: FolderKanban,
    group: 'Content',
    titleKey: 'title',
    subtitleKeys: ['client', 'category'],
    columns: [
      { key: 'deliverables', label: 'Deliverables', kind: 'count' },
      { key: 'isFeatured', label: 'Featured', kind: 'flag' },
    ],
    sortable: true,
    defaults: { isPublished: true, isFeatured: false, stack: [], deliverables: [], content: '' },
    publicPath: (row) => (row.isPublished ? `/projects/${String(row.slug)}` : null),
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, wide: true, maxLength: 160 },
      {
        name: 'summary',
        label: 'Summary',
        type: 'textarea',
        required: true,
        wide: true,
        rows: 3,
        maxLength: 400,
        hint: 'One or two sentences for the project card.',
      },
      { name: 'role', label: 'Your role', type: 'text', maxLength: 120, placeholder: 'Project Coordinator' },
      { name: 'client', label: 'Client', type: 'text', maxLength: 160 },
      {
        name: 'category',
        label: 'Category',
        type: 'text',
        maxLength: 60,
        hint: 'Used by the filter on the Projects page.',
        suggestions: ['Education', 'Business', 'Enterprise', 'Public sector'],
      },
      { name: 'year', label: 'Year', type: 'text', maxLength: 20, placeholder: '2024' },
      {
        name: 'deliverables',
        label: 'Deliverables',
        type: 'tags',
        wide: true,
        hint: 'What you produced, in order — for example BRD, SRS, UAT. Press Enter after each one.',
      },
      {
        name: 'content',
        label: 'Case study',
        type: 'markdown',
        wide: true,
        hint: 'Markdown. Use ## for section headings.',
      },
      { name: 'stack', label: 'Tools', type: 'tags', wide: true, hint: 'Optional: Jira, Figma, Draw.io…' },
      { name: 'liveUrl', label: 'Live URL', type: 'url', placeholder: 'https://' },
      { name: 'repoUrl', label: 'Repository URL', type: 'url', placeholder: 'https://' },
      published,
      { name: 'isFeatured', label: 'Featured', type: 'switch', side: true, hint: 'Shown on the home page.' },
      { name: 'coverUrl', label: 'Cover image or GIF', type: 'media', side: true, accept: 'image', folder: 'projects' },
      {
        name: 'coverAlt',
        label: 'Cover description',
        type: 'textarea',
        side: true,
        rows: 2,
        maxLength: 300,
        hint: 'Alt text: what the image shows.',
      },
      { name: 'slug', label: 'URL slug', type: 'slug', side: true, hint: 'Leave empty to generate it from the title.' },
    ],
  },
  {
    key: 'experiences',
    label: 'Experience',
    singular: 'Experience',
    description: 'Roles shown on the About page timeline, newest first.',
    icon: Briefcase,
    group: 'Content',
    titleKey: 'role',
    subtitleKeys: ['company'],
    columns: [
      { key: 'period', label: 'Period', kind: 'mono' },
      { key: 'isCurrent', label: 'Current', kind: 'flag' },
    ],
    sortable: true,
    defaults: { isPublished: true, isCurrent: false, highlights: [], tags: [] },
    publicPath: () => '/about#experience',
    fields: [
      { name: 'role', label: 'Role', type: 'text', required: true, maxLength: 160 },
      { name: 'company', label: 'Company', type: 'text', required: true, maxLength: 160 },
      {
        name: 'period',
        label: 'Period',
        type: 'text',
        required: true,
        maxLength: 60,
        placeholder: 'Jan 2024 — Present',
      },
      {
        name: 'employmentType',
        label: 'Employment type',
        type: 'text',
        maxLength: 60,
        suggestions: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
      },
      { name: 'location', label: 'Location', type: 'text', maxLength: 120 },
      { name: 'companyUrl', label: 'Company website', type: 'url', placeholder: 'https://' },
      { name: 'summary', label: 'Summary', type: 'textarea', wide: true, rows: 3, maxLength: 2000 },
      { name: 'highlights', label: 'Highlights', type: 'list', wide: true, itemLabel: 'highlight' },
      { name: 'tags', label: 'Skills used', type: 'tags', wide: true },
      published,
      { name: 'isCurrent', label: 'Current role', type: 'switch', side: true, hint: 'Marks the role as ongoing.' },
    ],
  },
  {
    key: 'skill-groups',
    label: 'Skills',
    singular: 'Skill group',
    description: 'Groups of skills and tools, shown on the home and About pages.',
    icon: Sparkles,
    group: 'Content',
    titleKey: 'title',
    subtitleKeys: ['description'],
    columns: [{ key: 'items', label: 'Items', kind: 'count' }],
    sortable: true,
    defaults: { isPublished: true, items: [] },
    publicPath: () => '/about#skills',
    fields: [
      { name: 'title', label: 'Group name', type: 'text', required: true, maxLength: 120 },
      { name: 'description', label: 'Description', type: 'text', maxLength: 300 },
      { name: 'items', label: 'Skills', type: 'tags', wide: true, hint: 'Press Enter after each skill.' },
      published,
    ],
  },
  {
    key: 'posts',
    label: 'Blog posts',
    singular: 'Post',
    description: 'Articles for the blog. Drafts stay hidden until you publish them.',
    icon: FileText,
    group: 'Content',
    titleKey: 'title',
    subtitleKeys: ['excerpt'],
    columns: [
      { key: 'publishedAt', label: 'Published', kind: 'mono' },
      { key: 'readingMinutes', label: 'Minutes', kind: 'mono' },
    ],
    sortable: false,
    defaults: { isPublished: false, tags: [], content: '' },
    publicPath: (row) => (row.isPublished ? `/blog/${String(row.slug)}` : null),
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, wide: true, maxLength: 200 },
      {
        name: 'excerpt',
        label: 'Excerpt',
        type: 'textarea',
        required: true,
        wide: true,
        rows: 3,
        maxLength: 400,
        hint: 'Shown in lists and in link previews.',
      },
      { name: 'content', label: 'Article', type: 'markdown', wide: true },
      { name: 'tags', label: 'Topics', type: 'tags', wide: true },
      { ...published, hint: 'Publishing sets the date if it is empty.' },
      { name: 'publishedAt', label: 'Publish date', type: 'datetime', side: true },
      { name: 'coverUrl', label: 'Cover image', type: 'media', side: true, accept: 'image', folder: 'posts' },
      { name: 'slug', label: 'URL slug', type: 'slug', side: true, hint: 'Leave empty to generate it from the title.' },
    ],
  },
  {
    key: 'education',
    label: 'Education',
    singular: 'Education',
    description: 'Degrees listed on the About page.',
    icon: GraduationCap,
    group: 'Content',
    titleKey: 'degree',
    subtitleKeys: ['institution'],
    columns: [{ key: 'period', label: 'Period', kind: 'mono' }],
    sortable: true,
    defaults: { isPublished: true },
    publicPath: () => '/about',
    fields: [
      { name: 'degree', label: 'Degree', type: 'text', required: true, wide: true, maxLength: 200 },
      { name: 'institution', label: 'Institution', type: 'text', required: true, maxLength: 160 },
      { name: 'period', label: 'Period', type: 'text', required: true, maxLength: 60 },
      { name: 'field', label: 'Focus', type: 'text', wide: true, maxLength: 200 },
      { name: 'description', label: 'Notes', type: 'textarea', wide: true, rows: 3, maxLength: 1000 },
      published,
    ],
  },
  {
    key: 'certifications',
    label: 'Certifications',
    singular: 'Certification',
    description: 'Courses and certificates listed on the About page.',
    icon: Award,
    group: 'Content',
    titleKey: 'name',
    subtitleKeys: ['issuer'],
    columns: [{ key: 'year', label: 'Year', kind: 'mono' }],
    sortable: true,
    defaults: { isPublished: true },
    publicPath: () => '/about',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, wide: true, maxLength: 200 },
      { name: 'issuer', label: 'Issuer', type: 'text', maxLength: 160 },
      { name: 'year', label: 'Year', type: 'text', maxLength: 20 },
      { name: 'credentialUrl', label: 'Credential URL', type: 'url', wide: true, placeholder: 'https://' },
      published,
    ],
  },
  {
    key: 'organizations',
    label: 'Organizations',
    singular: 'Organization',
    description: 'Volunteer and campus roles on the About page.',
    icon: Users,
    group: 'Content',
    titleKey: 'name',
    subtitleKeys: ['role'],
    columns: [{ key: 'period', label: 'Period', kind: 'mono' }],
    sortable: true,
    defaults: { isPublished: true },
    publicPath: () => '/about',
    fields: [
      { name: 'name', label: 'Organization', type: 'text', required: true, maxLength: 160 },
      { name: 'role', label: 'Role', type: 'text', required: true, maxLength: 160 },
      { name: 'period', label: 'Period', type: 'text', required: true, maxLength: 60 },
      { name: 'description', label: 'Description', type: 'textarea', wide: true, rows: 3, maxLength: 1000 },
      published,
    ],
  },
  {
    key: 'stats',
    label: 'Stats',
    singular: 'Stat',
    description: 'The numbers strip under the home page introduction.',
    icon: ChartColumn,
    group: 'Site',
    titleKey: 'value',
    subtitleKeys: ['label'],
    columns: [],
    sortable: true,
    defaults: { isPublished: true },
    publicPath: () => '/',
    fields: [
      {
        name: 'value',
        label: 'Value',
        type: 'text',
        required: true,
        maxLength: 20,
        placeholder: '5+',
        hint: 'Numbers count up on the page; symbols like + or % are kept.',
      },
      { name: 'label', label: 'Label', type: 'text', required: true, maxLength: 120 },
      published,
    ],
  },
  {
    key: 'social-links',
    label: 'Social links',
    singular: 'Social link',
    description: 'Links in the footer, menu and contact page.',
    icon: Share2,
    group: 'Site',
    titleKey: 'label',
    subtitleKeys: ['url'],
    columns: [{ key: 'icon', label: 'Icon', kind: 'mono' }],
    sortable: true,
    defaults: { isPublished: true, icon: 'link' },
    fields: [
      { name: 'label', label: 'Label', type: 'text', required: true, maxLength: 60 },
      {
        name: 'icon',
        label: 'Icon',
        type: 'select',
        required: true,
        options: [
          'linkedin',
          'github',
          'email',
          'x',
          'instagram',
          'whatsapp',
          'youtube',
          'medium',
          'dribbble',
          'behance',
          'website',
          'link',
        ].map((value) => ({ value, label: value === 'x' ? 'X (Twitter)' : value[0]!.toUpperCase() + value.slice(1) })),
      },
      {
        name: 'url',
        label: 'URL',
        type: 'url',
        required: true,
        wide: true,
        placeholder: 'https:// or mailto:',
      },
      published,
    ],
  },
]

export const singletons: SingletonConfig[] = [
  {
    key: 'profile',
    label: 'Profile',
    description: 'Who you are: name, headline, bio and contact details.',
    icon: UserRound,
    publicPath: '/about',
    fields: [
      { name: 'name', label: 'Full name', type: 'text', required: true, maxLength: 120 },
      { name: 'headline', label: 'Headline', type: 'text', required: true, maxLength: 120, placeholder: 'Software Builder' },
      {
        name: 'roles',
        label: 'Roles',
        type: 'tags',
        wide: true,
        hint: 'Cycled next to your name on the home page.',
      },
      {
        name: 'summary',
        label: 'Summary',
        type: 'textarea',
        required: true,
        wide: true,
        rows: 3,
        maxLength: 600,
        hint: 'The large introduction on the About page.',
      },
      { name: 'bio', label: 'Bio', type: 'markdown', wide: true },
      { name: 'location', label: 'Location', type: 'text', maxLength: 120 },
      { name: 'email', label: 'Public email', type: 'email', maxLength: 254 },
      { name: 'isAvailable', label: 'Show availability', type: 'switch', side: true },
      {
        name: 'availability',
        label: 'Availability label',
        type: 'text',
        side: true,
        maxLength: 120,
        placeholder: 'Open to collaborations',
      },
      { name: 'avatarUrl', label: 'Photo', type: 'media', side: true, accept: 'image', folder: 'profile' },
      {
        name: 'resumeUrl',
        label: 'CV / resume',
        type: 'media',
        side: true,
        accept: 'any',
        folder: 'documents',
        hint: 'Upload a PDF to show a “Download CV” button.',
      },
    ],
  },
  {
    key: 'settings',
    label: 'Site settings',
    description: 'Home page copy, contact call to action and search engine details.',
    icon: Settings,
    publicPath: '/',
    fields: [
      {
        name: 'heroTitle',
        label: 'Home headline',
        type: 'text',
        required: true,
        wide: true,
        maxLength: 200,
        hint: 'Wrap one word in *asterisks* to give it the accent style.',
      },
      { name: 'heroSubtitle', label: 'Home introduction', type: 'textarea', required: true, wide: true, rows: 3, maxLength: 600 },
      {
        name: 'processSteps',
        label: '“How I work” steps',
        type: 'repeater',
        wide: true,
        itemLabel: 'step',
        itemFields: [
          { name: 'title', label: 'Step', type: 'text', required: true, maxLength: 40 },
          { name: 'description', label: 'Description', type: 'textarea', required: true, rows: 2, maxLength: 200 },
        ],
      },
      { name: 'contactTitle', label: 'Contact headline', type: 'text', required: true, wide: true, maxLength: 200 },
      { name: 'contactText', label: 'Contact text', type: 'textarea', required: true, wide: true, rows: 3, maxLength: 600 },
      { name: 'siteTitle', label: 'Site title', type: 'text', required: true, wide: true, maxLength: 120 },
      {
        name: 'siteDescription',
        label: 'Search description',
        type: 'textarea',
        required: true,
        wide: true,
        rows: 3,
        maxLength: 300,
        hint: 'Shown by search engines and link previews.',
      },
      { name: 'footerNote', label: 'Footer note', type: 'text', wide: true, maxLength: 200 },
      { name: 'ogImageUrl', label: 'Share image', type: 'media', side: true, accept: 'image', folder: 'site', hint: '1200 × 630 works best.' },
    ],
  },
]

export const findCollection = (key: string | undefined) => collections.find((config) => config.key === key)
