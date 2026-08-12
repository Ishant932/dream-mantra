/** Static routes/icons for nav mega menus — labels come from locale */
export const navAssessmentRoutes = [
  '/counselling/brain-mapping',
  '/counselling/skill-mapping',
  '/counselling/combo',
  '/counselling/why',
];
export const navAssessmentIcons = ['🔬', '📊', '🧬', '💜'];

export const navProgramRoutes = [
  '/counselling/programs/class-1-5',
  '/counselling/programs/class-6-8',
  '/counselling/programs/class-9-10',
  '/counselling/programs/class-11-12',
  '/counselling/programs/college-students',
  '/counselling/programs/working-professionals',
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
  '/counselling/programs/class-1-5',
  '/counselling/programs/class-6-8',
  '/counselling/programs/class-9-10',
  '/counselling/programs/class-11-12',
  '/counselling/programs/college-students',
  '/counselling/programs/working-professionals',
];

export function zipNavLinks(links, routes, icons) {
  return links.map((link, i) => ({
    ...link,
    to: routes[i],
    icon: icons[i],
  }));
}
