/** Reload once when the server build changes (prevents stale chunk errors after deploy). */
const VERSION_KEY = 'dm_deploy_version';

export async function ensureLatestDeploy() {
  if (import.meta.env.DEV) return;

  try {
    const res = await fetch('/api/health', { cache: 'no-store' });
    const { version } = await res.json();
    if (!version) return;

    const prev = localStorage.getItem(VERSION_KEY);
    const url = new URL(window.location.href);

    if (prev && prev !== version) {
      localStorage.setItem(VERSION_KEY, version);
      if (url.searchParams.get('_v') === version) return;
      url.searchParams.set('_v', version);
      window.location.replace(`${url.pathname}${url.search}${url.hash}`);
      return;
    }

    localStorage.setItem(VERSION_KEY, version);
    if (url.searchParams.has('_v')) {
      url.searchParams.delete('_v');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  } catch {
    /* offline or API waking up */
  }
}
