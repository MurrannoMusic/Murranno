import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** New pages start at the top; hash links keep their in-page destination. */
export function RouteScrollReset() {
  const { pathname, search, hash, key } = useLocation();
  useLayoutEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search, hash, key]);
  return null;
}
