import { motion } from 'framer-motion';
import { isPhoneViewport } from '../utils/mobilePerf';

export default function DashboardToolkitRail({ tabs, activeTab, onSelectTab }) {
  const phone = isPhoneViewport();

  return (
    <nav
      className={`dash-toolkit-rail${phone ? ' dash-toolkit-rail--phone' : ''}`}
      role="tablist"
      aria-label="Your Career Toolkit"
    >
      <div className="dash-toolkit-rail__scroll">
        {tabs.map((tab, i) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={tab.locked}
              className={`dash-toolkit-rail__chip${isActive ? ' dash-toolkit-rail__chip--active' : ''}${tab.locked ? ' dash-toolkit-rail__chip--locked' : ''}`}
              onClick={() => !tab.locked && onSelectTab(tab.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="dash-toolkit-rail__label">{tab.label}</span>
              {tab.locked && <span className="dash-toolkit-rail__lock" aria-hidden>🔒</span>}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
