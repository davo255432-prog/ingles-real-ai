import type { VisualMetadata } from './types';

export const VISUAL_CATALOG = {
  'unit1.pronouns.i': {
    id: 'unit1.pronouns.i',
    file: '../../assets/coach/unit1/pronouns/i-david.png',
    alt: 'David se señala a sí mismo para representar el pronombre I',
    unit: 'unit1',
    category: 'pronouns',
    subjects: ['David'],
  },
  'unit1.pronouns.you': {
    id: 'unit1.pronouns.you',
    file: '../../assets/coach/unit1/pronouns/you-david.png',
    alt: 'David señala a la persona con quien habla para representar el pronombre you',
    unit: 'unit1',
    category: 'pronouns',
    subjects: ['David'],
  },
  'unit1.pronouns.he': {
    id: 'unit1.pronouns.he',
    file: '../../assets/coach/unit1/pronouns/he-carlos.png',
    alt: 'Carlos representa el pronombre he',
    unit: 'unit1',
    category: 'pronouns',
    subjects: ['Carlos'],
  },
  'unit1.pronouns.she': {
    id: 'unit1.pronouns.she',
    file: '../../assets/coach/unit1/pronouns/she-maria.png',
    alt: 'María representa el pronombre she',
    unit: 'unit1',
    category: 'pronouns',
    subjects: ['María'],
  },
  'unit1.pronouns.we': {
    id: 'unit1.pronouns.we',
    file: '../../assets/coach/unit1/pronouns/we-david-maria.png',
    alt: 'David y María juntos representan el pronombre we',
    unit: 'unit1',
    category: 'pronouns',
    subjects: ['David', 'María'],
  },
  'unit1.pronouns.they': {
    id: 'unit1.pronouns.they',
    file: '../../assets/coach/unit1/pronouns/they-carlos-ana.png',
    alt: 'Carlos y Ana juntos representan el pronombre they',
    unit: 'unit1',
    category: 'pronouns',
    subjects: ['Carlos', 'Ana'],
  },
  'unit1.pronouns.it': {
    id: 'unit1.pronouns.it',
    file: '../../assets/coach/unit1/pronouns/it-dog-phone.png',
    alt: 'Un perro y un teléfono representan el pronombre it',
    unit: 'unit1',
    category: 'pronouns',
    subjects: ['dog', 'phone'],
  },
} as const satisfies Record<string, VisualMetadata>;

export type VisualId = keyof typeof VISUAL_CATALOG;
