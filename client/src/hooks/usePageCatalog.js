import { useEffect, useState } from 'react';
import { pagesApi } from '../api';

export function cmsText(cms, key, fallback = '') {
  if (!cms?.hasCustom) return fallback;
  const v = cms?.[key];
  return typeof v === 'string' && v.trim() ? v : fallback;
}

export function usePageCatalog(slug) {
  const [cms, setCms] = useState(null);
  useEffect(() => {
    if (!slug) return;
    pagesApi.get(slug).then((r) => setCms(r.page || null)).catch(() => setCms(null));
  }, [slug]);
  return cms;
}
