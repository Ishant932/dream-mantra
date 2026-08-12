function renderInlineImage(match, alt, url, key) {
  return (
    <figure key={key} className="my-6">
      <img src={url} alt={alt || ''} className="blog-inline-image w-full rounded-2xl border border-sand-200/80" loading="lazy" />
    </figure>
  );
}

export function renderBlogContent(content = '') {
  const raw = String(content || '').trim();
  if (!raw) return null;

  if (/<[a-z][\s\S]*>/i.test(raw)) {
    return (
      <div
        className="prose-blog blog-content-html text-base sm:text-lg leading-relaxed opacity-90 space-y-5"
        dangerouslySetInnerHTML={{ __html: raw }}
      />
    );
  }

  const blocks = raw.split(/\n\n+/).filter(Boolean);
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        const mdImage = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(block.trim());
        if (mdImage) return renderInlineImage(mdImage, mdImage[1], mdImage[2], `md-${i}`);
        return (
          <p key={i} className="prose-blog text-base sm:text-lg leading-relaxed opacity-90 whitespace-pre-wrap">
            {block}
          </p>
        );
      })}
    </div>
  );
}
