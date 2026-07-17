import { motion } from 'framer-motion';
import { Brain, Phone, MapPin, Sparkles } from 'lucide-react';

const tips = [
  { text: 'Brain Mapping talent scan', icon: Brain, gradient: 'from-amber-500 to-orange-600', pos: 'top-28 left-3', delay: 0 },
  { text: 'Free consult', icon: Phone, gradient: 'from-amber-500 to-orange-500', pos: 'bottom-36 left-4', delay: 1.2 },
  { text: 'Science-backed guidance', icon: Sparkles, gradient: 'from-amber-500 to-orange-500', pos: 'bottom-28 right-4', delay: 2.4 },
  { text: 'Jaipur centres', icon: MapPin, gradient: 'from-orange-500 to-orange-400', pos: 'top-1/2 left-2 -translate-y-1/2 hidden xl:block', delay: 1.8 },
];

export default function FloatingInfo() {
  return (
    <div className="fixed inset-0 pointer-events-none z-30 hidden lg:block overflow-hidden">
      {tips.map((tip, i) => {
        const Icon = tip.icon;
        return (
          <motion.div
            key={tip.text}
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{
              opacity: [0, 1, 1, 0.85, 0],
              scale: [0.85, 1, 1, 0.95, 0.85],
              y: [8, 0, -4, 0, 6],
            }}
            transition={{
              duration: 6,
              delay: tip.delay,
              repeat: Infinity,
              repeatDelay: 14,
              ease: 'easeInOut',
            }}
            className={`absolute ${tip.pos}`}
          >
            <motion.div
              className={`flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-full bg-gradient-to-r ${tip.gradient} text-amber-50 shadow-md shadow-amber-500/20 border border-amber-100/25 backdrop-blur-sm max-w-[130px] pointer-events-none`}
            >
              <span className="w-5 h-5 rounded-full bg-[var(--bg-elevated)]/20 flex items-center justify-center shrink-0">
                <Icon className="w-2.5 h-2.5" />
              </span>
              <span className="text-[10px] font-bold leading-tight truncate">{tip.text}</span>
              {i === 0 && (
                <Sparkles className="w-2.5 h-2.5 text-amber-200 shrink-0 animate-pulse" />
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
