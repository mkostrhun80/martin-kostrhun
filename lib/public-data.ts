export type FAQ = {
    id: string;
    question: string;
    answer: string;
    published?: boolean;
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
export type PublicData = {
    contactEnabled: boolean;
    statistics: {
        count: number;
        asOf: string;
    } | null;
    reviews: Review[];
    faq: FAQ[];
    booking: {
        links: Partial<Record<'osobne' | 'online' | 'telefon', string>>;
        timezone: string;
    };
};
export const defaultFAQ: FAQ[] = [
    { id: 'sluzby', question: 'S čím se na mě můžete obrátit?', answer: 'S investicemi, financováním bydlení, finančním plánem, životním pojištěním, zajištěním na stáří i podnikatelskými financemi.' },
    { id: 'zacatek', question: 'Musím už vědět, jakou službu potřebuji?', answer: 'Nemusíte. Na úvod společně probereme vaši situaci a cíle. Od nich se odvíjí návrh možností.' },
    { id: 'schuzka', question: 'Jak probíhá první schůzka?', answer: 'Nejdřív potřebuji poznat vaši situaci a plány. Společně si ujasníme, co chcete řešit, a domluvíme další postup.' },
    { id: 'online', question: 'Je možné řešit spolupráci online?', answer: 'Ano, schůzku můžeme domluvit osobně v Hradci Králové, online nebo telefonicky.' },
    { id: 'pece', question: 'Co následuje po sjednání služby?', answer: 'Spolupráce podpisem smlouvy nekončí. Součástí mého přístupu je průběžná péče a přizpůsobení plánu změnám ve vašem životě.' },
];
export const emptyPublicData: PublicData = { contactEnabled: false, statistics: null, reviews: [], faq: defaultFAQ, booking: { links: {}, timezone: 'Europe/Prague' } };
export const sectionDefinitions = [
    { id: 'sluzby', label: 'S čím pomáhám', short: 'Služby', description: 'Bydlení, investice, ochrana příjmů a finanční plán.' },
    { id: 'o-mne', label: 'O mně', short: 'O mně', description: 'Poznejte mě a moje profesní zázemí.' },
    { id: 'zkusenosti', label: 'Zkušenosti klientů', short: 'Zkušenosti', description: 'Skutečné zkušenosti ze spolupráce.' },
    { id: 'otazky', label: 'Časté otázky', short: 'Otázky', description: 'Praktické odpovědi před první schůzkou.' },
    { id: 'spoluprace', label: 'Jak spolupráce probíhá', short: 'Spolupráce', description: 'Od první schůzky po dlouhodobou péči.' },
    { id: 'kontakt', label: 'Kontakt', short: 'Kontakt', description: 'Napište mi zprávu přímo z webu.' },
];
export function visibleSections(data: PublicData) { return sectionDefinitions.filter(s => s.id !== 'zkusenosti' || data.statistics !== null || data.reviews.length > 0); }
