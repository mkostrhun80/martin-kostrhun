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
// Publish only owner-approved, consented and verified reviews here.
// Never include email addresses, submission tokens or private client identifiers.
export const approvedReviews: Review[] = [];
export const defaultFAQ: FAQ[] = [
    { id: 'sluzby', question: 'S čím se na mě můžete obrátit?', answer: 'S investicemi, financováním bydlení, finančním plánem, životním pojištěním, zajištěním na stáří i podnikatelskými financemi.' },
    { id: 'zacatek', question: 'Musím už vědět, jakou službu potřebuji?', answer: 'Nemusíte. Na úvod společně probereme vaši situaci a cíle. Od nich se odvíjí návrh možností.' },
    { id: 'schuzka', question: 'Jak probíhá první schůzka?', answer: 'Nejdřív potřebuji poznat vaši situaci a plány. Společně si ujasníme, co chcete řešit, a domluvíme další postup.' },
    { id: 'online', question: 'Je možné řešit spolupráci online?', answer: 'Ano, schůzku můžeme domluvit osobně v Hradci Králové, online nebo telefonicky.' },
    { id: 'pece', question: 'Co následuje po sjednání služby?', answer: 'Spolupráce podpisem smlouvy nekončí. Součástí mého přístupu je průběžná péče a přizpůsobení plánu změnám ve vašem životě.' },
];
