/** Paginated careers via API — avoids downloading the full 5MB+ JSON bundle */
import { careersApi } from '../api';

export function prefetchCareers() {
  return careersApi.list({ page: 1, limit: 1 }).catch(() => null);
}

export async function loadCareersLocal(params = {}) {
  return careersApi.list(params);
}

export function getCachedCareersCount() {
  return 950;
}

export async function getCareerBySlugLocal(slug) {
  return careersApi.get(slug);
}
