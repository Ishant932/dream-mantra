import { useLocation, useOutlet } from 'react-router-dom';

/** Route outlet — CSS fade only (no framer-motion) for faster navigation */
export default function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div key={location.pathname} className="page-enter">
      {outlet}
    </div>
  );
}
