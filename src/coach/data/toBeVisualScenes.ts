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
  { id: 'david-at-the-airport', visualId: 'unit2.to-be.david-at-the-airport', en: 'David is at the airport.', es: 'David está en el aeropuerto.', pron: 'dei-vid is at di ér-port', form: 'is' },
  { id: 'david-at-the-restaurant', visualId: 'unit2.to-be.david-at-the-restaurant', en: 'David is at the restaurant.', es: 'David está en el restaurante.', pron: 'dei-vid is at de rés-to-rant', form: 'is' },
  { id: 'david-in-the-office', visualId: 'unit2.to-be.david-in-the-office', en: 'I am in the office.', es: 'Estoy en la oficina.', pron: 'ai am in di ó-fis', form: 'am' },
  { id: 'david-in-california', visualId: 'unit2.to-be.david-in-california', en: 'I am in California.', es: 'Estoy en California.', pron: 'ai am in ca-li-fór-nia', form: 'am' },
  { id: 'david-happy', visualId: 'unit2.to-be.david-happy', en: 'David is happy.', es: 'David está feliz.', pron: 'dei-vid is já-pi', form: 'is' },
  { id: 'david-tired', visualId: 'unit2.to-be.david-tired', en: 'David is tired.', es: 'David está cansado.', pron: 'dei-vid is tái-erd', form: 'is' },
  { id: 'david-ready', visualId: 'unit2.to-be.david-ready', en: 'David is ready.', es: 'David está listo.', pron: 'dei-vid is ré-di', form: 'is' },
  { id: 'maria-at-work', visualId: 'unit2.to-be.maria-at-work', en: 'She is at work.', es: 'Ella está en el trabajo.', pron: 'shi is at werk', form: 'is' },
  { id: 'maria-at-home', visualId: 'unit2.to-be.maria-at-home', en: 'She is at home.', es: 'Ella está en casa.', pron: 'shi is at joum', form: 'is' },
  { id: 'maria-at-the-supermarket', visualId: 'unit2.to-be.maria-at-the-supermarket', en: 'Maria is at the supermarket.', es: 'María está en el supermercado.', pron: 'ma-rí-a is at de sú-per-mar-ket', form: 'is' },
  { id: 'maria-in-the-office', visualId: 'unit2.to-be.maria-in-the-office', en: 'She is in the office.', es: 'Ella está en la oficina.', pron: 'shi is in di ó-fis', form: 'is' },
  { id: 'maria-happy', visualId: 'unit2.to-be.maria-happy', en: 'Maria is happy.', es: 'María está feliz.', pron: 'ma-rí-a is já-pi', form: 'is' },
  { id: 'carlos-at-work', visualId: 'unit2.to-be.carlos-at-work', en: 'He is at work.', es: 'Él está en el trabajo.', pron: 'ji is at werk', form: 'is' },
  { id: 'carlos-sick', visualId: 'unit2.to-be.carlos-sick', en: 'Carlos is sick.', es: 'Carlos está enfermo.', pron: 'cár-los is sik', form: 'is' },
  { id: 'ana-at-work', visualId: 'unit2.to-be.ana-at-work', en: 'Ana is at work.', es: 'Ana está en el trabajo.', pron: 'á-na is at werk', form: 'is' },
  { id: 'ana-at-school', visualId: 'unit2.to-be.ana-at-school', en: 'Ana is at school.', es: 'Ana está en la escuela.', pron: 'á-na is at skúul', form: 'is' },
  { id: 'ana-ready', visualId: 'unit2.to-be.ana-ready', en: 'Ana is ready.', es: 'Ana está lista.', pron: 'á-na is ré-di', form: 'is' },
  { id: 'dog-here', visualId: 'unit2.to-be.dog-here', en: 'The dog is here.', es: 'El perro está aquí.', pron: 'de dog is jir', form: 'is' },
];
