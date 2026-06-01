// Reusable animation variants for Framer Motion
export const animations = {
  // Fade & Slide animations
  fadeInUp: {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.6 },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -40 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.6 },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 40 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.6 },
  },

  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.6 },
  },
  scaleInSlow: {
    initial: { opacity: 0, scale: 0.85 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true },
    transition: { duration: 0.8 },
  },

  // Rotate animations
  rotateIn: {
    initial: { opacity: 0, rotate: -10 },
    whileInView: { opacity: 1, rotate: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.6 },
  },

  // Stagger container
  staggerContainer: {
    initial: { opacity: 1 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
  },

  // Stagger item
  staggerItem: (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
  }),

  // Hover animations
  hoverLift: {
    whileHover: { y: -8, transition: { duration: 0.3 } },
  },
  hoverScale: {
    whileHover: { scale: 1.05, transition: { duration: 0.3 } },
  },
  hoverGlow: {
    whileHover: {
      boxShadow: '0 20px 50px rgba(255, 107, 74, 0.22), 0 8px 24px rgba(201, 168, 76, 0.15)',
      y: -8,
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
  },

  // Floating animation
  float: {
    animate: { y: [0, -15, 0] },
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
  floatSlow: {
    animate: { y: [0, -20, 0] },
    transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
  },

  // Pulse animation
  pulse: {
    animate: { opacity: [1, 0.5, 1] },
    transition: { duration: 2, repeat: Infinity },
  },

  // Bounce animation
  bounce: {
    animate: { y: [0, -10, 0] },
    transition: { duration: 1.5, repeat: Infinity },
  },

  // Shimmer animation
  shimmer: {
    animate: { backgroundPosition: ['200% center', '-200% center'] },
    transition: { duration: 3, repeat: Infinity, ease: 'linear' },
  },

  // Page transition
  pageTransitionIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  },

  /** Use inside tab panels — animate on mount, not whileInView (which hides tab content) */
  tabFadeUp: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  tabFadeLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  tabScaleIn: {
    initial: { opacity: 0, y: 32, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  pageTransitionOut: {
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  },

  // Modal animations
  modalBounce: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },

  // Reveal text
  revealText: {
    initial: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
    whileInView: { opacity: 1, clipPath: 'inset(0 0% 0 0)' },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.8, ease: 'easeInOut' },
  },

  /** Stagger grid — use on motion.div wrappers */
  staggerGrid: {
    initial: 'hidden',
    whileInView: 'visible',
    viewport: { once: true, margin: '-60px' },
    variants: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
    },
  },
  staggerItem: {
    variants: {
      hidden: { opacity: 0, y: 28, scale: 0.96 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
      },
    },
  },
  popIn: {
    initial: { opacity: 0, scale: 0.8 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true },
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
  blurIn: {
    initial: { opacity: 0, y: 20, filter: 'blur(8px)' },
    whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
    viewport: { once: true },
    transition: { duration: 0.6 },
  },
  slideLeft: {
    initial: { opacity: 0, x: -36 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
  slideRight: {
    initial: { opacity: 0, x: 36 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },

  // Gradient animation
  gradientShift: {
    animate: { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] },
    transition: { duration: 5, repeat: Infinity, ease: 'linear' },
  },
};

// Stagger container for multiple items
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Individual item variant for staggered animations
export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// Enhanced hover effects
export const cardHoverVariants = {
  rest: {
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    y: 0,
  },
  hover: {
    boxShadow: '0 20px 50px rgba(255, 107, 74, 0.2), 0 8px 24px rgba(201, 168, 76, 0.12)',
    y: -8,
    scale: 1.02,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};
