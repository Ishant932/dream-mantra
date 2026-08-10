import { useEffect } from 'react';
import { UserMessagesPanel } from '../MessagesPanel';

export default function SupportStudio({ token }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.getElementById('user-dashboard-anchor')?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, []);

  return (
    <div className="dash-support-studio dash-support-studio--chat-first">
      <UserMessagesPanel token={token} variant="whatsapp" />
      <div className="dash-support-studio__quick">
        <a href="tel:9680102276" className="dash-support-studio__pill">9680102276</a>
        <a href="mailto:info@dreammantra.in" className="dash-support-studio__pill">info@dreammantra.in</a>
        <span className="dash-support-studio__pill dash-support-studio__pill--muted">Mon–Sat 11 AM – 7 PM</span>
      </div>
    </div>
  );
}
