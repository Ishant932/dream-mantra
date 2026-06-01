import { motion } from 'framer-motion';

import { useLang } from '../context/LanguageContext';



export default function CRPAdditionalHighlights() {

  const { d } = useLang();

  const crp = d('pages.crp');

  const crpAdditionalParameters = d('data.crpAdditionalParameters');



  return (

    <section id="highlights" className="py-16 lg:py-20 scroll-mt-28">

      <motion.div

        initial={{ opacity: 0, y: 24 }}

        whileInView={{ opacity: 1, y: 0 }}

        viewport={{ once: true }}

        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

      >

        <h3 className="section-title text-center mb-3">

          {crp.highlights.title}{' '}

          <span className="gradient-text">{crp.highlights.titleHighlight}</span>

        </h3>

        <p className="text-center text-sand-600 mb-8 max-w-xl mx-auto text-sm">

          {crp.highlights.subtitle}

        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">

          {crpAdditionalParameters.map((item, i) => (

            <motion.div

              key={item.label}

              initial={{ opacity: 0, y: 16, rotateX: -8 }}

              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}

              viewport={{ once: true }}

              transition={{ delay: i * 0.05, duration: 0.4 }}

              whileHover={{ y: -4, scale: 1.02, boxShadow: '0 12px 28px rgba(255,107,74,0.12)' }}

              className="crp-param-card crp-additional-card p-4"

            >

              <motion.span

                className="text-xl mb-2 block"

                animate={{ y: [0, -4, 0] }}

                transition={{ duration: 2.5 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}

              >

                {item.icon}

              </motion.span>

              <h4 className="font-bold text-sm mb-1">{item.label}</h4>

              <p className="text-xs text-sand-600 leading-relaxed">{item.desc}</p>

            </motion.div>

          ))}

        </div>

      </motion.div>

    </section>

  );

}


