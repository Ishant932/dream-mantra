import PageHero from './PageHero';
import { IMAGES } from '../data/content';

/** When admin saves fullHtml, the entire page body is replaced site-wide */
export default function CmsFullPage({ cms, fallbackImage }) {
  if (!cms?.fullHtml?.trim()) return null;
  return (
    <>
      {(cms.heroTitle || cms.heroSubtitle) && (
        <PageHero
          title={cms.heroTitle}
          subtitle={cms.heroSubtitle}
          image={cms.heroImage || fallbackImage || IMAGES.counselling}
        />
      )}
      <div
        className="cms-full-page prose prose-amber max-w-5xl mx-auto px-4 py-12"
        dangerouslySetInnerHTML={{ __html: cms.fullHtml }}
      />
    </>
  );
}

export function buildDefaultFullHtml(page) {
  const sections = (page.sections || [])
    .map((s) => `<section class="cms-block"><h2>${s.title || ''}</h2>${s.image ? `<img src="${s.image}" alt="" />` : ''}<p>${s.content || ''}</p></section>`)
    .join('\n');
  return `<div class="cms-page-body">
${page.intro ? `<p class="cms-lead">${page.intro}</p>` : ''}
${sections}
</div>`;
}
