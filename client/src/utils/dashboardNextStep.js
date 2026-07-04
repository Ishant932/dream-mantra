import { getAssessmentDisplayTitle } from './assessmentHelpers';
import { getConfirmedPaidAssessments } from './moduleAccess';

export const NEXT_STEP_ACTIONS = {
  PROFILE: 'profile',
  PAYMENT: 'payment',
  MODULES: 'modules',
  PROCESS: 'process',
  BOOK: 'book',
};

/** Shared “recommended next step” logic for dashboard overview + mobile deck. */
export function getDashboardNextStep({
  profileCompletion = 0,
  pendingPayment = null,
  assessments = [],
  paidAssessment = null,
  counsellingAccess = false,
  consultations = [],
}) {
  const activeModules = getConfirmedPaidAssessments(assessments);
  const upcomingBookings = (consultations || []).filter(
    (c) => c.status !== 'cancelled' && c.scheduled_at && new Date(c.scheduled_at) > new Date()
  );

  let step = {
    action: NEXT_STEP_ACTIONS.PROFILE,
    title: 'Complete your profile',
    desc: 'Add class, stream, and goals so we can personalise your journey.',
    cta: 'Complete profile',
    shortCta: 'Next step',
  };

  if (profileCompletion >= 60 && pendingPayment && pendingPayment.payment_confirmed !== true) {
    step = {
      action: NEXT_STEP_ACTIONS.PAYMENT,
      title: 'Finish payment',
      desc: `Complete checkout for ${getAssessmentDisplayTitle(pendingPayment)}.`,
      cta: 'Pay now',
      shortCta: 'Next step',
    };
  } else if (profileCompletion >= 60 && !activeModules.length) {
    step = {
      action: NEXT_STEP_ACTIONS.MODULES,
      title: 'Choose your first module',
      desc: 'Mind Mapping, Skill Mapping, or the full combo — start your assessment journey.',
      cta: 'Browse modules',
      shortCta: 'Next step',
    };
  } else if (paidAssessment) {
    step = {
      action: NEXT_STEP_ACTIONS.PROCESS,
      title: 'Continue your assessment',
      desc: 'Follow the process steps or take your skill mapping tests.',
      cta: 'Process & Take test',
      shortCta: 'Next step',
    };
  } else if (counsellingAccess && !upcomingBookings.length) {
    step = {
      action: NEXT_STEP_ACTIONS.BOOK,
      title: 'Book your counselling session',
      desc: 'Your counselling add-on is active — pick a slot with our certified counsellor.',
      cta: 'Book session',
      shortCta: 'Next step',
    };
  }

  return step;
}

export const ADMIN_NEXT_STEP_ACTIONS = {
  BOOKINGS: 'bookings',
  REPORTS: 'reports',
  PAYMENTS: 'payments',
  MESSAGES: 'messages',
  ANALYTICS: 'analytics',
};

/** Recommended next action for the admin dashboard overview + mobile deck. */
export function getAdminDashboardNextStep({ stats, notifUnread = 0 }) {
  if (stats?.pending > 0) {
    return {
      action: ADMIN_NEXT_STEP_ACTIONS.BOOKINGS,
      title: 'Review pending bookings',
      desc: `${stats.pending} consultation${stats.pending === 1 ? '' : 's'} awaiting confirmation.`,
      cta: 'Open bookings',
      shortCta: 'Next step',
    };
  }

  if (notifUnread > 0) {
    return {
      action: ADMIN_NEXT_STEP_ACTIONS.MESSAGES,
      title: 'Check new messages',
      desc: `${notifUnread} unread notification${notifUnread === 1 ? '' : 's'} in your inbox.`,
      cta: 'View messages',
      shortCta: 'Next step',
    };
  }

  if ((stats?.openSlots ?? 0) === 0) {
    return {
      action: ADMIN_NEXT_STEP_ACTIONS.BOOKINGS,
      title: 'Add counselling slots',
      desc: 'No open booking slots — add availability so students can schedule sessions.',
      cta: 'Manage calendar',
      shortCta: 'Next step',
    };
  }

  return {
    action: ADMIN_NEXT_STEP_ACTIONS.ANALYTICS,
    title: 'Review platform analytics',
    desc: 'Check sign-ups, revenue, and module performance at a glance.',
    cta: 'View analytics',
    shortCta: 'Next step',
  };
}
