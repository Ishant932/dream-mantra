/** Account status helpers for suspend / active users */
export function isUserSuspended(user) {
  if (!user) return false;
  if (user.account_status === 'suspended') {
    if (!user.suspended_until) return true;
    const until = new Date(user.suspended_until);
    if (Number.isNaN(until.getTime())) return true;
    return until > new Date();
  }
  if (user.suspended_until) {
    const until = new Date(user.suspended_until);
    if (!Number.isNaN(until.getTime()) && until > new Date()) return true;
  }
  return false;
}

export function suspensionMessage(user) {
  if (!user?.suspended_until) {
    return 'Your account is suspended. Contact support at 9680102276.';
  }
  const until = new Date(user.suspended_until);
  if (Number.isNaN(until.getTime())) {
    return 'Your account is suspended. Contact support at 9680102276.';
  }
  return `Your account is suspended until ${until.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}. Contact 9680102276 for help.`;
}
