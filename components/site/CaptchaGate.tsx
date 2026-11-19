'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { HCAPTCHA_SITE_KEY } from '@/lib/form-config';
import { usePrivacyPreferences } from './PrivacyPreferences';
import { SafeEmailLink } from './SafeEmailLink';

type CaptchaAPI = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    hcaptcha?: CaptchaAPI;
    mkCaptchaLoaded?: () => void;
  }
}

let loading: Promise<CaptchaAPI> | undefined;

function loadCaptcha(): Promise<CaptchaAPI> {
  if (window.hcaptcha) return Promise.resolve(window.hcaptcha);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const fail = () => {
      clearTimeout(timer);
      script.remove();
      loading = undefined;
      delete window.mkCaptchaLoaded;
      reject(new Error('captcha unavailable'));
    };
    window.mkCaptchaLoaded = () => {
      clearTimeout(timer);
      if (!window.hcaptcha) {
        fail();
        return;
      }
      resolve(window.hcaptcha);
      delete window.mkCaptchaLoaded;
    };
    script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit&recaptchacompat=off&onload=mkCaptchaLoaded';
    script.async = true;
    script.addEventListener('error', fail, { once: true });
    const timer = setTimeout(fail, 15000);
    document.head.append(script);
  });
  return loading;
}

export function CaptchaGate({
  onToken,
  resetKey,
  attention = false,
}: {
  onToken: (token: string) => void;
  resetKey: number;
  attention?: boolean;
}) {
  const { preferences, allow } = usePrivacyPreferences();
  const root = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const callback = useRef(onToken);
  const activeResetKey = useRef(resetKey);
  useEffect(() => {
    callback.current = onToken;
  }, [onToken]);
  useEffect(() => {
    activeResetKey.current = resetKey;
  }, [resetKey]);

  const [near, setNear] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [verifiedState, setVerifiedState] = useState<{ key: number; ok: boolean }>({ key: 0, ok: false });

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!preferences.captcha || !near || !root.current) return;
    let disposed = false;
    loadCaptcha()
      .then(api => {
        if (disposed || !root.current) return;
        widget.current = api.render(root.current, {
          sitekey: HCAPTCHA_SITE_KEY,
          size: 'normal',
          hl: 'cs',
          theme: 'light',
          callback: (token: string) => {
            setError(false);
            setVerifiedState({ key: activeResetKey.current, ok: true });
            callback.current(token);
          },
          'expired-callback': () => {
            setVerifiedState({ key: activeResetKey.current, ok: false });
            callback.current('');
          },
          'chalexpired-callback': () => {
            setVerifiedState({ key: activeResetKey.current, ok: false });
            callback.current('');
          },
          'error-callback': () => {
            setVerifiedState({ key: activeResetKey.current, ok: false });
            callback.current('');
            setError(true);
          },
        });
      })
      .catch(() => {
        if (!disposed) {
          setVerifiedState({ key: activeResetKey.current, ok: false });
          callback.current('');
          setError(true);
        }
      });
    return () => {
      disposed = true;
      if (widget.current !== null) window.hcaptcha?.remove(widget.current);
      widget.current = null;
      callback.current('');
    };
  }, [preferences.captcha, near, retry]);

  useEffect(() => {
    if (widget.current !== null) window.hcaptcha?.reset(widget.current);
    callback.current('');
  }, [resetKey]);

  const isVerified = verifiedState.ok && verifiedState.key === resetKey;

  return (
    <div className="captcha-gate" data-captcha-gate>
      {!preferences.captcha && (
        <div className={attention ? 'external-permission external-permission-attention' : 'external-permission'}>
          <p>
            <ShieldCheck
              size={16}
              style={{ display: 'inline', verticalAlign: '-3px', marginRight: '6px' }}
              aria-hidden="true"
            />
            Pro odeslání formuláře je potřeba jedním kliknutím povolit ochranu proti spamu (<strong>hCaptcha</strong>).{' '}
            <a href="https://www.hcaptcha.com/privacy" target="_blank" rel="noreferrer">
              Soukromí hCaptcha
            </a>
            .
          </p>
          <div className="external-permission-actions">
            <button
              type="button"
              data-captcha-enable
              onClick={() => {
                setNear(true);
                allow('captcha');
              }}
            >
              Povolit a ověřit (hCaptcha)
            </button>
            <SafeEmailLink>Raději napsat e-mailem</SafeEmailLink>
          </div>
        </div>
      )}
      <div
        ref={root}
        className="captcha-widget"
        hidden={!preferences.captcha}
        aria-label="Ověření proti spamu"
      />
      {isVerified && (
        <p className="captcha-verified-pill">
          <Check size={16} aria-hidden="true" /> Ověřeno proti spamu — můžete odeslat
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          Ochranu proti spamu se nepodařilo načíst.{' '}
          <button
            type="button"
            className="site-link-inline"
            style={{ background: 'none', borderTop: 0, borderLeft: 0, borderRight: 0, cursor: 'pointer', minHeight: 'auto' }}
            onClick={() => {
              setError(false);
              setRetry(value => value + 1);
            }}
          >
            Zkusit znovu
          </button>{' '}
          nebo <SafeEmailLink>napsat e-mailem</SafeEmailLink>.
        </p>
      )}
      <noscript>
        <p className="form-note">
          Pro ověření a odeslání formuláře zapněte JavaScript, nebo{' '}
          <a href="mailto:martin.kostrhun@edofinance.cz">napište přímo e-mailem</a>.
        </p>
      </noscript>
    </div>
  );
}
