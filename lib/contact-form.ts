export type ContactValues = { name: string; contact: string; message: string };
export type ContactErrors = Partial<Record<keyof ContactValues, string>>;
export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (values.name.trim().length < 2) errors.name = 'Napište prosím své jméno (alespoň 2 znaky).';
  const contact = values.contact.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) && !/^\+?\d{9,15}$/.test(contact.replace(/[\s()-]/g, ''))) {
    errors.contact = 'Zadejte platný e-mail nebo telefon, na kterém vás zastihnu.';
  }
  if (values.message.trim().length < 2) errors.message = 'Napište prosím, s čím vám mohu pomoci.';
  return errors;
}
