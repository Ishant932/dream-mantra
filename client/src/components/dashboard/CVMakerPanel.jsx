import { useRef } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import EmbeddedAppFrame from '../EmbeddedAppFrame';

export default function CVMakerPanel() {
  const frameRef = useRef(null);

  const handleDownload = () => {
    const win = frameRef.current?.contentWindow;
    if (win?.print) {
      win.focus();
      win.print();
      return;
    }
    window.open('/cv-builder/index.html', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={handleDownload}>
          <Download className="w-4 h-4" /> Download as PDF
        </button>
        <a href="/cv-builder/index.html" target="_blank" rel="noreferrer" className="btn-outline inline-flex items-center gap-2">
          <ExternalLink className="w-4 h-4" /> Open full screen
        </a>
      </div>
      <p className="text-xs dash-card-meta">Tip: In the print dialog, choose &quot;Save as PDF&quot; as the destination.</p>
      <div className="app-embed app-embed--cv app-embed--flush">
        <EmbeddedAppFrame ref={frameRef} src="/cv-builder/index.html" title="CV Builder" className="app-embed__frame" embed />
      </div>
    </div>
  );
}
