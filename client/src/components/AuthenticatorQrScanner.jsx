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
 * Professional QR scanner frame — same UI as payment UPI QR (scan corners, badge, download).
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
  if (!qrSrc) return null;

  return (
    <div className="payment-page__qr-frame" aria-label={ariaLabel}>
      <div className="payment-page__qr-frame-head">
        <span className="payment-page__qr-badge">
          <QrCode className="w-3.5 h-3.5" aria-hidden />
          {badge}
        </span>
        <span className="payment-page__qr-brand">{brand}</span>
      </div>
      <div className="payment-page__qr-mat">
        <div className="payment-page__qr-scan-corners" aria-hidden />
        <img
          src={qrSrc}
          alt="Scan QR code to add Dream Mantra to your authenticator app"
          className="payment-page__qr-image"
        />
      </div>
      <p className="payment-page__qr-caption">{caption}</p>
      {manualEntry && (
        <p className="text-xs text-sand-500 text-center font-mono break-all px-2 -mt-1 mb-2">
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
