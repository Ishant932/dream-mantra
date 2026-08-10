import EmbeddedAppFrame from '../EmbeddedAppFrame';

export default function CVMakerPanel() {
  return (
    <div className="app-embed app-embed--cv app-embed--flush">
      <EmbeddedAppFrame src="/cv-builder/index.html" title="CV Builder" className="app-embed__frame" embed />
    </div>
  );
}
