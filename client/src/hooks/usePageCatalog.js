import { useEffect, useState } from 'react';
import { pagesApi } from '../api';

export function usePageCatalog(slug) {
  const [cms, setCms] = useState(null);
  useEffect(() => {
    if (!slug) return;
    pagesApi.get(slug).then((r) => setCms(r.page || null)).catch(() => setCms(null));
  }, [slug]);
  return cms;
}
