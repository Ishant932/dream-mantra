import { lazy } from 'react';

const RELOAD_KEY = 'dm_chunk_reload';

export function isChunkLoadError(error) {
  const msg = error?.message || String(error || '');
  return (
    msg.includes('Failed to fetch dynamically imported module')
    || msg.includes('Loading chunk')
    || msg.includes('ChunkLoadError')
    || error?.name === 'ChunkLoadError'
  );
}

export function reloadForStaleChunk() {
  if (sessionStorage.getItem(RELOAD_KEY)) return false;
  sessionStorage.setItem(RELOAD_KEY, '1');
  const url = new URL(window.location.href);
  url.searchParams.set('_chunk', String(Date.now()));
  window.location.replace(`${url.pathname}${url.search}${url.hash}`);
  return true;
}

export function clearChunkReloadFlag() {
  try {
    sessionStorage.removeItem(RELOAD_KEY);
  } catch {
    /* ignore */
  }
}

/** Lazy import with one automatic full reload when a post-deploy chunk is missing. */
export function lazyWithRetry(importFn) {
  return lazy(() =>
    importFn().catch((error) => {
      if (isChunkLoadError(error) && reloadForStaleChunk()) {
        return new Promise(() => {});
      }
      clearChunkReloadFlag();
      throw error;
    })
  );
}
