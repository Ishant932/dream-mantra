import { motion } from 'framer-motion';
import { Fingerprint, MapPin, Clock, CheckCircle2 } from 'lucide-react';

export default function AssessmentFingerprintStep({ onConfirm, saving }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Fingerprint className="w-8 h-8 text-amber-600" />
        <h1 className="font-display text-2xl md:text-3xl font-bold">Fingerprint Collection</h1>
      </div>
      <p className="text-sand-600 dark:text-sand-400 mb-8">
        Visit our centre or schedule an at-home session. Fingerprint scanning is painless and takes about 15–20 minutes.
      </p>

      <div className="space-y-4 mb-8">
        {[
          { icon: MapPin, title: 'Visit Dream Mantra centre', desc: 'Raja Park, Shastri Nagar or Nirman Nagar — Jaipur' },
          { icon: Clock, title: 'Timing', desc: 'Mon–Sat, 11am–7pm · Call 9680102276 to confirm slot' },
          { icon: Fingerprint, title: 'What to expect', desc: 'Fingertips & palms scanned on imaging device — no ink, no pain' },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex gap-4 p-4 rounded-xl bg-sand-50 dark:bg-sand-800/60 border border-sand-100 dark:border-sand-700"
          >
            <item.icon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{item.title}</p>
              <p className="text-sm text-sand-600 dark:text-sand-400 mt-0.5">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <button type="button" onClick={onConfirm} disabled={saving} className="btn-primary inline-flex items-center gap-2 !px-8">
        <CheckCircle2 className="w-4 h-4" />
        {saving ? 'Saving…' : 'I have given / scheduled my fingerprints'}
      </button>
    </div>
  );
}
