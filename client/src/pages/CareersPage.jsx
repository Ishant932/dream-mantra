import CareerLibraryExplorer from '../components/CareerLibraryExplorer';
import CmsPageSections from '../components/CmsPageSections';
import { usePageCatalog } from '../hooks/usePageCatalog';

/** Public career library — uses uploaded career-library template */
export default function CareersPage() {
  const cms = usePageCatalog('careers');
  return (
    <>
      <CmsPageSections cms={cms} className="!py-6" />
      <CareerLibraryExplorer embedded={false} />
    </>
  );
}
