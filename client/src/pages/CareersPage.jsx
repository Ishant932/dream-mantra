import CareerLibraryExplorer from '../components/CareerLibraryExplorer';
import CmsPageSections from '../components/CmsPageSections';
import { usePageCatalog } from '../hooks/usePageCatalog';

export default function CareersPage() {
  const cms = usePageCatalog('careers');
  const hasCms = cms?.hasCustom && (cms?.sections?.length || cms?.intro);
  return (
    <div className={`careers-page-shell${hasCms ? ' careers-page-shell--with-cms' : ''}`}>
      {hasCms ? <CmsPageSections cms={cms} className="careers-page-shell__cms !py-4" /> : null}
      <CareerLibraryExplorer embedded />
    </div>
  );
}
