/** One editorial order for the page, contents and section rail. */
export const siteSections = [
  { id: 'domu', label: 'Úvod', description: 'Martin Kostrhun · finanční specialista' },
  { id: 'obsah', label: 'Rozcestník', description: 'Vyberte si, co vás zajímá.' },
  { id: 'o-mne', label: 'O mně', description: 'Poznejte mě a můj přístup k financím.' },
  { id: 'sluzby', label: 'S čím pomáhám', description: 'Bydlení, investice, ochrana příjmů a finanční plán.' },
  { id: 'spoluprace', label: 'Jak spolupráce probíhá', description: 'Od první schůzky po dlouhodobou péči.' },
  { id: 'otazky', label: 'Časté otázky', description: 'Praktické odpovědi před první schůzkou.' },
  { id: 'kontakt', label: 'Kontakt', description: 'Napište mi zprávu přímo z webu.' },
  { id: 'zkusenosti', label: 'Zkušenosti a zpětná vazba', description: 'Podělte se o zkušenost ze spolupráce.' },
  { id: 'zazemi', label: 'Zázemí eDO finance', description: 'Možnosti napříč finančním trhem.' },
] as const;
export type SectionId = typeof siteSections[number]['id'];
export const contentSections = siteSections.slice(2);
// The opening shortcuts are a small selection; the rail still lists the whole page.
export const indexSections = contentSections.filter(section => section.id !== 'zkusenosti' && section.id !== 'zazemi');
