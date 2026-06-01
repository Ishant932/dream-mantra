/** Static routes/icons for nav mega menus — labels come from locale */
export const navAssessmentRoutes = [
  '/assessments/dmit',
  '/assessments/psychometric',
  '/assessments/dmit-psychometric',
  '/assessments/why-dreams-mantra',
];
export const navAssessmentIcons = ['🔬', '📊', '🧬', '💜'];

export const navProgramRoutes = [
  '/programs/class-1-5',
  '/programs/class-6-8',
  '/programs/class-9-10',
  '/programs/class-11-12',
  '/programs/college-students',
  '/programs/working-professionals',
  '/counselling?tab=programs&pathway=institutions',
];
export const navProgramIcons = ['🌱', '🎯', '📚', '🎓', '🏫', '💼', '🤝'];

export const navCrpRoutes = ['/crp/explore', '/crp/launch'];
export const navCrpIcons = ['🚀', '🤖'];

export const navCrpProgramRoutes = [
  '/crp/launch?tab=college-students',
  '/crp/launch?tab=freshers',
  '/crp/launch?tab=working-professionals',
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
