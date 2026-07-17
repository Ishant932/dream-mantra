import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Brain, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

const FEATURE_ICONS = {
  matcher: Brain,
  predictor: TrendingUp,
  skills: Zap,
};

export default function AIFeatures() {
  const { d } = useLang();
  const content = d('aiFeatures');
  const features = useMemo(
    () => content.features.map((f) => ({ ...f, icon: FEATURE_ICONS[f.id] })),
    [content.features],
  );
  const quizQuestions = content.quiz.questions;

  const [activeFeature, setActiveFeature] = useState('matcher');
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);

  const handleQuizAnswer = (index) => {
    const newAnswers = [...quizAnswers, index];
    setQuizAnswers(newAnswers);
    
    if (newAnswers.length === quizQuestions.length) {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setQuizAnswers([]);
    setQuizComplete(false);
  };

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-[var(--bg-elevated)]">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-200/30 to-brand-300/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-gold-200/20 to-brand-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          className="text-center mb-16"
        >
          <h2 className="section-title">
            <Zap className="w-8 h-8 inline text-brand-600 mr-3 animate-pulse" />
            {content.title}
          </h2>
          <p className="text-sand-600 mt-4 max-w-2xl mx-auto text-lg">
            {content.subtitle}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => {
                    setActiveFeature(feature.id);
                    resetQuiz();
                  }}
                  className={`w-full text-left p-6 rounded-2xl transition-all duration-300 ${
                    activeFeature === feature.id
                      ? 'bg-[var(--bg-elevated)] shadow-xl ring-2 ring-brand-400 border-0 scale-[1.02]'
                      : 'bg-[var(--bg-elevated)]/60 border-2 border-transparent hover:border-brand-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Icon className={`w-6 h-6 mt-1 flex-shrink-0 ${activeFeature === feature.id ? 'text-brand-600' : 'text-sand-400'}`} />
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg ${activeFeature === feature.id ? 'text-brand-700' : 'text-sand-700'}`}>
                        {feature.title}
                      </h3>
                      <p className="text-sand-600 text-sm mt-1">{feature.desc}</p>
                      <span className="text-xs font-semibold text-brand-600 mt-2 inline-block">
                        ⚡ {feature.badge}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="h-full"
          >
            <AnimatePresence mode="wait">
              {activeFeature === 'matcher' && (
                <motion.div
                  key="matcher"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="infigon-card p-8 h-full flex flex-col glow-card"
                >
                  {!quizComplete ? (
                    <>
                      <div className="mb-6">
                        <p className="text-sm font-semibold text-brand-600">{content.quiz.questionOf} {quizAnswers.length + 1} {content.quiz.of} {quizQuestions.length}</p>
                        <div className="w-full bg-sand-200 rounded-full h-2 mt-2">
                          <motion.div
                            className="bg-gradient-to-r from-brand-500 to-brand-600 h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(quizAnswers.length / quizQuestions.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>

                      <h3 className="text-xl font-bold mb-6 text-sand-800">
                        {quizQuestions[quizAnswers.length]?.q}
                      </h3>

                      <div className="space-y-3 flex-1">
                        {quizQuestions[quizAnswers.length]?.options.map((option, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.02, x: 4 }}
                            onClick={() => handleQuizAnswer(idx)}
                            className="w-full p-3 rounded-lg bg-sand-50 hover:bg-brand-50 border-2 border-transparent hover:border-brand-300 text-left transition-all text-sand-700 font-medium"
                          >
                            {option}
                          </motion.button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center justify-center h-full text-center"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl">✓</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{content.quiz.complete}</h3>
                      <p className="text-sand-600 mb-6">{content.quiz.recommend}</p>
                      
                      <div className="w-full space-y-3 mb-8">
                        {content.quiz.recommendations.map((career, i) => (
                          <div key={i} className="text-left">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-sand-700">{career.title}</span>
                              <span className="text-brand-600 font-bold">{career.match}%</span>
                            </div>
                            <div className="w-full bg-sand-200 rounded-full h-1.5">
                              <motion.div
                                className="bg-gradient-to-r from-brand-500 to-brand-600 h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${career.match}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={resetQuiz}
                        className="btn-outline mb-3"
                      >
                        {content.quiz.retake}
                      </button>
                      <Link
                        to="/counselling?tab=psychometric"
                        className="btn-primary w-full inline-flex items-center justify-center"
                      >
                        {content.quiz.getAssessment} <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeFeature === 'predictor' && (
                <motion.div
                  key="predictor"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="infigon-card p-8 h-full glow-card"
                >
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                      <p className="text-sm text-amber-800">
                        <strong>{content.predictor.predicted}</strong> {content.predictor.predictedValue}
                      </p>
                    </div>
                    <div className="space-y-3">
                      {content.predictor.streams.map((item, i) => (
                        <div key={i}>
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-sand-700">{item.stream}</span>
                            <span className="text-brand-600 font-bold">{item.confidence}%</span>
                          </div>
                          <div className="w-full bg-sand-200 rounded-full h-2">
                            <motion.div
                              className="bg-gradient-to-r from-brand-500 to-brand-600 h-full rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${item.confidence}%` }}
                              transition={{ duration: 0.8, delay: i * 0.15 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link to="/counselling" className="btn-primary w-full mt-6">
                      {content.predictor.confirm}
                    </Link>
                  </div>
                </motion.div>
              )}

              {activeFeature === 'skills' && (
                <motion.div
                  key="skills"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="infigon-card p-8 h-full glow-card"
                >
                  <h3 className="font-bold text-xl mb-4">{content.skills.title}</h3>
                  <div className="space-y-3 mb-6">
                    {content.skills.items.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-3 rounded-lg bg-sand-50 border border-sand-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sand-800">{item.skill}</p>
                            <p className="text-xs text-sand-600">{item.level}</p>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            item.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                            item.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <Link to="/contact" className="btn-primary w-full">
                    {content.skills.getRoadmap}
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
