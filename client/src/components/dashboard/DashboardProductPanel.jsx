import { Lock } from 'lucide-react';
import ProductJourneySteps from './ProductJourneySteps';
import CounsellingBookingPanel from '../CounsellingBookingPanel';
import DashboardProductOverview from './DashboardProductOverview';
import { DashCard } from '../DashboardUI';

const COUNSELLING_SUBTABS = [
  { id: 'journey', label: 'Your Journey', lock: true },
  { id: 'counselling', label: 'Counselling', lock: true },
  { id: 'report', label: 'Report', lock: true },
];

const TRAINING_SUBTABS = [
  { id: 'journey', label: 'Your Journey', lock: true },
  { id: 'counselling', label: 'Counselling', lock: true },
  { id: 'resources', label: 'Resources', lock: true },
  { id: 'details', label: 'Details', lock: true },
  { id: 'cv', label: 'CV Maker', lock: true },
];

function LockedCard({ onBook }) {
  return (
    <DashCard className="!p-6 text-center border-amber-200/80" glow={false} hover={false}>
      <Lock className="w-10 h-10 text-amber-600 mx-auto mb-3 opacity-80" />
      <h4 className="font-bold text-lg mb-2">Locked — purchase to unlock</h4>
      <button type="button" className="btn-primary" onClick={onBook}>Book Now</button>
    </DashCard>
  );
}

function showOverview(subtab) {
  return !subtab || subtab === 'overview';
}

export function CounsellingProductPanel({
  focus, paid, subtab, onSubtab, careerPath, reports = [], bookingProps, journeyCtx, onBook,
}) {
  const locked = (tab) => tab.lock && !paid;
  const pick = (id) => {
    const tab = COUNSELLING_SUBTABS.find((t) => t.id === id);
    if (tab && locked(tab)) return;
    onSubtab(id);
  };
  const progress = careerPath?.activeAssessment?.progress || {};
  const slug = careerPath?.productSlug;
  const overviewMode = !paid || showOverview(subtab);

  return (
    <div className="space-y-3">
      {paid && (
        <div className="dash-subtab-rail dash-subtab-rail--product dash-subtab-rail--center dash-subtab-rail--lg">
          {COUNSELLING_SUBTABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`dash-subtab-rail__chip${subtab === tab.id ? ' is-active' : ''}`}
              onClick={() => pick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      <div className="dash-panel-surface dash-panel-surface--product">
        {(overviewMode || !paid) && <DashboardProductOverview focus={focus} onBook={onBook} paid={paid} />}
        {paid && subtab === 'journey' && (
          <ProductJourneySteps
            focus={focus}
            paid={paid}
            progress={progress}
            slug={slug}
            hasReport={journeyCtx.hasReport}
            hasBooking={journeyCtx.hasBooking}
            counsellingDone={journeyCtx.counsellingDone}
            onProcess={journeyCtx.onProcess}
            onFingerprints={journeyCtx.onFingerprints}
            onTakeTest={journeyCtx.onTakeTest}
            onBookCounselling={() => onSubtab('counselling')}
            onReports={journeyCtx.onReports}
          />
        )}
        {paid && subtab === 'counselling' && <CounsellingBookingPanel {...bookingProps} />}
        {paid && subtab === 'report' && (
          <div>
            <p className="font-semibold text-theme-primary mb-3">Your reports</p>
            {reports.length ? reports.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 mb-2">
                <div>
                  <p className="font-semibold">{r.report_title || 'Report'}</p>
                  <p className="text-xs dash-card-meta">{r.product_title}</p>
                </div>
                {r.report_link ? (
                  <a href={r.report_link} target="_blank" rel="noreferrer" className="btn-outline">View</a>
                ) : (
                  <span className="text-sm text-amber-700">Pending</span>
                )}
              </div>
            )) : <p className="text-sm dash-card-meta">Reports appear after assessment review.</p>}
          </div>
        )}
        {paid && subtab && subtab !== 'overview' && !['journey', 'counselling', 'report'].includes(subtab) && <LockedCard onBook={onBook} />}
      </div>
    </div>
  );
}

export function TrainingProductPanel({
  focus, paid, subtab, onSubtab, careerPath, journeyCtx, bookingProps, resourcesPanel, detailsStudio, cvPanel, onBook,
}) {
  const locked = (tab) => tab.lock && !paid;
  const pick = (id) => {
    const tab = TRAINING_SUBTABS.find((t) => t.id === id);
    if (tab && locked(tab)) return;
    onSubtab(id);
  };
  const progress = careerPath?.activeAssessment?.progress || {};
  const slug = careerPath?.productSlug;
  const overviewMode = !paid || showOverview(subtab);

  return (
    <div className="space-y-3">
      {paid && (
        <div className="dash-subtab-rail dash-subtab-rail--product dash-subtab-rail--center dash-subtab-rail--lg">
          {TRAINING_SUBTABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`dash-subtab-rail__chip${subtab === tab.id ? ' is-active' : ''}`}
              onClick={() => pick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      <div className="dash-panel-surface dash-panel-surface--product">
        {(overviewMode || !paid) && <DashboardProductOverview focus={focus} onBook={onBook} paid={paid} />}
        {paid && subtab === 'journey' && (
          <ProductJourneySteps
            focus={focus}
            paid={paid}
            progress={progress}
            slug={slug}
            hasReport={journeyCtx.hasReport}
            hasBooking={journeyCtx.hasBooking}
            counsellingDone={journeyCtx.counsellingDone}
            onProcess={journeyCtx.onProcess}
            onTakeTest={journeyCtx.onTakeTest}
            onBookCounselling={() => onSubtab('counselling')}
            onReports={journeyCtx.onReports}
          />
        )}
        {paid && subtab === 'counselling' && bookingProps && <CounsellingBookingPanel {...bookingProps} />}
        {paid && subtab === 'resources' && resourcesPanel}
        {paid && subtab === 'details' && detailsStudio}
        {paid && subtab === 'cv' && cvPanel}
        {paid && subtab && !showOverview(subtab) && !['journey', 'counselling', 'resources', 'details', 'cv'].includes(subtab) && (
          <LockedCard onBook={onBook} />
        )}
      </div>
    </div>
  );
}
