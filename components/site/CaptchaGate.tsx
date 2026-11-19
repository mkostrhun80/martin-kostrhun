'use client';
import { useEffect, useRef, useState } from 'react';
import { HCAPTCHA_SITE_KEY } from '@/lib/form-config';
import { siteConfig } from '@/lib/site-config';
import { usePrivacyPreferences } from './PrivacyPreferences';

type CaptchaAPI = { render: (element: HTMLElement, options: Record<string, unknown>) => string; reset: (id: string) => void; remove: (id: string) => void };
declare global { interface Window { hcaptcha?: CaptchaAPI; mkCaptchaLoaded?: () => void } }
let loading: Promise<CaptchaAPI> | undefined;
function loadCaptcha(): Promise<CaptchaAPI> {
  if (window.hcaptcha) return Promise.resolve(window.hcaptcha);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const fail = () => { clearTimeout(timer); script.remove(); loading = undefined; delete window.mkCaptchaLoaded; reject(new Error('captcha unavailable')); };
    window.mkCaptchaLoaded = () => {
      clearTimeout(timer);
      if (!window.hcaptcha) { fail(); return; }
      resolve(window.hcaptcha); delete window.mkCaptchaLoaded;
    };
    script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit&recaptchacompat=off&onload=mkCaptchaLoaded';
    script.async = true; script.addEventListener('error', fail, { once: true });
    const timer = setTimeout(fail, 15000); document.head.append(script);
  });
  return loading;
}

export function CaptchaGate({ onToken, resetKey }: { onToken: (token: string) => void; resetKey: number }) {
  const { preferences, allow } = usePrivacyPreferences();
  const root = useRef<HTMLDivElement>(null), widget = useRef<string | null>(null);
  const callback = useRef(onToken);
  useEffect(() => { callback.current = onToken; }, [onToken]);
  const [near, setNear] = useState(false), [error, setError] = useState(false), [retry, setRetry] = useState(0);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { setNear(true); observer.disconnect(); } }, { rootMargin: '200px' });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!preferences.captcha || !near || !root.current) return;
    let disposed = false;
    loadCaptcha().then(api => {
      if (disposed || !root.current) return;
      widget.current = api.render(root.current, {
        sitekey: HCAPTCHA_SITE_KEY, size: 'compact', hl: 'cs', theme: 'light',
        callback: (token: string) => { setError(false); callback.current(token); },
        'expired-callback': () => callback.current(''),
        'chalexpired-callback': () => callback.current(''),
        'error-callback': () => { callback.current(''); setError(true); },
      });
    }).catch(() => { if (!disposed) { callback.current(''); setError(true); } });
    return () => { disposed = true; if (widget.current !== null) window.hcaptcha?.remove(widget.current); widget.current = null; callback.current(''); };
  }, [preferences.captcha, near, retry]);
  useEffect(() => { if (widget.current !== null) window.hcaptcha?.reset(widget.current); callback.current(''); }, [resetKey]);
  return <div className="captcha-gate">
    {!preferences.captcha && <div className="external-permission"><p>Pro odeslání přes web je potřeba ochrana hCaptcha. Načte se až po vašem povolení. <a href="https://www.hcaptcha.com/privacy" target="_blank" rel="noreferrer">Soukromí hCaptcha</a>.</p><div><button type="button" onClick={() => { setNear(true); allow('captcha'); }}>Povolit hCaptcha</button><a href={`mailto:${siteConfig.email}`}>Raději e-mailem</a></div></div>}
    <div ref={root} className="captcha-widget" hidden={!preferences.captcha} aria-label="Ověření proti spamu"/>
    {error && <p role="alert">Ochranu se nepodařilo načíst. <button type="button" onClick={() => { setError(false); setRetry(value => value + 1); }}>Zkusit znovu</button> nebo <a href={`mailto:${siteConfig.email}`}>napsat e-mailem</a>.</p>}
    <noscript><p>Pro ověření a odeslání formuláře zapněte JavaScript, nebo <a href={`mailto:${siteConfig.email}`}>napište přímo e-mailem</a>.</p></noscript>
  </div>;
}
