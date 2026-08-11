/** Static routes/icons for nav mega menus — labels come from locale */
export const navAssessmentRoutes = [
  '/counselling/brain-mapping',
  '/counselling/skill-mapping',
  '/counselling/combo',
  '/counselling/why',
];
export const navAssessmentIcons = ['🔬', '📊', '🧬', '💜'];

export const navProgramRoutes = [
  '/programs/class-1-5',
  '/programs/class-6-8',
  '/programs/class-9-10',
  '/programs/class-11-12',
  '/programs/college-students',
  '/programs/working-professionals',
];
export const navProgramIcons = ['🌱', '🎯', '📚', '🎓', '🏫', '💼'];

export const navCommonRoutes = ['/counselling/institutions'];
export const navCommonIcons = ['🤝'];

export const navCrpRoutes = ['/crp/launchpad', '/crp/readiness'];
export const navCrpIcons = ['🚀', '🌟'];

export const navCrpProgramRoutes = [
  '/crp/pathways/college-students',
  '/crp/pathways/freshers',
  '/crp/pathways/working-professionals',
];
export const navCrpProgramIcons = ['🏫', '🚀', '💼'];

export const whoWeGuideRoutes = [
  '/programs/class-1-5',
  '/programs/class-6-8',
  '/programs/class-9-10',
  '/programs/class-11-12',
  '/programs/college-students',
  '/programs/working-professionals',
];

export function zipNavLinks(links, routes, icons) {
  return links.map((link, i) => ({
    ...link,
    to: routes[i],
    icon: icons[i],
  }));
}
