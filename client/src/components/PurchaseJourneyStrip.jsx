import { motion } from 'framer-motion';
import { ShoppingBag, CreditCard, UserCheck, Calendar, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { id: 'choose', icon: ShoppingBag, label: 'Choose module', sub: 'Add counselling at checkout' },
  { id: 'pay', icon: CreditCard, label: 'Complete payment', sub: 'Online or admin verify' },
  { id: 'confirm', icon: UserCheck, label: 'Payment confirmed', sub: 'Access unlocks instantly' },
  { id: 'book', icon: Calendar, label: 'Book your slot', sub: 'Pick date & time' },
];

export default function PurchaseJourneyStrip({ activeStep = 'choose', compact = false }) {
  const activeIdx = STEPS.findIndex((s) => s.id === activeStep);

  return (
    <div className={`purchase-journey ${compact ? 'purchase-journey--compact' : ''}`}>
      <ol className="purchase-journey__track">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const done = i < activeIdx;
          const active = i === activeIdx;
          return (
            <motion.li
              key={step.id}
              className={`purchase-journey__step ${done ? 'purchase-journey__step--done' : ''} ${active ? 'purchase-journey__step--active' : ''}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <span className="purchase-journey__icon" aria-hidden="true">
                {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </span>
              <div className="purchase-journey__text">
                <span className="purchase-journey__label">{step.label}</span>
                {!compact && <span className="purchase-journey__sub">{step.sub}</span>}
              </div>
              {i < STEPS.length - 1 && <span className="purchase-journey__connector" aria-hidden="true" />}
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
