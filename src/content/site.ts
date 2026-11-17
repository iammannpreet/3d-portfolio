import type { SiteContent } from './types'

/**
 * Everything the site says lives in this file. Edit copy here; no scene or layout code needs to
 * change.
 *
 * Sources: the Dec 2025 resume (github.com/iammannpreet/myResume), the GitHub profile README and
 * the previous iammannpreet.com. Where they disagreed the resume won.
 */
export const site: SiteContent = {
  meta: {
    siteUrl: 'https://iammannpreet.com',
    title: 'Manpreet Singh · Backend Software Engineer',
    description:
      'Backend software engineer building event-driven systems with Node.js, TypeScript and Rails. Scroll through the stack, the experience and the projects.',
  },

  hero: {
    cta: 'Know me better',
    scrollHint: 'Scroll to ride',
  },

  contact: {
    heading: 'Get in touch',
    blurb: 'Want to collaborate, or just talk shop about queues and motorcycles? Email is the fastest way to reach me.',
  },

  profile: {
    name: 'Manpreet Singh',
    shortName: 'Mann',
    handle: 'iammannpreet',
    headline: 'Backend Software Engineer',
    tagline: 'I build event-driven backends. Off the clock, I ride.',
    bio: [
      'Backend engineer with 3+ years building microservices and event-driven systems in Node.js, TypeScript and Ruby on Rails.',
      'Before engineering I ran operations as an assistant general manager, leading a team of 30. It taught me to keep systems and people moving under pressure.',
      'Away from the keyboard I am on the motorcycle, or in a competitive round of ping pong.',
    ],
    location: null,
    email: 'contact@iammannpreet.com',
    resumeUrl: "https://github.com/iammannpreet/myResume/raw/master/Manpreet's%20Resume.pdf",
    photo: null,
    facts: [
      { label: 'Experience', value: '3+ years' },
      { label: 'Focus', value: 'Event-driven backends' },
      { label: 'Core stack', value: 'Node.js · TypeScript · Rails' },
      { label: 'Off the clock', value: 'Motorcycles · ping pong' },
    ],
  },

  socials: [
    { id: 'github', label: 'GitHub', href: 'https://github.com/iammannpreet' },
    { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/iammannpreet/' },
    { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/iammannpreet/' },
    { id: 'email', label: 'Email', href: 'mailto:contact@iammannpreet.com' },
    {
      id: 'resume',
      label: 'Résumé',
      href: "https://github.com/iammannpreet/myResume/raw/master/Manpreet's%20Resume.pdf",
    },
  ],

  skillRings: {
    inner: [
      'Node.js',
      'TypeScript',
      'Ruby on Rails',
      'Express',
      'PostgreSQL',
      'MongoDB',
      'RabbitMQ',
      'Docker',
    ],
    outer: [
      'React',
      'Next.js',
      'Tailwind CSS',
      'Three.js',
      'React Three Fiber',
      'GraphQL',
      'REST',
      'GitHub Actions',
      'Jest',
      'RSpec',
    ],
  },

  bootLog: [
    'HELMET LINK ............ OK',
    'NODE.JS / TYPESCRIPT ... OK',
    'RABBITMQ ............... OK',
    'POSTGRESQL ............. OK',
    'DOCKER ................. OK',
    'ENGINE ................. START',
  ],

  stack: [
    {
      hotspot: 'engine',
      part: 'Engine',
      title: 'Backend & APIs',
      blurb: 'Where the power is made: the services and APIs that do the actual work.',
      skills: [
        'Node.js',
        'TypeScript',
        'Ruby on Rails',
        'Express.js',
        'REST APIs',
        'Microservices',
        'GraphQL (familiar)',
        'gRPC (familiar)',
      ],
    },
    {
      hotspot: 'drivetrain',
      part: 'Drivetrain',
      title: 'Messaging & integration',
      blurb: 'Power is useless until it reaches the wheel. Queues and events carry work between services.',
      skills: [
        'RabbitMQ',
        'Event-driven architecture',
        'Pub/Sub',
        'API integration',
        'Data transformation',
        'ETL',
      ],
      proof: 'Tuned RabbitMQ at Thrive Creative for 20% more event throughput.',
    },
    {
      hotspot: 'frame',
      part: 'Frame',
      title: 'Architecture',
      blurb: 'Everything bolts to the frame. Clear boundaries keep a system rigid where it must be and easy to change everywhere else.',
      skills: [
        'Hexagonal architecture (ports & adapters)',
        'Domain-driven design',
        'Distributed systems',
        'Background job processing',
      ],
      proof: 'Built the ClickUp to Invoice Ninja sync on ports and adapters.',
    },
    {
      hotspot: 'tank',
      part: 'Tank',
      title: 'Data',
      blurb: 'What the engine runs on: schemas, queries and indexes that keep it fed.',
      skills: [
        'PostgreSQL',
        'MongoDB (Mongoid)',
        'Database modeling',
        'Query optimization',
        'Indexing',
      ],
    },
    {
      hotspot: 'cockpit',
      part: 'Cockpit',
      title: 'Frontend & 3D',
      blurb: 'What the rider sees and touches. This site included.',
      skills: ['React', 'Next.js', 'Tailwind CSS', 'Three.js', 'React Three Fiber'],
      proof: 'Redesigned a client section at Venture Freight; engagement rose 25%.',
    },
    {
      hotspot: 'brakes',
      part: 'Brakes & tyres',
      title: 'Testing & DevOps',
      blurb: 'You only ride fast when you trust the brakes. Tests and pipelines are that trust.',
      skills: ['Docker', 'GitHub Actions CI/CD', 'RSpec', 'Jest', 'TDD', 'Heroku', 'Netlify'],
    },
  ],

  milestones: [
    {
      id: 'bca',
      kind: 'education',
      period: 'Mar 2013 – Apr 2016',
      title: "Bachelor's in Computer Applications",
      org: 'Punjabi University',
      place: 'Punjab, India',
      summary: 'Undergraduate degree in computer applications.',
      highlights: [],
      tags: [],
    },
    {
      id: 'cegep',
      kind: 'education',
      period: 'Feb 2018 – Apr 2019',
      title: 'Post Graduate Diploma, Mobile Application Development',
      org: 'Cégep de la Gaspésie et des Îles',
      place: 'Montreal, QC',
      summary: 'Postgraduate diploma focused on mobile and web development.',
      highlights: [],
      tags: [],
    },
    {
      id: 'answernet',
      kind: 'work',
      period: 'Mar 2024 – Nov 2024',
      title: 'Assistant General Manager',
      org: 'AnswerNet',
      place: 'Winnipeg, MB',
      summary: 'Ran operations for a 30-agent team and handled its technical troubleshooting.',
      highlights: [
        'Led a cross-functional team of 30 agents; team efficiency up 15%',
        'Troubleshot hardware and software issues to keep service running',
      ],
      tags: ['Leadership', 'Operations'],
    },
    {
      id: 'thrive',
      kind: 'work',
      period: 'Jun 2024 – present',
      title: 'Backend Developer (part-time)',
      org: 'Thrive Creative',
      place: 'Remote',
      summary: 'Event-driven microservices that keep ClickUp and Invoice Ninja in sync.',
      highlights: [
        'Hexagonal architecture (ports and adapters) in Node.js, TypeScript and RabbitMQ',
        'Tuned RabbitMQ for 20% more event throughput',
        'PostgreSQL schemas and indexing, Docker, CI/CD',
      ],
      tags: ['Node.js', 'TypeScript', 'RabbitMQ', 'PostgreSQL', 'Docker'],
    },
    {
      id: 'venture-freight',
      kind: 'work',
      period: 'Nov 2024 – present',
      title: 'Full Stack Developer (part-time)',
      org: 'Venture Freight / F8 Solutions',
      place: 'Remote',
      summary: 'Modernised a legacy backend and reworked the public site.',
      highlights: [
        'Migrated the backend from Supabase to Convex; operating costs down 15%',
        'Redesigned the Industries We Serve section in React and Tailwind; engagement up 25%',
      ],
      tags: ['React', 'Tailwind CSS', 'Convex'],
    },
  ],

  projects: [
    {
      id: 'activecircle',
      title: 'ActiveCircle',
      blurb:
        'Community app for finding, organising and joining local activities, from gym sessions to kids’ playdates, on an interactive map.',
      role: 'Lead developer',
      year: '2024',
      tags: ['React', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB', 'Mapbox', 'JWT'],
      image: null,
      imageAlt: 'ActiveCircle activity listings and map',
      links: [
        { label: 'Live', href: 'https://deluxe-banoffee-13d115.netlify.app/' },
        { label: 'Code', href: 'https://github.com/iammannpreet/ActiveCircle' },
      ],
      featured: true,
    },
    {
      id: 'bell-hackathon',
      title: 'Bell Industrial Hackathon',
      blurb: 'Team build for an industry hackathon with Bell.',
      year: '2024',
      tags: ['React', 'Vite'],
      image: null,
      imageAlt: 'Bell Industrial Hackathon project screen',
      links: [
        {
          label: 'Code',
          href: 'https://github.com/Alicehappy/group-innovation-station-bell-industrial-hackthon/tree/develop',
        },
      ],
      featured: true,
      needsReview: true,
    },
    {
      id: 'braincoins',
      title: 'BrainCoins',
      blurb: 'Team project; server-side code is linked below.',
      year: '2024',
      tags: ['JavaScript', 'Node.js'],
      image: null,
      imageAlt: 'BrainCoins project screen',
      links: [{ label: 'Code', href: 'https://github.com/gillnim/braincoin-server' }],
      featured: true,
      needsReview: true,
    },
    {
      id: 'ecommerce-build',
      title: 'Ecommerce-build',
      blurb: 'An ecommerce storefront built on Next.js 15.',
      year: '2024',
      tags: ['Next.js 15', 'TypeScript'],
      image: null,
      imageAlt: 'Ecommerce-build storefront',
      links: [{ label: 'Code', href: 'https://github.com/iammannpreet/ecommerce-build' }],
      featured: true,
      needsReview: true,
    },
    {
      id: 'couchpatata',
      title: 'CouchPatata',
      blurb:
        'Movie discovery API in Ruby on Rails 8 and MongoDB with fuzzy title search, TMDB sync, Docker deployment and a GitHub Actions pipeline.',
      role: 'Lead backend developer',
      year: '2024 – 2025',
      tags: ['Ruby on Rails', 'MongoDB', 'Docker', 'RSpec', 'GitHub Actions'],
      image: null,
      imageAlt: 'CouchPatata',
      links: [{ label: 'Code', href: 'https://github.com/iammannpreet/CouchPatata-Backend' }],
      featured: false,
    },
    {
      id: 'meetbot',
      title: 'MeetBot',
      blurb:
        'A bot that joins Google Meet with Selenium, reads the captions and writes meeting summaries with the Hugging Face API.',
      role: 'Lead developer',
      year: '2024',
      tags: ['Node.js', 'Selenium', 'React', 'Hugging Face'],
      image: null,
      imageAlt: 'MeetBot',
      links: [{ label: 'Code', href: 'https://github.com/iammannpreet/MeetBot' }],
      featured: false,
    },
  ],

  // Set `enabled: true` and fill this in to show the My ride chapter.
  ride: {
    enabled: false,
    bike: null,
    intro: '',
    photos: [],
    routes: [],
  },

  testimonials: [
    {
      quote:
        'I had the pleasure of working with Manpreet on several projects, and I’ve been thoroughly impressed by his contributions. Manpreet’s keen eye for frontend development really sets him apart. His attention to details allows him to create visually appealing interfaces that enhanced our project’s user experience.',
      name: 'Salina Tulik',
      relation: 'Worked on the same team at BrainStation',
    },
    {
      quote:
        'Manpreet’s dedication and drive have been inspiring. His technical expertise and ability to tackle complex problems are impressive.',
      name: 'Michelle',
      relation: 'Former manager at AnswerNet',
    },
    {
      quote:
        'Working with Manpreet was a pleasure. He brought fresh ideas and great energy to every project we collaborated on.',
      name: 'Akshit Basur',
      relation: 'Former colleague',
    },
  ],

  credits: [
    {
      title: 'Cyberpunk Bike Concept Design',
      author: 'Berk Gedik',
      authorUrl: 'https://sketchfab.com/berkgedik',
      sourceUrl:
        'https://sketchfab.com/3d-models/cyberpunk-bike-concept-design-99290272e69d4cd8a56af2d2e1274e0d',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      changes: 'Textures resized and re-encoded; geometry compressed.',
    },
    {
      title: 'Black helmet',
      author: '3DWorkbench',
      authorUrl: 'https://sketchfab.com/3DWorkbench',
      sourceUrl: 'https://sketchfab.com/3d-models/black-helmet-fb2230b152824463a75e903d38d035a8',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      changes: 'Textures resized and re-encoded; geometry compressed.',
    },
  ],
}
