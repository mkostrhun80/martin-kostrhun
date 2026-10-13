import { Navigation } from '@/components/site/Navigation';
import { Admin } from '@/components/site/Admin';
export const metadata = { title: 'Soukromá správa | Martin Kostrhun', robots: { index: false, follow: false } };
export default function AdminPage() { return <><Navigation isHome={false}/><main id="main" className="admin-main"><Admin /></main></>; }
