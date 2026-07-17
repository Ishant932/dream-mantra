import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

export default function PromoBar() {
  const { t } = useLang();
  const promos = [
    { label: t('promo.crp'), price: t('promo.explore'), to: '/crp?tab=launchpad' },
    { label: t('promo.careers'), price: t('promo.browse'), to: '/careers' },
    { label: t('promo.free'), price: t('promo.book'), to: '/contact#guidance' },
  ];

  return (
    <div className="promo-bar relative z-[60] h-9 sm:h-10 overflow-hidden shadow-lg" style={{ boxShadow: '0 4px 20px rgba(255,107,74,0.25)' }}>
      <motion.div
        className="flex items-center h-full whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        {[...promos, ...promos, ...promos].map((p, i) => (
          <Link
            key={i}
            to={p.to}
            className="inline-flex items-center gap-2 mx-4 sm:mx-8 text-[11px] sm:text-sm font-semibold hover:opacity-90 group promo-bar-link"
          >
            <Sparkles className="w-3 h-3 opacity-80 group-hover:animate-pulse text-[#FF6B4A]" />
            {p.label}
            <motion.span
              whileHover={{ scale: 1.08, y: -1 }}
              className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border badge-new promo-bar-badge"
            >
              {p.price}
            </motion.span>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
