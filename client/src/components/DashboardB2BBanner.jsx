import { motion } from 'framer-motion';
import { Sparkles, Radio } from 'lucide-react';
import { isPhoneViewport } from '../utils/mobilePerf';
import CopyableUserId from './CopyableUserId';
import DashboardNextStepButton from './DashboardNextStepButton';

export default function DashboardB2BBanner({
  tag,
  title,
  subtitle,
  meta,
  dateLabel,
  variant = 'admin',
  action,
  dreamsUid,
  nextStep,
  toolkitTabs,
  activeTab,
  onSelectTab,
}) {
  const phone = isPhoneViewport();
  const today = dateLabel || new Date().toLocaleDateString('en-IN', {
    weekday: phone ? 'short' : 'long',
    day: 'numeric',
    month: phone ? 'short' : 'long',
  });
  const hasToolkit = toolkitTabs?.length > 0;

  const dreamsIdBlock = dreamsUid ? (
    <div className="dash-hero-id" aria-label="Dreams ID">
      <p className="dash-hero-id__label">Dreams ID</p>
      <CopyableUserId uid={dreamsUid} compact animate={false} className="dash-hero-id__copy" />
    </div>
  ) : null;

  const toolkitRail = hasToolkit && (
    <nav className="dash-hero-toolkit" role="tablist" aria-label="Dashboard sections">
      <div className="dash-hero-toolkit__scroll">
        {toolkitTabs.map((tab, i) => {
          const on = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={on}
              disabled={tab.locked}
              className={`dash-hero-toolkit__chip${on ? ' is-active' : ''}${tab.locked ? ' is-locked' : ''}`}
              onClick={() => !tab.locked && onSelectTab(tab.id)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {tab.label}
              {tab.locked && <span className="dash-hero-toolkit__lock">🔒</span>}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );

  const headerBlock = (
    <div className="dash-hero-head">
      {tag && (
        <span className="dash-b2b-hero__tag dash-b2b-hero__tag--small">
          {phone ? <Radio className="w-3 h-3" aria-hidden /> : <Sparkles className="w-3 h-3" />}
          {tag}
        </span>
      )}
      <h1 className="dash-b2b-hero__title dash-b2b-hero__title--compact">{title}</h1>
      {subtitle && <p className="dash-b2b-hero__subtitle dash-b2b-hero__subtitle--compact">{subtitle}</p>}
      {meta && <p className="dash-hero-meta">{meta}</p>}
    </div>
  );

  if (phone) {
    return (
      <div className={`dash-b2b-hero dash-b2b-hero--${variant} dash-b2b-hero--cockpit dash-b2b-hero--unified`}>
        <div className="dash-b2b-hero__orb dash-b2b-hero__orb--a" aria-hidden />
        <div className="dash-b2b-hero__cockpit-row dash-hero-head-row">
          <div className="min-w-0 flex-1">{headerBlock}</div>
          <div className="dash-b2b-hero__cockpit-right shrink-0">
            {action}
            <span className="dash-b2b-hero__date dash-b2b-hero__date--cockpit">{today}</span>
          </div>
        </div>
        <div className="dash-b2b-hero__unified-row">
          {dreamsIdBlock}
          {toolkitRail}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`dash-b2b-hero dash-b2b-hero--${variant} dash-b2b-hero--unified`}
    >
      <div className="dash-b2b-hero__shine" aria-hidden />
      <div className="dash-b2b-hero__top flex flex-wrap items-start justify-between gap-3 relative z-[1]">
        <div className="min-w-0 flex-1">{headerBlock}</div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {nextStep && <DashboardNextStepButton nextStep={nextStep} variant="hero" />}
          {action}
          <span className="dash-b2b-hero__date">{today}</span>
        </div>
      </div>
      <div className="dash-b2b-hero__unified-row">
        {dreamsIdBlock}
        {toolkitRail}
      </div>
    </motion.div>
  );
}
