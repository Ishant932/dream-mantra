import { motion } from 'framer-motion';
import { Users, ExternalLink, MessageCircle, CheckCircle2 } from 'lucide-react';

export default function AssessmentCommunityStep({ communityLink, onJoin, saving }) {
  const hasLink = Boolean(communityLink?.trim());

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Users className="w-8 h-8 text-amber-600" />
        <h1 className="font-display text-2xl md:text-3xl font-bold">Join the AI Career Launchpad Community</h1>
      </div>
      <p className="text-sand-600 dark:text-sand-400 mb-8">
        Connect with your cohort, access session recordings, assignments, and peer support — all in one place.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-700/40 mb-8"
      >
        <MessageCircle className="w-10 h-10 text-amber-600 mb-3" />
        <p className="font-bold text-lg">WhatsApp / Community Group</p>
        <p className="text-sm text-sand-600 dark:text-sand-400 mt-2">
          {hasLink
            ? 'Click below to join your batch community. Introduce yourself after joining!'
            : 'Your community link will appear here once the admin publishes it. Check back soon or contact support at 9680102276.'}
        </p>
        {hasLink && (
          <a
            href={communityLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2 mt-4"
          >
            Open community link <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </motion.div>

      <button
        type="button"
        onClick={onJoin}
        disabled={saving || !hasLink}
        className="btn-primary inline-flex items-center gap-2 !px-8 disabled:opacity-50"
      >
        <CheckCircle2 className="w-4 h-4" />
        {saving ? 'Saving…' : 'I have joined the community'}
      </button>
    </div>
  );
}
