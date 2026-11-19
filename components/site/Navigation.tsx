import { SiteHeader } from './SiteHeader';

/** Subpages and legal documents share the same persistent header navigation. */
export function Navigation({ isHome = false }: { isHome?: boolean }) {
  return <SiteHeader isHome={isHome} />;
}
