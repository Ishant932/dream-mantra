import { motion } from 'framer-motion';
import {
  User, Mail, Phone, GraduationCap, MapPin, Target, Building2, Calendar, Users,
  BookOpen, Heart, PhoneCall, Globe, Sparkles, AlertCircle,
} from 'lucide-react';
import CopyableUserId from './CopyableUserId';

const FIELDS = [
  { key: 'dateOfBirth', label: 'Date of Birth', icon: Calendar },
  { key: 'gender', label: 'Gender', icon: Users },
  { key: 'city', label: 'City', icon: MapPin },
  { key: 'state', label: 'State', icon: MapPin },
  { key: 'classLevel', label: 'Class / Level', icon: GraduationCap },
  { key: 'stream', label: 'Stream / Interest', icon: Target },
  { key: 'board', label: 'Board / Curriculum', icon: BookOpen },
  { key: 'schoolOrCollege', label: 'School / College', icon: Building2 },
  { key: 'careerGoal', label: 'Career Goal', icon: Target },
  { key: 'hobbies', label: 'Hobbies & Interests', icon: Heart },
  { key: 'biggestChallenge', label: 'Biggest Challenge', icon: AlertCircle },
  { key: 'parentName', label: 'Parent / Guardian', icon: Users },
  { key: 'parentPhone', label: 'Parent Contact', icon: PhoneCall },
  { key: 'whatsappNumber', label: 'WhatsApp Number', icon: Phone },
  { key: 'preferredMode', label: 'Counselling Mode', icon: Globe },
  { key: 'howHeard', label: 'How You Found Us', icon: Sparkles },
];

export default function ProfileDetailsCard({
  user,
  profile,
  profileCompletion,
  variant = 'light',
  showHeader = true,
  onEdit,
}) {
  const p = profile || {};
  const filledCount = FIELDS.filter((f) => String(p[f.key] || '').trim()).length;
  const isDark = variant === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-6 ${
        isDark
          ? 'bg-sand-900/60 border-sand-700'
          : 'infigon-card border-amber-100 dark:border-sand-600'
      }`}
    >
      {showHeader && (
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold ${
              isDark ? 'bg-amber-600 text-amber-50' : 'bg-gradient-to-br from-amber-500 to-orange-600 text-amber-50'
            }`}>
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <h3 className={`font-display text-lg font-bold ${isDark ? 'text-amber-50' : ''}`}>
                {user?.name || 'User Profile'}
              </h3>
              {user?.user_uid && (
                <div className="mt-1.5">
                  <CopyableUserId uid={user.user_uid} compact={isDark} />
                </div>
              )}
              <div className={`flex flex-wrap gap-3 text-sm mt-1 ${isDark ? 'text-sand-400' : 'text-sand-500'}`}>
                {user?.email && (
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
                )}
                {user?.phone && (
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {user.phone}</span>
                )}
              </div>
            </div>
          </div>
          {profileCompletion != null && (
            <div className="text-right">
              <p className={`text-2xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                {profileCompletion}%
              </p>
              <p className={`text-xs ${isDark ? 'text-sand-500' : 'text-sand-400'}`}>Profile complete</p>
            </div>
          )}
        </div>
      )}

      {filledCount === 0 ? (
        <div className={`text-center py-8 rounded-xl ${isDark ? 'bg-sand-800/50' : 'bg-sand-50 dark:bg-sand-800/40'}`}>
          <User className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-sand-600' : 'text-sand-300'}`} />
          <p className={`text-sm ${isDark ? 'text-sand-400' : 'text-sand-500'}`}>
            No profile details saved yet.
          </p>
          {onEdit && (
            <button type="button" onClick={onEdit} className="btn-primary mt-4 !py-2 !px-4 text-sm">
              Fill Profile Form
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FIELDS.map((f) => {
            const value = String(p[f.key] || '').trim();
            const Icon = f.icon;
            return (
              <div
                key={f.key}
                className={`p-3 rounded-xl border text-sm ${
                  value
                    ? isDark
                      ? 'bg-sand-800/80 border-sand-700'
                      : 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/40'
                    : isDark
                      ? 'bg-sand-800/30 border-sand-800 opacity-60'
                      : 'bg-sand-50 dark:bg-sand-800/30 border-sand-100 dark:border-sand-700 opacity-70'
                }`}
              >
                <p className={`text-[10px] font-semibold uppercase tracking-wide flex items-center gap-1 mb-0.5 ${
                  isDark ? 'text-sand-500' : 'text-sand-400'
                }`}>
                  <Icon className="w-3 h-3" /> {f.label}
                </p>
                <p className={`font-medium text-xs ${isDark ? 'text-amber-50' : 'text-sand-800 dark:text-sand-200'}`}>
                  {value || '—'}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {onEdit && filledCount > 0 && (
        <button type="button" onClick={onEdit} className={`mt-5 text-sm font-semibold ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'}`}>
          Edit profile details →
        </button>
      )}

      {user?.created_at && (
        <p className={`text-xs mt-4 pt-4 border-t ${isDark ? 'text-sand-600 border-sand-800' : 'text-sand-400 border-sand-100'}`}>
          Member since {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      )}
    </motion.div>
  );
}
