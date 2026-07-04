import { QrCode, Download } from 'lucide-react';

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * Google Authenticator QR — visible on login and security settings.
 */
export default function AuthenticatorQrScanner({
  qrSrc,
  manualEntry,
  badge = 'Google Auth',
  brand = 'Dream Mantra',
  caption = 'Scan with Google Authenticator, Authy, or Microsoft Authenticator',
  downloadName = 'dream-mantra-admin-2fa-qr.png',
  ariaLabel = 'Google Authenticator QR code scanner',
}) {
  if (!qrSrc) {
    return (
      <div className="auth-qr-scanner auth-qr-scanner--empty">
        <p className="text-sm text-amber-800 font-semibold text-center">
          QR code is loading… If this stays blank, use the manual key below or tap “Scan QR code” again.
        </p>
        {manualEntry && (
          <p className="text-xs text-sand-600 text-center font-mono break-all mt-2 px-2">
            Manual key: {manualEntry}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="auth-qr-scanner payment-page__qr-frame" aria-label={ariaLabel}>
      <div className="payment-page__qr-frame-head">
        <span className="payment-page__qr-badge">
          <QrCode className="w-3.5 h-3.5" aria-hidden />
          {badge}
        </span>
        <span className="payment-page__qr-brand">{brand}</span>
      </div>
      <div className="payment-page__qr-mat auth-qr-scanner__mat">
        <div className="payment-page__qr-scan-corners" aria-hidden />
        <img
          src={qrSrc}
          alt="Scan QR code to add Dream Mantra to Google Authenticator"
          className="payment-page__qr-image auth-qr-scanner__image"
        />
      </div>
      <p className="payment-page__qr-caption">{caption}</p>
      {manualEntry && (
        <p className="auth-qr-scanner__manual text-xs text-sand-600 text-center font-mono break-all px-2">
          Manual key: {manualEntry}
        </p>
      )}
      <div className="payment-page__qr-actions">
        <button
          type="button"
          onClick={() => downloadDataUrl(qrSrc, downloadName)}
          className="payment-page__qr-download"
        >
          <Download className="w-4 h-4 shrink-0" aria-hidden />
          Download QR
        </button>
      </div>
    </div>
  );
}
