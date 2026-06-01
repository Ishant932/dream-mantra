import { useState, useEffect } from 'react';

import { Link, useParams } from 'react-router-dom';

import { motion } from 'framer-motion';

import {

  ArrowLeft, Briefcase, GraduationCap, IndianRupee, TrendingUp,

  Building2, Target, BookOpen, CheckCircle2, Clock, Shield, Users, Route,

  Wrench, Globe, Award, AlertTriangle, Sparkles,

} from 'lucide-react';

import { careersApi } from '../api';
import { getCareerBySlugLocal } from '../utils/loadCareers';
import CareerRoadmapFlow from '../components/CareerRoadmapFlow';

export default function CareerDetailPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const local = await getCareerBySlugLocal(slug);
        if (!cancelled) setData(local);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }

      careersApi.get(slug).then((res) => {
        if (!cancelled && res?.career) setData(res);
      }).catch(() => {});
    })();

    return () => { cancelled = true; };
  }, [slug]);



  if (loading) {

    return (

      <div className="min-h-screen pt-32 flex justify-center">

        <div className="w-14 h-14 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />

      </div>

    );

  }



  if (!data?.career) {

    return (

      <div className="min-h-screen pt-32 text-center px-4">

        <h1 className="text-2xl font-bold">Career not found</h1>

        <Link to="/careers" className="btn-primary mt-6 inline-flex">Browse all careers</Link>

      </div>

    );

  }



  const { career, related } = data;



  return (

    <div className="min-h-screen career-detail-root bg-gradient-to-b from-amber-50/50 to-[var(--bg-base)] dark:from-[var(--bg-base)] dark:via-[var(--bg-muted)] dark:to-[var(--bg-alt)]">

      <section className="relative pt-28 pb-12 overflow-hidden">

        <div className="absolute inset-0 dm-spectrum-bg opacity-95" />

        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-7xl mx-auto px-4">

          <Link to="/careers" className="inline-flex items-center gap-2 text-amber-200 hover:text-amber-50 mb-6 text-sm font-medium">

            <ArrowLeft className="w-4 h-4" /> 950+ Career Opportunities

          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4">

            <span className="px-3 py-1 rounded-full bg-[var(--bg-elevated)]/20 text-amber-50 text-sm">{career.category}</span>

            <span className="px-3 py-1 rounded-full bg-amber-400/30 text-amber-100 text-sm font-semibold">{career.outlook} Outlook</span>

            {career.aiResilience && (

              <span className="px-3 py-1 rounded-full bg-amber-400/30 text-amber-100 text-sm font-semibold">AI Resilience: {career.aiResilience}</span>

            )}

          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-amber-50 mb-4">{career.title}</h1>

          <p className="text-amber-100 text-lg max-w-3xl">{career.shortDescription}</p>

          <div className="flex flex-wrap gap-4 mt-8">

            <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-elevated)]/15 text-amber-50 text-sm">

              <IndianRupee className="w-4 h-4" /> {career.salaryDisplay}

            </span>

            <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-elevated)]/15 text-amber-50 text-sm">

              <TrendingUp className="w-4 h-4" /> Demand: {career.demand}

            </span>

            <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-elevated)]/15 text-amber-50 text-sm">

              Stream: {career.stream?.join(', ')}

            </span>

          </div>

        </motion.div>

      </section>



      <section className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-10">

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-8">

          {/* Career Roadmap Flowchart */}

          {career.roadmap?.length > 0 && (

            <CareerRoadmapFlow steps={career.roadmap} title={career.title} />

          )}



          <div className="infigon-card p-8">

            <h2 className="font-display text-xl font-bold flex items-center gap-2 mb-4">

              <Briefcase className="w-6 h-6 text-amber-600" /> About this career

            </h2>

            <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{career.description}</p>

          </div>



          {career.dayInLife && (

            <div className="infigon-card p-8">

              <h2 className="font-display text-xl font-bold flex items-center gap-2 mb-4">

                <Clock className="w-6 h-6 text-amber-600" /> Day in the life

              </h2>

              <p className="text-[var(--text-secondary)] leading-relaxed">{career.dayInLife}</p>

            </div>

          )}



          {career.responsibilities?.length > 0 && (

            <DetailBlock icon={Target} title="Key Responsibilities" items={career.responsibilities} />

          )}



          {career.jobRoles?.length > 0 && (

            <DetailBlock icon={Award} title="Career Levels & Job Roles" items={career.jobRoles} />

          )}



          {career.salaryProgression?.length > 0 && (

            <DetailBlock icon={IndianRupee} title="Salary Progression" items={career.salaryProgression} />

          )}



          <div className="grid md:grid-cols-2 gap-6">

            <DetailBlock icon={GraduationCap} title="Education" items={career.education} />

            <DetailBlock icon={Target} title="Key Skills" items={career.skills} />

            {career.softSkills?.length > 0 && (

              <DetailBlock icon={Sparkles} title="Soft Skills" items={career.softSkills} />

            )}

            {career.hardSkills?.length > 0 && (

              <DetailBlock icon={Wrench} title="Hard Skills" items={career.hardSkills} />

            )}

            <DetailBlock icon={BookOpen} title="Entrance Exams" items={career.exams} />

            <DetailBlock icon={Building2} title="Top Institutes" items={career.institutes} />

            {career.certifications?.length > 0 && (

              <DetailBlock icon={Shield} title="Certifications" items={career.certifications} />

            )}

            {career.courses?.length > 0 && (

              <DetailBlock icon={BookOpen} title="Recommended Courses" items={career.courses} />

            )}

            {career.topEmployers?.length > 0 && (

              <DetailBlock icon={Users} title="Top Employers" items={career.topEmployers} />

            )}

            {career.industries?.length > 0 && (

              <DetailBlock icon={Building2} title="Industries" items={career.industries} />

            )}

            {career.toolsAndTech?.length > 0 && (

              <DetailBlock icon={Wrench} title="Tools & Technology" items={career.toolsAndTech} />

            )}

            {career.higherStudies?.length > 0 && (

              <DetailBlock icon={GraduationCap} title="Higher Studies Options" items={career.higherStudies} />

            )}

          </div>



          {career.perks?.length > 0 && (

            <DetailBlock icon={Sparkles} title="Career Perks & Benefits" items={career.perks} />

          )}



          {career.challenges?.length > 0 && (

            <DetailBlock icon={AlertTriangle} title="Challenges to Consider" items={career.challenges} />

          )}



          {career.internshipPath && (

            <div className="infigon-card p-6">

              <h3 className="font-bold flex items-center gap-2 mb-3">

                <Route className="w-5 h-5 text-amber-600" /> Internship Path

              </h3>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{career.internshipPath}</p>

            </div>

          )}



          {career.globalOpportunities && (

            <div className="infigon-card p-6 bg-gradient-to-br from-amber-50 to-amber-50 dark:from-amber-900/20 dark:to-amber-900/10">

              <h3 className="font-bold flex items-center gap-2 mb-3">

                <Globe className="w-5 h-5 text-amber-600" /> Global Opportunities

              </h3>

              <p className="text-sm text-[var(--text-secondary)]">{career.globalOpportunities}</p>

            </div>

          )}



          {career.prosAndCons && (

            <div className="grid md:grid-cols-2 gap-6">

              <DetailBlock icon={CheckCircle2} title="Pros" items={career.prosAndCons.pros} />

              <DetailBlock icon={AlertTriangle} title="Cons" items={career.prosAndCons.cons} />

            </div>

          )}



          {career.futureScope && (

            <div className="infigon-card p-8 bg-gradient-to-br from-amber-50 to-amber-50 dark:from-amber-900/20 dark:to-amber-900/10">

              <h2 className="font-display text-xl font-bold flex items-center gap-2 mb-4">

                <TrendingUp className="w-6 h-6 text-amber-600" /> Future scope

              </h2>

              <p className="text-[var(--text-secondary)]">{career.futureScope}</p>

            </div>

          )}

        </motion.div>



        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">

          <div className="infigon-card p-6 sticky top-28">

            <h3 className="font-bold text-lg mb-4">Quick facts</h3>

            <dl className="space-y-3 text-sm">

              <Fact label="Eligibility" value={career.eligibility} />

              <Fact label="Duration" value={career.duration} />

              <Fact label="Work environment" value={career.workEnvironment} />

              <Fact label="Salary" value={career.salaryDisplay} />

              {career.growthPath && <Fact label="Growth path" value={career.growthPath} />}

              {career.aiResilience && <Fact label="AI resilience" value={career.aiResilience} />}

              {career.workLifeBalance && <Fact label="Work-life balance" value={career.workLifeBalance} />}

            </dl>

            <Link to="/contact" className="btn-primary w-full mt-6 text-center block">Book Counselling</Link>

            <Link to="/assessments/dmit-psychometric" className="btn-outline w-full mt-3 text-center block">Take Mind Mapping + Skill Mapping</Link>

          </div>

        </motion.div>

      </section>



      {related?.length > 0 && (

        <section className="max-w-7xl mx-auto px-4 pb-20">

          <h2 className="font-display text-2xl font-bold mb-6">Related careers</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {related.map((r, i) => (

              <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>

                <Link to={`/careers/${r.slug}`} className="block infigon-card p-4 hover:border-amber-400 transition">

                  <p className="font-semibold hover:text-amber-700">{r.title}</p>

                  <p className="text-xs text-[var(--text-muted)] mt-1">{r.salaryDisplay}</p>

                </Link>

              </motion.div>

            ))}

          </div>

        </section>

      )}

    </div>

  );

}



function DetailBlock({ icon: Icon, title, items }) {

  return (

    <div className="infigon-card p-6">

      <h3 className="font-bold flex items-center gap-2 mb-3">

        <Icon className="w-5 h-5 text-amber-600" /> {title}

      </h3>

      <ul className="space-y-2">

        {items?.map((item) => (

          <li key={item} className="flex gap-2 text-sm text-[var(--text-secondary)]">

            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />

            {item}

          </li>

        ))}

      </ul>

    </div>

  );

}



function Fact({ label, value }) {

  return (

    <div>

      <dt className="text-[var(--text-muted)]">{label}</dt>
      <dd className="font-medium text-[var(--text-primary)]">{value}</dd>

    </div>

  );

}


