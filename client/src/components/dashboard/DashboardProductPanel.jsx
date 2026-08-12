import { Lock } from 'lucide-react';
import ProductJourneySteps from './ProductJourneySteps';
import CounsellingBookingPanel from '../CounsellingBookingPanel';
import DashboardProductOverview from './DashboardProductOverview';
import ProfileWizardPanel from './ProfileWizardPanel';
import SkillMappingTakeTestPanel from './SkillMappingTakeTestPanel';
import CommunityLinksPanel from './CommunityLinksPanel';
import SessionBookingPanel from './SessionBookingPanel';
import { getCounsellingSubtabs, getTrainingSubtabs } from '../../utils/productSubtabs';
import { counsellingPrerequisitesMet, getCounsellingBookings } from '../../utils/counsellingStatus';
import {
  canBookCounsellingSession,
  productGrantsCounselling,
  purchaseHadCounsellingPackage,
} from '../../utils/moduleAccess';
import { DashCard } from '../DashboardUI';

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

const REPORT_TAB = 'report';

export function CounsellingProductPanel({
  focus, paid, subtab, onSubtab, careerPath, reports = [], bookingProps, journeyCtx, onBook,
  displayUser, profile, onProfileSave, profileSaving, token, onTestProgressSaved, profileCompletion = 0,
  onAdditionalCounselling, assessments = [],
}) {
  const activeAssessment = careerPath?.activeAssessment;
  const productSlug = careerPath?.productSlug;
  const includesCounselling = productGrantsCounselling(assessments, productSlug, activeAssessment);
  const showAdditionalCounselling = purchaseHadCounsellingPackage(activeAssessment) || focus === 'combo';
  const subtabs = getCounsellingSubtabs(focus, includesCounselling);
  const progress = activeAssessment?.progress || {};
  const consultations = bookingProps?.bookings || [];
  const counsellingBookings = getCounsellingBookings(consultations);
  const profileReady = profileCompletion >= 80 || !!profile?.setupComplete;
  const prereqsMet = counsellingPrerequisitesMet(focus, progress, profileReady);
  const canBookCounselling = includesCounselling
    && prereqsMet
    && canBookCounsellingSession(assessments, consultations);
  const counsellingUnlocked = includesCounselling && (prereqsMet || counsellingBookings.length > 0);
  const locked = (tab) => {
    if (tab.lock && !paid) return true;
    if (tab.id === 'counselling' && paid && !counsellingUnlocked) return true;
    return false;
  };
  const pick = (id) => {
    const tab = subtabs.find((t) => t.id === id);
    if (tab && locked(tab)) return;
    onSubtab(id);
  };
  const slug = careerPath?.productSlug;
  const overviewMode = !paid || showOverview(subtab);
  const validIds = subtabs.map((t) => t.id);

  return (
    <div className="space-y-3">
      {paid && (
        <div className="dash-subtab-rail dash-subtab-rail--scroll dash-subtab-rail--product dash-subtab-rail--center dash-subtab-rail--lg">
          {subtabs.map((tab) => (
            <button key={tab.id} type="button" disabled={locked(tab)}
              className={`dash-subtab-rail__chip${subtab === tab.id ? ' is-active' : ''}${locked(tab) ? ' is-locked' : ''}`}
              onClick={() => pick(tab.id)}>
              {tab.label}{locked(tab) ? ' 🔒' : ''}
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
            includesCounselling={includesCounselling}
            showAdditionalCounselling={showAdditionalCounselling}
            {...journeyCtx}
            onProfile={() => onSubtab('profile')}
            onBookCounselling={() => onSubtab('counselling')}
            onTakeTest={() => onSubtab('take-test')}
            onReports={() => onSubtab('report')}
            onAdditionalCounselling={onAdditionalCounselling}
          />
        )}
        {paid && subtab === 'profile' && (
          <ProfileWizardPanel user={displayUser} profile={profile} onSave={onProfileSave} saving={profileSaving} />
        )}
        {paid && subtab === 'take-test' && (
          <SkillMappingTakeTestPanel
            user={displayUser}
            profile={profile}
            instrumentIds={careerPath?.activeAssessment?.progress?.skillMappingInstruments}
            assessmentId={careerPath?.activeAssessment?.id}
            token={token}
            savedProgress={careerPath?.activeAssessment?.progress?.skillTestProgress}
            onProgressSaved={onTestProgressSaved}
          />
        )}
        {paid && subtab === 'counselling' && !counsellingUnlocked && (
          <DashCard className="!p-6 text-center border-amber-200/80" glow={false} hover={false}>
            <Lock className="w-10 h-10 text-amber-600 mx-auto mb-3 opacity-80" />
            <h4 className="font-bold text-lg mb-2">Counselling locked</h4>
            <p className="text-sm dash-card-meta mb-4">Complete your profile and required tests first. Counselling opens once you are ready to book.</p>
            <button type="button" className="btn-primary" onClick={() => onSubtab('journey')}>View your journey</button>
          </DashCard>
        )}
        {paid && subtab === 'counselling' && counsellingUnlocked && (
          <CounsellingBookingPanel {...bookingProps} canBookCounselling={canBookCounselling} />
        )}
        {paid && subtab === REPORT_TAB && (
          <div>
            <p className="font-semibold text-theme-primary mb-3">Your reports</p>
            {reports.length ? reports.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 mb-2">
                <div>
                  <p className="font-semibold">{r.report_title || 'Report'}</p>
                  <p className="text-xs dash-card-meta">{r.product_title}</p>
                </div>
                {r.report_link ? <a href={r.report_link} target="_blank" rel="noreferrer" className="btn-outline">View</a> : <span className="text-sm text-amber-700">Pending</span>}
              </div>
            )) : <p className="text-sm dash-card-meta">Reports appear after assessment review.</p>}
          </div>
        )}
        {paid && subtab && !showOverview(subtab) && !validIds.includes(subtab) && <LockedCard onBook={onBook} />}
      </div>
    </div>
  );
}

export function TrainingProductPanel({
  focus, paid, subtab, onSubtab, careerPath, journeyCtx, bookingProps, resourcesPanel, cvPanel, onBook,
  displayUser, profile, onProfileSave, profileSaving, communityLink, sessionBookingProps, onCommunityJoined, token,
}) {
  const subtabs = getTrainingSubtabs(focus);
  const locked = (tab) => tab.lock && !paid;
  const pick = (id) => {
    const tab = subtabs.find((t) => t.id === id);
    if (tab && locked(tab)) return;
    onSubtab(id);
  };
  const progress = careerPath?.activeAssessment?.progress || {};
  const slug = careerPath?.productSlug;
  const overviewMode = !paid || showOverview(subtab);
  const validIds = subtabs.map((t) => t.id);

  return (
    <div className="space-y-3">
      {paid && (
        <div className="dash-subtab-rail dash-subtab-rail--scroll dash-subtab-rail--product dash-subtab-rail--center dash-subtab-rail--lg">
          {subtabs.map((tab) => (
            <button key={tab.id} type="button" disabled={locked(tab)}
              className={`dash-subtab-rail__chip${subtab === tab.id ? ' is-active' : ''}${locked(tab) ? ' is-locked' : ''}`}
              onClick={() => pick(tab.id)}>
              {tab.label}{locked(tab) ? ' 🔒' : ''}
            </button>
          ))}
        </div>
      )}
      <div className="dash-panel-surface dash-panel-surface--product">
        {(overviewMode || !paid) && <DashboardProductOverview focus={focus} onBook={onBook} paid={paid} />}
        {paid && subtab === 'journey' && (
          <ProductJourneySteps focus={focus} paid={paid} progress={progress} slug={slug} {...journeyCtx}
            onCommunity={() => onSubtab('community')} onSchedule={() => onSubtab('schedule')} onResources={() => onSubtab('resources')} onCv={() => onSubtab('cv')} />
        )}
        {paid && subtab === 'community' && (
          <CommunityLinksPanel
            communityLink={communityLink}
            assessmentId={careerPath?.activeAssessment?.id}
            token={token}
            communityJoined={careerPath?.activeAssessment?.progress?.communityJoined}
            onJoined={onCommunityJoined}
          />
        )}
        {paid && subtab === 'schedule' && sessionBookingProps && <SessionBookingPanel {...sessionBookingProps} displayUser={displayUser} />}
        {paid && subtab === 'resources' && resourcesPanel}
        {paid && subtab === 'cv' && cvPanel}
        {paid && subtab && !showOverview(subtab) && !validIds.includes(subtab) && <LockedCard onBook={onBook} />}
      </div>
    </div>
  );
}

