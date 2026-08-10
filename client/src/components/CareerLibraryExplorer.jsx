import EmbeddedAppFrame from './EmbeddedAppFrame';

export default function CareerLibraryExplorer({ embedded = false }) {
  return (
    <div className={`app-embed app-embed--career${embedded ? ' app-embed--flush' : ''}`}>
      <EmbeddedAppFrame
        src="/career-library/index.html"
        title="Career Library"
        className="app-embed__frame"
        embed={embedded}
      />
    </div>
  );
}
