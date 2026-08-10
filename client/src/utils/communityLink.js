/** Normalize community link from API — string or { url, title, description, ... } */
export function resolveCommunityUrl(link) {
  if (!link) return '';
  if (typeof link === 'string') return link.trim();
  return String(link.url || '').trim();
}

export function resolveCommunityMeta(link) {
  if (!link || typeof link === 'string') {
    return { url: resolveCommunityUrl(link), title: 'Community', description: '', start_at: null, end_at: null };
  }
  return {
    url: String(link.url || '').trim(),
    title: link.title || 'Community',
    description: link.description || '',
    start_at: link.start_at || null,
    end_at: link.end_at || null,
  };
}
