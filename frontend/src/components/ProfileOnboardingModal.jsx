import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, GraduationCap, MapPin, Target, User, ChevronRight, ChevronLeft,
  CheckCircle2, Heart, Users, BookOpen, Phone, Globe,
} from 'lucide-react';

const STEP_THEMES = [
  { gradient: 'from-amber-600 via-orange-600 to-orange-600', accent: 'bg-amber-500', ring: 'ring-amber-400' },
  { gradient: 'from-orange-600 via-amber-600 to-yellow-600', accent: 'bg-orange-500', ring: 'ring-orange-400' },
];

const STEPS = [
  {
    id: 1,
    title: 'About You & Education',
    subtitle: 'Basic details, class, stream & where you study',
    icon: GraduationCap,
    fields: ['dateOfBirth', 'gender', 'city', 'state', 'classLevel', 'stream', 'board', 'schoolOrCollege'],
  },
  {
    id: 2,
    title: 'Goals & Contact',
    subtitle: 'Your dreams, WhatsApp number & how we can reach you',
    icon: Heart,
    fields: ['careerGoal', 'hobbies', 'biggestChallenge', 'whatsappNumber', 'parentName', 'parentPhone', 'preferredMode', 'howHeard'],
  },
];

const HOBBY_OPTIONS = [
  'Sports', 'Music', 'Art', 'Coding', 'Reading', 'Science',
  'Dance', 'Gaming', 'Writing', 'Debate', 'Nature', 'Business',
];

const FIELD_CONFIG = {
  dateOfBirth: { label: 'Date of Birth', type: 'date', required: true, icon: User },
  gender: {
    label: 'Gender',
    type: 'select',
    required: true,
    icon: Users,
    options: [
      { value: '', label: 'Select gender' },
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Other', label: 'Other' },
      { value: 'Prefer not to say', label: 'Prefer not to say' },
    ],
  },
  city: { label: 'City', type: 'text', placeholder: 'e.g. Jaipur', required: true, icon: MapPin },
  state: {
    label: 'State',
    type: 'select',
    required: true,
    icon: MapPin,
    options: [
      { value: '', label: 'Select state' },
      { value: 'Rajasthan', label: 'Rajasthan' },
      { value: 'Delhi', label: 'Delhi NCR' },
      { value: 'Maharashtra', label: 'Maharashtra' },
      { value: 'Karnataka', label: 'Karnataka' },
      { value: 'Gujarat', label: 'Gujarat' },
      { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
      { value: 'Other', label: 'Other State' },
    ],
  },
  classLevel: {
    label: 'Class / Level',
    type: 'select',
    required: true,
    icon: GraduationCap,
    options: [
      { value: '', label: 'Select class / level' },
      { value: 'Class 1-5', label: 'Class 1-5' },
      { value: 'Class 6-8', label: 'Class 6-8' },
      { value: 'Class 9-10', label: 'Class 9-10' },
      { value: 'Class 11-12', label: 'Class 11-12' },
      { value: 'College', label: 'College Student' },
      { value: 'Working Professional', label: 'Working Professional' },
    ],
  },
  stream: {
    label: 'Stream / Interest',
    type: 'select',
    required: true,
    icon: BookOpen,
    options: [
      { value: '', label: 'Select stream' },
      { value: 'Science (PCM)', label: 'Science (PCM)' },
      { value: 'Science (PCB)', label: 'Science (PCB)' },
      { value: 'Commerce', label: 'Commerce' },
      { value: 'Arts / Humanities', label: 'Arts / Humanities' },
      { value: 'Technology / IT', label: 'Technology / IT' },
      { value: 'Undecided', label: 'Not sure yet' },
    ],
  },
  board: {
    label: 'Board / Curriculum',
    type: 'select',
    icon: BookOpen,
    options: [
      { value: '', label: 'Select board' },
      { value: 'CBSE', label: 'CBSE' },
      { value: 'ICSE / ISC', label: 'ICSE / ISC' },
      { value: 'Rajasthan Board (RBSE)', label: 'Rajasthan Board (RBSE)' },
      { value: 'State Board', label: 'Other State Board' },
      { value: 'IB / International', label: 'IB / International' },
      { value: 'College / University', label: 'College / University' },
    ],
  },
  schoolOrCollege: {
    label: 'School / College Name',
    type: 'text',
    placeholder: 'e.g. Delhi Public School, Jaipur',
    icon: GraduationCap,
  },
  careerGoal: {
    label: 'Dream Career / Goal',
    type: 'text',
    placeholder: 'e.g. Software Engineer, Doctor, CA, Designer…',
    required: true,
    icon: Target,
  },
  hobbies: { label: 'Hobbies & Interests', type: 'hobbies', icon: Heart },
  biggestChallenge: {
    label: 'Biggest Career Challenge Right Now',
    type: 'select',
    icon: Target,
    options: [
      { value: '', label: 'Select one' },
      { value: 'Stream selection confusion', label: 'Stream selection confusion' },
      { value: 'Choosing right career', label: 'Choosing the right career' },
      { value: 'Parent / peer pressure', label: 'Parent or peer pressure' },
      { value: 'Exam & board stress', label: 'Exam & board stress' },
      { value: 'Low confidence / clarity', label: 'Low confidence or clarity' },
      { value: 'Career switch', label: 'Want to switch career' },
    ],
  },
  parentName: { label: 'Parent / Guardian Name', type: 'text', placeholder: 'Optional', icon: Users },
  parentPhone: { label: 'Parent Contact Number', type: 'tel', placeholder: 'Optional — 10 digit mobile', icon: Phone },
  whatsappNumber: {
    label: 'Registered WhatsApp Number',
    type: 'tel',
    placeholder: '10-digit WhatsApp number',
    required: true,
    icon: Phone,
    hint: 'All the updates will be shared on this number only.',
  },
  preferredMode: {
    label: 'Preferred Counselling Mode',
    type: 'select',
    icon: Globe,
    options: [
      { value: '', label: 'Select preference' },
      { value: 'Online', label: 'Online (Pan-India)' },
      { value: 'Offline Jaipur', label: 'Offline — Jaipur centre' },
      { value: 'Both', label: 'Both online & offline' },
    ],
  },
  howHeard: {
    label: 'How did you find Dream Mantra?',
    type: 'select',
    icon: Sparkles,
    options: [
      { value: '', label: 'Select one' },
      { value: 'Google Search', label: 'Google Search' },
      { value: 'Instagram', label: 'Instagram' },
      { value: 'Friend / Family', label: 'Friend or Family' },
      { value: 'School / Teacher', label: 'School or Teacher' },
      { value: 'WhatsApp', label: 'WhatsApp' },
      { value: 'Other', label: 'Other' },
    ],
  },
};

export const emptyForm = {
  classLevel: '',
  stream: '',
  city: '',
  state: '',
  board: '',
  schoolOrCollege: '',
  careerGoal: '',
  dateOfBirth: '',
  gender: '',
  hobbies: '',
  biggestChallenge: '',
  parentName: '',
  parentPhone: '',
  whatsappNumber: '',
  preferredMode: '',
  howHeard: '',
};

const fieldVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.07, type: 'spring', stiffness: 380, damping: 28 },
  }),
};

function HobbyPicker({ value, onChange }) {
  const selected = value ? value.split(',').map((s) => s.trim()).filter(Boolean) : [];

  const toggle = (hobby) => {
    const next = selected.includes(hobby)
      ? selected.filter((h) => h !== hobby)
      : [...selected, hobby].slice(0, 6);
    onChange(next.join(', '));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {HOBBY_OPTIONS.map((h, i) => {
        const active = selected.includes(h);
        return (
          <motion.button
            key={h}
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => toggle(h)}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold border-2 transition-all ${
              active
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-amber-50 border-transparent shadow-md'
                : 'bg-[var(--bg-elevated)] dark:bg-sand-800 text-sand-600 dark:text-sand-300 border-sand-200 dark:border-sand-600 hover:border-amber-400'
            }`}
          >
            {h}
          </motion.button>
        );
      })}
    </div>
  );
}

export default function ProfileOnboardingModal({ open, initialProfile, onSave, onSkip, saving }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ ...emptyForm, ...initialProfile });
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (open) {
      setForm({ ...emptyForm, ...initialProfile });
      setStep(0);
      setDirection(1);
    }
  }, [open, initialProfile]);

  const current = STEPS[step];
  const theme = STEP_THEMES[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const canNext = () => {
    if (step === 0) {
      return form.dateOfBirth && form.gender && form.city.trim() && form.state && form.classLevel && form.stream;
    }
    const whatsapp = String(form.whatsappNumber || '').replace(/\D/g, '');
    return form.careerGoal.trim() && whatsapp.length >= 10;
  };

  const goNext = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-brand-950/60 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 40, rotateX: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="relative w-full max-w-md sm:max-w-lg bg-[var(--bg-elevated)] dark:bg-[#523010] rounded-3xl shadow-2xl overflow-hidden border border-amber-100/20"
          style={{ perspective: 1000 }}
        >
          {/* Animated header */}
          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`relative bg-gradient-to-br ${theme.gradient} px-5 sm:px-6 pt-5 pb-7 text-amber-50 overflow-hidden`}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-16 -right-16 w-40 h-40 rounded-full border border-amber-100/10"
            />
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-brand-950/20 to-transparent"
            />

            <button
              type="button"
              onClick={onSkip}
              className="absolute top-3 right-3 p-2 rounded-full bg-[var(--bg-elevated)]/15 hover:bg-[var(--bg-elevated)]/25 transition z-10"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Step dots */}
            <div className="flex gap-2 mb-4 relative z-10">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.id}
                  animate={{
                    scale: i === step ? 1.15 : 1,
                    opacity: i <= step ? 1 : 0.4,
                  }}
                  className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-[var(--bg-elevated)]' : 'bg-[var(--bg-elevated)]/30'}`}
                />
              ))}
            </div>

            <motion.div
              key={`head-${step}`}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative z-10 flex items-center gap-3"
            >
              <motion.div
                animate={{ rotate: [0, 6, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-11 h-11 rounded-2xl bg-[var(--bg-elevated)]/20 backdrop-blur flex items-center justify-center ring-2 ring-white/30"
              >
                <current.icon className="w-5 h-5" />
              </motion.div>
              <div>
                <span className="text-[10px] font-bold text-amber-50/80 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Step {step + 1} of {STEPS.length}
                </span>
                <h2 className="font-display text-lg sm:text-xl font-bold">{current.title}</h2>
                <p className="text-xs text-amber-50/85">{current.subtitle}</p>
              </div>
            </motion.div>

            <div className="mt-4 h-1 bg-[var(--bg-elevated)]/20 rounded-full overflow-hidden relative z-10">
              <motion.div
                className="h-full bg-[var(--bg-elevated)] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </motion.div>

          {/* Form body */}
          <div className="px-5 sm:px-6 py-5 max-h-[min(52vh,420px)] overflow-y-auto bg-gradient-to-b from-sand-50/80 to-[var(--bg-base)] dark:from-sand-900/50 dark:to-[#523010]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.28 }}
                className="space-y-3.5"
              >
                {current.fields.map((key, i) => {
                  const cfg = FIELD_CONFIG[key];
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={key}
                      custom={i}
                      variants={fieldVariants}
                      initial="hidden"
                      animate="show"
                    >
                      <label className="text-xs font-bold text-sand-600 dark:text-sand-400 flex items-center gap-1.5 mb-1.5 uppercase tracking-wide">
                        <span className={`w-5 h-5 rounded-md ${theme.accent} flex items-center justify-center`}>
                          {Icon && <Icon className="w-3 h-3 text-amber-50" />}
                        </span>
                        {cfg.label}
                        {cfg.required && <span className="text-orange-600 normal-case">*</span>}
                      </label>

                      {cfg.type === 'hobbies' ? (
                        <HobbyPicker value={form.hobbies} onChange={(v) => setField('hobbies', v)} />
                      ) : cfg.type === 'select' ? (
                        <select
                          className="input-field !rounded-xl !py-2.5 !text-sm border-2 focus:border-amber-500 transition-colors"
                          value={form[key]}
                          onChange={(e) => setField(key, e.target.value)}
                        >
                          {cfg.options.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={cfg.type || 'text'}
                          className="input-field !rounded-xl !py-2.5 !text-sm border-2 focus:border-amber-500 transition-colors"
                          placeholder={cfg.placeholder}
                          value={form[key]}
                          onChange={(e) => setField(key, e.target.value)}
                        />
                      )}
                      {cfg.hint && (
                        <p className="mt-1.5 text-[11px] text-sand-500 dark:text-sand-400 leading-relaxed pl-0.5">
                          {cfg.hint}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-6 pb-5 pt-3 flex gap-2 sm:gap-3 border-t border-sand-100 dark:border-sand-800 bg-[var(--bg-elevated)] dark:bg-[#523010]">
            {step > 0 ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={goBack}
                className="btn-outline flex-1 !py-2.5 !text-sm flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={onSkip}
                className="btn-outline flex-1 !py-2.5 !text-sm text-sand-500"
              >
                Later
              </motion.button>
            )}
            {step < STEPS.length - 1 ? (
              <motion.button
                type="button"
                disabled={!canNext()}
                whileHover={{ scale: canNext() ? 1.02 : 1 }}
                whileTap={{ scale: canNext() ? 0.98 : 1 }}
                onClick={goNext}
                className={`flex-1 !py-2.5 !text-sm text-amber-50 font-bold rounded-xl flex items-center justify-center gap-1 disabled:opacity-45 bg-gradient-to-r ${theme.gradient} shadow-lg`}
              >
                Continue <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                disabled={saving || !canNext()}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSave(form)}
                className={`flex-1 !py-2.5 !text-sm text-amber-50 font-bold rounded-xl flex items-center justify-center gap-1 bg-gradient-to-r ${theme.gradient} shadow-lg disabled:opacity-45`}
              >
                {saving ? 'Saving…' : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Finish
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
