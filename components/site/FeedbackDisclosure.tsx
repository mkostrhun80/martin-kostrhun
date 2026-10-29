'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

/** Secondary client action; native details also works without JavaScript. */
export function FeedbackDisclosure({ children }: { children: ReactNode }) {
  const details = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    let frame = 0;
    const reveal = () => {
      if (location.hash !== '#zpetna-vazba' || !details.current) return;
      details.current.open = true;
      frame = requestAnimationFrame(() => document.getElementById('zpetna-vazba')?.scrollIntoView({ block: 'start', behavior: 'instant' }));
    };
    reveal(); addEventListener('hashchange', reveal);
    return () => { cancelAnimationFrame(frame); removeEventListener('hashchange', reveal); };
  }, []);
  return <details ref={details} className="feedback-disclosure">
    <summary className="feedback-toggle"><span>Zanechat zpětnou vazbu</span><ChevronDown size={20} aria-hidden="true"/></summary>
    <div className="feedback-disclosure-body">{children}</div>
  </details>;
}
