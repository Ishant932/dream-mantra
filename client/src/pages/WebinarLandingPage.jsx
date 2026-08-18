import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Play, Radio } from 'lucide-react';
import { WEBINAR_CONFIG, getWebinarPhase, formatCountdown } from '../data/webinarConfig';

function CountdownUnit({ value, label }) {
  return (
    <div className="webinar-countdown__unit">
      <span className="webinar-countdown__num">{String(value).padStart(2, '0')}</span>
      <span className="webinar-countdown__lbl">{label}</span>
    </div>
  );
}

export default function WebinarLandingPage() {
  const [now, setNow] = useState(() => new Date());
  const phase = getWebinarPhase(now);
  const start = new Date(WEBINAR_CONFIG.scheduledStart);
  const end = new Date(WEBINAR_CONFIG.scheduledEnd);
  const msLeft = start.getTime() - now.getTime();
  const countdown = formatCountdown(msLeft);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const showVideo = phase === 'live' || phase === 'ended';

  return (
    <div className="webinar-landing">
      <div className="webinar-landing__hero">
        <div className="webinar-landing__badge">
          {phase === 'live' ? <><Radio className="w-4 h-4" /> Live now</> : phase === 'upcoming' ? 'Upcoming webinar' : 'Replay available'}
        </div>
        <h1 className="webinar-landing__title">{WEBINAR_CONFIG.title}</h1>
        <p className="webinar-landing__subtitle">{WEBINAR_CONFIG.subtitle}</p>
        <p className="webinar-landing__desc">{WEBINAR_CONFIG.description}</p>

        <div className="webinar-landing__meta">
          <span><Calendar className="w-4 h-4" /> {start.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })}</span>
          <span><Clock className="w-4 h-4" /> {start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })} – {end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })} IST</span>
        </div>
      </div>

      <div className="webinar-landing__stage">
        {phase === 'upcoming' && (
          <div className="webinar-countdown">
            <p className="webinar-countdown__title">Webinar starts in</p>
            <div className="webinar-countdown__grid">
              <CountdownUnit value={countdown.days} label="Days" />
              <CountdownUnit value={countdown.hours} label="Hours" />
              <CountdownUnit value={countdown.minutes} label="Mins" />
              <CountdownUnit value={countdown.seconds} label="Secs" />
            </div>
            <p className="webinar-countdown__note">Video will unlock automatically when the webinar goes live.</p>
          </div>
        )}

        {showVideo ? (
          <div className="webinar-video-wrap">
            <iframe
              title={WEBINAR_CONFIG.title}
              src={WEBINAR_CONFIG.videoUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="webinar-video-wrap__frame"
            />
          </div>
        ) : (
          <div className="webinar-video-placeholder">
            <Play className="w-12 h-12 opacity-40" />
            <p>Video unlocks at scheduled time</p>
          </div>
        )}
      </div>

      <div className="webinar-landing__host">
        <p className="webinar-landing__host-label">Hosted by</p>
        <p className="webinar-landing__host-name">{WEBINAR_CONFIG.hostName}</p>
        <p className="webinar-landing__host-role">{WEBINAR_CONFIG.hostRole}</p>
      </div>

      <div className="webinar-landing__cta">
        <Link to={WEBINAR_CONFIG.ctaHref} className="btn-primary webinar-landing__cta-btn">
          {WEBINAR_CONFIG.ctaLabel}
        </Link>
      </div>
    </div>
  );
}
