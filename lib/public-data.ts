import { siteConfig } from './site-config';

export type FAQ = {
    id: string;
    question: string;
    answer: string;
    published?: boolean;
    source?: { label: string; href: string };
};
export type Review = {
    id: string;
    displayName: string;
    rating: number;
    text: string;
    createdAt: string;
    verified: boolean;
    featured: boolean;
};
// Publish only owner-approved, consented and verified reviews here.
// Never include email addresses, submission tokens or private client identifiers.
export const approvedReviews: Review[] = [];
export const defaultFAQ: FAQ[] = [
    { id: 'sluzby', question: 'S čím mi finanční specialista Martin Kostrhun pomůže?', answer: 'Pomáhám s investicemi, hypotékami a financováním bydlení, finančním plánem, životním pojištěním, zajištěním na stáří i podnikatelskými financemi. Jednotlivé oblasti propojuji podle vašich cílů a životní situace.' },
    { id: 'zacatek', question: 'Musím už vědět, jakou službu potřebuji?', answer: 'Nemusíte. Na úvod společně probereme vaši situaci a cíle. Od nich se odvíjí návrh možností.' },
    { id: 'schuzka', question: 'Jak probíhá první schůzka?', answer: 'Nejdřív potřebuji poznat vaši situaci a plány. Společně si ujasníme, co chcete řešit, a domluvíme další postup.' },
    { id: 'online', question: 'Je možné řešit spolupráci online?', answer: 'Ano, schůzku můžeme domluvit osobně v Hradci Králové, online nebo telefonicky.' },
    { id: 'misto', question: 'Kde se můžeme sejít v Hradci Králové?', answer: `Osobní schůzku si můžeme domluvit na adrese ${siteConfig.address}, ${siteConfig.city}. Napište na ${siteConfig.email} nebo zavolejte na ${siteConfig.phone} a domluvíme termín.` },
    { id: 'opravneni', question: 'Jak si ověřím oprávnění k finančnímu zprostředkování?', answer: `Působím jako vázaný zástupce eDO finance, a.s. Aktuální registraci a konkrétní rozsah oprávnění si můžete ověřit v registru České národní banky podle jména Martin Kostrhun nebo IČO ${siteConfig.ico}.`, source: { label: 'Ověřit v registru ČNB', href: siteConfig.registryUrl } },
    { id: 'pece', question: 'Co následuje po sjednání služby?', answer: 'Spolupráce podpisem smlouvy nekončí. Součástí mého přístupu je průběžná péče a přizpůsobení plánu změnám ve vašem životě.' },
];
