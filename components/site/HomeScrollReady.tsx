'use client';

import { useEffect } from 'react';

/** Tell the early reload guard that React and the page's fonts have settled. */
export function HomeScrollReady() {
  useEffect(() => {
    let disposed = false;
    const ready = () => { if (!disposed) dispatchEvent(new Event('home-page-ready')); };
    void document.fonts.ready.then(ready, ready);
    return () => { disposed = true; };
  }, []);
  return null;
}
