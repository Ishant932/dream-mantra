/** English site content — mirrors site.hi.js structure */
import { programPathwaysEn } from '../data/programPathways.en.js';
import { partnerDetailsEn, leadershipEn } from './partnerDetails.en.js';

export const siteEn = {
  navMega: {
    assessments: {
      title: 'Assessments',
      links: [
        { label: 'Brain Mapping', desc: 'Fingerprint talent mapping' },
        { label: 'Skill Mapping', desc: '7-framework personality suite' },
        { label: 'Brain Mapping + Skill Mapping', desc: 'Complete profile combo' },
        { label: 'Why Career Counselling', desc: 'Science-backed guidance' },
      ],
    },
    programs: {
      title: 'Age Pathways',
      links: [
        { label: 'Class 1-5', desc: 'Early talent discovery' },
        { label: 'Class 6-8', desc: 'Self-discovery phase' },
        { label: 'Class 9-10', desc: 'Stream selection' },
        { label: 'Class 11-12', desc: 'Career direction' },
        { label: 'College Students', desc: 'Degree & job clarity' },
        { label: 'Working Professionals', desc: 'Switch & grow' },
      ],
    },
    common: {
      title: 'Common',
      links: [
        { label: 'Partner with us', desc: 'Schools, colleges & partners' },
      ],
    },
    crp: {
      title: 'Training and placement',
      links: [
        { label: 'AI Career Launchpad', desc: 'Blueprint · Sessions · Highlights · Parameters' },
        { label: 'Personalised Career Readiness Program', desc: 'Brain + Skill mapping · 5 sessions · Placement support' },
      ],
    },
    crpPrograms: {
      title: 'Age Pathway',
      links: [
        { label: 'College Students', desc: 'Degree & first-job readiness' },
        { label: 'Freshers', desc: 'Land your first role with AI' },
        { label: 'Working Professionals', desc: 'Switch & grow your career' },
      ],
    },
  },

  freeGuidance: {
    cta: 'Book a free guidance call',
    login: 'Sign in to know more',
    badge: 'Free guidance call',
    bookIntro:
      'Tell us your class or goal. We’ll call you back — no payment needed for this first conversation.',
    formTitle: 'Book a free guidance call',
    formSubtitle: 'Share your details. A Dream Mantra counsellor will call you back.',
    intentLabel: 'What do you need?',
    intents: [
      { id: 'counselling', label: 'Counselling' },
      { id: 'training', label: 'Training & Placement' },
      { id: 'partner', label: 'Partner / Institution' },
      { id: 'other', label: 'Not sure yet' },
    ],
    messagePlaceholder: 'Your class / goal / question (min. 10 characters)',
    submit: 'Request free call',
    sending: 'Sending…',
    thankYou: 'Thank you! We will call you soon for your free guidance conversation.',
    error: 'Could not send message. Please try again.',
    alreadyClient: '',
    authCta: 'Sign in to know more',
    newHere: 'New here? Skim the overview, then book a free guidance call.',
  },

  quickLinks: {
    title: 'Quick Links',
    links: [
      { to: '/#certifications', label: 'Certifications' },
      { to: '/about', label: 'About Us' },
      { to: '/blog', label: 'Blog' },
      { to: '/terms', label: 'Terms & Conditions' },
    ],
  },

  navQuickMenu: {
    whatsappLabel: 'Chat with Esh on WhatsApp',
    footer: 'Scientific career guidance · Class 1 to First Job',
    columns: [
      {
        title: 'Discover',
        links: [
          { to: '/book-now', label: 'Book Now', icon: '🛒' },
          { to: '/counselling/institutions', label: 'Partner with us', icon: '🏛️' },
          { to: '/#certifications', label: 'Certifications', icon: '🏅' },
        ],
      },
      {
        title: 'Connect',
        links: [
          { to: '/contact#guidance', label: 'Book a free guidance call', icon: '📅' },
          { to: '/contact', label: 'Contact', icon: '📞' },
          { to: '/about', label: 'About Us', icon: '✨' },
          { to: '/blog', label: 'Blog', icon: '📝' },
        ],
      },
    ],
  },

  mobileNav: {
    home: 'Home',
    counselling: 'Counselling',
    tests: 'Training and Placement',
    dashboard: 'Dashboard',
    contact: 'Contact',
    careers: 'Careers',
    call: 'Call',
    modules: 'Book Now',
    pillars: '5 Pillars',
    book: 'Book Free Call',
    faq: 'FAQ',
    signup: 'Sign up',
    jumpLabel: 'Quick jump',
    showMore: 'Show more on this page',
    showLess: 'Show less',
    moreFaqs: 'Show all FAQs',
  },

  footer: {
    followUs: 'Follow Us',
    whatsapp: 'WhatsApp Chat',
    copyright: 'Dream Mantra · Owned & Operated by Tibrewal Enterprises · All rights reserved.',
    gstNumber: '08CDYPT7241R1Z4',
    gstAddress: 'C-23, Bhagat Singh Marg, Tilak Marg, Jaipur, Rajasthan — 302004',
    gstLabel: 'GSTIN',
    agePathways: 'Age Pathways',
    counsellingOverview: '',
    exploreTitle: 'Explore',
    quickLinks: 'Quick Links',
    locationsBlock: {
      title: 'Our Centres',
      onlineDesc: 'Counselling via video call anywhere in India',
      openMaps: 'Open in Google Maps',
    },
    footerQuickLinks: [
      { to: '/', label: 'Home' },
      { to: '/marketplace', label: 'Book Now' },
      { to: '/counselling', label: 'Counselling' },
      { to: '/crp?tab=launchpad', label: 'Training & Placement' },
      { to: '/about', label: 'About Us' },
      { to: '/contact#guidance', label: 'Book a free guidance call' },
      { to: '/terms', label: 'Terms & Conditions' },
    ],
    footerCounsellingOverview: {
      links: [
        { to: '/counselling', label: 'Explore Counselling' },
        { to: '/crp?tab=launchpad', label: 'Explore Training & Placement' },
      ],
    },
    footerAgePathways: [
      { to: '/programs/class-1-5', label: 'Class 1-5' },
      { to: '/programs/class-6-8', label: 'Class 6-8' },
      { to: '/programs/class-9-10', label: 'Class 9-10' },
      { to: '/programs/class-11-12', label: 'Class 11-12' },
      { to: '/programs/college-students', label: 'College' },
      { to: '/programs/working-professionals', label: 'Professionals' },
    ],
    footerQuickColumn: [
      { to: '/contact#guidance', label: 'Book a free guidance call' },
      { to: '/counselling/institutions', label: 'Partner with us' },
      { to: '/marketplace', label: 'Book Now' },
      { to: '/#certifications', label: 'Certifications' },
      { to: '/about', label: 'About Us' },
      { to: '/blog', label: 'Blog' },
      { to: '/contact', label: 'Contact' },
      { to: '/terms', label: 'Terms & Conditions' },
    ],
    footerQuickSections: [
      {
        title: 'Discover',
        links: [
          { to: '/marketplace', label: 'Book Now' },
          { to: '/counselling/institutions', label: 'Partner with us' },
          { to: '/#certifications', label: 'Certifications' },
        ],
      },
      {
        title: 'Connect',
        links: [
          { to: '/contact#guidance', label: 'Book a free guidance call' },
          { to: '/about', label: 'About Us' },
          { to: '/blog', label: 'Blog' },
          { to: '/contact', label: 'Contact' },
          { to: '/policies', label: 'Policies' },
          { to: '/terms', label: 'Terms & Conditions' },
        ],
      },
    ],
    footerPrograms: [
      { to: '/programs/class-1-5', label: 'Class 1-5' },
      { to: '/programs/class-6-8', label: 'Class 6-8' },
      { to: '/programs/class-9-10', label: 'Class 9-10' },
      { to: '/programs/class-11-12', label: 'Class 11-12' },
      { to: '/programs/college-students', label: 'College Students' },
      { to: '/programs/working-professionals', label: 'Working Professionals' },
      { to: '/counselling?tab=dmit', label: 'Brain Mapping' },
      { to: '/counselling?tab=psychometric', label: 'Skill Mapping' },
      { to: '/counselling?tab=combo', label: 'Brain Mapping + Skill Mapping' },
      { to: '/counselling?tab=why', label: 'Why Career Counselling' },
      { to: '/crp', label: 'AI Career Launchpad' },
    ],
  },

  home: {
    modulesIntro: {
      label: 'Our Verticals',
      title: 'Our',
      titleHighlight: 'Verticals',
      subtitle: '',
      learnMore: 'Learn more',
      groups: [
        {
          id: 'counselling',
          label: 'Counselling',
          subtitle: '',
          modules: [
            {
              slug: 'dmit',
              icon: '🧬',
              title: 'Brain Mapping',
              desc: 'Fingerprint-based guidance.',
              link: '/counselling?tab=dmit',
            },
            {
              slug: 'psychometric',
              icon: '🧠',
              title: 'Skill Mapping',
              desc: 'Psychometric-based.',
              link: '/counselling?tab=psychometric',
            },
            {
              slug: 'dmit-psychometric',
              icon: '✨',
              title: 'Brain + Skill Mapping',
              desc: 'Fingerprint + psychometric guidance, together.',
              link: '/counselling?tab=combo',
            },
          ],
        },
        {
          id: 'training',
          label: 'Training & Placement',
          subtitle: '',
          modules: [
            {
              slug: 'crp',
              icon: '🚀',
              title: 'AI Career Launchpad',
              desc: '5 sessions away from your next job.',
              link: '/crp/explore',
            },
            {
              slug: 'career-readiness',
              icon: '🎯',
              title: 'Personalised Career Readiness Program',
              desc: 'Brain + Skill Mapping, 5 sessions · placement support.',
              link: '/crp?tab=readiness',
            },
          ],
        },
      ],
    },
    howDreamzWorks: {
      title: 'How Dream',
      titleHighlight: 'Mantra Works',
      subtitle: 'Science-backed counselling from first assessment to your personalised roadmap.',
      processesLabel: 'Processes',
      counsellingLabel: 'Counselling Process',
      counsellingGroupLabel: 'Counselling',
      counsellingGroupSubtitle: 'Brain Mapping, Skill Mapping & the complete Brain + Skill profile.',
      trainingGroupLabel: 'Training & Placement',
      trainingGroupSubtitle: 'AI-powered job readiness for students & freshers.',
      choosePathwayLabel: 'Choose your path',
      modulesLabel: 'Module Processes',
      stepLabel: 'STEP',
      exploreModule: 'Explore module',
      steps: [
        {
          step: 1,
          icon: '📊',
          title: 'ASSESS',
          desc: 'Scientific Brain Mapping fingerprint scanning + Psychometric tests',
        },
        {
          step: 2,
          icon: '🔬',
          title: 'ANALYZE',
          desc: 'Neuroscience-backed analysis by certified counselors',
        },
        {
          step: 3,
          icon: '🎯',
          title: 'GUIDE',
          desc: 'Personalized roadmap for academics, career & life success',
        },
      ],
      moduleProcesses: [
        {
          id: 'dmit',
          group: 'counselling',
          title: 'Brain Mapping',
          icon: '🧬',
          link: '/counselling?tab=dmit',
          steps: ['Register & confirm payment', 'Fingerprint collection', 'Report analysis (3–7 days)', 'Counselling session'],
        },
        {
          id: 'psychometric',
          group: 'counselling',
          title: 'Skill Mapping',
          icon: '🧠',
          link: '/counselling?tab=psychometric',
          steps: ['Register & confirm payment', 'Complete online test', 'Expert report review', 'Counsellor session'],
        },
        {
          id: 'dmit-psychometric',
          group: 'counselling',
          title: 'Brain + Skill Mapping',
          icon: '✨',
          link: '/counselling?tab=combo',
          steps: ['Register & confirm payment', 'Fingerprint + online test', 'Combined report analysis', 'Expert counselling session'],
        },
        {
          id: 'crp',
          group: 'training',
          title: 'AI Career Launchpad',
          icon: '🚀',
          link: '/crp/explore',
          steps: ['Join your batch', '5 live skill sessions', 'Resume & LinkedIn polish', 'Recruiter network access'],
        },
      ],
    },
    crpHighlight: {
      label: 'New Programme',
      title: 'AI Career Launchpad — Job-Ready Accelerator',
      desc: '5 sessions × 1.5 hours — LinkedIn, resume, mock interviews, salary negotiation & Jaipur recruiter network.',
      cta: 'Explore AI Career Launchpad',
      tiles: {
        linkedin: 'LinkedIn & Networking',
        resume: 'Resume & CV',
        mockInterviews: 'Mock Interviews',
        jaipurRecruiters: 'Jaipur Recruiters',
      },
    },
    whyCounselling: {
      label: 'The Reality',
      title: 'Why Career',
      titleHighlight: 'Counselling Matters',
      hook: 'Wrong stream. Wrong college. Wrong career. One early decision can cost years of regret.',
      quote: '"Every child is a unique key — meant to unlock a different door. Comparison only breaks the key." — Dream Mantra',
      statsLine: '7,000+ families guided · Govt & IIT Madras certified counsellors · Jaipur + Pan-India online',
      knowMore: 'Know More',
      knowMoreLink: '/counselling?tab=why',
      problems: [
        {
          stat: '90%',
          label: 'know only 7–10 careers',
          desc: 'while 5,000+ real paths exist in India alone — most students never hear about them',
        },
        {
          stat: '65%',
          label: 'graduates underemployed',
          desc: 'trapped by poor stream, degree & career decisions made without scientific guidance',
        },
        {
          stat: '35Cr+',
          label: 'graduates by 2030',
          desc: 'competing in a market the size of the entire US — clarity is your biggest edge',
        },
      ],
      solutionTitle: 'The Dream Mantra Way',
      solutionDesc:
        'Stop guessing. Get science-backed clarity with Brain Mapping, Skill Mapping & certified counsellors — no pressure, no comparison, just clarity.',
      solutionPoints: [
        'Brain Mapping — fingerprint science validated in 30+ countries',
        'Skill Mapping — 7 frameworks: 7 assessments: Career Interest, Multiple Talents, Personality, Learning Style, Professional Behaviour, Workplace Personality & Decision-Making',
        '1000+ career library with education paths, salaries & roadmaps',
        '1-on-1 sessions with Govt & IIT Madras certified counsellors',
        'Jaipur centres (Raja Park, Shastri Nagar, Nirman Nagar) + Pan-India online',
        'Free initial consultation — Mon–Sat, 11am–7pm · 9680102276',
      ],
    },
    trustBar: {
      tagline: 'Science-backed guidance trusted across India',
      items: [
        { type: 'badge', label: '360° Analysis', icon: '🔬' },
        { type: 'badge', label: 'Internationally Certified', icon: '🌍' },
        { type: 'badge', label: 'Government Certified', icon: '🏛️' },
        { type: 'badge', label: 'IIT Madras Certified', icon: '🎓' },
        { type: 'number', value: 30, suffix: '+', label: 'Countries Validated', icon: '🌐' },
        { type: 'number', value: 50, suffix: '+', label: 'School Partners', icon: '🏫' },
        { type: 'number', value: 120, suffix: '+', label: 'Coaching Partners', icon: '📚' },
        { type: 'number', value: 7000, suffix: '+', label: 'Counsellings Done', icon: '🎯' },
      ],
    },
    whoWeGuide: {
      title: 'Who We',
      titleHighlight: 'Guide',
      subtitle: '',
      viewProgram: 'View Program',
      seeAllPrograms: 'Explore Age Pathways',
    },
    pillars: {
      title: '5 Counselling',
      titleHighlight: 'Pillars',
      titleSuffix: '',
      subtitle: '',
      pillarLabel: 'Pillar',
      explore: 'Explore',
      counsellingLabel: 'Counselling',
      trainingLabel: '5 Sessions for',
      trainingLabelHighlight: 'Training & Placement',
      trainingSubtitle: '',
      seventhPillarLabel: 'Training & Placement',
      viewCrp: 'View AI Career Launchpad',
      viewFullPage: 'View full framework page',
      sessionLabel: 'Session',
    },
    aiToolkit: {
      title: 'Your AI-Powered',
      titleHighlight: 'Career Toolkit',
      subtitle: 'Everything you need from assessments to personalised guidance tools.',
      psychometricTitle: 'Skill Mapping',
      psychometricDesc:
        'A scientific career assessment that analyses your personality, strengths, and interests to suggest the right career paths.',
      takeAssessment: 'Take Your Test',
      checkItOut: 'Check It Out',
    },
    process: {
      title: 'Our',
      titleHighlight: '5-Step',
      titleSuffix: 'Counselling Process',
      subtitle: 'From confusion to clarity with expert guidance at every step',
      bookSession: 'Book Session',
    },
    premiumServices: {
      title: 'Our',
      titleHighlight: 'Premium Services',
      subtitle: 'High impact services for growth, skill development, and long-term success',
    },
    partnerJoin: {
      title: 'Partner &',
      titleHighlight: 'Join',
      subtitle: '',
      contactCta: 'Contact us',
    },
    partnersMarquee: {
      title: 'Connect With the',
      titleHighlight: 'Best',
      subtitle: 'Leading schools, colleges & universities across India',
    },
    managementTeam: {
      label: 'Meet The Management Team',
      title: 'Leadership',
      titleHighlight: 'That Cares',
      subtitle: '',
      readFullStory: 'Read Full Story',
    },
    certifications: {
      label: '',
      title: 'Trusted &',
      titleHighlight: 'Certified',
      subtitle: '',
      viewFull: 'View certificate',
      closeLightbox: 'Close',
      tabs: {
        all: 'All',
        international: 'International',
        government: 'Government',
        nlp: 'NLP',
        iit: 'IIT Madras',
        reliance: 'Reliance Foundation',
      },
    },
    faq: {
      title: 'Questions?',
      titleHighlight: 'Get Answers',
      subtitle: '',
      contactUs: 'Contact Us',
    },
    cta: {
      title: 'More Queries?',
      subtitle: 'We are just a call away...',
      contactUs: 'Contact Us',
    },
    testimonialsTitle: 'What Parents & Students',
    testimonialsHighlight: 'Say',
  },

  hero: {
    badges: ['Neuroscience Based', '5 Pillars Framework', '7000+ Clients'],
    aiPowered: '✨ AI-Powered',
  },

  stats: {
    clientsServed: 'Families Guided',
    careersMapped: 'Careers Mapped',
    countriesValidated: 'Countries Validated',
    pillarFramework: 'Pillar Framework',
  },

  data: {
    processSteps: [
      {
        title: 'Inborn Talent (Brain Mapping)',
        points: ['Learning style & natural strengths', 'No exams or pressure'],
      },
      {
        title: 'Acquired Talent (Skill Mapping)',
        points: ['Personality, interests & behaviour', 'Fit for stream & career choices'],
      },
      {
        title: 'What You Have Learned',
        points: ['Subjects, grades & projects audited', 'Academics aligned to real paths'],
      },
      {
        title: 'Market Trend',
        points: ['Growing careers matched to you', 'Demand, salary & opportunity data'],
      },
      {
        title: 'AI Proof Career',
        points: ['Roles that stay human-strong', 'Built for long-term employability'],
      },
    ],

    faqs: [
      {
        q: 'What is career counselling and why is it important?',
        a: 'Career counselling helps you understand strengths, interests, and opportunities to make informed education and career decisions.',
      },
      {
        q: 'How does career counselling benefit students?',
        a: 'Students gain clarity on streams, courses, colleges, and careers aligned with aptitude — avoiding costly wrong choices.',
      },
      {
        q: 'What does a career counsellor do?',
        a: 'Assesses your profile, interprets Skill Mapping/Brain Mapping results, shortlists careers and institutions, and guides admissions.',
      },
      {
        q: 'How accurate is Skill Mapping?',
        a: 'When scientifically designed and expert-interpreted, they offer reliable personality and aptitude insights.',
      },
      {
        q: 'Who needs career counselling?',
        a: 'Students Class 8–12, college students, parents, and working professionals considering shifts or upskilling.',
      },
      {
        q: 'How does AI help in career counselling?',
        a: 'AI powers career libraries, roadmaps, and faster analysis while counsellors ensure empathy and accountability.',
      },
      {
        q: 'Is online career counselling effective?',
        a: 'Yes — same assessments, expert counsellors, and tools with greater accessibility across India.',
      },
      {
        q: 'How long does the process take?',
        a: 'Typically 3–7 sessions over a few weeks depending on goals.',
      },
    ],

    whyCards: [
      {
        tag: 'Market Potential',
        title: 'Huge Competition',
        highlight: '35+ crore graduates',
        sub: 'by 2030 in India',
        compare: 'Entire population of USA — 33 Crore',
      },
      {
        tag: 'Employment Reality',
        title: 'Employment Reality',
        highlight: '65%',
        sub: 'of graduates unemployed or underemployed due to poor career decisions',
      },
      {
        tag: 'Lack of Awareness',
        title: 'Lack of Awareness',
        highlight: '90%',
        sub: 'of Indians know only 7–10 career options while 5000+ exist',
      },
    ],

    toolkitServices: [
      {
        title: 'Career Library',
        desc: 'Explore 1000+ careers with skills, salaries, education paths, and growth.',
      },
      {
        title: 'Book Now',
        desc: 'Brain Mapping, Skill Mapping, combo, and training programs — purchase and track progress.',
      },
      {
        title: 'Training & Placement',
        desc: 'AI Career Launchpad and Career Readiness Program for job-ready outcomes.',
      },
    ],

    premiumServices: [
      {
        title: 'Internship Assistance',
        desc: 'Find internships matching your skills and career goals.',
      },
      {
        title: 'Skill Development Roadmap',
        desc: 'Personalised skill roadmap to grow faster in your career.',
      },
      {
        title: 'Profile Building',
        desc: 'Strengthen profile with projects aligned to your dream career.',
      },
      {
        title: 'Industry Mentorship',
        desc: 'Experts help you understand trends and stay future-ready.',
      },
      {
        title: 'Long-Term Handholding',
        desc: 'Continuous support and regular check-ins throughout your journey.',
      },
    ],

    whoWeGuide: [
      { title: 'Class 1-5', subtitle: 'Talent Discovery', icon: '🌟' },
      { title: 'Class 6-8', subtitle: 'Self Discovery', icon: '🔍' },
      { title: 'Class 9-10', subtitle: 'Stream Selection', icon: '🎯' },
      { title: 'Class 11-12', subtitle: 'Career Direction', icon: '🚀' },
      { title: 'College Students', subtitle: 'Degree & Career Clarity', icon: '🎓' },
      { title: 'Working Professionals', subtitle: 'Career Switch & Growth', icon: '💼' },
    ],

    counsellingTabs: [
      { id: 'overview', label: 'Overview' },
      { id: 'why', label: 'Why Career Counselling' },
      { id: 'dmit', label: 'Brain Mapping' },
      { id: 'psychometric', label: 'Skill Mapping' },
      { id: 'combo', label: 'Brain + Skill Mapping' },
      { id: 'programs', label: 'Age Pathways' },
      { id: 'institutions', label: 'Partner with us' },
    ],

    crpTabs: [
      { id: 'launchpad', label: 'AI Career Launchpad' },
      { id: 'readiness', label: 'Personalised Career Readiness Program' },
      { id: 'pathways', label: 'Age Pathways' },
    ],

    assessmentTabs: [
      { id: 'dmit', label: 'Brain Mapping' },
      { id: 'psychometric', label: 'Skill Mapping' },
      { id: 'dmit-psychometric', label: 'Brain Mapping + Skill Mapping' },
      { id: 'why-dreams-mantra', label: 'Why Career Counselling' },
    ],

    assessments: [
      {
        slug: 'dmit',
        title: 'Brain Mapping',
        subtitle: 'Fingerprint Analysis, Inborn Potential Mapping',
        points: [
          'Validated in 30+ countries',
          'Maps learning styles, memory patterns, intelligence types',
          'Bias-free insight without exams or pressure',
          'Rooted in neuroscience, genetics, and psychology',
        ],
      },
      {
        slug: 'psychometric',
        title: 'Skill Mapping',
        subtitle: '7 Frameworks: 7 assessments: Career Interest, Multiple Talents, Personality, Learning Style, Professional Behaviour, Workplace Personality & Decision-Making',
        points: [
          'Personality Assessment profiling',
          'Professional Behaviour & Work Style Analysis',
          'Career Interest Assessment mapping',
          'Workplace Personality, Learning Style, Multiple Talents & Decision-Making assessments',
        ],
      },
      {
        slug: 'dmit-psychometric',
        title: 'Brain Mapping + Skill Mapping',
        subtitle: 'Complete Inborn + Acquired Talent Profile — Best of Both',
        points: [
          'Brain Mapping fingerprint analysis for inborn intelligence & learning style',
          'Skill Mapping suite for personality, interests & behaviour',
          'Holistic profile combining nature + nurture for career decisions',
          'Recommended for Class 6+ stream and career selection',
          'Single combined report with counsellor interpretation session',
        ],
      },
      {
        slug: 'why-dreams-mantra',
        title: 'Why Career Counselling',
        subtitle: 'Scientific career guidance — No pressure. No comparison. Just clarity.',
        points: [
          'The Dream Mantra Promise — every child holds untapped brilliance',
          'Brain Mapping validated in 30+ countries + 7 Skill Mapping frameworks',
          'Assess → Analyze → Guide: from Class 1 to First Job',
          'Founder Esha Lohiya — Govt of India, IIT Madras, NLP certified',
          'Jaipur centres + Pan-India online · 9680102276',
        ],
      },
    ],

    products: [
      { slug: 'dmit', title: 'Brain Mapping', description: 'Fingerprint-based inborn talent mapping' },
      { slug: 'psychometric', title: 'Skill Mapping', description: '7 assessments for personality, interests & career fit' },
      { slug: 'dmit-psychometric', title: 'Brain + Skill Mapping', description: 'Complete nature + nurture profile' },
      { slug: 'crp-test', title: 'AI Career Launchpad Training', description: 'Job readiness for college & freshers' },
      { slug: 'career-readiness', title: 'Personalised Career Readiness Program', description: 'Brain + Skill Mapping, training & placement' },
    ],

    studyAbroadCountries: ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Ireland', 'Singapore', 'UAE'],

    counsellorsTabs: [
      { id: 'network', label: 'Our Counsellors' },
      { id: 'become', label: 'Become a Counsellor' },
      { id: 'certification', label: 'Certification' },
      { id: 'join', label: 'Join Network' },
    ],

    marketplaceTabs: [
      { id: 'counselling', label: 'Counselling' },
      { id: 'training', label: 'Training & Placement' },
    ],

    studyAbroadTabs: [
      { id: 'overview', label: 'Overview' },
      { id: 'countries', label: 'Countries' },
      { id: 'universities', label: 'Universities' },
      { id: 'loans', label: 'Education Loans' },
      { id: 'visa', label: 'Visa Support' },
    ],

    crpAudienceTabs: [
      {
        id: 'college-students',
        label: 'College Students',
        icon: '🎓',
        desc: 'Degree validation, internships & first-job readiness',
        quote: '"I studied hard for 3 years — but I still don\'t know if my degree will get me a job."',
        tagline: 'If this sounds like you, AI Career Launchpad is built for your stage.',
        problems: [
          'Choosing electives and projects without knowing what recruiters actually want',
          'Empty LinkedIn while batchmates already have internship offers',
          'Parents asking "placement kab hogi?" every semester — and no clear answer',
          'Resume rejected by ATS before a human even sees it',
          'GD and interview rounds feel like a black box — no practice, no feedback',
        ],
        sessionsCovered: [
          'Session 1 — Personal brand, elevator pitch & video resume',
          'Session 2 — LinkedIn, Naukri & digital portfolio that recruiters find',
          'Session 3 — ATS-friendly resume & cover letters for your field',
          'Session 4 — Mock interviews, HR questions & group discussion strategy',
          'Session 5 — Jaipur recruiter network, salary negotiation & offer evaluation',
        ],
        expectedOutcomes: [
          'Polished resume + LinkedIn profile recruiters can discover',
          'Confident answers for campus placement & internship interviews',
          'A clear "why hire me?" story tailored to your degree',
          'Direct recruiter contacts in Jaipur',
          '30-day action plan before final-year placement season',
        ],
      },
      {
        id: 'freshers',
        label: 'Freshers',
        icon: '🚀',
        desc: 'Land your first role with AI-powered job search',
        quote: '"Everyone says \'apply everywhere\' — but I don\'t even know where to start or what to write."',
        tagline: 'Class 12 pass-outs and first-time job seekers — this is your launchpad.',
        problems: [
          'No work experience — so every application feels impossible to fill',
          'Applying on Naukri/LinkedIn daily but zero interview calls',
          'Family pressure to "get a government job" while you want private sector growth',
          'Interview anxiety — mind goes blank on "Tell me about yourself"',
          'Not sure which roles match your actual skills vs what you studied',
        ],
        sessionsCovered: [
          'Session 1 — Build your first professional identity & 30-second pitch',
          'Session 2 — Set up job portals & get found by recruiters online',
          'Session 3 — Create a fresher resume that passes ATS filters',
          'Session 4 — Practice HR interviews & GD with expert feedback',
          'Session 5 — Connect with Jaipur recruiters & negotiate your first offer',
        ],
        expectedOutcomes: [
          'First job-ready resume even with zero experience',
          'Active profiles on Naukri & LinkedIn with the right keywords',
          'Confidence to walk into your first interview',
          'Shortlist of realistic roles matching your profile',
          'Recruiter contacts & follow-up templates that get replies',
        ],
      },
      {
        id: 'working-professionals',
        label: 'Working Professionals',
        icon: '💼',
        desc: 'Career switch, upskilling & role alignment',
        quote: '"I earn a salary — but every Monday morning, I wish I was somewhere else."',
        tagline: 'Stuck, underpaid, or planning a switch? We help you move with clarity.',
        problems: [
          'Years in the wrong role — skills stagnating, motivation draining',
          'Want to switch industry but don\'t know how to reposition your experience',
          'Underpaid compared to market — but never learned to negotiate',
          'LinkedIn profile still looks like your first job from 5 years ago',
          'Fear of starting over vs staying in a comfortable but wrong career',
        ],
        sessionsCovered: [
          'Session 1 — Refresh personal brand & craft a switch narrative',
          'Session 2 — Rebuild LinkedIn & portfolio for your target role',
          'Session 3 — Rewrite resume to highlight transferable skills',
          'Session 4 — Interview for senior/switch roles — story & body language',
          'Session 5 — Salary negotiation, offer comparison & Jaipur network',
        ],
        expectedOutcomes: [
          'Clear career switch roadmap with realistic timeline',
          'Resume & LinkedIn repositioned for your target industry',
          'Confident salary negotiation — know your market worth',
          'Interview stories that explain your pivot convincingly',
          'Recruiter network in Jaipur for local opportunities',
        ],
      },
    ],

    testimonials: [
      {
        name: 'Parents of Rohan',
        role: 'Class 7 · Jaipur',
        text: 'Dream Mantra helped us understand our son\'s learning style. He\'s a kinesthetic learner. Now we use activities to teach him. His grades improved and so did his confidence!',
        stars: 5,
      },
      {
        name: 'Priya',
        role: 'Class 11 — Commerce',
        text: 'I was confused between Commerce and Science. The Brain Mapping showed my natural strength in logical-mathematical thinking. I took Commerce with Math and now I\'m pursuing CA. Best decision ever!',
        stars: 5,
      },
      {
        name: 'Parent of Myra',
        role: 'Class 8',
        text: 'The career awareness sessions opened my daughter\'s mind to possibilities she never knew existed. She\'s excited about her future now.',
        stars: 5,
      },
      {
        name: 'Vikram',
        role: 'Marketing Professional',
        text: 'As a working professional, I was stuck in a role that didn\'t fit me. Dream Mantra helped me identify my real strengths. I switched careers and now I actually enjoy Mondays!',
        stars: 5,
      },
      {
        name: 'Parent of Kabir',
        role: 'Class 5',
        text: 'The Brain Mapping report was eye-opening — it matched exactly with what we observed but gave us the scientific backing. And the Skill Mapping analysis helped us understand our son\'s current personality. The combination is powerful.',
        stars: 5,
      },
      {
        name: 'College Student',
        role: 'B.Tech 2nd Year',
        text: 'Esha ma\'am explained how my natural strengths (from Brain Mapping) align with my current interests (from Skill Mapping) and what the market actually needs. For the first time, I have a clear path forward.',
        stars: 5,
      },
      {
        name: 'Parent of Ananya',
        role: 'Class 10',
        text: 'The team At Dream Mantra doesn\'t just give you a report — they hand-hold you through it. The simplified visuals made it easy for even us as parents to understand. No stress, just clarity.',
        stars: 5,
      },
      {
        name: 'Working Professional',
        role: 'Career Switch Success',
        text: 'I was skeptical about fingerprint analysis, but the science behind Brain Mapping convinced me. Combined with Skill Mapping, I got a complete picture of who I am and what I should do next.',
        stars: 5,
      },
    ],

    dashboardTabs: [
      { id: 'assess', label: 'Book Now', desc: 'Browse and purchase modules' },
      { id: 'counselling', label: 'Counselling', desc: 'Choose your counselling path' },
      { id: 'training', label: 'Training and Placement', desc: 'Explore job-ready training' },
      { id: 'support', label: 'Support', desc: 'Messages and help' },
      { id: 'careers', label: 'Career Library', desc: 'Explore 1000+ career paths' },
    ],

    managementTeam: [
      {
        name: 'Esha Tibrewal',
        role: 'Founder & CEO',
        tagline: 'From Naukri.com to unlocking every child\'s potential',
        bio: 'A passionate counsellor and the guiding force behind Dream Mantra, Esha brings a unique blend of corporate recruitment experience and counseling expertise. She witnessed firsthand the gap between what people study, what they\'re suited for, and what the market actually needs.',
      },
      {
        name: 'Shivam Lohiya',
        role: 'Co-Founder – Operations & Technology',
        tagline: 'PwC consulting rigor powering Dream Mantra at scale',
        bio: 'A strategic leader who builds the technology and operations backbone of Dream Mantra, Shivam brings consulting rigor from large-scale government projects. He understood that impact at scale requires robust technology, seamless operations, and processes that thousands can trust.',
      },
    ],

    certifications: [
      {
        id: 'iccc',
        title: 'International Certified Career Coach',
        issuer: 'Mindler',
      },
      {
        id: 'govt',
        title: 'Government Certified Coach',
        issuer: 'Reliance Foundation',
      },
      {
        id: 'nlp-practitioner',
        title: 'NLP Practitioner Certification',
        issuer: 'NLP Workshop Training',
      },
      {
        id: 'nlp-advanced',
        title: 'NLP Advanced Certified Coach',
        issuer: 'WiseMonk',
      },
      {
        id: 'nlp-hindi',
        title: 'NLP Practitioner Certified Coach',
        issuer: 'WiseMonk',
      },
      {
        id: 'iit',
        title: 'IIT Madras Certified Coach',
        issuer: 'IIT Madras',
      },
      {
        id: 'reliance',
        title: 'Reliance Foundation Certified Coach',
        issuer: 'Reliance Foundation',
      },
    ],

    missionVision: {
      mission: 'To replace confusion, pressure, and guesswork with clarity, awareness, and informed decision-making — for every individual.',
      vision: 'To empower every individual—especially children and youth—to discover their true potential through scientific self-awareness, and guide them toward a life of confidence, clarity, and purpose.',
      purpose: 'To bridge the gap between education, natural intelligence, and career alignment — enabling students to progress with direction, supported by informed parents and empowered institutions.',
      philosophy: 'We are all unique keys, meant to unlock different doors. At Dream Mantra, we don\'t try to fit people into boxes — we use Brain Mapping and Skill Mapping science to help them discover which path they naturally belong in.',
    },

    founder: {
      role: 'Founder & Chief Counsellor',
      quote: 'Every child is a unique key, meant to unlock different doors. At Dream Mantra, we don\'t label or judge — we simply reveal the brilliance that already exists. With science, heart, and lifelong value.',
      longNote: 'In my years at Naukri.com, I saw thousands of professionals stuck in jobs they hated. Bright, capable people who chose the wrong path because of pressure, confusion, or lack of guidance. There was always a mismatch between what they studied, what they were naturally good at, and what the job market actually needed. That\'s why we use Brain Mapping — validated in 30+ countries — and Skill Mapping assessments with 7 frameworks to create the complete picture. We\'re not just decoding fingerprints — we\'re unlocking futures.',
      certs: ['Government of India', 'International Certified Career Counselling', 'Brain Mapping', 'NLP', 'Reliance Foundation', 'IIT Madras'],
    },

    crpProgram: {
      fullName: 'AI Career Launchpad — Job-Ready Accelerator',
      duration: '5 Sessions × 1.5 hours = 7.5 hours total',
      description: '',
      outcomes: [
        {
          title: 'Job-ready resume, LinkedIn & portfolio',
          desc: 'ATS optimized, recruiter friendly & impressive',
        },
        {
          title: 'Confident in interviews & group discussions',
          desc: 'Practice-backed delivery with clear feedback',
        },
        {
          title: 'Know how to negotiate salary',
          desc: 'Ask with clarity and close stronger offers',
        },
        {
          title: 'Direct recruiter contacts in Jaipur',
          desc: 'Local network access when you need it',
        },
        {
          title: 'Personal brand that stands out',
          desc: 'A memorable first impression every time',
        },
        {
          title: 'ATS-friendly job applications',
          desc: 'Tailored submissions that pass screening',
        },
        {
          title: 'Clear 30-day action plan',
          desc: 'Know exactly what to do next',
        },
        {
          title: 'Workplace etiquette & first-week confidence',
          desc: 'Enter corporate life prepared',
        },
      ],
      sessions: [
        {
          number: 1,
          title: 'Personal Brand & First Impression',
          duration: '1.5 hours',
          topics: [
            'Personal Branding Strategy',
            'Tell Me About Yourself — framework & practice',
            'Video Resume creation',
            'Elevator Pitch — 30 sec & 2 min versions',
          ],
          icon: '✨',
        },
        {
          number: 2,
          title: 'Digital Presence & Job Portals',
          duration: '1.5 hours',
          topics: [
            'LinkedIn Profile Optimization & Networking',
            'Naukri & Job Portal Strategy',
            'Digital Portfolio Building (for creatives & techies)',
            'How recruiters search candidates online',
          ],
          icon: '💼',
        },
        {
          number: 3,
          title: 'Resume, CV & Applications',
          duration: '1.5 hours',
          topics: [
            'Resume/CV Making — ATS-friendly formats',
            'Cover Letter Optimization',
            'Tailoring applications per role',
            'Common mistakes that reject applications',
          ],
          icon: '📄',
        },
        {
          number: 4,
          title: 'Interviews & Group Discussion',
          duration: '1.5 hours',
          topics: [
            'Interview Skills — HR, technical & managerial',
            'Mock Interviews with feedback',
            'Group Discussion — practice & strategy',
            'Body language & confidence building',
          ],
          icon: '🎤',
        },
        {
          number: 5,
          title: 'Corporate Entry & Jaipur Network',
          duration: '1.5 hours',
          topics: [
            'Campus to Corporate — know your organization',
            'Salary Negotiation Guidance',
            'Recruiters Contact Details of Jaipur',
            'Follow-up strategy & offer evaluation',
          ],
          icon: '🏢',
        },
      ],
      allTopics: [
        'Personal Branding Strategy',
        'Tell Me About Yourself — framework & practice',
        'Video Resume creation',
        'Elevator Pitch — 30 sec & 2 min versions',
        'LinkedIn Profile Optimization & Networking',
        'Naukri & Job Portal Strategy',
        'Digital Portfolio Building (for creatives & techies)',
        'How recruiters search candidates online',
        'Resume/CV Making — ATS-friendly formats',
        'Cover Letter Optimization',
        'Tailoring applications per role',
        'Common mistakes that reject applications',
        'Interview Skills — HR, technical & managerial',
        'Mock Interviews with feedback',
        'Group Discussion — practice & strategy',
        'Body language & confidence building',
        'Campus to Corporate — know your organization',
        'Salary Negotiation Guidance',
        'Recruiters Contact Details of Jaipur',
        'Follow-up strategy & offer evaluation',
      ],
    },

    crpParameters: [
      { id: 1, label: 'Personal Branding Strategy', session: 1, desc: 'Define your unique professional identity — strengths, story, and the impression you want recruiters to remember.', icon: '✨', category: 'Session 1' },
      { id: 2, label: 'Tell Me About Yourself — framework & practice', session: 1, desc: 'Master a structured intro for interviews, networking events, and recruiter calls — with live practice.', icon: '🙋', category: 'Session 1' },
      { id: 3, label: 'Video Resume creation', session: 1, desc: 'Create a short, professional video resume that helps you stand out in creative, tech, and modern hiring pipelines.', icon: '🎬', category: 'Session 1' },
      { id: 4, label: 'Elevator Pitch — 30 sec & 2 min versions', session: 1, desc: 'Prepare crisp pitches for quick encounters and longer conversations — tailored to your target role.', icon: '🎯', category: 'Session 1' },
      { id: 5, label: 'LinkedIn Profile Optimization & Networking', session: 2, desc: 'Headline, summary, keywords, and connection strategy so recruiters find and reach out to you.', icon: '💼', category: 'Session 2' },
      { id: 6, label: 'Naukri & Job Portal Strategy', session: 2, desc: 'Profile setup, job alerts, application tracking, and how to rank higher on India\'s top job portals.', icon: '🔍', category: 'Session 2' },
      { id: 7, label: 'Digital Portfolio Building (for creatives & techies)', session: 2, desc: 'Showcase projects, GitHub, Behance, or personal sites — proof of skills beyond a one-page resume.', icon: '🖥️', category: 'Session 2' },
      { id: 8, label: 'How recruiters search candidates online', session: 2, desc: 'Understand what HR and hiring managers look for — keywords, visibility, and red flags to avoid.', icon: '👁️', category: 'Session 2' },
      { id: 9, label: 'Resume/CV Making — ATS-friendly formats', session: 3, desc: 'Build resumes that pass Applicant Tracking Systems and land on a human recruiter\'s desk.', icon: '📄', category: 'Session 3' },
      { id: 10, label: 'Cover Letter Optimization', session: 3, desc: 'Write compelling cover letters tailored to each role — not generic copy-paste templates.', icon: '✉️', category: 'Session 3' },
      { id: 11, label: 'Tailoring applications per role', session: 3, desc: 'Match your resume, cover letter, and portfolio to each job description for higher shortlist rates.', icon: '🎨', category: 'Session 3' },
      { id: 12, label: 'Common mistakes that reject applications', session: 3, desc: 'Spot formatting errors, weak summaries, and content gaps that cause instant rejection.', icon: '⚠️', category: 'Session 3' },
      { id: 13, label: 'Interview Skills — HR, technical & managerial', session: 4, desc: 'Prepare for every interview round — behavioural, domain-specific, and leadership-style questions.', icon: '🎤', category: 'Session 4' },
      { id: 14, label: 'Mock Interviews with feedback', session: 4, desc: 'Practice real interview scenarios with certified experts and get actionable improvement tips.', icon: '🔄', category: 'Session 4' },
      { id: 15, label: 'Group Discussion — practice & strategy', session: 4, desc: 'Learn GD structure, when to speak, how to lead, and how to score points in campus & corporate drives.', icon: '💬', category: 'Session 4' },
      { id: 16, label: 'Body language & confidence building', session: 4, desc: 'Posture, eye contact, voice tone, and nerves management — project confidence from the first handshake.', icon: '💪', category: 'Session 4' },
      { id: 17, label: 'Campus to Corporate — know your organization', session: 5, desc: 'Workplace etiquette, team dynamics, and what to expect in your first weeks on the job.', icon: '🏛️', category: 'Session 5' },
      { id: 18, label: 'Salary Negotiation Guidance', session: 5, desc: 'Research market pay, negotiate offers confidently, and avoid under-selling your skills.', icon: '💰', category: 'Session 5' },
      { id: 19, label: 'Recruiters Contact Details of Jaipur', session: 5, desc: 'Direct access to curated Jaipur recruiter contacts and local hiring opportunities.', icon: '🏢', category: 'Session 5' },
      { id: 20, label: 'Follow-up strategy & offer evaluation', session: 5, desc: 'Professional follow-ups after interviews, comparing offers, and choosing the right opportunity.', icon: '📋', category: 'Session 5' },
    ],

    crpAdditionalParameters: [
      { label: '5 Sessions × 1.5 Hours', desc: '7.5 hours of practical learning', icon: '⏱️' },
      { label: 'Online & Offline (Jaipur)', desc: 'Flexible learning options', icon: '🌐' },
      { label: 'Small Batch Cohorts', desc: 'Personal attention every session', icon: '👥' },
      { label: 'English & Hindi Delivery', desc: 'Learn in the language you prefer', icon: '🗣️' },
      { label: 'Completion Certificate', desc: 'Recognized program credential', icon: '🏅' },
      { label: 'Certified Expert Facilitators', desc: 'Industry-ready mentoring', icon: '✅' },
      { label: 'College Students & Freshers', desc: 'Built for first-job readiness', icon: '🎓' },
      { label: 'Book a Free Guidance Call', desc: 'Speak to our experts before you start', icon: '📞' },
    ],

    programDetails: programPathwaysEn,

    whyDreamsMantra: {
      dreamzPromise: {
        title: 'The Dream Mantra Promise',
        text: 'At Dream Mantra (Dream Mantra), we believe every child holds untapped brilliance. In a world driven by pressure and comparison, we offer something rare: clarity, confidence, and direction.',
        subtext: 'We use Brain Mapping & Skill Mapping — a globally trusted, scientific method that maps brain potential through fingerprint analysis.',
        benefits: [
          'Validated in 30+ countries',
          'Reveals learning styles, memory patterns, intelligence types, and behavioural traits',
          'Deep, bias-free insight — without exams, pressure, or labels',
          'Rooted in neuroscience, genetics, and psychology',
        ],
      },
      howDreamzWorks: [
        { step: 1, icon: '📊', title: 'ASSESS', desc: 'Scientific Brain Mapping fingerprint scanning + Skill Mapping (7 assessments: Career Interest, Multiple Talents, Personality, Learning Style, Professional Behaviour, Workplace Personality & Decision-Making)' },
        { step: 2, icon: '🔬', title: 'ANALYZE', desc: 'Neuroscience-backed analysis by certified counsellors — Govt of India aligned, NLP trained' },
        { step: 3, icon: '🎯', title: 'GUIDE', desc: 'Personalized roadmap for academics, career & life success — from Class 1 to First Job' },
      ],
      featuredAssessments: [
        { title: 'Brain Mapping', desc: 'Fingerprint Analysis, Inborn Potential Mapping', link: '/counselling?tab=dmit', icon: '🔬' },
        { title: 'Skill Mapping', desc: '7 Frameworks: 7 assessments: Career Interest, Multiple Talents, Personality, Learning Style, Professional Behaviour, Workplace Personality & Decision-Making', link: '/counselling?tab=psychometric', icon: '📊' },
        { title: 'Brain Mapping + Skill Mapping', desc: 'Complete inborn + acquired talent profile', link: '/counselling?tab=combo', icon: '🧬' },
      ],
      whyDifferent: [
        'Science-backed Brain Mapping + 7 Skill Mapping frameworks — not guesswork or astrology',
        '7-Pillar holistic career model (Counselling → Job Ready + AI Career Launchpad)',
        '1000+ career library with detailed roadmaps, salaries & entrance exams',
        'Free consultation — Mon–Sat 11am–7pm · Call 9680102276',
        'Certified counsellors: Govt of India, IIT Madras, NLP, Reliance Foundation',
        'Jaipur centres + Pan-India online counselling — same quality everywhere',
        'No pressure. No comparison. No labels. Just clarity and confidence.',
        'Hand-holding beyond the report — counsellors explain every insight in simple language',
      ],
      impactStats: [
        { value: '7,000+', label: 'Counsellings completed' },
        { value: '1000+', label: 'Careers in library' },
        { value: '30+', label: 'Countries validate Brain Mapping' },
        { value: '7', label: 'Psychometric frameworks' },
      ],
      locations: ['Raja Park, Jaipur', 'Shastri Nagar, Jaipur', 'Nirman Nagar, Jaipur', 'Pan-India (Online)'],
      comparisons: {
        title: 'Why scientific counselling beats guesswork',
        subtitle: 'Dream Mantra combines Brain Mapping + Skill Mapping with certified counsellors — compared to common alternatives parents and students rely on in India.',
        tableHeaders: ['Factor', 'Friends / relatives advice', 'Generic online tests', 'Dream Mantra counselling'],
        rows: [
          ['Scientific basis', 'Personal opinion & social bias', 'Single questionnaire, often unverified', 'Brain Mapping in 30+ countries + 7 psychometric frameworks'],
          ['Personalisation', 'One-size advice from their experience', 'Automated PDF with generic text', 'Fingerprint + behaviour profile mapped to 1000+ India careers'],
          ['Pressure & labels', 'Comparison with cousins & neighbours', 'Ranking without context', 'No pressure. No comparison. Clarity only.'],
          ['Counsellor support', 'Not trained in career psychology', 'No human follow-up', 'Govt & IIT Madras certified counsellors — 1-on-1 sessions'],
          ['Roadmap depth', 'Vague “take science” suggestions', 'Career names only', 'Education path, exams (JEE/NEET/CUET), salary bands, institutes'],
          ['Follow-up', 'Informal chats only', 'No accountability', 'Reports, sessions, module process & parent walkthrough'],
          ['Accessibility', 'Limited to who you know', 'Self-serve only', 'Jaipur centres + Pan-India online · Mon–Sat 11am–7pm'],
          ['Stream choice timing', 'Decided after Class 10 boards under stress', 'No Class 9–10 stream guidance', 'Class 6–8 discovery → Class 9–10 stream mapping with evidence'],
          ['Entrance exam clarity', 'Generic “prepare for IIT” without fit check', 'No exam-to-career linkage', 'JEE / NEET / CUET / CLAT mapped to realistic targets & backup plans'],
          ['Salary & ROI reality', 'Outdated or inflated figures', 'No India-specific salary bands', 'Indian fresher & mid-career LPA ranges by city tier'],
          ['Parent involvement', 'Arguments at home, no neutral mediator', 'Parents not included in report', 'Joint parent–student sessions with counsellor explanation'],
          ['Data privacy', 'Advice spreads in family / WhatsApp groups', 'Data sold to coaching institutes', 'Confidential reports — shared only with family'],
          ['NEP 2020 alignment', 'Not aware of multidisciplinary options', 'Ignores new NEP flexibilities', 'Paths aligned with NEP streams, skills & vocational options'],
          ['Wrong decision cost', 'Hidden — years lost before correction', 'Not discussed', 'Early correction saves 2–5 years of wrong degree / drop year'],
          ['Working professional support', '“Just do MBA” generic advice', 'Not designed for career switchers', 'Upskilling, portfolio & switch roadmaps for professionals'],
        ],
        milestoneHeaders: ['Stage', 'Typical approach', 'Dream Mantra approach'],
        milestones: [
          ['Class 6–8', 'No guidance — marks-only focus', 'Brain Mapping + interest discovery before stream pressure'],
          ['Class 9–10', 'Science because “scope zyada hai”', 'Stream fit validated with Brain Mapping + Skill Mapping + counsellor'],
          ['Class 11–12', 'Coaching starts without career clarity', 'Exam strategy tied to specific career & college targets'],
          ['Graduation', 'Degree chosen randomly; placement panic', 'Internship, skills & job-ready modules from year 1'],
          ['First job', 'Random applications; low salary acceptance', 'Salary negotiation, offer comparison & Jaipur network support'],
        ],
        stats: [
          { label: 'Students feel confused about stream choice', value: '87%', source: 'Industry surveys — Class 9–12 India' },
          { label: 'Parents want scientific guidance', value: '92%', source: 'Urban & tier-2 counselling demand' },
          { label: 'Dream Mantra counsellings completed', value: '7,000+', source: 'Dream Mantra records' },
          { label: 'Career paths mapped in-app', value: '1000+', source: 'India-focused career library' },
          { label: 'Students know only 7–10 career names', value: '90%', source: 'National career awareness studies' },
          { label: 'Graduates underemployed in India', value: '65%', source: 'Labour market & graduate outcome reports' },
        ],
      },
    },

    instagramReels: [
      {
        id: 'rajshree-school',
        shortcode: 'DPBmn_rkbH5',
        title: 'Career Counselling at Rajshree Public School',
        caption: 'Every child is unique — Team Dream Mantra conducted an insightful Brain Mapping session to help students discover their natural career paths.',
      },
      {
        id: 'future-ready',
        shortcode: 'DPN_3QekWWa',
        title: 'Future-Ready Students',
        caption: 'Unlock potential with scientific career guidance — Brain Mapping, counselling, and clarity for every student journey.',
      },
      {
        id: 'dmit-career-guidance',
        shortcode: 'DPN-2HUEVAF',
        title: 'Brain Mapping & Career Counselling',
        caption: 'Brain Mapping, child development, and career counselling — helping students build the right mindset for their future.',
      },
      {
        id: 'class-1-5-guidance',
        shortcode: 'DXI8qPnzQVK',
        title: 'Career Guidance from Class 1–5',
        caption: 'It is never too early to start — Dream Mantra helps young learners discover strengths early with scientific assessments.',
      },
    ],

    psychometricTests: [
      { id: 'mbti', icon: '🧠', name: 'Personality Assessment', developer: 'Isabel Briggs Myers & Katharine Briggs (1943)', summary: 'Categorises personality across four preference pairs to reveal study habits, decision-making style, and career environment fit.', pairs: ['Introversion / Extraversion', 'Sensing / Intuition', 'Thinking / Feeling', 'Judging / Perceiving'], outcome: '16 personality types for clearer self-understanding', color: 'amber' },
      { id: 'disc', icon: '⚡', name: 'Professional Behaviour & Work Style Analysis', developer: 'Dr. William Moulton Marston (1928)', summary: 'Explains behaviour across four styles — widely used in education, leadership, and communication profiling.', pairs: ['Dominance — assertive, result-driven', 'Influence — expressive, social', 'Steadiness — calm, cooperative', 'Conscientiousness — analytical, precise'], outcome: 'Behavioural style map for teamwork & leadership', color: 'orange' },
      { id: 'big5', icon: '📊', name: 'Workplace Personality & Success Factors Analysis', developer: 'Lewis Goldberg (1981), Costa & McCrae (1985)', summary: 'The most scientifically validated personality framework used in modern psychology today.', pairs: ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'], outcome: 'Trait-based profile for academic & career fit', color: 'green' },
      { id: 'vak', icon: '👁️', name: 'Learning Style Assessment', developer: 'VARK model by Neil Fleming (1987)', summary: 'Identifies preferred learning modes to improve retention, focus, and academic performance.', pairs: ['Visual — images & diagrams', 'Auditory — listening & discussion', 'Kinesthetic — activities & movement'], outcome: 'Personalised study strategy recommendations', color: 'gold' },
      { id: 'mit', icon: '🎯', name: 'Multiple Talents Assessment', developer: 'Dr. Howard Gardner (1983), Harvard University', summary: 'Intelligence is multidimensional — talent exists beyond academic marks alone.', pairs: ['Logical–Mathematical', 'Linguistic', 'Musical', 'Bodily–Kinesthetic', 'Visual–Spatial', 'Interpersonal', 'Intrapersonal', 'Naturalistic', 'Existential'], outcome: 'Talent mapping beyond exam scores', color: 'amber' },
      { id: 'riasec', icon: '🧭', name: 'Career Interest Assessment', developer: 'Dr. John Holland (1959)', summary: 'Links personality with career interests through six types — one of the most trusted frameworks worldwide.', pairs: ['Realistic — practical, technical', 'Investigative — analytical, scientific', 'Artistic — creative, expressive', 'Social — helping, teaching', 'Enterprising — leadership, business', 'Conventional — organised, structured'], outcome: 'Career interest alignment & shortlisting', color: 'orange' },
      { id: 'jung', icon: '🔮', name: 'Decision-Making & Thinking Style Assessment', developer: 'Carl Gustav Jung (1921)', summary: 'Foundation theory for many modern personality assessments — energy, perception, and decision styles.', pairs: ['Energy: Introvert / Extrovert', 'Perception: Sensing / Intuition', 'Decision: Thinking / Feeling'], outcome: 'Deep cognitive & personality insight', color: 'green' },
    ],
    psychoProblems: [
      'Confusion about career direction',
      'Lack of motivation in studies',
      'Low confidence and self-doubt',
      'Frequent changes in goals',
      'Stress and academic dissatisfaction',
    ],
    psychoBenefits: [
      'Natural abilities & aptitudes',
      'Personality traits & temperament',
      'Learning style preferences',
      'Interests and passions',
      'Behavioural strengths & communication style',
    ],
    psychoProfileCovers: [
      'Personality Analysis – Understand your natural personality, strengths, and areas for growth.',
      'Career Interest Analysis – Discover the careers and work environments that best match your interests.',
      'Behavioural Style – Learn how you communicate, work with others, and respond in different situations.',
      'Learning Style Assessment – Identify how you learn best and the study techniques that suit you.',
      'Multiple Intelligence Profile – Discover your strongest abilities and areas where you have the highest potential.',
      'Core Personality Traits – Gain deeper insights into your confidence, discipline, adaptability, emotional balance, and social preferences.',
      'Personalised Career Roadmap – Receive stream, subject, career recommendations, and expert guidance from a certified counsellor.',
    ],
    psychoProcess: [
      { step: '01', title: 'Online Assessment', desc: 'Complete the Skill Mapping battery online — typically 30–45 minutes, at your own pace.', icon: '💻' },
      { step: '02', title: 'Multi-Framework Analysis', desc: 'Multiple psychometric tests will be taken — age-specific frameworks are administered and interpreted together by certified analysts.', icon: '🔬' },
      { step: '03', title: 'Comprehensive Report', desc: 'Receive a detailed report covering personality, interests, learning style, and career alignment.', icon: '📋' },
      { step: '04', title: 'Counselling Session', desc: '1-on-1 session with a Dream Mantra counsellor to translate insights into actionable guidance.', icon: '💬' },
    ],
    psychoAgeMap: [
      {
        age: 'Class 6–8',
        tag: 'Self Discovery Stage',
        frameworks: ['Multiple Talents', 'Learning Style'],
        problem: 'Students study hard but marks don\'t improve — often because how they\'re taught doesn\'t match how their brain naturally learns.',
        solution: 'Multiple Talents & Learning Style assessments reveal intelligence types and learning preferences — so study methods, activities, and confidence-building align with who they really are.',
        program: '/programs/class-6-8',
      },
      {
        age: 'Class 9–12',
        tag: 'Stream & Career Selection',
        frameworks: ['Multiple Talents', 'Personality', 'Learning Style', 'Career Interest', 'Professional Behaviour'],
        problem: 'Stream choices driven by marks, peer pressure, or trends — not by personality, interests, or behavioural fit.',
        solution: 'Five frameworks map how they learn, think, behave, and what careers naturally attract them — science-backed stream and subject decisions.',
        program: '/programs/class-9-10',
      },
      {
        age: 'College Students',
        tag: 'Degree & Career Clarity',
        frameworks: ['Multiple Talents', 'Personality', 'Career Interest', 'Professional Behaviour', 'Workplace Personality'],
        problem: 'Many students realise mid-degree that their field doesn\'t fit — leading to wasted time, low motivation, or costly switches.',
        solution: 'Five deep frameworks confirm degree fit, internship direction, and job readiness — before placement season or a painful pivot.',
        program: '/programs/college-students',
      },
      {
        age: 'Working Professionals',
        tag: 'Career Growth & Switch',
        frameworks: ['Multiple Talents', 'Personality', 'Career Interest', 'Professional Behaviour', 'Workplace Personality'],
        problem: 'Stuck in roles that drain energy — a mismatch between natural strengths, personality, and daily work demands.',
        solution: 'Workplace Personality, Personality, Career Interest & Professional Behaviour assessments together reveal ideal roles, leadership style, and whether a career switch makes scientific sense.',
        program: '/programs/working-professionals',
      },
    ],
    psychoWhy: [
      { title: 'Beyond Brain Mapping', desc: 'While Brain Mapping reveals inborn potential, Skill Mapping maps your current personality, interests, behaviour, and decision-making style.' },
      { title: 'Complete Picture', desc: 'Together with Brain Mapping, Skill Mapping creates the full nature + nurture profile for confident career decisions.' },
      { title: 'Scientific & Objective', desc: 'Globally researched frameworks — not assumptions, peer pressure, or guesswork.' },
      { title: '7 Frameworks, One Profile', desc: 'Multiple dimensions ensure guidance is accurate, balanced, and practical — not based on a single test score.' },
    ],

    comboSteps: [
      { step: '01', title: 'Brain Mapping', desc: 'Fingerprint scanning maps your inborn potential — learning styles, memory patterns, intelligence types. Validated in 30+ countries.', icon: '🔬', link: '/counselling?tab=dmit' },
      { step: '02', title: 'Skill Mapping', desc: 'Online assessment (30–45 min) across 7 assessments: Career Interest, Multiple Talents, Personality, Learning Style, Professional Behaviour, Workplace Personality & Decision-Making.', icon: '📊', link: '/counselling?tab=psychometric' },
      { step: '03', title: 'Combined Report', desc: 'Single holistic report merging inborn (Brain Mapping) + acquired (Skill Mapping) insights — your complete talent profile.', icon: '📋' },
      { step: '04', title: 'Expert Counselling', desc: 'Certified Dream Mantra counsellor interprets both reports in a dedicated session and builds your personalised career roadmap.', icon: '💬' },
    ],
    comboCompare: [
      { aspect: 'What it maps', dmit: 'Inborn / genetic potential via fingerprints', psychometric: 'Current personality, interests & behaviour', combo: 'Complete nature + nurture picture' },
      { aspect: 'Best for', dmit: 'Early talent discovery (Class 1–8), learning style', psychometric: 'Stream & career decisions (Class 9+)', combo: 'Stream selection, career direction, course correction' },
      { aspect: 'Frameworks', dmit: 'Fingerprint-based multiple intelligence mapping', psychometric: '7 assessments: Career Interest, Multiple Talents, Personality, Learning Style, Professional Behaviour, Workplace Personality & Decision-Making', combo: 'All of the above in one integrated profile' },
      { aspect: 'Output', dmit: '28-page inborn talent report', psychometric: 'Multi-framework personality report', combo: 'Combined report + counsellor interpretation session' },
    ],
    comboBenefits: [
      { icon: '🧬', title: 'Nature + Nurture', desc: 'Brain Mapping shows who you are born to be; Skill Mapping shows who you are becoming — together, no guesswork.' },
      { icon: '🎯', title: 'Accurate Stream Fit', desc: 'Confirm PCM, PCB, Commerce or Arts with scientific data — not marks or peer pressure alone.' },
      { icon: '👨‍👩‍👧', title: 'Family-Aligned Guidance', desc: "Reports give parents objective insight — counsellors align expectations with the child's real strengths." },
      { icon: '🗺️', title: 'Personalised Roadmap', desc: 'Post-report counselling session converts data into a step-by-step academic and career plan.' },
      { icon: '📈', title: 'Market-Aware Decisions', desc: 'Counsellors connect your profile to 1000+ careers, exams, and current industry trends.' },
      { icon: '🔄', title: 'Follow-Up Support', desc: 'Course correction sessions available as goals evolve through Class 11-12 and college.' },
    ],
    comboReportIncludes: [
      'Brain Mapping inborn potential & brain lobe analysis',
      'Learning style (Visual / Auditory / Kinesthetic)',
      'Multiple intelligence mapping',
      'Personality type & preferences',
      'Professional Behaviour style profile',
      'Career Interest alignment',
      'Workplace Personality trait analysis',
      'Stream & career recommendations',
      'SWOT analysis from combined data',
      '1-on-1 counsellor interpretation session',
    ],
    comboWho: [
      'Class 6–8 students exploring self-discovery',
      'Class 9–10 students choosing streams',
      'Class 11–12 students planning careers & exams',
      'College students seeking degree & job clarity',
      'Parents wanting scientific guidance for their child',
      'Students confused between Science, Commerce & Arts',
    ],

    partners: [
      { slug: 'schools', title: 'Schools', desc: 'Integrate scientific career guidance into your school curriculum with certified counsellors and parent workshops.' },
      { slug: 'coaching-centers', title: 'Coaching Centers', desc: 'Offer Brain Mapping & Skill Mapping assessments as value-add for your students preparing for competitive exams.' },
      { slug: 'colleges', title: 'Colleges', desc: 'Campus career cells powered by Dream Mantra — placement prep, internships, and alumni mentoring.' },
      { slug: 'corporates', title: 'Corporates', desc: 'Employee career wellness programs, team assessments, and leadership development workshops.' },
      { slug: 'teachers', title: 'Teachers', desc: 'Become a certified career guide — training, certification, and referral income opportunities.' },
      { slug: 'referral-partner', title: 'Referral Partner', desc: 'Earn commissions by referring students and professionals to Dream Mantra programs.' },
    ],
    partnerDetails: partnerDetailsEn,
    leadership: leadershipEn,
    homeLeadership: {
      founding: { title: 'Founding Leadership', subtitle: 'The visionaries who built Dream Mantra from the ground up.' },
      directors: { title: 'Board of Directors', subtitle: 'Strategic leadership guiding long-term direction, growth, and community impact.' },
      executive: { title: 'Executive Leadership Team', subtitle: 'Regional leaders driving marketing, counselling excellence, and business expansion.' },
    },
  },

  pillars: [
    {
      id: 1,
      title: 'Inborn Talent (Brain Mapping)',
      subtitle: 'Fingerprint science',
      description:
        'Brain Mapping maps your inborn potential through fingerprint analysis — validated in 30+ countries. Reveals learning style, memory patterns, and intelligence types without exams or pressure.',
      features: [
        'Scientific fingerprint scanning',
        'Learning style & memory mapping',
        'Bias-free, no exam stress',
        'Ideal for early discovery (Class 1+)',
        'Rooted in neuroscience & genetics',
      ],
    },
    {
      id: 2,
      title: 'Acquired Talent (Skill Mapping)',
      subtitle: '7 assessment frameworks',
      description:
        'Understand personality, interests, and behavioural traits through our 7 assessments — the gold standard for stream and career decisions after Class 8.',
      features: [
        '7 assessments: Career Interest, Multiple Talents, Personality, Learning Style, Professional Behaviour, Workplace Personality & Decision-Making',
        'Personality-career alignment',
        'Best for Class 9–12 & college',
        'AI-assisted interpretation',
        'Complements Brain Mapping for full profile',
      ],
    },
    {
      id: 3,
      title: 'What You Have Learned',
      subtitle: 'Academic & skill audit',
      description:
        'We analyse what you have actually studied — subjects, grades, projects, certifications — and map how your current education aligns with real career paths and skill gaps.',
      features: [
        'Subject & grade analysis',
        'Skill gap identification',
        'Project & certification review',
        'Bridge courses recommendation',
        'Aligns academics with career goals',
      ],
    },
    {
      id: 4,
      title: 'Market Trend',
      subtitle: 'Industry intelligence',
      description:
        'Real-time insight into which careers are growing, which are saturated, and where demand is rising in India and globally — so you choose a future-proof direction.',
      features: [
        'Industry growth & demand data',
        'Salary & hiring trends',
        'Emerging vs declining roles',
        'Regional opportunity mapping',
        '1000+ career library reference',
      ],
    },
    {
      id: 5,
      title: 'AI Proof Career',
      subtitle: 'Tomorrow-ready careers',
      description:
        'Identify careers resilient to automation and AI disruption. We guide you toward roles where human creativity, empathy, and complex judgment remain irreplaceable.',
      features: [
        'AI-impact career scoring',
        'Emerging tech career paths',
        'Upskilling for AI era',
        'Hybrid human+AI roles',
        'Long-term employability focus',
      ],
    },
  ],

  trainingSessions: [
    {
      number: 1,
      title: 'Career Discovery',
      subtitle: 'Clarity & direction',
      description:
        'Discover your strengths, interests, personality, and ideal career path with complete career clarity.',
      features: [
        'Strengths & interest discovery',
        'Personality-career fit',
        'Ideal path shortlisting',
        'Complete career clarity',
        'Personalised direction plan',
      ],
    },
    {
      number: 2,
      title: 'Personal Branding',
      subtitle: 'Stand out professionally',
      description:
        'Build an ATS-friendly resume, optimized LinkedIn profile, and a professional brand that stands out.',
      features: [
        'ATS-friendly resume',
        'LinkedIn optimization',
        'Professional brand story',
        'First-impression polish',
        'Portfolio & presence tips',
      ],
    },
    {
      number: 3,
      title: 'AI-Powered Job Search',
      subtitle: 'Smarter applications',
      description:
        'Use AI to optimize your resume, find opportunities, network effectively, and accelerate your job search.',
      features: [
        'AI resume optimization',
        'Opportunity discovery',
        'Smart networking tactics',
        'Faster job-search loops',
        'Role targeting strategy',
      ],
    },
    {
      number: 4,
      title: 'Interview Mastery',
      subtitle: 'Confident conversations',
      description:
        'Crack HR, technical, and panel interviews with confidence, communication skills, and proven strategies.',
      features: [
        'HR interview frameworks',
        'Technical interview prep',
        'Panel interview practice',
        'Communication confidence',
        'Proven response strategies',
      ],
    },
    {
      number: 5,
      title: 'Career Launch',
      subtitle: 'Offer-ready growth',
      description:
        'Learn job application strategies, salary negotiation, corporate readiness, and long-term career growth.',
      features: [
        'Application strategies',
        'Salary negotiation',
        'Corporate readiness',
        'Offer evaluation tips',
        'Long-term growth roadmap',
      ],
    },
  ],

  seventhPillar: {
    title: '5 Sessions for Training & Placement',
    subtitle: 'AI Career Launchpad — Job-Ready Accelerator',
    tagline: 'College Students & Freshers — become job-ready in 5 focused sessions',
    crpHighlights: ['Career Discovery', 'Personal Branding', 'AI Job Search', 'Interview Mastery', 'Career Launch'],
  },

  partners: {
    partnerWithUs: 'Partner with us →',
  },

  programs: [
    { slug: 'class-1-5', title: 'Class 1-5', subtitle: 'Talent Discovery' },
    { slug: 'class-6-8', title: 'Class 6-8', subtitle: 'Self Discovery' },
    { slug: 'class-9-10', title: 'Class 9-10', subtitle: 'Stream Selection' },
    { slug: 'class-11-12', title: 'Class 11-12', subtitle: 'Career Direction' },
    { slug: 'college-students', title: 'College Students', subtitle: 'Degree & Career Clarity' },
    { slug: 'working-professionals', title: 'Working Professionals', subtitle: 'Career Switch & Growth' },
  ],

  pages: {
    counselling: {
      title: 'For Counselling',
      subtitle: "India's #1 Career & Education Counselling — Brain Mapping & Skill Mapping powered",
      cta: 'Book a free guidance call',
      pathLabel: 'How to use this page',
      pathSteps: [
        'Pick a topic in the menu',
        'Explore what fits you',
        'Book a free guidance call',
      ],
      menuHint: 'Choose a section',
      nextStepEyebrow: 'Your next step',
      nextStepTitle: 'Ready for personal guidance?',
      nextStepDesc:
        'Talk to a counsellor — no commitment. We’ll help you choose the right next step.',
      tabs: {
        overview: {
          exploreMore: 'Explore more',
          processEyebrow: '5-Step Process',
          processTitle: 'How counselling works',
          processDesc:
            'Five science-backed steps — from inborn talent to an AI-ready career path — guided by certified counsellors.',
          agesEyebrow: 'Who we counsel',
          agesTitle: 'Ages we do counselling for',
          agesDesc: 'Pick your stage — each pathway opens problems, benefits, solutions, and Book Now.',
          assessmentsEyebrow: 'Assessments',
          assessmentsTitle: 'Brain, Skill & complete profile',
          assessmentsDesc: 'Glimpses of the tools that power every counselling session.',
          assessmentGlimpses: [
            {
              id: 'dmit',
              icon: '🧬',
              title: 'Brain Mapping',
              desc: 'Fingerprint-based guidance.',
              link: '/counselling?tab=dmit',
            },
            {
              id: 'psychometric',
              icon: '🧠',
              title: 'Skill Mapping',
              desc: 'Psychometric-based.',
              link: '/counselling?tab=psychometric',
            },
            {
              id: 'combo',
              icon: '✨',
              title: 'Brain + Skill Mapping',
              desc: 'Fingerprint + psychometric guidance, together.',
              link: '/counselling?tab=combo',
            },
          ],
        },
        dmit: {
          title: '🔬 Brain Mapping',
          desc: 'Fingerprint analysis mapping inborn potential — validated in 30+ countries.',
        },
        psychometric: {
          title: '📊 Skill Mapping',
          desc: '7 assessments: Career Interest, Multiple Talents, Personality, Learning Style, Professional Behaviour, Workplace Personality & Decision-Making — 7 frameworks in one suite.',
          takeAssessment: 'Get Started',
        },
        process: {
          bookSession: 'Book Session',
        },
        programs: {
          badge: 'Tailored for every life stage',
          title: 'Age Pathways for Every Journey',
          desc: 'From early talent discovery to college clarity and career switches — choose the pathway that fits your age and goals.',
          exploreProgram: 'Explore Pathway',
          subTabs: {
            students: 'Students',
            institutions: 'Partner with us',
          },
          institutions: {
            badge: 'Partner With Dream Mantra',
            title: 'Partner With Dream Mantra',
            desc: 'At Dream Mantra Education & Career Counselling, we collaborate with educators, institutions and professionals who want to help students discover their true potential and make the right career choices.',
            chooseCategory: 'Select the option that best describes you to explore partnership opportunities.',
            explorePartnership: 'Explore Partnership',
            getInTouch: 'Get in touch with us',
            getInTouchDesc: 'Reach our partnership team for schools, colleges, coaching centres, corporates, teachers, and referral partners.',
            hours: 'Mon–Sat, 11am–7pm',
            contactCta: 'Contact Partnership Team',
          },
        },
        book: {
          title: 'Book a free guidance call',
          hours: 'Mon–Sat, 11am–7pm | 9680102276',
          createAccount: 'Create Account',
        },
      },
    },
    assessments: {
      title: 'Assessments',
      subtitle: 'Scientific Brain Mapping & Skill Mapping career assessments — validated in 30+ countries',
      whyCareerCounselling: {
        title: 'Why Career Counselling?',
        desc: 'Discover our scientific approach — Brain Mapping, Skill Mapping, the 7-Pillar model, and personalised guidance from Class 1 to First Job.',
        cta: 'Explore Why Career Counselling',
      },
    },
    counsellors: {
      title: 'For Counsellors',
      subtitle: 'Join 1000+ certified career counsellors across India',
      become: {
        title: 'Become a Career Counsellor',
        desc: 'Get certified in Brain Mapping, Skill Mapping counselling, and join Dream Mantra\'s pan-India network. Training, certification, and referral income.',
        cta: 'Apply Now',
        imageAlt: 'Counsellor training',
      },
      certification: {
        items: [
          'Government of India aligned',
          'Brain Mapping Practitioner',
          'International Career Counselling',
          'NLP Basics',
          'IIT Madras workshops',
        ],
        imageAlt: 'Certification',
      },
      join: {
        desc: 'Partner as school, coaching center, or independent counsellor.',
        cta: 'Contact Partnership Team',
        imageAlt: 'Counsellor network',
      },
    },
    marketplace: {
      title: 'Book Now',
      subtitle: 'Two clear paths — counselling assessments & products, plus training for job readiness',
      quote: '"The best investment you can make is in yourself — and the right career decision starts with the right assessment."',
      cta: 'Book a free guidance call',
      verticals: {
        counselling: {
          eyebrow: 'Clarity first',
          title: 'Counselling',
          desc: 'Brain Mapping, Skill Mapping & counselling products.',
          assessmentsTitle: 'Premium Assessments',
          assessmentsDesc: 'Brain Mapping, Skill Mapping & Combo — book from dashboard after signup.',
          productsTitle: 'Counselling products',
        },
        training: {
          eyebrow: 'Job readiness',
          title: 'Training & Placement',
          desc: 'AI Career Launchpad — skills, interviews & placement-ready outcomes.',
          programEyebrow: 'AI Career Launchpad',
          programTitle: 'Get job-ready with structured training',
          programDesc:
            'Five skill sessions covering personal brand, resume, interviews, and placement support for college students, freshers, and professionals.',
          exploreCta: 'Explore Launchpad',
          pathwaysCta: 'Age Pathways',
          productsTitle: 'Training programs',
          points: [
            '5 skill sessions for job readiness',
            'Resume, LinkedIn & interview practice',
            'Placement-focused outcomes',
          ],
        },
      },
      tests: {
        premiumTitle: 'Premium Assessments',
        premiumDesc: 'Brain Mapping, Skill Mapping & Combo — book from dashboard after signup.',
        paidProductsTitle: 'Paid Products',
        viewDetails: 'View details',
        signUpToBook: 'Sign up to book →',
        withCode: 'with',
      },
    },
    studyAbroad: {
      title: 'Study Abroad',
      subtitle: 'University shortlisting, visas, and education loans',
      overview: 'End-to-end study abroad support — from country selection to visa and loan assistance with top banking partners.',
      universities: '1200+ college partners. We shortlist universities matching your profile, budget, and career goals.',
      visa: {
        title: 'Visa & Documentation',
        desc: 'Document prep, mock interviews, and timeline tracking for student visas.',
        cta: 'Talk to Expert',
      },
    },
    pillars: {
      title: '5 Pillars for Counselling & 5 Sessions for Training',
      subtitle: 'A complete Dream Mantra framework — counselling clarity plus job-ready training',
      cta: 'Book Consultation',
      intro: 'Every career decision at Dream Mantra stands on five counselling pillars, plus five Training & Placement sessions in AI Career Launchpad — combining science, market reality, and job readiness.',
      introCore: 'five counselling pillars',
      introCrp: 'five Training & Placement sessions in AI Career Launchpad',
      pillarLabel: 'Pillar',
      explore: 'Explore',
      counsellingLabel: '5 Pillars for Counselling',
      trainingLabel: '5 Sessions for',
      trainingLabelHighlight: 'Training & Placement',
      trainingSubtitle: 'AI Career Launchpad — from career clarity to offer-ready confidence.',
      sessionLabel: 'Session',
      seventhPillarLabel: 'Training & Placement',
      viewCrp: 'View AI Career Launchpad',
    },

    about: {
      hero: {
        title: 'About Us — Science Meets Heart',
        subtitle: "We're not just decoding fingerprints. We're unlocking futures — with science, heart, and lifelong value.",
      },
      story: {
        label: 'Our Story',
        title: 'Every child holds untapped brilliance',
        paragraph1Before: 'Dream Mantra began when Founder ',
        paragraph1After: ', as Key Accounts Manager at Naukri.com for Rajasthan, worked with 15,000+ job seekers and 2,500+ HR professionals. She noticed a recurring pattern — professionals stuck in jobs they hated because their path never matched who they truly were.',
        paragraph2: 'Three things were almost always misaligned: what people studied, what they were naturally suited for, and what the market actually required. That gap led her to Brain Mapping and Skill Mapping assessments — scientific methods that together reveal inborn potential and current personality.',
        cta: 'Explore Our Assessments',
        imageAlt: 'Dream Mantra counselling',
      },
      twoPillars: {
        title: 'Our Two Scientific',
        titleHighlight: 'Pillars',
        subtitle: '🧩 Brain Mapping + Skill Mapping = Complete Clarity',
        dmit: {
          title: '🔬 Brain Mapping — The Nature Side',
          desc: 'Fingerprint analysis mapping inborn potential — validated in 30+ countries. Reveals learning styles, memory patterns, and intelligence types without exams or pressure.',
        },
        psychometric: {
          title: '📊 Skill Mapping — The Nurture Side',
          desc: '7 frameworks — 7 assessments: Career Interest, Multiple Talents, Personality, Learning Style, Professional Behaviour, Workplace Personality & Decision-Making — mapping current personality, interests, and behavioural patterns shaped by experience.',
        },
      },
      missionVision: {
        missionTitle: 'Our Mission',
        visionTitle: 'Our Vision',
        purposeTitle: 'Our Purpose',
      },
      values: {
        title: 'What Makes Us Unique',
        items: [
          { title: 'Clarity', desc: 'Replace confusion and guesswork with scientific self-awareness and informed decisions.' },
          { title: 'Complete Picture', desc: 'Brain Mapping (nature) + Skill Mapping (nurture) — where you excel and who you are right now.' },
          { title: 'Real-World Alignment', desc: 'What you study × natural strengths × personality × what the market actually needs.' },
          { title: 'Science Meets Heart', desc: 'Expert counselling that turns insight into strategies — no pressure, no comparison.' },
        ],
      },
      managementTeam: {
        label: 'Leadership Team',
        title: 'Founding Leadership',
        subtitle: 'The founders who combine counselling expertise, technology, and operations to deliver clarity at scale.',
      },
      founderNote: {
        label: "Founder's Note",
      },
      certifications: {
        label: 'Our Certifications',
        title: 'Trusted &',
        titleHighlight: 'Certified',
        subtitle: 'Government-aligned and internationally recognised credentials — the same certifications that power every Dream Mantra counselling session.',
        viewFull: 'View certificate',
        closeLightbox: 'Close',
      },
      locations: {
        title: '📍 Jaipur Centres · 🌍 Pan-India Online',
        names: ['Raja Park', 'Shastri Nagar', 'Nirman Nagar'],
        panIndia: 'Pan-India Online',
        panIndiaSub: 'Live online counselling across India',
        city: 'Jaipur, Rajasthan',
        hours: 'Mon–Sat 11am–7pm',
      },
      cta: {
        title: 'Ready to discover your complete picture?',
        subtitle: 'Book a free guidance call — Mon–Sat, 11am–7pm',
        button: 'Book a free guidance call',
      },
    },

    crp: {
      hub: {
        title: 'Training & Placement',
        subtitle: 'From learning to landing your dream job.',
        cta: 'Book a free guidance call',
        overviewEyebrow: 'Job readiness',
        overviewTitle: 'How Training & Placement works',
        overviewDesc:
          'Pick your age pathway, then go deep into the AI Career Launchpad — 5 skill sessions, highlights, and placement-ready outcomes.',
        exploreMore: 'Explore more',
        cards: [
          {
            id: 'launchpad',
            icon: '🚀',
            title: 'AI Career Launchpad',
            desc: '5 skill sessions, highlights, and parameters for job-ready confidence.',
          },
          {
            id: 'readiness',
            icon: '🌟',
            title: 'Personalised Career Readiness Program',
            desc: 'Neuroscience + psychometrics + placement — the complete launchpad.',
          },
        ],
      },
      hero: {
        subtitle: 'College Students · Freshers · Working Professionals · 5 skill sessions × 1.5 hours',
        cta: 'Book a free guidance call',
      },
      explore: {
        title: 'AI Career Launchpad',
        subtitle: 'Full program roadmap · 5 AI skill sessions · program highlights · 20 parameters',
        cta: 'Book a free guidance call',
        footerTitle: "Your career doesn't happen by chance. It happens by",
        footerAccent: 'preparation.',
        footerMeta: '5 Sessions · 30 Days · A lifetime of impact.',
        footerDesc: '',
        nav: { label: 'AI Career Launchpad' },
      },
      launch: {
        title: 'Launch With AI',
        subtitle: 'College Students · Freshers · Working Professionals — start with a free guidance call',
        cta: 'Book a free guidance call',
        exploreLink: 'View full program blueprint',
        nav: { label: 'Launch With AI' },
      },
      statItems: [
        { label: '5 Sessions', sub: 'Skill modules' },
        { label: '7.5 hrs', sub: 'Total training' },
        { label: '20', sub: 'Parameters' },
        { label: '100%', sub: 'Practical & industry focused' },
      ],
      badge: 'Training & Placement · AI Career Launchpad',
      forAudiencePrefix: 'For',
      exploreSprints: 'Explore 5 skill sessions',
      sessions: {
        title: '5 AI Skill',
        titleHighlight: 'Sessions',
        subtitle: '',
        sessionLabel: 'SESSION',
        groups: [
          {
            icon: '🚀',
            title: 'Brand & Applications',
            subtitle: 'Sessions 1–3',
            duration: '4.5 hours',
            sessionNumbers: [1, 2, 3],
          },
          {
            icon: '🎯',
            title: 'Interviews & Career Launch',
            subtitle: 'Sessions 4–5',
            duration: '3 hours',
            sessionNumbers: [4, 5],
          },
        ],
      },
      highlights: {
        title: 'Additional',
        titleHighlight: 'Program Highlights',
        subtitle: '',
      },
      parameters: {
        badge: '',
        title: "What You'll Learn in",
        titleHighlight: 'AI Career Launchpad',
        subtitle: '',
        filterAll: 'All',
        parameterOf: 'Parameter',
        ofTwenty: 'of 20',
        closeLabel: 'Close explanation',
      },
      allTopics: {
        title: 'Everything covered in AI Career Launchpad',
      },
      outcomes: {
        title: 'Program Outcomes',
        subtitle: '',
      },
      ctaCard: {
        title: 'Ready to launch your career?',
        desc: '',
        button: 'Book a free guidance call',
        seePillars: 'See all 5 Pillars',
      },
      readiness: {
        badge: 'Flagship career launchpad',
        title: 'Personalised Career Readiness Program',
        subtitle: 'The CRP blends neuroscience, psychometrics, and modern recruitment practices to prepare students and professionals for the job market — five sessions, five counselling pillars, and placement assistance.',
        bookCta: 'Book Now',
        intro: 'Structured into five sessions, supported by five counselling pillars, and backed by placement assistance — designed to transform students and professionals into market-ready candidates with clarity, confidence, and future-proof skills.',
        sessionsTitle: 'Five Training & Placement Sessions',
        pillarsTitle: 'Five Counselling Pillars',
        leadersTitle: 'Leadership Team',
        audienceTitle: 'Who Can Benefit?',
        contactTitle: 'Contact & Access',
        contactDesc: 'Phone: 9680102276 · Email: info@dreammantra.in · Mon–Sat, 11 AM – 7 PM · Jaipur, Rajasthan (Pan-India services available)',
        mappingSteps: [
          {
            title: 'Step 1: Brain Mapping (Inborn Talent)',
            desc: 'Fingerprint-based biometric analysis decodes natural abilities — learning styles, memory patterns, and intelligence types.',
            bullets: ['Validated in 30+ countries', 'Discover natural strengths without exam stress', 'Rooted in neuroscience, genetics, and dermatoglyphics'],
          },
          {
            title: 'Step 2: Skill Mapping (Acquired Talent)',
            desc: 'Psychometric tests measure personality traits, soft skills, and technical skills matched to career paths and industry demand.',
            bullets: ['7 integrated assessments', 'Leadership, communication, and problem-solving insight'],
          },
          {
            title: 'Step 3: Combined Mapping',
            desc: 'Integrates Brain Mapping + Skill Mapping for a 360° career profile aligned with market trends.',
            bullets: ['What comes naturally + what you have learned', 'Future-proof and AI-proof career choices'],
          },
        ],
        trainingSessions: [
          { title: 'Career Discovery', desc: 'Identify strengths, interests, and personality fit.', outcome: 'Complete career clarity with a personalized roadmap.' },
          { title: 'Personal Branding', desc: 'Build resume, LinkedIn profile, and digital presence.', outcome: 'Recruiter-attractive branding.' },
          { title: 'AI-Powered Job Search', desc: 'Learn to use AI tools for smart job hunting.', outcome: 'Efficient access to hidden opportunities.' },
          { title: 'Interview Mastery', desc: 'Mock interviews, confidence-building, communication training.', outcome: 'Strong interview performance.' },
          { title: 'Career Launch', desc: 'Placement assistance, recruiter connections, final push.', outcome: 'Smooth transition into the workforce.' },
        ],
        pillars: [
          { title: 'Inborn Talent (Brain Mapping)', desc: 'Discover natural strengths.' },
          { title: 'Acquired Talent (Skill Mapping)', desc: 'Assess learned skills.' },
          { title: 'What You Have Learned', desc: 'Academic and professional knowledge.' },
          { title: 'Market Trend', desc: 'Align with industry demand.' },
          { title: 'AI-Proof Career', desc: 'Future-ready career paths.' },
        ],
        leaders: [
          { name: 'Esha (Founder)', role: 'Ex-Naukri.com recruiter', focus: 'Bridging education with industry needs.' },
          { name: 'Shivam (Co-Founder)', role: 'PwC consulting background', focus: 'Scalable technology and operations.' },
        ],
        audiences: [
          { title: 'School Students (Class 1–12)', desc: 'Early talent discovery.' },
          { title: 'College Students', desc: 'Career clarity and placement readiness.' },
          { title: 'Working Professionals', desc: 'Career transitions and upskilling.' },
        ],
      },
    },

    dmit: {
      hero: {
        badge: '🔬 Validated in 30+ Countries | Neuroscience-Based',
        titleBefore: 'Reveal Inborn Potential Through',
        titleHighlight: 'Fingerprint Analysis',
        titleAfter: '',
        desc: 'Brain Mapping maps your inborn brain potential through fingerprint analysis — without exams, pressure, or labels.',
        bookTest: 'Book Brain Mapping',
        freeConsultation: 'Free guidance Call',
        imageAlt: 'Brain Mapping fingerprint session',
      },
      trustedBy: {
        label: 'Trusted By',
        items: ['🏛️ Assam Government', '⚖️ Bombay High Court', '🌍 30+ Countries'],
      },
      whatIs: {
        label: 'Understanding the Science',
        title: 'What is Brain Mapping?',
        paragraphs: [
          'Brain Mapping (Dermatoglyphics Multiple Intelligence Test) is a scientific assessment that maps an individual\'s inborn brain potential through fingerprint analysis.',
          'Fingerprints are formed in the womb between the 13th and 19th week of pregnancy and remain unchanged throughout life. During this same developmental phase, the brain lobes are also forming, creating a natural connection between finger ridge patterns and brain development.',
        ],
        revealsTitle: 'What Brain Mapping Reveals',
        reveals: [
          'Natural learning style and information processing patterns',
          'Memory type and cognitive functioning',
          'Thinking style and behavioural tendencies',
          'Distribution of multiple intelligences',
          'Inborn strengths and talents',
          'Personality orientation and communication style',
          'Early understanding of suitable skills, streams, and career directions',
        ],
        scienceTitle: 'Scientific Foundation',
        scienceIntro: 'Brain Mapping is based on research and principles from multiple scientific fields and aligns with Howard Gardner\'s Multiple Intelligence Theory — intelligence exists in multiple forms rather than a single IQ measure.',
        scienceFields: [
          { icon: '🧬', title: 'Genetics', desc: 'Fingerprint patterns are genetically inherited and unique to every individual.' },
          { icon: '🧠', title: 'Neuroscience', desc: 'Each finger corresponds to specific brain lobes and neural functions.' },
          { icon: '🌍', title: 'Global Research', desc: 'Dermatoglyphics studied and applied in over 30 countries worldwide.' },
        ],
        purposeTitle: 'The Core Purpose',
        purpose: 'To reveal an individual\'s inborn potential and provide a scientific foundation for better learning, stronger confidence, and clearer academic-career decisions.',
      },
      howDone: {
        label: 'Step by Step',
        title: 'How is it Done?',
        subtitle: 'A painless, science-backed process from fingerprint scan to expert counselling.',
        steps: [
          {
            num: '01',
            title: 'Fingerprint Scanning',
            points: ['Painless, hygienic digital scanning', 'All 10 fingers analyzed'],
          },
          {
            num: '02',
            title: 'Scientific Analysis (3–7 Days)',
            points: ['Fingerprint & brain analysis processing', 'Multiple parameters calculated'],
          },
          {
            num: '03',
            title: 'Detailed Report Generation',
            points: ['35-page personalized report', 'Visual charts & easy interpretations'],
          },
          {
            num: '04',
            title: 'Expert Counselling Session',
            points: ['One-on-one with certified counsellor', 'Personalized strategies & roadmap'],
          },
        ],
      },
      whoFor: {
        label: "Who It's For",
        title: 'Who Needs Brain Mapping?',
        subtitle: 'From early talent discovery to career confirmation — every life stage benefits from knowing how the brain is naturally wired.',
        groups: [
          {
            icon: '🌟',
            stage: 'Class 1–5',
            tag: 'Talent Discovery Stage',
            points: ['Early talent identification', 'Understand natural learning style', 'Discover hidden strengths', 'Choose right extracurricular activities', 'Parent guidance for supporting child'],
          },
          {
            icon: '🔍',
            stage: 'Class 6–8',
            tag: 'Self Discovery Stage',
            points: ['Learning style clarity', 'Study technique optimization', 'Identify natural strengths', 'Understand personality traits', 'Build confidence through self-awareness'],
          },
          {
            icon: '🎯',
            stage: 'Class 9–10',
            tag: 'Stream Selection Stage',
            points: ['Stream selection (Science/Commerce/Arts)', 'Subject choice guidance', 'Career direction clarity', 'Study approach based on strengths', 'Exam preparation strategy'],
          },
          {
            icon: '🚀',
            stage: 'Class 11–12',
            tag: 'Career Direction Stage',
            points: ['Career path guidance', 'College entrance exam strategy', 'Subject-wise strength identification', 'Future planning guidance', 'Competitive exam preparation'],
          },
          {
            icon: '🎓',
            stage: 'College / University',
            tag: 'Career Confirmation Stage',
            points: ['Confirm you\'re in the right field', 'Identify ideal job/internship roles', 'Placement preparation support', 'Career switch if needed', 'Higher studies planning'],
          },
          {
            icon: '💼',
            stage: 'Working Professionals',
            tag: 'Career Growth Stage',
            points: ['Career switch guidance', 'Role alignment check', 'Job satisfaction improvement', 'Entrepreneurial strength identification', 'Leadership potential discovery'],
          },
        ],
      },
      report: {
        title: 'What You Get — 35-Page Report',
        desc: 'A comprehensive personalized report covering every dimension of inborn potential, learning style, and career direction.',
        sections: [
          'D.M.I.T Introduction', 'My Personality', 'Competitive Strength Of Five Lobes',
          'Brain Lobes & Their Functions', 'ATD Degree and Learning Sensitivity',
          'My Finger Print Analysis', 'Brain Dominance — Left vs Right',
          'Graph of Multiple Intelligence (8 types)', 'My Quotients (EQ, IQ, AQ, CQ)',
          'My Acquiring Methods', 'My Learning Styles (Visual, Auditory, Kinesthetic)',
          'Extra-Curricular Activities Graph', 'Career Options', 'Career Graph',
          'Analysis Summary', 'Counsellor\'s Remarks',
        ],
      },
      intelligences: {
        title: 'The 8 Intelligences',
        subtitle: 'Based on Howard Gardner\'s Multiple Intelligence Theory — mapped through your fingerprint profile.',
        items: [
          { icon: '📖', name: 'Word Smart', type: 'Linguistic Intelligence', traits: ['Good with words', 'Loves reading & writing', 'Learns by explaining'] },
          { icon: '🔢', name: 'Number Smart', type: 'Logical-Mathematical', traits: ['Good with numbers', 'Loves patterns & logic', 'Learns by questioning'] },
          { icon: '🎵', name: 'Music Smart', type: 'Musical Intelligence', traits: ['Sensitive to sound', 'Loves music & rhythm', 'Learns with tunes'] },
          { icon: '🎨', name: 'Picture Smart', type: 'Visual-Spatial', traits: ['Thinks in images', 'Loves art & design', 'Learns by visualizing'] },
          { icon: '🏃', name: 'Body Smart', type: 'Bodily-Kinesthetic', traits: ['Learns by moving', 'Loves sports & dance', 'Hands-on learner'] },
          { icon: '👥', name: 'People Smart', type: 'Interpersonal', traits: ['Understands others', 'Loves teamwork', 'Learns by discussing'] },
          { icon: '🧘', name: 'Self Smart', type: 'Intrapersonal', traits: ['Knows themselves', 'Loves independent work', 'Learns by reflecting'] },
          { icon: '🌿', name: 'Nature Smart', type: 'Naturalistic', traits: ['Connects with nature', 'Loves plants/animals', 'Learns by observing'] },
        ],
      },
      comparison: {
        title: 'Brain Mapping vs Traditional Tests',
        traditional: {
          label: 'Traditional Tests',
          items: [
            { text: 'Measures current performance', bad: true },
            { text: 'Based on what child studied', bad: true },
            { text: 'Creates exam pressure & anxiety', bad: true },
            { text: 'One-size-fits-all approach', bad: true },
            { text: 'Valid for today only', bad: true },
            { text: 'Can be coached or faked', bad: true },
            { text: 'Learning style not revealed', bad: true },
            { text: 'Unreliable future guidance', bad: true },
          ],
        },
        dmit: {
          label: 'Brain Mapping',
          items: [
            { text: 'Measures inborn potential', bad: false },
            { text: 'Based on fingerprint patterns', bad: false },
            { text: 'Creates curiosity, zero pressure', bad: false },
            { text: '100% personalized approach', bad: false },
            { text: 'Valid for a lifetime', bad: false },
            { text: 'Cannot be faked — fingerprint based', bad: false },
            { text: 'Learning style clearly identified', bad: false },
            { text: 'Highly reliable future guidance', bad: false },
          ],
        },
      },
      validation: {
        label: 'Media & Research',
        title: 'Scientific Research & Validation',
        subtitle: 'Brain Mapping is backed by neuroscience, genetics, and global research — endorsed by government and judiciary.',
        items: [
          {
            icon: '🏛️',
            title: 'Assam Government Mandates Brain Mapping',
            desc: 'The Bodoland Territorial Council (BTC) introduced Brain Mapping in schools across Assam to personalize learning through fingerprint-based intelligence testing.',
            source: '— India Today',
          },
          {
            icon: '⚖️',
            title: 'Bombay High Court Endorsement',
            desc: 'Bombay High Court\'s Official Child Psychologist recommended Brain Mapping for analysing a child\'s intelligence and personality in court proceedings.',
          },
          {
            icon: '🔬',
            title: 'Scientific Research Foundation',
            desc: 'Based on neuroscience, genetics, and Howard Gardner\'s Multiple Intelligence Theory — validated in 30+ countries.',
            bullets: ['Neuroscience — brain lobe relationships', 'Genetics — unique fingerprint patterns', 'Psychology — behavioural interpretation'],
          },
        ],
        knowMore: 'Know More About Validation',
      },
      whyChooseTitle: 'Why Choose Dream Mantra Brain Mapping?',
      whyChoose: [
        { title: 'Accurate Insights', desc: 'Brain Mapping technology backed by research — precision in identifying innate strengths and abilities.' },
        { title: 'Personalized Guidance', desc: 'Expert counsellors provide tailored recommendations based on your unique fingerprint profile.' },
        { title: 'Endless Possibilities', desc: 'Align your talents with the right career path for success and satisfaction.' },
        { title: 'Proven Track Record', desc: 'Thousands of students and professionals have found clarity through Dream Mantra Brain Mapping.' },
      ],
      getStarted: 'Get Started Now',
      cta: {
        title: 'Unlock Your Inborn Potential',
        desc: 'Book Brain Mapping today — Mon–Sat 11am–7pm · 9680102276 · Jaipur & Pan-India (Online)',
        button: 'Book Brain Mapping Test',
      },
    },

    psychometric: {
      hero: {
        badge: '7 Powerful Frameworks — One Complete Profile',
        titleBefore: 'Skill Mapping',
        titleHighlight: 'Assessment Suite',
        desc: 'Beyond Brain Mapping: understanding your current personality, interests & behaviour through scientifically designed assessments.',
        subdesc: 'Internationally researched · Multi-framework analysis · Certified counsellor interpretation',
        bookTest: 'Book Skill Mapping',
        freeConsultation: 'Free guidance Call',
        imageAlt: 'Skill Mapping assessment',
      },
      challenge: {
        label: 'The Challenge',
        title: 'Are students choosing their future… or just following the crowd?',
        p1: 'Stream selection, subject choices, and career goals are often influenced by marks, parental expectations, peer pressure, or popular trends. Many capable students lack clarity about who they are and how they learn best.',
        p2Before: 'To make informed choices, students need more than advice — they need ',
        p2Highlight: 'scientific self-understanding',
        p2After: '. That is where Skill Mapping assessment becomes valuable.',
        problemsTitle: 'When decisions lack self-understanding',
      },
      whatAre: {
        label: 'Understanding the Science',
        title: 'What are Skill Mapping?',
        subtitle: 'What is Psychometric Testing?',
        paragraphs: [
          'Skill Mapping is a comprehensive psychometric assessment that combines 7 internationally researched frameworks to understand a student\'s current personality, interests, behaviour, learning style, strengths, and career preferences.',
          'Instead of relying only on marks or opinions, it provides an objective profile of how a student thinks, learns, communicates, and what careers naturally suit them.',
        ],
        benefitsTitle: 'Benefits of Skill Mapping',
        profileAgeNote: 'Report contents vary based on the student\'s age.',
        studentBenefits: [
          'Gain clarity about your strengths and potential',
          'Choose the right stream, subjects, and career path',
          'Discover your preferred learning style',
          'Improve confidence and self-awareness',
          'Make informed decisions backed by scientific insights',
          'Reduce confusion, stress, and career uncertainty',
          'Support better parent-student career discussions',
        ],
        profileTitle: 'Your comprehensive profile covers',
      },
      testsProvided: {
        label: 'Tests Provided',
        title: '7 Internationally Researched Frameworks',
        desc: 'Our assessment integrates multiple globally recognised psychological models — ensuring students are understood from different dimensions, not just one test score.',
        moreDimensions: 'more dimensions',
      },
      why: {
        title: 'Why Skill Mapping?',
        comboCta: 'Brain Mapping + Skill Mapping Combo',
        learnDmit: 'Learn about Brain Mapping',
      },
      ageWise: {
        label: "Who It's For",
        title: 'Age-Wise Mapping',
        viewProgram: 'View program',
        testsLabel: 'Tests taken',
        problemLabel: 'The Problem',
        solutionLabel: 'The Solution',
      },
      process: {
        label: 'Step by Step',
        title: 'How is it Done?',
      },
      cta: {
        title: 'Book Your Free guidance Call',
        desc: 'Mon–Sat, 11am–7pm · Online (Pan-India) & Offline (Jaipur) · No fees for initial consultation',
        bookSession: 'Book Free Session',
        frameworks: '7 Frameworks',
        detailedReport: 'Detailed Report',
        expertCounselling: 'Expert Counselling',
      },
    },

    dmitPsychometric: {
      hero: {
        badge: 'Complete Nature + Nurture Profile',
        title: 'Brain Mapping + Skill Mapping',
        desc: 'Complete nature + nurture profile with certified expert counselling for stream, career, and life decisions.',
        flow: '',
        bookCombo: 'Book Combo Package',
        freeConsultation: 'Free guidance Call',
        mergeCard: '',
        dmitAlt: 'Brain Mapping',
        psychometricAlt: 'Skill Mapping',
      },
      process: {
        label: 'How It Works',
        title: 'Both Tests → Reports → Counselling',
        desc: "We don't just give you data — our certified counsellors interpret both reports and guide your next steps.",
        learnMore: 'Learn more',
      },
      compare: {
        title: 'Brain Mapping vs Skill Mapping vs Combo',
        aspect: 'Aspect',
        dmit: 'Brain Mapping',
        psychometric: 'Skill Mapping',
        combo: 'Combo',
      },
      benefitsTitle: 'Why Choose the Combo?',
      reportTitle: 'Combined Report Includes',
      whoTitle: 'Who Should Take This?',
      counselling: {
        title: 'Reports + Expert Counselling',
        desc: 'After both assessments, a certified Dream Mantra counsellor walks you through your combined report — translating science into a clear, actionable career roadmap. Parents welcome.',
        bookCombo: 'Book Brain Mapping + Skill Mapping',
        dmitOnly: 'Brain Mapping only →',
        psychometricOnly: 'Skill Mapping only →',
        processLink: '5-Step Process →',
      },
    },

    whyDreamsMantra: {
      hero: {
        title: 'Why Career Counselling?',
        subtitle: 'Scientific Education & Career Guidance — We are all unique keys, meant to unlock different doors.',
        tagline: 'Discover Your Hidden Brilliance — No Pressure. No Comparison. Just Clarity.',
        cta: 'Book Free guidance Call',
      },
      intro: "India's most trusted scientific career guidance platform using Brain Mapping & Skill Mapping assessments — from Class 1 to First Job.",
      howWorksTitle: 'How Career Counselling Works',
      stepLabel: 'STEP',
      whoWeGuideTitle: 'Who We Guide',
      featuredTitle: 'Featured Assessments',
      whyDifferentTitle: 'Why Our Career Counselling Is Different',
      founderTitle: "Founder's Note",
      successStoriesBadge: 'Real Transformations',
      successStoriesTitle: 'Success Stories',
      successStoriesHighlight: 'Real Student Journeys',
      successStoriesSubtitle: 'Watch real student journeys and transformations from Dream Mantra on Instagram.',
      reelsTitle: 'Real Stories on Instagram',
      followInstagram: 'Follow @dream.mantra',
      beforeLabel: 'Before Dream Mantra',
      afterLabel: 'After Dream Mantra',
      watchStory: 'Watch story',
      videoBadge: 'Video testimonial',
      reelBadge: 'Instagram Reel',
      testimonialsTitle: 'Testimonials',
      contactTitle: 'Get in Touch',
      contactCta: 'Book Your Free guidance Call',
    },

    program: {
      notFound: 'Program not found',
      goHome: 'Go Home',
      workspaceLabel: 'Age pathways workspace',
      ageTabsLabel: 'Age groups',
      problemsLabel: 'Real challenges in India',
      challengesTitle: 'Common Challenges',
      benefitsLabel: 'Benefits',
      benefitsTitle: 'What you gain',
      solutionsLabel: 'Solutions offered',
      solutionsTitle: 'Choose a module to continue',
      facingSame: 'Are you facing the same?',
      struggleParentPrefix: 'Do you also want your child to',
      struggleStudentPrefix: 'Are you also struggling with',
      modulesBadge: 'Specially designed for you',
      modulesTitle: 'Here are our modules to help you',
      optionalBadge: 'Optional',
      exploreModule: 'Explore module',
      bookConsultation: 'Book counselling session',
      allPathways: 'View all age pathways',
      otherPathways: 'Explore other age pathways',
      showMoreProblems: 'Show more challenges',
      showLessProblems: 'Show less',
      bookLoginPay: 'Book Now — Login & Pay',
      bookContinuePay: 'Book Now — Continue to Payment',
      bookSelectHint: 'Select a solution above to enable Book Now.',
      bookSelectedHint: 'Next: unlock this module with login and payment.',
      loginPayNotice: 'Sign in to continue to payment for your selected module.',
      whatsNext: 'What’s next',
      stepperLabel: 'Next steps',
      stepAge: 'Pick age',
      stepModule: 'Choose module',
      stepLogin: 'Login',
      stepPay: 'Pay',
    },

    contact: {
      title: 'Contact Us',
      subtitle: 'Tell us where you are stuck — counselling or Training & Placement. We’ll call you back.',
      phone: 'Phone',
      email: 'Email',
      hours: 'Hours',
      locations: 'Locations',
      panIndia: 'Pan-India Online',
      followUs: 'Follow Us',
      formTitle: 'Book a free guidance call',
      namePlaceholder: 'Your name',
      emailPlaceholder: 'Email',
      phonePlaceholder: 'Phone',
      messagePlaceholder: 'How can we help?',
      submit: 'Request free call',
      thankYou: 'Thank you! We will call you soon for your free guidance conversation.',
    },

    partner: {
      notFound: 'Partner page not found',
      goHome: 'Go Home',
      subtitle: 'Collaborate with Dream Mantra',
      cta: 'Get in Touch',
      partnerPrefix: 'Partner',
    },

    policies: {
      title: 'Policies',
      subtitle: 'How we protect your data and deliver our services',
      intro: 'Dream Mantra (Tibrewal Enterprises) provides career guidance, assessments, and counselling. These policies summarise how we operate — for full legal terms see Terms & Conditions.',
      sections: [
        { title: 'Privacy & Data', content: 'We collect name, email, phone, and assessment data to deliver services. Data is used only for counselling, reports, payments, and support. We do not sell personal data. You may request correction or deletion by emailing info@dreammantra.in.' },
        { title: 'Assessment & Counselling', content: 'Brain Mapping, Skill Mapping, and psychometric reports are advisory tools. Final stream, course, and career decisions remain with students and parents. Counselling sessions require 24-hour notice to reschedule.' },
        { title: 'Payments & Refunds', content: 'Fees are shown at checkout. Online payments via Razorpay unlock access instantly. Manual UPI/bank transfers require payment proof and admin verification (typically within 24 business hours). Refunds, when approved, are processed in 2–3 business days; bank reflection may take 10–15 days.' },
        { title: 'Cookies & Website', content: 'We use essential cookies for login and session security. Analytics help us improve the platform. You can disable non-essential cookies in your browser settings.' },
        { title: 'Children & Consent', content: 'Users under 18 need parental or guardian consent. Parents are responsible for supervising minors on the platform.' },
        { title: 'Contact & Grievances', content: 'Questions or concerns: info@dreammantra.in or 9680102276 (Mon–Sat, 11 AM – 7 PM). GSTIN: 08CDYPT7241R1Z4. Registered address: C-23, Bhagat Singh Marg, Tilak Marg, Jaipur, Rajasthan — 302004.' },
      ],
      disclaimer: {
        title: 'Disclaimer',
        p1: 'Assessment and counselling outputs are guidance aids, not guarantees of admission, employment, or academic results.',
        p2: 'Dream Mantra is not liable for decisions made solely on third-party advice outside our certified counsellor sessions.',
      },
      operator: 'Dream Mantra — Tibrewal Enterprises',
      gstNumber: '08CDYPT7241R1Z4',
      gstAddress: 'C-23, Bhagat Singh Marg, Tilak Marg, Jaipur, Rajasthan — 302004',
      gstLabel: 'GSTIN:',
      locationLabel: 'Registered office:',
      lastUpdated: 'Last updated:',
      lastUpdatedDate: 'August 8, 2026',
      contactTitle: 'Need help?',
      contactDesc: 'Our team responds on business days.',
      emailLabel: 'Email:',
      phoneLabel: 'Phone:',
      hoursLabel: 'Hours:',
      hoursValue: 'Mon–Sat, 11 AM – 7 PM',
      locationValue: 'Jaipur, Rajasthan (Pan-India online services)',
    },

    terms: {
      title: 'Terms & Conditions',
      subtitle: 'Please read our complete policies and terms carefully',
      intro: 'Welcome to Dream Mantra. These Terms & Conditions govern your access to and use of our website, assessments, consultations, and all services. By using Dream Mantra, you agree to be legally bound by these terms. If you do not agree, please refrain from using our services. Dream Mantra is owned and operated by Tibrewal Enterprises.',
      sections: [
        { title: '1. Acceptance of Terms', content: 'By accessing and using Dream Mantra website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.' },
        { title: '2. Assessment Services', content: 'All assessment results (Brain Mapping, Skill Mapping, AI Career Launchpad) are advisory in nature. They provide scientific insights into personality, aptitude, and career preferences. However, final career decisions remain solely with students, parents, and guardians. Dream Mantra is not responsible for any outcome based on assessment recommendations.' },
        { title: '3. Consultations and Counselling', content: 'Free consultations are offered based on counsellor availability. Booked sessions must be rescheduled with at least 24 hours notice. Dream Mantra reserves the right to cancel bookings if slots remain unfilled 24 hours before the scheduled time. All guidance is professional advice — Dream Mantra does not accept liability for educational or career outcomes.' },
        { title: '4. Refund Policy', content: 'Dream Mantra provides refunds as per company policy. After your refund request has been approved, the refund amount will be initiated within 2–3 business days. Once initiated, it may take an additional 10–15 business days for the amount to reflect in your original payment method, depending on your bank, card issuer, or payment gateway.' },
        { title: '5. User Responsibilities', content: 'Users agree to provide accurate personal information during registration and assessments. You are responsible for maintaining confidentiality of your account credentials. Any unauthorized use of your account must be reported immediately to Dream Mantra support.' },
        { title: '6. Intellectual Property', content: 'All content on Dream Mantra (assessments, materials, articles, videos, designs) is owned by Dream Mantra / Tibrewal Enterprises or licensed partners. Reproduction, distribution, or transmission without written permission is prohibited.' },
        { title: '7. Limitation of Liability', content: 'Dream Mantra provides services "as is" without warranties. We are not liable for indirect, incidental, or consequential damages arising from your use of our services. Our total liability is limited to fees paid by you in the past 12 months.' },
        { title: '8. Age Restrictions', content: "Users under 18 must have parental/guardian consent to use our services. Parents/guardians are responsible for supervising minors' use of our platform." },
        { title: '9. Modification of Terms', content: 'Dream Mantra reserves the right to modify these terms at any time. Continued use of services after modifications constitutes acceptance of updated terms. Changes will be effective immediately upon posting.' },
        { title: '10. Governing Law', content: 'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Jaipur, Rajasthan.' },
        { title: '11. Brand Ownership', content: 'Dream Mantra is owned and operated by Tibrewal Enterprises. All brand names, logos, and trademarks related to Dream Mantra are the property of Tibrewal Enterprises and its authorised partners.' },
        { title: '12. GST Details', content: 'GSTIN: 08CDYPT7241R1Z4. GST registered address: C-23, Bhagat Singh Marg, Tilak Marg, Jaipur, District Jaipur, Rajasthan — 302004, India.' },
        {
          title: 'Changes to This Privacy Policy',
          paragraphs: [
            'We may update this Privacy Policy from time to time, including to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will post the revised Privacy Policy on the Site, update the January 29, 2025 and take any other steps required by applicable law.',
          ],
        },
        {
          title: 'How We Collect and Use Your Personal Information',
          paragraphs: [
            'To provide the Services, we collect personal information about you from a variety of sources, as set out below. The information that we collect and use varies depending on how you interact with us.',
            'In addition to the specific uses set out below, we may use information we collect about you to communicate with you, provide or improve or improve the Services, comply with any applicable legal obligations, enforce any applicable terms of service, and to protect or defend the Services, our rights, and the rights of our users or others.',
          ],
        },
        {
          title: 'What Personal Information We Collect',
          paragraphs: [
            'The types of personal information we obtain about you depends on how you interact with our Site and use our Services. When we use the term "personal information", we are referring to information that identifies, relates to, describes or can be associated with you. The following sections describe the categories and specific types of personal information we collect.',
          ],
        },
        {
          title: 'Information We Collect Directly from You',
          paragraphs: [
            'Information that you directly submit to us through our Services may include:',
          ],
          items: [
            'Contact details including your name, address, phone number, and email.',
            'Order information including your name, billing address, shipping address, payment confirmation, email address, and phone number.',
            'Account information including your username, password, security questions and other information used for account security purposes.',
            'Customer support information including the information you choose to include in communications with us, for example, when sending a message through the Services.',
          ],
        },
        {
          title: 'Optional Features',
          paragraphs: [
            'Some features of the Services may require you to directly provide us with certain information about yourself. You may elect not to provide this information, but doing so may prevent you from using or accessing these features.',
          ],
        },
        {
          title: 'Information We Collect about Your Usage',
          paragraphs: [
            'We may also automatically collect certain information about your interaction with the Services ("Usage Data"). To do this, we may use cookies, pixels and similar technologies ("Cookies"). Usage Data may include information about how you access and use our Site and your account, including device information, browser information, information about your network connection, your IP address and other information regarding your interaction with the Services.',
          ],
        },
        {
          title: 'Information We Obtain from Third Parties',
          paragraphs: [
            'Finally, we may obtain information about you from third parties, including from vendors and service providers who may collect information on our behalf, such as:',
          ],
          items: [
            'Companies who support our Site and Services, such as website',
            'Our payment processors, who collect payment information (e.g., bank account, credit or debit card information, billing address) to process your payment in order to fulfill your orders and provide you with products or services you have requested, in order to perform our contract with you.',
          ],
        },
        {
          title: 'Online Tracking Technologies',
          paragraphs: [
            'When you visit our Site, open or click on emails we send you, or interact with our Services or advertisements, we, or third parties we work with, may automatically collect certain information using online tracking technologies such as pixels, web beacons, software developer kits, third-party libraries, and cookies.',
            'Any information we obtain from third parties will be treated in accordance with this Privacy Policy. Also see the section below, Third Party Websites and Links.',
          ],
        },
        {
          title: 'How We Use Your Personal Information',
          subsections: [
            {
              title: 'Providing Products and Services',
              paragraphs: [
                'We use your personal information to provide you with the Services in order to perform our contract with you, including to process your payments, fulfill your orders, to send notifications to you related to your account, purchases, returns, other transactions, to create, maintain and otherwise manage your account, to arrange for shipping, facilitate any returns and other features and functionalities related to your account.',
              ],
            },
            {
              title: 'Marketing and Advertising',
              paragraphs: [
                'We may use your personal information for marketing and promotional purposes, such as to send marketing, advertising and promotional communications by email, text message or postal mail, and to show you advertisements for products or services. This may include using your personal information to better tailor the Services and advertising on our Site and other websites.',
              ],
            },
            {
              title: 'Security and Fraud Prevention',
              paragraphs: [
                'We use your personal information to detect, investigate or take action regarding possible fraudulent, illegal or malicious activity. If you choose to use the Services and register an account, you are responsible for keeping your account credentials safe. We highly recommend that you do not share your username, password, or other access details with anyone else. If you believe your account has been compromised, please contact us immediately.',
              ],
            },
            {
              title: 'Refund Policy',
              paragraphs: [
                'Dream Mantra provides refunds as per company policy. After your refund request has been approved, the refund amount will be initiated within 2–3 business days. Once initiated, it may take an additional 10–15 business days for the amount to reflect in your original payment method, depending on your bank, card issuer, or payment gateway.',
              ],
            },
            {
              title: 'Communicating with You and Service Improvement',
              paragraphs: [
                'We use your personal information to provide you with customer support and improve our Services. This is in our legitimate interests in order to be responsive to you, to provide effective services to you, and to maintain our business relationship with you.',
              ],
            },
          ],
        },
        {
          title: 'Cookies',
          paragraphs: [
            'Like many websites, we use Cookies on our Site. For specific information about the Cookies that we use related to powering our website see We use Cookies to power and improve our Site and our Services (including to remember your actions and preferences), to run analytics and better understand user interaction with the Services (in our legitimate interests to administer, improve and optimize the Services). We may also permit third parties and services providers to use Cookies on our Site to better tailor the services, products and advertising on our Site and other websites.',
          ],
        },
        {
          title: 'Third Party Websites and Links',
          paragraphs: [
            'Our Site may include links to other websites, apps, and services operated by third parties. We are not responsible for the privacy practices of those third parties. We encourage you to review their privacy policies before sharing personal information with them.',
          ],
        },
        { title: 'Contact Us', content: 'For questions or concerns about these terms, please contact us at info@dreammantra.in or call 9680102276. Office hours: Mon-Sat, 11am-7pm. GST address: C-23, Bhagat Singh Marg, Tilak Marg, Jaipur, Rajasthan — 302004.' },
      ],
      disclaimer: {
        title: '⚠️ Important Disclaimer',
        p1: 'Dream Mantra provides educational and career guidance services. Our assessments and recommendations are tools to aid decision-making, not substitutes for professional medical, psychological, or legal advice.',
        p2: 'Students and parents are advised to use our guidance in conjunction with their own research, family discussions, and institutional counselling. Dream Mantra does not guarantee job placement or admission to any institution.',
      },
      operator: 'Dream Mantra — Owned & Operated by Tibrewal Enterprises',
      gstNumber: '08CDYPT7241R1Z4',
      gstAddress: 'C-23, Bhagat Singh Marg, Tilak Marg, Jaipur, District Jaipur, Rajasthan — 302004',
      lastUpdated: 'Last Updated:',
      lastUpdatedDate: 'January 29, 2025',
      lastUpdatedNote: 'For the latest version, visit our website regularly.',
      contactTitle: 'Questions About Our Terms?',
      contactDesc: 'Contact our support team for clarifications or concerns.',
      emailLabel: 'Email:',
      phoneLabel: 'Phone:',
      hoursLabel: 'Hours:',
      hoursValue: 'Monday to Saturday, 11:00 AM - 7:00 PM',
      locationLabel: 'GST Address:',
      locationValue: 'C-23, Bhagat Singh Marg, Tilak Marg, Jaipur, Rajasthan — 302004',
      gstLabel: 'GSTIN:',
    },

    privacy: {
      title: 'Privacy Policy',
      subtitle: 'How we collect, use, and protect your information',
      intro: 'Dream Mantra ("we", "us"), owned and operated by Tibrewal Enterprises, respects your privacy. This policy explains what personal information we collect when you use our website, dashboards, assessments, counselling services, and related features — and how we keep it secure.',
      sections: [
        {
          title: '1. How We Collect and Use Your Personal Information',
          paragraphs: [
            'To provide the Services, we collect personal information about you from a variety of sources, as set out below. The information that we collect and use varies depending on how you interact with us.',
            'In addition to the specific uses set out below, we may use information we collect about you to communicate with you, provide or improve the Services, comply with any applicable legal obligations, enforce any applicable terms of service, and to protect or defend the Services, our rights, and the rights of our users or others.',
          ],
        },
        {
          title: '2. What Personal Information We Collect',
          paragraphs: [
            'The types of personal information we obtain about you depends on how you interact with our Site and use our Services. When we use the term "personal information", we are referring to information that identifies, relates to, describes or can be associated with you. The following sections describe the categories and specific types of personal information we collect.',
          ],
        },
        {
          title: '3. Information We Collect Directly from You',
          paragraphs: [
            'Information that you directly submit to us through our Services may include:',
          ],
          items: [
            'Contact details including your name, address, phone number, and email.',
            'Order information including your name, billing address, shipping address, payment confirmation, email address, and phone number.',
            'Account information including your username, password, security questions and other information used for account security purposes.',
            'Customer support information including the information you choose to include in communications with us, for example, when sending a message through the Services.',
          ],
        },
        {
          title: '3A. Optional Features',
          paragraphs: [
            'Some features of the Services may require you to directly provide us with certain information about yourself. You may elect not to provide this information, but doing so may prevent you from using or accessing these features.',
          ],
        },
        {
          title: '4. Information We Collect about Your Usage',
          paragraphs: [
            'We may also automatically collect certain information about your interaction with the Services ("Usage Data"). To do this, we may use cookies, pixels and similar technologies ("Cookies"). Usage Data may include information about how you access and use our Site and your account, including device information, browser information, information about your network connection, your IP address and other information regarding your interaction with the Services.',
          ],
        },
        {
          title: '5. Information We Obtain from Third Parties',
          paragraphs: [
            'Finally, we may obtain information about you from third parties, including from vendors and service providers who may collect information on our behalf, such as:',
          ],
          items: [
            'Companies who support our Site and Services, such as website hosting, analytics, email, and messaging providers.',
            'Our payment processors, who collect payment information (e.g., bank account, credit or debit card information, billing address) to process your payment in order to fulfill your orders and provide you with products or services you have requested, in order to perform our contract with you.',
          ],
        },
        {
          title: '5A. Online Tracking',
          paragraphs: [
            'When you visit our Site, open or click on emails we send you, or interact with our Services or advertisements, we, or third parties we work with, may automatically collect certain information using online tracking technologies such as pixels, web beacons, software developer kits, third-party libraries, and cookies.',
            'Any information we obtain from third parties will be treated in accordance with this Privacy Policy. Also see the section below, Third Party Websites and Links.',
          ],
        },
        {
          title: '6. How We Use Your Personal Information',
          subsections: [
            {
              title: 'Providing Products and Services',
              paragraphs: [
                'We use your personal information to provide you with the Services in order to perform our contract with you, including to process your payments, fulfill your orders, to send notifications to you related to your account, purchases, returns, and other transactions, to create, maintain and otherwise manage your account, to arrange for shipping, facilitate any returns and other features and functionalities related to your account.',
              ],
            },
            {
              title: 'Marketing and Advertising',
              paragraphs: [
                'We may use your personal information for marketing and promotional purposes, such as to send marketing, advertising and promotional communications by email, text message or postal mail, and to show you advertisements for products or services. This may include using your personal information to better tailor the Services and advertising on our Site and other websites.',
              ],
            },
            {
              title: 'Security and Fraud Prevention',
              paragraphs: [
                'We use your personal information to detect, investigate or take action regarding possible fraudulent, illegal or malicious activity. If you choose to use the Services and register an account, you are responsible for keeping your account credentials safe. We highly recommend that you do not share your username, password, or other access details with anyone else. If you believe your account has been compromised, please contact us immediately.',
              ],
            },
            {
              title: 'Refund Policy',
              paragraphs: [
                'Dream Mantra provides refunds as per company policy. After your refund request has been approved, the refund amount will be initiated within 2–3 business days. Once initiated, it may take an additional 10–15 business days for the amount to reflect in your original payment method, depending on your bank, card issuer, or payment gateway.',
              ],
            },
            {
              title: 'Communicating with You and Service Improvement',
              paragraphs: [
                'We use your personal information to provide you with customer support and improve our Services. This is in our legitimate interests in order to be responsive to you, to provide effective services to you, and to maintain our business relationship with you.',
              ],
            },
          ],
        },
        {
          title: '7. Cookies',
          paragraphs: [
            'Like many websites, we use Cookies on our Site. We use Cookies to power and improve our Site and our Services (including to remember your actions and preferences), to run analytics and better understand user interaction with the Services (in our legitimate interests to administer, improve and optimize the Services). We may also permit third parties and service providers to use Cookies on our Site to better tailor the services, products and advertising on our Site and other websites.',
          ],
        },
        {
          title: '8. Third Party Websites and Links',
          paragraphs: [
            'Our Site may include links to other websites, apps, and services operated by third parties. We are not responsible for the privacy practices of those third parties. We encourage you to review their privacy policies before sharing personal information with them.',
          ],
        },
        {
          title: '9. Children & Parental Consent',
          paragraphs: [
            'Services for students under 18 require parental or guardian involvement. Parents may contact us to review or update a minor\'s profile information.',
          ],
        },
        {
          title: '10. Your Rights',
          paragraphs: [
            'You may request access to, correction of, or deletion of your personal data by contacting info@dreammantra.in. We will respond within a reasonable time as required by applicable law.',
          ],
        },
        {
          title: '11. Changes to This Privacy Policy',
          paragraphs: [
            'We may update this Privacy Policy from time to time, including to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will post the revised Privacy Policy on the Site, update the "Last Updated" date (January 29, 2025, or the date of any later revision) and take any other steps required by applicable law.',
          ],
        },
        {
          title: '12. Contact',
          paragraphs: [
            'For privacy questions: info@dreammantra.in · 9680102276 · Dream Mantra / Tibrewal Enterprises.',
            'GSTIN: 08CDYPT7241R1Z4. GST address: C-23, Bhagat Singh Marg, Tilak Marg, Jaipur, District Jaipur, Rajasthan — 302004, India.',
          ],
        },
      ],
      operator: 'Dream Mantra — Owned & Operated by Tibrewal Enterprises',
      gstNumber: '08CDYPT7241R1Z4',
      gstAddress: 'C-23, Bhagat Singh Marg, Tilak Marg, Jaipur, District Jaipur, Rajasthan — 302004',
      lastUpdated: 'Last Updated:',
      lastUpdatedDate: 'January 29, 2025',
    },
  },

  aiFeatures: {
    title: 'AI-Powered Career Discovery',
    subtitle: 'Use our intelligent AI tools to discover your perfect career path based on science, not guesswork.',
    imageAlt: 'AI career discovery',
    features: [
      { id: 'matcher', title: 'AI Career Matcher', desc: 'Answer 10 quick questions about your interests, strengths, and goals to get personalized career recommendations.', badge: '2 min quiz' },
      { id: 'predictor', title: 'Stream Predictor', desc: 'AI analyzes your academic performance and interests to predict your ideal stream: PCM, PCB, Commerce, or Arts.', badge: 'Instant' },
      { id: 'skills', title: 'Skills Gap Analyzer', desc: 'Identify which skills you need to develop for your dream career and get a personalized learning roadmap.', badge: 'AI-Powered' },
    ],
    quiz: {
      questionOf: 'Question',
      of: 'of',
      complete: 'Quiz Complete!',
      recommend: 'Based on your answers, we recommend:',
      retake: 'Retake Quiz',
      getAssessment: 'Get Detailed Assessment',
      recommendations: [
        { title: 'Software Engineer', match: 95 },
        { title: 'Data Scientist', match: 88 },
        { title: 'AI/ML Specialist', match: 92 },
      ],
      questions: [
        { q: 'What interests you most?', options: ['Technology', 'Science/Medicine', 'Business/Law', 'Creative Arts', 'Social Work'] },
        { q: 'Your strongest subject?', options: ['Maths', 'Biology', 'Economics', 'Languages', 'No specific preference'] },
        { q: 'Work style preference?', options: ['Hands-on/Practical', 'Research-based', 'Client-facing', 'Creative', 'Independent'] },
        { q: 'Career goal?', options: ['High salary', 'Job security', 'Social impact', 'Creative freedom', 'Work-life balance'] },
        { q: 'Preferred work environment?', options: ['Office', 'Field/Outdoors', 'Remote', 'Flexible', 'Lab/Research'] },
      ],
    },
    predictor: {
      predicted: 'Your Predicted Stream:',
      predictedValue: 'PCM (Science with Maths)',
      confirm: 'Confirm with Counsellor',
      streams: [
        { stream: 'PCM (Maths)', confidence: 92 },
        { stream: 'PCB (Biology)', confidence: 65 },
        { stream: 'Commerce', confidence: 45 },
      ],
    },
    skills: {
      title: 'Top Skills to Develop',
      getRoadmap: 'Get Personalized Roadmap',
      items: [
        { skill: 'Data Analysis', level: 'Advanced', priority: 'Critical' },
        { skill: 'Python Programming', level: 'Intermediate', priority: 'High' },
        { skill: 'Communication', level: 'Beginner', priority: 'Medium' },
      ],
    },
  },

  journeyProgress: {
    label: 'Your Journey',
    title: 'Your Career Journey',
    subtitle: 'All steps are open — jump to any step you need, in any order.',
    completedOf: 'of',
    stepsCompleted: 'steps completed',
    complete: 'Complete',
    step: 'Step',
    done: 'Done ✓',
    completed: 'Completed',
    recommended: 'Recommended next',
    available: 'Available',
    allComplete: 'Journey complete — great work!',
    reportWaiting: 'Report in progress — typically ready in 3–7 days',
    steps: [
      { id: 'profile', title: 'Complete Your Profile', desc: 'Add your class, stream, city, and career goal so we can personalise recommendations.', actionEdit: 'Edit Profile', actionComplete: 'Complete Profile' },
      { id: 'book', title: 'Book a Module', desc: 'Choose Brain Mapping, Skill Mapping, or AI Career Launchpad based on your needs.', actionLabel: 'Browse Modules' },
      { id: 'payment', title: 'Complete Payment', desc: 'Secure checkout for your selected module.', actionPay: 'Pay Now', actionBookFirst: 'Book a Module First' },
      { id: 'process', title: 'Understand the Process', desc: 'Review what happens after payment — timelines, deliverables, and what to expect.', actionLabel: 'View Process' },
      { id: 'product_action', title: 'Complete Your Assessment', desc: 'Take the next action for your module — questionnaire, fingerprints, or community onboarding.', actionLabel: 'Continue Assessment' },
      { id: 'report', title: 'Get Your Report', desc: 'Your personalised career report is prepared and delivered within 3–7 business days.', actionLabel: 'View Reports' },
      { id: 'book_counselling', title: 'Book Counselling Session', desc: 'Schedule a one-on-one session to review your report with a certified counsellor.', actionLabel: 'Book Session', actionPurchaseFirst: 'Purchase counselling first' },
    ],
    processTitles: {
      dmit: 'Brain Mapping Process',
      psychometric: 'Skill Mapping Process',
      'crp-test': 'AI Career Launchpad Process',
    },
    productSteps: {
      dmit: { actionTitle: 'Give Fingerprints', actionDesc: 'Visit our centre or schedule fingerprint scanning' },
      psychometric: { actionTitle: 'Take test', actionDesc: 'Age-based Skill Mapping tests and forms' },
      'crp-test': { actionTitle: 'Join the Community', actionDesc: 'Join your AI Career Launchpad batch community' },
    },
  },
};
