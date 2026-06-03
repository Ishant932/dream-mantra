import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Clock, CheckCircle2, Loader2, MapPin } from 'lucide-react';
import PageHero from '../components/PageHero';
import TrendPhoto from '../components/TrendPhoto';
import FooterLocations from '../components/FooterLocations';
import { IMAGES } from '../data/content';
import { useLang } from '../context/LanguageContext';
import { publicApi } from '../api';

/** Clear educational counselling / workshop imagery (not street or roadside scenes) */
const CONTACT_EDU_IMAGE = IMAGES.counsellingSession;
const CONTACT_WORKSHOP_IMAGE = IMAGES.workshop;

export default function Contact() {
  const { t, d } = useLang();
  const contact = d('pages.contact');
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await publicApi.submitContact(form);
      setSuccess(res.message || contact.thankYou);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setError(err.message || 'Could not send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        title={contact.title}
        subtitle={contact.subtitle}
        image={CONTACT_EDU_IMAGE}
        className="contact-page-hero"
      />
      <section className="py-20 max-w-7xl mx-auto px-4 contact-page">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-6">
            {[
              { href: 'tel:9680102276', icon: Phone, label: contact.phone, value: t('footer.phone') },
              { href: 'mailto:info@dreammantra.in', icon: Mail, label: contact.email, value: t('footer.email') },
            ].map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.45 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="glass-card p-6 flex items-center gap-4 hover:shadow-lg transition block"
              >
                <motion.div
                  className="w-14 h-14 rounded-xl bg-brand-100 flex items-center justify-center"
                  whileHover={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <item.icon className="w-7 h-7 text-brand-600" />
                </motion.div>
                <div><p className="text-sm text-theme-muted">{item.label}</p><p className="font-bold text-xl text-theme-primary">{item.value}</p></div>
              </motion.a>
            ))}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.45 }}
              whileHover={{ y: -4 }}
              className="glass-card p-6 flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-xl bg-brand-100 flex items-center justify-center"><Clock className="w-7 h-7 text-brand-600" /></div>
              <div><p className="text-sm text-theme-muted">{contact.hours}</p><p className="font-bold text-theme-primary">{t('footer.hours')}</p></div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.45 }}
              className="glass-card p-6"
            >
              <p className="contact-locations-heading">
                <MapPin className="w-4 h-4 text-amber-600" aria-hidden="true" />
                {contact.locations}
              </p>
              <FooterLocations variant="embedded" />
              <p className="text-amber-700 dark:text-amber-300 mt-4 font-semibold text-sm">{contact.panIndia}</p>
            </motion.div>
          </motion.div>
          <div className="space-y-6">
            <TrendPhoto
              src={CONTACT_WORKSHOP_IMAGE}
              alt="Career counselling and education workshop at Dream Mantra"
              rounded="rounded-2xl"
              overlay={false}
              aspect="aspect-[16/10]"
              className="contact-edu-photo shadow-xl ring-1 ring-amber-200/70 dark:ring-amber-700/40"
            />
            <motion.form
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="glass-card p-8"
              onSubmit={handleSubmit}
            >
              <h3 className="font-display text-xl font-bold mb-6 text-theme-primary">{contact.formTitle}</h3>
              {success && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
                </div>
              )}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
              )}
              <div className="space-y-4">
                <input className="input-field" placeholder={contact.namePlaceholder} required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                <input className="input-field" type="email" placeholder={contact.emailPlaceholder} required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                <input className="input-field" placeholder={contact.phonePlaceholder} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                <textarea className="input-field min-h-[120px]" placeholder={contact.messagePlaceholder} required minLength={10} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
                <button type="submit" disabled={submitting} className="btn-primary w-full inline-flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {submitting ? 'Sending…' : contact.submit}
                </button>
              </div>
            </motion.form>
          </div>
        </div>
      </section>
    </>
  );
}
