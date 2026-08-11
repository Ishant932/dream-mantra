import { Router } from 'express';
import { getPageCatalog, listPageCatalog } from '../lib/pageCatalog.js';
import { getCopyOverrideTrees, listCopyPatches } from '../lib/copyOverrides.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ pages: listPageCatalog() });
});

router.get('/copy-overrides', (_req, res) => {
  res.json({ trees: getCopyOverrideTrees(), patches: listCopyPatches() });
});

router.get('/:slug', (req, res) => {
  const page = getPageCatalog(req.params.slug);
  if (!page) return res.status(404).json({ message: 'Page not found' });
  res.json({ page });
});

export default router;
