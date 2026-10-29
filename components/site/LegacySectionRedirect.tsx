import { sitePath } from '@/lib/site-path';
import { Navigation } from './Navigation';
export function LegacySectionRedirect({ anchor, title }: { anchor: string; title: string }) {
  const destination = sitePath('/') + '#' + anchor;
  return <><meta httpEquiv="refresh" content={`0;url=${destination}`}/><Navigation/><main id="main" className="standalone-main" tabIndex={-1}><h1>{title}</h1><p>Tato část je nyní přímo na hlavní stránce.</p><a className="site-button" href={destination}>Přejít na {title.toLocaleLowerCase('cs')}</a></main></>;
}
