'use client';
import { sitePath } from '@/lib/site-path';
export function AppointmentLink({ children = 'Domluvit schůzku', topic = '', className = 'site-button', isHome = true, onNavigate }: {
    children?: React.ReactNode;
    topic?: string;
    className?: string;
    isHome?: boolean; onNavigate?: () => void;
}) {
    return <a className={className} href={`${isHome ? '' : sitePath('/')}#kontakt`} onClick={() => { onNavigate?.(); window.dispatchEvent(new CustomEvent('appointment', { detail: { topic } })); if (!isHome)
        try { sessionStorage.setItem('appointment-topic', topic); } catch { /* Direct navigation still works. */ } }}>{children}</a>;
}
