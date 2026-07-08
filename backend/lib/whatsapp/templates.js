import { siteUrl } from './config.js';
import { messageCatalog } from './catalog.js';

const LANG = 'en';

/** All automated triggers use plain text (Twilio-friendly). Meta template names kept for optional Meta provider. */
export function buildTemplatePayload(trigger, user, extra = {}) {
  const text = messageCatalog(trigger, user, extra);
  if (text) return { kind: 'text', body: text };

  const name = user?.name?.split(' ')[0] || 'there';
  const uid = user?.user_uid || '';
  const base = siteUrl();

  switch (trigger) {
    case 'welcome':
    case 'welcome_step1':
      return {
        templateName: 'dm_welcome',
        lang: LANG,
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: name },
            { type: 'text', text: uid || 'your Dreams ID' },
            { type: 'text', text: `${base}/dashboard` },
          ],
        }],
      };
    default:
      return null;
  }
}

export function buildTextBody(trigger, user, extra = {}) {
  return messageCatalog(trigger, user, extra)
    || buildTemplatePayload(trigger, user, extra)?.body
    || null;
}
