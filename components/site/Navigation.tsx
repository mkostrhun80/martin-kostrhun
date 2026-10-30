import { ArrowLeft } from 'lucide-react';
import { sitePath } from '@/lib/site-path';

/** Legal/legacy documents retain a simple way back; the home page has no header. */
export function Navigation({ isHome = false }: { isHome?: boolean }) {
  return isHome ? null : <nav className="document-back" aria-label="Zpět na web"><a href={sitePath('/')}><ArrowLeft size={17} aria-hidden="true"/>Martin Kostrhun</a></nav>;
}
