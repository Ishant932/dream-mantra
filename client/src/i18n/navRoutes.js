/** Static routes/icons for nav mega menus — labels come from locale */
export const navAssessmentRoutes = [
  '/counselling?tab=dmit',
  '/counselling?tab=psychometric',
  '/counselling?tab=combo',
  '/counselling?tab=why',
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

export const navCommonRoutes = ['/counselling?tab=institutions'];
export const navCommonIcons = ['🤝'];

export const navCrpRoutes = ['/crp?tab=launchpad'];
export const navCrpIcons = ['🚀'];

export const navCrpProgramRoutes = [
  '/crp?tab=pathways&audience=college-students',
  '/crp?tab=pathways&audience=freshers',
  '/crp?tab=pathways&audience=working-professionals',
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

export const testimonialImages = [
  '/portraits/parent1',
]; // use PORTRAITS from content in component

export function zipNavLinks(links, routes, icons) {
  return links.map((link, i) => ({
    ...link,
    to: routes[i],
    icon: icons[i],
  }));
}
