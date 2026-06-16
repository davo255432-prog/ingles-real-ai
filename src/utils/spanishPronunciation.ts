// ─────────────────────────────────────────────────────────────────────────────
// Pronunciación aproximada (inglés → lectura en español)
//
// Genera una guía de pronunciación BREVE y fácil de leer para hispanohablantes
// a partir de un texto en inglés. NO usa símbolos fonéticos IPA. Es una
// aproximación pensada para leerse "tal cual" con las reglas del español.
//
// Es lógica 100% local (sin red, sin backend, sin API). Determinista.
// Pensada para reutilizarse desde cualquier pantalla que muestre texto en
// inglés (p.ej. "Habla en español").
// ─────────────────────────────────────────────────────────────────────────────

// Diccionario de palabras frecuentes con su lectura aproximada en español.
// Tiene prioridad sobre las reglas: cubre los casos donde la transliteración
// automática fallaría (vocales largas, "e" muda, irregularidades comunes).
const WORD_MAP: Record<string, string> = {
  // pronombres y verbo to be
  i: 'ai', you: 'yu', he: 'ji', she: 'shi', it: 'it', we: 'uí', they: 'déi',
  me: 'mi', him: 'jim', her: 'jer', us: 'as', them: 'dem',
  my: 'mai', your: 'yur', his: 'jis', our: 'áuer', their: 'der',
  am: 'am', is: 'is', are: 'ar', be: 'bi', was: 'uós', were: 'uér',
  been: 'biin', being: 'bíin',
  // artículos / conectores
  the: 'de', a: 'a', an: 'an', and: 'an', or: 'or', but: 'bat',
  of: 'av', to: 'tu', in: 'in', on: 'on', at: 'at', for: 'for',
  with: 'uíd', from: 'from', by: 'bai', as: 'as', so: 'sóu', if: 'if',
  this: 'dis', that: 'dat', these: 'diis', those: 'dóus',
  here: 'jíer', there: 'der', where: 'uér', when: 'uén', what: 'uát',
  who: 'ju', how: 'jáo', why: 'uái', which: 'uích',
  // verbos y palabras muy comunes
  need: 'niid', want: 'uánt', have: 'jav', has: 'jas', had: 'jad',
  do: 'du', does: 'das', did: 'did', go: 'góu', goes: 'góus',
  get: 'guet', got: 'gat', make: 'méik', take: 'téik', give: 'guiv',
  can: 'can', will: 'uíl', would: 'wud', should: 'shud', could: 'cud',
  like: 'láik', know: 'nóu', see: 'sii', say: 'séi', come: 'cam',
  please: 'plíis', thanks: 'zenks', thank: 'zenk', sorry: 'sóri',
  yes: 'yes', no: 'nóu', not: 'nat', now: 'náo', here_is: 'jíer is',
  // sustantivos / adjetivos frecuentes
  car: 'car', keys: 'kiis', key: 'kii', water: 'uáter', food: 'fud',
  house: 'jáus', home: 'jóum', work: 'uérk', name: 'néim',
  day: 'déi', time: 'táim', help: 'jelp', money: 'máni',
  good: 'gud', bad: 'bad', big: 'big', small: 'smol',
  ready: 'rédi', tired: 'táierd', happy: 'jápi', open: 'óupen',
  closed: 'clóusd', outside: 'autsáid', inside: 'insáid',
  one: 'uán', two: 'tu', three: 'zrii', four: 'for', five: 'fáiv',
  morning: 'mórnin', today: 'tudéi', tomorrow: 'tumórou',
  david: 'déivid', okay: 'oukéi', ok: 'oukéi',
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
const isVowel = (c: string) => VOWELS.has(c);

// Transliteración por reglas para palabras que no están en el diccionario.
// Recorre la palabra con "lookahead" para tratar dígrafos antes que letras
// sueltas. Es una aproximación: prioriza legibilidad sobre exactitud.
function fallbackWord(raw: string): string {
  let s = raw.toLowerCase();

  // "e" muda final (magic-e simplificada): name, like, make…
  if (s.length > 3 && s.endsWith('e') && !isVowel(s[s.length - 2])) {
    s = s.slice(0, -1);
  }

  let out = '';
  let i = 0;
  const len = s.length;

  while (i < len) {
    const three = s.slice(i, i + 3);
    const two = s.slice(i, i + 2);
    const c = s[i];
    const next = s[i + 1] ?? '';

    // trigramas
    if (three === 'igh') { out += 'ai'; i += 3; continue; }

    // dígrafos consonánticos
    if (two === 'th') { out += 'd'; i += 2; continue; }
    if (two === 'sh') { out += 'sh'; i += 2; continue; }
    if (two === 'ch') { out += 'ch'; i += 2; continue; }
    if (two === 'ph') { out += 'f'; i += 2; continue; }
    if (two === 'ck') { out += 'k'; i += 2; continue; }
    if (two === 'qu') { out += 'ku'; i += 2; continue; }
    if (two === 'wh') { out += 'u'; i += 2; continue; }
    if (two === 'gh') { out += ''; i += 2; continue; }

    // dígrafos vocálicos
    if (two === 'ee' || two === 'ea') { out += 'ii'; i += 2; continue; }
    if (two === 'oo') { out += 'u'; i += 2; continue; }
    if (two === 'ou' || two === 'ow') { out += 'au'; i += 2; continue; }
    if (two === 'ai' || two === 'ay' || two === 'ey') { out += 'ei'; i += 2; continue; }
    if (two === 'oa' || two === 'oe') { out += 'ou'; i += 2; continue; }

    // consonante doble → simple
    if (c === next && !isVowel(c)) { i += 1; continue; }

    // letras sueltas
    switch (c) {
      case 'c':
        out += (next === 'e' || next === 'i' || next === 'y') ? 's' : 'k';
        break;
      case 'h': out += 'j'; break;       // h aspirada inglesa ≈ j española
      case 'j': out += 'y'; break;       // j inglesa ≈ "y" (jam → yam)
      case 'q': out += 'k'; break;
      case 'v': out += 'v'; break;
      case 'w': out += 'u'; break;
      case 'x': out += 'ks'; break;
      case 'y':
        out += (i === 0 || isVowel(next)) ? 'y' : 'i';
        break;
      case 'z': out += 's'; break;
      default: out += c; break;          // vocales y consonantes directas
    }
    i += 1;
  }

  return out;
}

/** Pronuncia una sola palabra (limpia de puntuación). */
function pronounceWord(word: string): string {
  const lower = word.toLowerCase();
  return WORD_MAP[lower] ?? fallbackWord(lower);
}

/**
 * Devuelve la pronunciación aproximada en español de un texto en inglés.
 * Mantiene el orden de las palabras y descarta la puntuación.
 * Si el texto está vacío, devuelve "".
 */
export function toSpanishPronunciation(english: string): string {
  if (!english || !english.trim()) return '';

  return english
    .trim()
    .split(/\s+/)
    .map((token) => {
      // separa la palabra de la puntuación pegada (p.ej. "keys." → "keys")
      const clean = token.replace(/[^A-Za-z']/g, '');
      if (!clean) return '';
      return pronounceWord(clean);
    })
    .filter(Boolean)
    .join(' ')
    .trim();
}
