'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { siteConfig } from '@/lib/site-config';

const noopSubscribe = () => () => {};
const getClient = () => true;
const getServer = () => false;

/**
 * Renders email links without contiguous literal user@domain or mailto: in SSR HTML
 * so edge email-obfuscation rewriters cannot mutate DOM before React hydrates.
 */
export function SafeEmailLink({
  className,
  children,
  email = siteConfig.email,
}: {
  className?: string;
  children?: ReactNode;
  email?: string;
}) {
  const hydrated = useSyncExternalStore(noopSubscribe, getClient, getServer);

  const atIndex = email.indexOf('@');
  const local = atIndex >= 0 ? email.slice(0, atIndex) : email;
  const domain = atIndex >= 0 ? email.slice(atIndex + 1) : '';
  const href = hydrated ? `mailto:${local}@${domain}` : '#kontakt';

  return (
    <a className={className} href={href} suppressHydrationWarning>
      {children ?? (
        <>
          <span>{local}</span>
          <span aria-hidden="true">&#8203;@&#8203;</span>
          <span>{domain}</span>
        </>
      )}
    </a>
  );
}
