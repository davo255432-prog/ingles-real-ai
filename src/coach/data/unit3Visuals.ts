import type { VisualId } from '../visual-library';

export const UNIT_3_VISUALS = {
  pronouns: {
    I: 'unit1.pronouns.i',
    You: 'unit1.pronouns.you',
    He: 'unit1.pronouns.he',
    She: 'unit1.pronouns.she',
    We: 'unit1.pronouns.we',
    They: 'unit1.pronouns.they',
    It: 'unit1.pronouns.it',
  },
  activation: {
    'I am ready.': 'unit2.to-be.david-ready',
    'She is here.': 'unit2.to-be.maria-in-the-office',
    'We are tired.': 'global.scenes.david-maria-going-to-school',
  },
  verbs: {
    need: 'global.scenes.david-needs-help-at-work',
    have: 'global.scenes.david-ready-with-essentials',
    want: 'global.scenes.david-wants-water',
    'go-to': 'global.scenes.david-going-to-school',
  },
  verbRealUse: {
    need: 'global.scenes.david-needs-help-at-work',
    have: 'global.scenes.david-ready-with-essentials',
    want: 'global.scenes.david-wants-water',
    'go-to': 'unit2.to-be.david-at-work',
  },
  examples: {
    'We need help.': 'global.scenes.david-needs-help-at-work',
    'I have the keys.': 'global.scenes.david-ready-with-essentials',
    'They have food.': 'global.scenes.carlos-ana-with-food',
    'I want water.': 'global.scenes.david-wants-water',
    'We go to school.': 'global.scenes.david-maria-going-to-school',
  },
  matching: {
    need: 'global.scenes.david-needs-help-at-work',
    have: 'global.scenes.david-ready-with-essentials',
    want: 'global.scenes.david-wants-water',
    'go-to': 'global.scenes.david-going-to-school',
  },
  prepositions: {
    in: 'unit2.to-be.david-in-california',
    home: 'unit2.to-be.david-at-home',
    work: 'unit2.to-be.david-at-work',
  },
  connectors: {
    and: 'global.scenes.carlos-ana-with-food',
    but: 'global.scenes.david-ready-with-essentials',
    because: 'global.scenes.david-needs-help-at-work',
    also: 'global.scenes.carlos-ana-with-food',
  },
  builder: 'global.scenes.david-needs-help-at-work',
  repetition: {
    'need-help': 'global.scenes.david-needs-help-at-work',
    'water-and-food': 'global.scenes.carlos-ana-with-food',
    'help-because-tired': 'global.scenes.david-needs-help-at-work',
  },
  dialogue: 'global.scenes.david-carlos-work-dialogue',
  preparation: 'global.scenes.david-ready-with-essentials',
  speakingPractice: {
    'work-help': 'global.scenes.david-needs-help-at-work',
    'ready-keys': 'global.scenes.david-ready-with-essentials',
    'want-water': 'global.scenes.david-wants-water',
    'go-work': 'global.scenes.david-ready-with-essentials',
  },
  speakingMission: {
    'mission-work': 'global.scenes.david-needs-help-at-work',
    'mission-ready': 'global.scenes.david-ready-with-essentials',
    'mission-school': 'global.scenes.david-going-to-school',
  },
  listeningMission: {
    'listen-home': 'unit2.to-be.david-at-home',
    'listen-work': 'global.scenes.david-needs-help-at-work',
    'listen-school': 'global.scenes.david-going-to-school',
  },
  sceneFamilies: {
    food: 'global.scenes.carlos-ana-with-food',
    schoolGroup: 'global.scenes.david-maria-going-to-school',
  },
} as const satisfies {
  pronouns: Record<string, VisualId>;
  activation: Record<string, VisualId>;
  verbs: Record<string, VisualId>;
  verbRealUse: Record<string, VisualId>;
  examples: Record<string, VisualId>;
  matching: Record<string, VisualId>;
  prepositions: Record<string, VisualId>;
  connectors: Record<string, VisualId>;
  builder: VisualId;
  repetition: Record<string, VisualId>;
  dialogue: VisualId;
  preparation: VisualId;
  speakingPractice: Record<string, VisualId>;
  speakingMission: Record<string, VisualId>;
  listeningMission: Record<string, VisualId>;
  sceneFamilies: Record<string, VisualId>;
};

export function getUnit3Visual(
  visualMap: Readonly<Record<string, VisualId>>,
  key: string,
): VisualId {
  const visualId = visualMap[key];
  if (!visualId) {
    throw new Error(`[Biblioteca Visual] No existe una imagen de Unidad 3 para "${key}".`);
  }
  return visualId;
}
