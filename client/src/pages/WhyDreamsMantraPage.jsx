import PageHero from '../components/PageHero';
import WhyCounsellingPanel from '../components/WhyCounsellingPanel';
import { IMAGES } from '../data/content';
import { useLang } from '../context/LanguageContext';

export default function WhyDreamsMantraPage() {
  const { d } = useLang();
  const page = d('pages.whyDreamsMantra');

  return (
    <>
      <PageHero
        title={page.hero.title}
        subtitle={page.hero.subtitle}
        image={IMAGES.hero}
        cta={page.hero.cta}
        ctaLink="/contact#guidance"
      />
      <WhyCounsellingPanel />
    </>
  );
}
