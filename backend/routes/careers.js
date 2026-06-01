import { Router } from 'express';
import { loadCareersData, queryCareers, getCareerBySlug } from '../lib/careersData.js';

const router = Router();

router.get('/', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json(queryCareers(req.query));
});

router.get('/categories', (_, res) => {
  res.set('Cache-Control', 'public, max-age=600');
  const data = loadCareersData();
  const categories = [...new Set((data.careers || []).map((c) => c.category))].sort();
  res.json({ categories, total: data.careers?.length || 0 });
});

router.get('/:slug', (req, res) => {
  const result = getCareerBySlug(req.params.slug);
  if (!result) return res.status(404).json({ message: 'Career not found' });
  res.set('Cache-Control', 'public, max-age=600');
  res.json(result);
});

export default router;
