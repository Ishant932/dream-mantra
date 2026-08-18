/** Default webinar schedule — update times for each live event */
export const WEBINAR_CONFIG = {
  title: 'Career Clarity Masterclass',
  subtitle: 'Live session with Dream Mantra career experts',
  description: 'Join our free live webinar to learn how to choose the right career path, avoid common mistakes, and build a clear roadmap for your future.',
  /** ISO datetime when the webinar goes live (IST) */
  scheduledStart: '2026-03-20T18:00:00+05:30',
  /** ISO datetime when replay ends (optional) */
  scheduledEnd: '2026-03-20T19:30:00+05:30',
  /** YouTube embed ID or direct MP4 URL */
  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0',
  ctaLabel: 'Book Free Counselling',
  ctaHref: '/book-now',
  hostName: 'Esha Lohiya',
  hostRole: 'Founder, Dream Mantra',
};

export function getWebinarPhase(now = new Date()) {
  const start = new Date(WEBINAR_CONFIG.scheduledStart);
  const end = new Date(WEBINAR_CONFIG.scheduledEnd);
  if (now < start) return 'upcoming';
  if (now <= end) return 'live';
  return 'ended';
}

export function formatCountdown(ms) {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds };
}
