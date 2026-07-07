import { useRef, useEffect } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';

/** Route outlet — no remount key to avoid tab/page flicker */
export default function PageTransition() {
  const outlet = useOutlet();

  return <div className="page-enter">{outlet}</div>;
}
