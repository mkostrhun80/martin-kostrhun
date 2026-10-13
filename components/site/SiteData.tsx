'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { emptyPublicData, type PublicData } from '@/lib/public-data';
import { sitePath } from '@/lib/site-path';
const Context = createContext(emptyPublicData);
export const apiPath = (path: string) => sitePath('/api' + path);
export function SiteData({ children }: {
    children: React.ReactNode;
}) {
    const [data, setData] = useState<PublicData>(emptyPublicData);
    useEffect(() => {
        let alive = true;
        const controller = new AbortController();
        const refresh = () => fetch(apiPath('/public'), { cache: 'no-store', signal: controller.signal }).then(r => r.ok ? r.json() : null).then(raw => { const value = raw as PublicData | null; if (alive && value && Array.isArray(value.reviews) && Array.isArray(value.faq))
            setData(value); }).catch(() => { });
        void refresh();
        window.addEventListener('focus', refresh);
        return () => { alive = false; controller.abort(); window.removeEventListener('focus', refresh); };
    }, []);
    return <Context.Provider value={data}>{children}</Context.Provider>;
}
export const useSiteData = () => useContext(Context);
