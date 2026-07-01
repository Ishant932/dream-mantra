import { useEffect, useRef, useState } from 'react';

/** Renders children only when near the viewport — faster initial paint on mobile. */
export default function LazyMount({ children, rootMargin = '420px 0px', minHeight = 80, fallback = null }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className="lazy-mount" style={!visible ? { minHeight } : undefined}>
      {visible ? children : fallback}
    </div>
  );
}
