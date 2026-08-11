import { useEffect, useState } from 'react';
import { getWhatsAppAgentLink } from '../data/siteLinks';

/** Live WhatsApp agent link (sandbox join or production Hi Esh). */
export function useWhatsAppAgentLink() {
  const [href, setHref] = useState(() => getWhatsAppAgentLink({ sandbox: true }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        const data = await res.json();
        const wa = data?.whatsapp || {};
        if (cancelled) return;
        setHref(getWhatsAppAgentLink({
          sandbox: wa.sandbox !== false,
          joinCode: wa.sandboxJoinCode || 'dream-mantra',
        }));
      } catch {
        /* keep default */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return href;
}
