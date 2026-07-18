import type { BeForm } from './curriculum';
import type { VisualId } from '../visual-library';

export interface ToBeVisualScene {
  id: string;
  visualId: VisualId;
  en: string;
  es: string;
  pron: string;
  form: BeForm;
}

export const TO_BE_VISUAL_SCENES: readonly ToBeVisualScene[] = [
  { id: 'david-at-work', visualId: 'unit2.to-be.david-at-work', en: 'I am at work.', es: 'Estoy en el trabajo.', pron: 'ai am at werk', form: 'am' },
  { id: 'david-at-home', visualId: 'unit2.to-be.david-at-home', en: 'I am at home.', es: 'Estoy en casa.', pron: 'ai am at joum', form: 'am' },
  { id: 'david-in-the-office', visualId: 'unit2.to-be.david-in-the-office', en: 'I am in the office.', es: 'Estoy en la oficina.', pron: 'ai am in di ó-fis', form: 'am' },
  { id: 'david-in-california', visualId: 'unit2.to-be.david-in-california', en: 'I am in California.', es: 'Estoy en California.', pron: 'ai am in ca-li-fór-nia', form: 'am' },
  { id: 'maria-at-work', visualId: 'unit2.to-be.maria-at-work', en: 'She is at work.', es: 'Ella está en el trabajo.', pron: 'shi is at werk', form: 'is' },
  { id: 'maria-at-home', visualId: 'unit2.to-be.maria-at-home', en: 'She is at home.', es: 'Ella está en casa.', pron: 'shi is at joum', form: 'is' },
  { id: 'maria-in-the-office', visualId: 'unit2.to-be.maria-in-the-office', en: 'She is in the office.', es: 'Ella está en la oficina.', pron: 'shi is in di ó-fis', form: 'is' },
  { id: 'carlos-at-work', visualId: 'unit2.to-be.carlos-at-work', en: 'He is at work.', es: 'Él está en el trabajo.', pron: 'ji is at werk', form: 'is' },
  { id: 'ana-at-work', visualId: 'unit2.to-be.ana-at-work', en: 'Ana is at work.', es: 'Ana está en el trabajo.', pron: 'á-na is at werk', form: 'is' },
  { id: 'dog-here', visualId: 'unit2.to-be.dog-here', en: 'The dog is here.', es: 'El perro está aquí.', pron: 'de dog is jir', form: 'is' },
];
