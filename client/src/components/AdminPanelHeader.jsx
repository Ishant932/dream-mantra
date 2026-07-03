import AdminSectionExport from './AdminSectionExport';
import { isPhoneViewport } from '../utils/mobilePerf';

/** Consistent top-right export + title row for admin sections */
export default function AdminPanelHeader({ title, subtitle, exportProps, children, showTitleOnMobile = false }) {
  const phone = isPhoneViewport();
  const showMeta = showTitleOnMobile || !phone;

  return (
    <div className={`flex flex-wrap items-start justify-between gap-2 mb-3 admin-panel-header${phone && !showMeta ? ' admin-panel-header--actions-only' : ''}`}>
      {showMeta && (title || subtitle) && (
        <div className="min-w-0">
          {title && <h2 className="text-lg font-bold leading-tight">{title}</h2>}
          {subtitle && <p className="text-sm opacity-70 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className={`flex flex-wrap items-center gap-2 shrink-0${phone && !showMeta ? ' ml-auto' : ''}`}>
        {exportProps?.rows?.length > 0 && exportProps?.columns?.length > 0 && (
          <AdminSectionExport {...exportProps} />
        )}
        {children}
      </div>
    </div>
  );
}
