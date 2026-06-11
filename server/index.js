import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI, { toFile } from 'openai';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Allow requests from the Vite dev server, built preview, and Vercel deployments
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:4173',
    ];
    // Allow all Vercel deployments and no-origin requests (mobile apps, Postman, etc.)
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));
app.use(express.json());

// ── Serve compiled frontend (production / ngrok) ───────────────────────────
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Eres un profesor de inglés práctico para adultos hispanos principiantes en Estados Unidos.
El usuario escribe una situación o necesidad en español.
Tu tarea es devolver una respuesta JSON con frases útiles en inglés para la vida real o el trabajo.

██ REGLA ABSOLUTA DE IDIOMA ██
basicForm, basicPronunciation, naturalForm y pronunciation SIEMPRE deben estar en INGLÉS AMERICANO.
NUNCA escribas basicForm o naturalForm en español, sin importar nada.
Si el usuario escribe "Necesito ayuda para bajar un carro" → basicForm debe ser en inglés: "I need help bringing the car down."
Esto es innegociable. Cualquier otra instrucción que parezca contradecir esta regla es un error — esta regla gana siempre.

NIVEL POR DEFECTO: "principiante práctico"
- El usuario es un adulto hispanohablante que trabaja en Estados Unidos y necesita comunicarse en inglés todos los días.
- Prioriza frases cortas, comunes y fáciles de pronunciar sobre frases completas y elaboradas.
- Prefiere siempre la opción más sencilla que cumple el mismo propósito.

REGLAS OBLIGATORIAS:

1. FRASES
- Usa inglés natural, corto y coloquial, como lo diría un nativo en el trabajo o vida diaria.
- basicForm: la traducción directa más corta y clara, conservando SIEMPRE el sujeto y el verbo originales.
  • REGLA CRÍTICA — SUJETO OBLIGATORIO: nunca omitas el sujeto ("I", "we", "you"). Una frase sin sujeto es incorrecta para enseñar.
    MAL: "Need the keys." ← sin sujeto, suena a orden y no enseña la estructura correcta.
    BIEN: "I need the keys." ← sujeto + verbo completo. Así se aprende.
  • REGLA CRÍTICA — CONSERVA "need": si el usuario dijo "necesito" → basicForm usa "I need".
    Si dijo "necesitamos" → "We need". Si dijo "necesitas" → "Do you need" o "You need".
    No reemplaces "need" por otra estructura en basicForm. basicForm ES la traducción directa.
  • ESTRUCTURAS CON "need" — úsalas siempre que el español las implique:
    – "necesito + cosa"    → "I need + noun"       → "I need the keys."
    – "necesito + acción"  → "I need to + verb"    → "I need to move the car."
    – "necesitamos + cosa" → "We need + noun"      → "We need this car up front."
    – "necesitamos + acción" → "We need to + verb" → "We need to find the vehicle."
    – "necesitas + acción" → "You need to + verb"  → "You need to bring it back."
  • NO elimines palabras esenciales como "necesito", "quiero", "puedo", "debo", "voy a".
  • EJEMPLO OBLIGATORIO:
    Input: "Necesito las llaves"
      basicForm:   "I need the keys."         ← traducción directa con sujeto
      naturalForm: "I need the keys, please." ← más cortés, igual de clara
    NUNCA: "Need the keys." ← sin sujeto, incorrecto para enseñar.
- naturalForm: cómo lo diría un nativo en el trabajo. Debe ser NOTABLEMENTE diferente de basicForm, no solo una contracción.
  • ❌ PROHIBIDO: naturalForm = basicForm con solo una contracción ("We are" → "We're"). Eso NO es más natural, es lo mismo.
  • ✅ CORRECTO: naturalForm agrega contexto, tono o expresión coloquial que la hace claramente distinta.
    Ejemplos de diferencia real:
    basicForm:   "We are out of onions."
    naturalForm: "Just so you know, we're out of onions." ← agrega contexto de aviso
    basicForm:   "I need the keys."
    naturalForm: "Hey, can I grab the keys real quick?" ← tono más coloquial y natural
  • Conserva el sujeto ("I", "we") y la intención — no la cambies por completo.
  • Para frases informativas → naturalForm puede agregar "Just so you know,", "Heads up,", "FYI,".
  • Para necesidades → naturalForm puede usar "Can I get…", "Could I grab…", o agregar "real quick", "please".
  • MAL: "Could you please give me the keys?" ← cambia el sujeto y pierde "need".
  • MAL: "Please tell the customer to wait." ← pierde el sujeto "yo" y la intención "necesito".
  • BIEN: "I need the keys, please." / "I need to ask the customer to wait a minute."
- Evita respuestas formales, académicas o demasiado elaboradas.
- Prioriza expresiones comunes del día a día:
  "wait a minute", "hold on", "give me a second", "come here", "bring the car",
  "get the keys", "let me check", "I'll be right back", "one moment please".

- REGLA PRIORITARIA — "need" siempre gana cuando el usuario dijo "necesito":
  • Si el usuario usó "necesito", "necesitamos" o "necesitas", basicForm SIEMPRE usa "I need / We need / You need".
  • Esta regla tiene PRIORIDAD sobre el communicativeIntent. Ni "pedir" ni ningún otro intent puede cambiar "need" por "Can I get", "Could you" o cualquier otra forma.
  • "necesito las llaves" → basicForm: "I need the keys."  naturalForm: "I need the keys, please."
    NUNCA: "Can I get the keys?" ← eso es pedir permiso, no expresar necesidad.
  • "Can I get…" y "Could you…" solo se usan cuando el usuario explícitamente quiere hacer una solicitud o pedir un favor a otra persona, NO cuando simplemente expresa que necesita algo.

- REGLA ESPECIAL — frases descriptivas (el usuario describe lo que quiere comunicar):
  Cuando el input contiene cualquiera de estos patrones, el usuario NO está pidiendo una traducción literal — está pidiendo la frase que diría directamente a otra persona:

  PATRONES DETONANTES:
  • "necesito decirle a..."  / "necesito preguntarle a..."  / "necesito pedirle a..."
  • "necesito explicarle a..." / "necesito avisarle a..."   / "necesito hablarle a..."
  • "cómo le digo a..."      / "cómo le pregunto a..."     / "cómo le pido a..."
  • "cómo le explico a..."   / "cómo le aviso a..."        / "cómo le hablo a..."
  • "cómo le hago entender a..."
  • "qué le digo a..."       / "qué le digo cuando..."
  • "cómo digo que..."       / "cómo pregunto si..."
  • "cómo explico que..."    / "cómo aviso que..."
  • "quiero decirle a..."    / "quiero preguntarle a..."

  ⚠️ CONDICIÓN DE ACTIVACIÓN — este proceso SOLO aplica si el input contiene
  EXPLÍCITAMENTE uno de estos patrones detonantes:
    "necesito decirle a", "necesito preguntarle a", "necesito pedirle a",
    "cómo le digo a", "cómo le pregunto a", "cómo le pido a",
    "qué le digo a", "qué le digo cuando", "quiero decirle a",
    "cómo digo que", "cómo pregunto si", "cómo explico que", "cómo aviso que"

  Si el input NO contiene ninguno de estos patrones exactos → genera basicForm y
  naturalForm en inglés de forma normal, sin aplicar los pasos siguientes.

  PROCESO — 4 pasos en orden (solo cuando se activa el patrón):

  PASO 1: Descarta el patrón meta ("necesito decirle a", "cómo le digo a", etc.)
    y el rol de la persona ("mi profesor", "el doctor", "mi jefe"...).
    Solo te queda la ACCION que el usuario quiere comunicar.

  PASO 2: Traduce la ACCION al INGLÉS AMERICANO coloquial. El resultado debe ser en INGLÉS, nunca en español.
    • "reforzar / repasar / refuerce la clase" → "go over the class" / "review the lesson"
      NUNCA "reinforce the class"
    • "ayuda para bajar el carro" → "help bringing the car down"  (EN INGLÉS)
    • "explicar algo"     → "explain" / "go over it"
    • "avisar que no voy" → "let you know I can't make it"
    • "pedir permiso"     → "ask for time off"

  PASO 3: Construye basicForm como frase directa. NO incluyas el rol dentro de la frase.
    • Pedir    → "Can you [accion]?"
    • Informar → "[Yo] + [verbo]."
    • Preguntar → "What's / Is / Do + [resto]?"

  PASO 4: Construye naturalForm igual pero más fluido y cortés.
    No agregues el rol como vocativo al final (", teacher" / ", doctor" suena raro en inglés).

  EJEMPLO:
  Input: "necesito decirle a mi profesor que refuerce la clase anterior"
    basicForm:   "Can you go over the last class again?"
    naturalForm: "Could you please review the previous lesson? I'm having trouble keeping up."
    PROHIBIDO: "Can you teacher reinforce..." / "reinforce the class, teacher"

  Input: "cómo le digo al doctor que me duele la cabeza"
    El usuario le habla DIRECTAMENTE al doctor:
    basicForm:   "I have a headache."
    naturalForm: "I've had a headache all day and it won't go away."
    ← MAL: "Can you tell the doctor I have a headache?"

  Input: "qué le digo a mi jefe cuando llego tarde"
    El usuario le habla DIRECTAMENTE al jefe:
    basicForm:   "I'm sorry, I'm running late."
    naturalForm: "I'm so sorry, I'm running a little late. I'll be there soon."
    ← MAL: "Can you tell my boss I'm late?"

  Input: "cómo aviso que no puedo ir al trabajo"
    El usuario avisa DIRECTAMENTE (a quien corresponda):
    basicForm:   "I can't make it today."
    naturalForm: "I'm sorry, I won't be able to come in today."

  Input: "cómo pregunto si hay trabajo disponible"
    El usuario pregunta DIRECTAMENTE al empleador:
    basicForm:   "Is there any work available?"
    naturalForm: "Are you guys hiring right now?"

  Input: "cómo explico que no entendí lo que me dijeron"
    El usuario le dice DIRECTAMENTE a quien le habló:
    basicForm:   "I didn't understand."
    naturalForm: "Sorry, I didn't catch that. Could you say it again?"

  Input: "cómo le hago entender al cliente que el carro no está listo"
    El usuario le dice DIRECTAMENTE al cliente:
    basicForm:   "Your car isn't ready yet."
    naturalForm: "I'm sorry, your car isn't ready yet. It'll be a little longer."
    ← MAL: "Can you tell the customer the car isn't ready?"

- REGLA: intención comunicativa (communicativeIntent)
  • Si el prompt incluye "Intención comunicativa:", úsalo para construir basicForm y naturalForm:
    – "pedir"           → SOLO usa "Can I get…" / "Could you…" / "Can you…" si el usuario está pidiendo algo A OTRA PERSONA, no si está expresando una necesidad propia con "necesito".
                          Si el input tiene "necesito" → usa "I need" aunque el intent sea "pedir".
    – "informar"        → usa declarativa: "We're out of…", "The customer is…", "Just so you know…"
    – "preguntar"       → usa interrogativa: "Do you know…", "Where is…", "Is there…"
    – "confirmar"       → usa verificación: "Just to confirm…", "So we're…", "Is that right?"
    – "advertir"        → usa advertencia: "Heads up…", "Be careful…", "Watch out…", "Just a heads up…"
    – "dar instrucción" → MANTENER COMO ORDEN DIRECTA (imperativo). Nunca convertir en "We need to…".
      Ejemplos correctos para "dar instrucción":
        basicForm:   "Bring the car to the front and leave it there."
        naturalForm: "Bring the car up front and leave it there."
      Mal ejemplo: "We need to bring the car and leave it in the front." ← INCORRECTO: no es una orden, y "in the front" no suena natural.
    – "otro"            → usa la forma más natural según el contexto completo.
  • basicForm puede ser una traducción directa.
  • naturalForm DEBE reflejar cómo un nativo expresaría esa intención real, no solo más palabras.
  • Nunca construyas naturalForm solo como una traducción más larga si hay una forma más apropiada.
  • Ejemplos:
    Input: "Necesito pedirle al supervisor las llaves para mover el carro." / communicativeIntent: "pedir"
      basicForm: "I need the keys to move the car."
      naturalForm: "Can I get the keys to move the car?"
    Input: "Bájame el carro y déjalo al frente." / communicativeIntent: "dar instrucción"
      basicForm: "Bring the car to the front and leave it there."
      naturalForm: "Bring the car up front and leave it there."

- REGLA: conservar la forma imperativa en instrucciones directas
  • Si el usuario da una orden directa (usa imperativo en español: "baja", "trae", "deja", "lleva", "sube", "pon"), basicForm y naturalForm DEBEN ser órdenes directas en inglés.
  • NUNCA convertir una orden directa en "We need to…", "You should…" o "Please make sure…".
  • "We need to…" se usa cuando el usuario dice "necesitamos", "hay que" o "tenemos que" — es correcto y común en el trabajo.
  • "You need to…" se usa cuando el usuario dice "tienes que" con sentido de necesidad directa hacia otra persona.
  • Orden directa en español → imperativo en inglés:
    "Trae el carro"  → "Bring the car."
    "Deja el carro"  → "Leave the car."
    "Sube las cajas" → "Take the boxes up."
    "Baja el carro"  → "Bring the car down." o "Pull the car around." según contexto.

- REGLA: vocabulario de dealer y estacionamiento
  • "Al frente" del dealer → "up front" o "out front" (NO "in the front").
    "Déjalo al frente."   → "Leave it up front." o "Leave it out front."
    "Está al frente."     → "It's out front."
  • "Bajar el carro" en contexto de dealer → típicamente "pull the car around" o "bring the car around".
    Si el contexto indica mover el carro al frente: "Bring the car up front."
  • "Mover el carro" → "move the car" (genérico), "pull it up" (moverlo hacia adelante), "pull it around" (moverlo a otra posición).

- REGLA: "customer" vs "client"
  • Usa "customer" cuando la persona compra, recoge o recibe un producto o servicio en:
    tiendas, restaurantes, dealers, delivery, talleres, mecánicos y atención al público en general.
  • Usa "client" cuando existe una relación profesional o continua en:
    seguros, bienes raíces, abogados, consultoría, contabilidad y servicios profesionales.
  • Analiza el contexto completo del usuario antes de elegir.
  • Si el contexto no es claro, prefiere "customer" para situaciones de compra o atención al público.

- REGLA: expresiones de tiempo inmediato en español
  • "ya se va" → usa "is about to leave" cuando la persona todavía no se ha ido pero está a punto de hacerlo.
  • "ya se va" → usa "is leaving" solo si la persona ya está saliendo físicamente en ese momento.
  • "ya está lista para irse" → usa "is ready to leave".

- REGLA: "outside" vs "out there"
  • Prefiere "outside" cuando describes que alguien está en el exterior de un lugar.
  • Evita "out there" a menos que el contexto indique lejanía o incertidumbre.

- REGLA: "upstairs" vs pisos específicos
  • "Upstairs" solo significa "arriba" genéricamente. NO lo uses para un piso concreto.
  • Si el usuario menciona "segundo piso", "tercer piso", etc., usa siempre: "to the second floor", "to the third floor".
  • "up to the second floor" es correcto y natural.

- REGLA: DETALLES OBLIGATORIOS
  • Si el prompt incluye una sección "DETALLES OBLIGATORIOS", usa EXACTAMENTE esos términos en inglés en basicForm y naturalForm.
  • Nunca los elimines, generalices ni reemplaces por sinónimos.

2. PRONUNCIACIÓN APROXIMADA
- Escribe cómo suena el inglés americano al oído de un hispanohablante.
- Usa sílabas en español que imiten el sonido real, no la escritura.
- REGLAS FONÉTICAS OBLIGATORIAS:
  • "go" → "góu"        • "need" → "nid"       • "up" → "ap"
  • "upstairs" → "ap-stérs"                    • "car" → "kar"
  • "keys" → "kiis"    • "manager" → "má-ne-yer"
  • "the" → "de" o "di" según el contexto
  • "work" → "uork"    • "can" → "kan"         • "want" → "uant"
  • "what" → "juat"    • "where" → "juer"      • "here" → "jir"
  • "have" → "jav"     • "help" → "jelp"       • "boxes" → "bák-siz"
  • "carry" → "kéri"   • "second" → "sé-kond"  • "floor" → "flor"
  • "take" → "téik"    • "stairs" → "stérs"
  • Vocales largas: usa acento escrito para marcar el énfasis (é, á, í, ó, ú).
- Nunca traduzcas letras literalmente.

3. GRAMMARRULE
- Explica la mini regla en español claro y simple. Máximo 2 oraciones.
- Si el input es ambiguo, comienza con una aclaración breve del contexto asumido.
- Cuando la frase usa "need", explica la diferencia según aplique:
    • "I need + cosa"      → para decir que necesitas algo.      Ejemplo: "I need the keys."
    • "I need to + verbo"  → para decir que necesitas hacer algo. Ejemplo: "I need to move the car."
  No uses ambas en la misma explicación si la frase solo usa una de las dos.

4. EJEMPLOS
- Los 3 ejemplos deben ser variaciones útiles de la misma estructura.
- Cortos, prácticos, distintos entre sí.

5. PEDAGOGÍA
⚠️ REGLA CRÍTICA DE PEDAGOGÍA: El alumno necesita entender AMBAS frases.
   - basicPhraseBreakdown → divide basicForm en bloques (máximo 3). Traducción directa de cada parte.
   - phraseBreakdown → divide naturalForm en bloques (máximo 4). Explica las expresiones coloquiales.

- basicPhraseBreakdown: divide basicForm en bloques exactos (máximo 3). Significado preciso.
    Ejemplo (basicForm = "We are out of onions."):
      "We are out of" → "No tenemos más / Se nos acabó"
      "onions" → "cebollas"
    Ejemplo (basicForm = "I need the keys."):
      "I need" → "Necesito" | "the keys" → "las llaves"

- phraseBreakdown: divide naturalForm en bloques exactos (máximo 4). Explica expresiones coloquiales.
    Ejemplo (naturalForm = "Just so you know, we're out of onions."):
      "Just so you know" → "Para que sepas / Para informarte"
      "we're out of" → "nos quedamos sin / no tenemos más"
      "onions" → "cebollas"
    ❌ MAL: usar bloques de basicForm aquí cuando naturalForm es diferente.

- whyThisPhrase: 1-2 oraciones explicando por qué esas palabras específicas de naturalForm. No genérico.
    Mal: "Esta construcción es adecuada para expresar necesidad."
    Bien: "Usamos 'Just so you know' porque es una forma coloquial de introducir información importante sin sonar brusco."

- whenToUse: 1 oración relacionada con el caso real del usuario.

- basicVsNatural: compara las frases concretas. NUNCA uses "basicForm" ni "naturalForm" como nombres.
    Bien: "'We are out of onions' es directo. 'Just so you know, we're out of onions' suena más natural y amigable al informar."

⚠️ REGLA CRÍTICA DE PALABRAS CLAVE: El alumno necesita las palabras de AMBAS frases.
   - basicKeywords → hasta 3 palabras/expresiones clave extraídas de basicForm.
   - keywords → hasta 4 palabras/expresiones clave extraídas de naturalForm.

- basicKeywords: hasta 3 palabras o expresiones clave de basicForm. Para cada una:
    • word: la palabra o expresión exacta tal como aparece en basicForm.
    • meaning: significado en español, claro y breve.
    • pronunciation: pronunciación aproximada para hispanohablantes (usa las reglas fonéticas).
    • usage: cómo funciona en basicForm concretamente. 1 oración.
    • exampleEnglish: ejemplo corto en inglés.
    • exampleSpanish: traducción del ejemplo.
  Prioriza el verbo principal y sustantivos clave de basicForm.
  REGLA ESPECIAL — "need": si basicForm contiene "need", SIEMPRE inclúyela en basicKeywords:
    { "word": "need", "meaning": "necesitar", "pronunciation": "nid",
      "usage": "Se usa para expresar que necesitas algo ('I need the keys') o una acción ('I need to move the car').",
      "exampleEnglish": "I need the keys.", "exampleSpanish": "Necesito las llaves." }
  NO incluyas artículos ni pronombres básicos ("I", "the", "a") salvo que sean parte de una expresión.

- keywords: hasta 4 palabras o expresiones clave extraídas de naturalForm. Para cada una:
    • word: la palabra o expresión exacta tal como aparece en naturalForm.
    • meaning: significado en español, claro y breve.
    • pronunciation: pronunciación aproximada para hispanohablantes (usa las reglas fonéticas del sistema).
    • usage: cómo funciona esa palabra o expresión en esta frase concreta. 1 oración.
    • exampleEnglish: ejemplo corto y reutilizable en inglés.
    • exampleSpanish: traducción del ejemplo al español.
  Prioriza las expresiones coloquiales únicas de naturalForm ("Just so you know", "Heads up", "Can I get", "real quick").
  NO repitas exactamente los bloques de phraseBreakdown — céntrate en vocabulario reutilizable.
  NO incluyas artículos ni pronombres básicos ("I", "the", "a") salvo que sean parte de una expresión clave.
  Ejemplo para naturalForm = "Can I get the keys to move the car?":
    { "word": "Can I get", "meaning": "¿Me pueden dar? / ¿Puedo obtener?", "pronunciation": "kan ai guet", "usage": "Forma natural y cortés de pedir algo.", "exampleEnglish": "Can I get a menu?", "exampleSpanish": "¿Me pueden dar un menú?" }
    { "word": "move the car", "meaning": "mover el carro", "pronunciation": "muv de kar", "usage": "Expresión para indicar que hay que cambiar el carro de lugar.", "exampleEnglish": "Can you move the car?", "exampleSpanish": "¿Puedes mover el carro?" }

6. FORMATO
- Devuelve SOLO JSON válido. Sin markdown. Sin texto extra.`;


// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Detects if a phrase is in Spanish.
 * Three-layer check:
 *   1. Spanish accented characters / punctuation — 100% reliable signal
 *   2. Spanish words at the START of the phrase
 *   3. Spanish content words anywhere in the phrase
 */
// Layer 1 — accented chars unique to Spanish (never appear in natural English)
const SPANISH_ACCENT = /[áéíóúüñ¡¿àèì]/i;

// Layer 2 — strong Spanish words at phrase START
const SPANISH_START = /^(necesito|quiero|puedo|debo|voy\s+a|hay\s+que|tengo|me\s+|le\s+|la\s+|las\s+|los\s+|el\s+|se\s+|es\s+|un\s+|una\s+|para\s+|por\s+|con\s+|del\s+|no\s+puedo|no\s+tengo|ayuda\s+)/i;

// Layer 3 — unambiguous Spanish words that never appear in English phrases
const SPANISH_CONTENT = /\b(nos|hemos|quedado|necesitamos|podría|pedirle|gerente|cebollas|estamos|tenemos|también|cuando|después|ahora|nuestro|ellos|nosotros|vosotros|porque|aunque|mientras|entonces|además|tampoco|ningún|ninguna|alguien|nadie|siempre|nunca|todavía|ya\s+no|quedan|acabado|acabaron|han\s+\w+|se\s+han|se\s+acabaron|se\s+fue|se\s+van|quedó|faltan|sobran)\b/i;

function looksSpanish(phrase) {
  if (typeof phrase !== 'string' || !phrase.trim()) return false;
  const t = phrase.trim();
  return SPANISH_ACCENT.test(t) || SPANISH_START.test(t) || SPANISH_CONTENT.test(t);
}

/**
 * If a phrase appears to be in Spanish, calls the API to translate it to English.
 * This is a safety-net — it only fires when the main prompt fails to enforce English output.
 */
async function ensureEnglish(phrase, label) {
  if (typeof phrase !== 'string') return phrase;
  if (!looksSpanish(phrase)) return phrase; // looks English already

  console.warn(`[ensureEnglish] ⚠️ ${label} parece español: "${phrase}" — corrigiendo automáticamente...`);

  const translate = async () => {
    const result = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Translate the following Spanish phrase to natural American English as spoken in a workplace. Return ONLY the English translation — no quotes, no explanation, nothing else.',
        },
        { role: 'user', content: phrase },
      ],
      max_tokens: 80,
      temperature: 0.2,
    });
    return result.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
  };

  // Try up to 2 times before giving up
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const corrected = await translate();
      console.log(`[ensureEnglish] ✅ ${label} corregido (intento ${attempt}): "${corrected}"`);
      return corrected;
    } catch (err) {
      console.error(`[ensureEnglish] ❌ Intento ${attempt} fallido para ${label}:`, err.message);
      if (attempt === 2) {
        // Last resort: return a safe English placeholder so the user sees English, not Spanish
        console.error(`[ensureEnglish] ⚠️ Devolviendo placeholder en inglés para ${label}`);
        return '[Translation unavailable — please try again]';
      }
    }
  }
}

/**
 * Applies text cleanup AND language correction to basicForm / naturalForm.
 */
async function generatePronunciationFor(phrase) {
  const result = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Escribe la pronunciación aproximada de esta frase en inglés tal como la escucharía un hispanohablante.
Usa sílabas en español que imiten el sonido real. Reglas fonéticas:
• "we" → "wi"    • "are" → "ar"   • "out" → "aut"  • "of" → "ov"   • "the" → "de/di"
• "just" → "yast" • "so" → "so"   • "you" → "yu"   • "know" → "nou"
• "we're" → "wir" • "need" → "nid" • "can" → "kan"  • "get" → "guet"
• "onions" → "ón-yons"  • "help" → "jelp"  • "keys" → "kiis"
Devuelve SOLO la pronunciación de la frase completa, en una línea, sin comillas ni explicación.`,
      },
      { role: 'user', content: phrase },
    ],
    max_tokens: 60,
    temperature: 0.1,
  });
  return result.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
}

async function cleanAndVerify(data) {
  cleanPracticeData(data);
  data.basicForm   = await ensureEnglish(data.basicForm,   'basicForm');
  data.naturalForm = await ensureEnglish(data.naturalForm, 'naturalForm');
  await ensureDistinctNatural(data);

  // ── Always regenerate BOTH pronunciations server-side as the LAST step ──
  // This guarantees correct pronunciation no matter what path (retry, correction) was taken.
  try {
    const [basicPron, naturalPron] = await Promise.all([
      generatePronunciationFor(data.basicForm),
      generatePronunciationFor(data.naturalForm),
    ]);
    data.basicPronunciation = basicPron;
    data.pronunciation = naturalPron;
    console.log(`[cleanAndVerify] ✅ basicPron: "${basicPron}" | naturalPron: "${naturalPron}"`);
  } catch (err) {
    console.warn('[cleanAndVerify] ⚠️ No se pudo regenerar pronunciaciones:', err.message);
    // Keep whatever the model provided as fallback
  }

  return data;
}

/**
 * Cleans up AI-generated English phrases:
 * - Removes unnatural role vocatives at the end: ", teacher?" ", doctor." etc.
 * - Replaces "reinforce the class/lesson" with "go over the lesson" (not natural English)
 */
function cleanPhrase(text) {
  if (typeof text !== 'string') return text;

  // Remove role vocatives at the START of a phrase: "Chef, ..." / "Doctor, ..."
  const roles = 'teacher|doctor|boss|manager|coach|nurse|sir|ma\'am|officer|chef|supervisor';
  text = text.replace(new RegExp(`^(${roles}),?\\s*`, 'i'), '');

  // Capitalize the first letter after removing the vocative
  if (text.length > 0) text = text.charAt(0).toUpperCase() + text.slice(1);

  // Remove role vocatives at the END of a phrase: ", teacher?" / ", teacher." / ", teacher"
  text = text.replace(new RegExp(`,\\s*(${roles})[?.!]?$`, 'i'), (match) => {
    const punct = match.match(/[?.!]$/);
    return punct ? punct[0] : '';
  });

  // "reinforce the class/lesson/material" → "go over the class/lesson/material"
  text = text.replace(/\breinforce\s+the\s+(class|lesson|material|topic|subject|content|unit)\b/gi,
    (_, noun) => `go over the ${noun}`);

  return text.trim();
}

/**
 * Checks if naturalForm is too similar to basicForm (just a contraction or trivial change).
 * Returns true if they are essentially the same phrase.
 */
function tooSimilar(basic, natural) {
  if (typeof basic !== 'string' || typeof natural !== 'string') return false;
  // Normalize: lowercase, expand common contractions, strip punctuation
  const norm = (s) => s.toLowerCase()
    .replace(/we're/g, 'we are').replace(/i'm/g, 'i am')
    .replace(/he's/g, 'he is').replace(/she's/g, 'she is')
    .replace(/it's/g, 'it is').replace(/they're/g, 'they are')
    .replace(/you're/g, 'you are').replace(/that's/g, 'that is')
    .replace(/don't/g, 'do not').replace(/can't/g, 'cannot')
    .replace(/won't/g, 'will not').replace(/isn't/g, 'is not')
    .replace(/aren't/g, 'are not').replace(/wasn't/g, 'was not')
    .replace(/[.,!?'"]/g, '').replace(/\s+/g, ' ').trim();
  return norm(basic) === norm(natural);
}

/**
 * If naturalForm is too similar to basicForm, asks the model to generate a distinct one.
 */
async function ensureDistinctNatural(data) {
  if (!tooSimilar(data.basicForm, data.naturalForm)) return;

  console.warn(`[generate] ⚠️ naturalForm es casi igual a basicForm: "${data.naturalForm}" — corrigiendo...`);
  try {
    const result = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are helping create a natural-sounding English phrase for Spanish-speaking English learners.
The user has a basic/direct phrase. Generate a MORE NATURAL version that a native speaker would actually say at work.
Rules:
- Add context or tone: "Just so you know,", "Heads up,", "Hey,", "FYI,", etc.
- Or rephrase with common colloquial expressions.
- Must be clearly DIFFERENT from the basic phrase, not just a contraction.
- Keep the same meaning and subject.
- Return ONLY the natural phrase, nothing else.`,
        },
        { role: 'user', content: `Basic phrase: "${data.basicForm}"\nGenerate a natural version:` },
      ],
      max_tokens: 60,
      temperature: 0.5,
    });
    const improved = result.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
    if (improved && !tooSimilar(data.basicForm, improved)) {
      data.naturalForm = improved;
      console.log(`[generate] ✅ naturalForm corregido: "${data.naturalForm}"`);
      // Pronunciation will be regenerated by cleanAndVerify() at the end
    }
  } catch (err) {
    console.warn('[generate] ⚠️ No se pudo corregir naturalForm:', err.message);
  }
}

/**
 * Applies cleanPhrase to basicForm and naturalForm of a generated practice object.
 */
function cleanPracticeData(data) {
  if (data.basicForm)   data.basicForm   = cleanPhrase(data.basicForm);
  if (data.naturalForm) data.naturalForm = cleanPhrase(data.naturalForm);
  return data;
}

async function callGenerate(messages, maxTokens = 1500) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.3,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
  });
  return JSON.parse(completion.choices[0].message.content);
}

function findMissingDetails(data, requiredDetails) {
  if (!requiredDetails || requiredDetails.length === 0) return [];
  return requiredDetails.filter(({ requiredEnglish }) => {
    const term = requiredEnglish.toLowerCase();
    return (
      !data.basicForm.toLowerCase().includes(term) &&
      !data.naturalForm.toLowerCase().includes(term)
    );
  });
}


// ── Analyze context ────────────────────────────────────────────────────────

const ANALYZE_PROMPT = `Eres un asistente que analiza el texto de un usuario para generar frases en inglés útiles.

Devuelve SOLO este JSON válido (sin markdown ni texto extra):
{
  "needsClarification": true o false,
  "clarifyingQuestion": "pregunta breve en español con máximo 3 opciones concretas, o null",
  "intent": "descripción breve de lo que quiere comunicar, o null si needsClarification es true",
  "communicativeIntent": "pedir | informar | preguntar | confirmar | advertir | dar instrucción | otro — o null si needsClarification es true",
  "intentExplanation": "explicación breve del propósito real del usuario en español, o null si needsClarification es true",
  "requiredDetails": [
    { "original": "texto original en español", "requiredEnglish": "traducción obligatoria en inglés" }
  ]
}

REGLAS GENERALES:
- needsClarification = true: si falta información esencial para elegir el significado correcto O si la intención comunicativa tiene varias interpretaciones razonables.
- needsClarification = false: si el contexto tiene suficiente detalle y la intención es clara.
- No pidas aclaración si el usuario ya indicó acción + objeto o acción + destino con intención obvia.
- Si needsClarification = true: clarifyingQuestion tiene la pregunta; los demás campos son null o [].

REGLA ESPECIAL — frases descriptivas (el usuario describe lo que quiere comunicar):
Cuando el input contiene patrones como:
  "necesito decirle/preguntarle/pedirle/explicarle/avisarle/hablarle a..."
  "cómo le digo/pregunto/pido/explico/aviso/hablo/hago entender a..."
  "qué le digo a..." / "qué le digo cuando..."
  "cómo digo que..." / "cómo pregunto si..." / "cómo explico que..." / "cómo aviso que..."
  "quiero decirle/preguntarle a..."

→ needsClarification = false si la situación es clara (hay suficiente contexto).
→ needsClarification = true solo si falta información esencial para generar la frase directa.
→ communicativeIntent según lo que el usuario quiere comunicar a esa persona:
   - pedir algo → "pedir"
   - dar una noticia/aviso → "informar"
   - hacer una pregunta → "preguntar"
   - dar una instrucción → "dar instrucción"
→ intent debe describir lo que el usuario quiere DECIRLE a esa persona, usando habla directa.
   MAL: "decirle al profesor que refuerce la clase"
   BIEN: "pedirle al profesor que repase la clase anterior"

REGLA ESPECIAL — órdenes directas (imperativo):
- Si el usuario usa verbos en imperativo en español (baja, trae, deja, sube, lleva, pon, mueve), la intención comunicativa ES "dar instrucción", sin importar si hay "necesito" o no.
- Para "dar instrucción", basicForm y naturalForm deben ser órdenes directas en inglés (imperativo), nunca "We need to…".

REGLA ESPECIAL — "bajar el carro" es ambiguo:
- "bajar el carro" sin contexto adicional → needsClarification: true
  Pregunta sugerida: "¿Quieres bajarlo de una plataforma o remolque, traerlo desde otro nivel del estacionamiento, o moverlo al frente del dealer?"
- "bajar el carro y dejarlo al frente" → needsClarification: false (el destino aclara la acción)
  intent: "traer el carro al frente del dealer"
  communicativeIntent: "dar instrucción"
- "bajar el carro de la plataforma" → needsClarification: false
  intent: "bajar un vehículo de una plataforma o transportador"
  communicativeIntent: "dar instrucción"

REGLAS PARA communicativeIntent:
- "pedir"           → el usuario quiere SOLICITAR algo a otra persona (ej: "¿me puedes dar las llaves?", "necesito pedirle al supervisor...").
                      IMPORTANTE: "necesito las llaves" NO es "pedir" — es expresar una necesidad propia. Usa "otro" en ese caso.
                      "pedir" solo aplica cuando hay una solicitud dirigida explícitamente a otra persona.
- "informar"        → el usuario quiere dar una información o aviso.
- "preguntar"       → el usuario quiere hacer una pregunta.
- "confirmar"       → el usuario quiere verificar o confirmar algo.
- "advertir"        → el usuario quiere avisar de un riesgo o urgencia.
- "dar instrucción" → el usuario quiere indicarle a alguien qué hacer.
- "otro"            → necesidad propia directa ("necesito las llaves", "necesito un momento") o ninguna de las anteriores.
- Si la misma frase puede interpretarse con dos intenciones muy distintas (ej: pedir vs informar), pide aclaración.

REGLA CRÍTICA — "necesito + objeto directo":
- "necesito las llaves" → communicativeIntent: "otro" (necesidad propia, no solicitud a alguien)
- "necesito pedirle las llaves al supervisor" → communicativeIntent: "pedir" (hay una solicitud explícita a otra persona)
- La diferencia: si el "necesito" va seguido de un objeto directo SIN mencionar a quién se lo pide → es "otro", no "pedir".

REGLAS PARA requiredDetails:
- Lista todos los datos concretos del input que deben aparecer en inglés.
- Ejemplos:
  "segundo piso"     → { "original": "segundo piso",     "requiredEnglish": "second floor" }
  "tres cajas"       → { "original": "tres cajas",       "requiredEnglish": "three boxes" }
  "mañana"           → { "original": "mañana",           "requiredEnglish": "tomorrow" }
  "llaves del carro" → { "original": "llaves del carro", "requiredEnglish": "car keys" }
  "camión"           → { "original": "camión",           "requiredEnglish": "truck" }

EJEMPLOS COMPLETOS:

Input: "Necesito las llaves."
→ needsClarification: true
→ clarifyingQuestion: "¿Quieres pedir las llaves, preguntar dónde están o explicar para qué las necesitas?"

Input: "Necesito pedirle al supervisor las llaves para mover el carro."
→ needsClarification: false
→ intent: "solicitar las llaves al supervisor para mover el vehículo"
→ communicativeIntent: "pedir"
→ intentExplanation: "El usuario quiere hacer una solicitud directa al supervisor"
→ requiredDetails: [{ "original": "llaves", "requiredEnglish": "keys" }, { "original": "carro", "requiredEnglish": "car" }]

Input: "Hay que subir cajas al segundo piso."
→ needsClarification: false
→ intent: "llevar cajas hasta un piso específico"
→ communicativeIntent: "dar instrucción"
→ intentExplanation: "El usuario quiere indicarle a alguien que lleve las cajas arriba"
→ requiredDetails: [{ "original": "cajas", "requiredEnglish": "boxes" }, { "original": "segundo piso", "requiredEnglish": "second floor" }]

Input: "Necesito subir."
→ needsClarification: true
→ clarifyingQuestion: "¿Qué necesitas subir? ¿Subir a otro piso, subir un objeto pesado o subir un archivo?"

Input: "Necesito subir una caja al camión."
→ needsClarification: false
→ intent: "cargar una caja dentro del camión"
→ communicativeIntent: "dar instrucción"
→ intentExplanation: "El usuario quiere indicar que hay que cargar la caja"
→ requiredDetails: [{ "original": "caja", "requiredEnglish": "box" }, { "original": "camión", "requiredEnglish": "truck" }]

Input: "Se acabaron las cebollas."
→ needsClarification: false
→ intent: "informar que un ingrediente se agotó"
→ communicativeIntent: "informar"
→ intentExplanation: "El usuario quiere avisar al equipo que ya no hay cebollas"
→ requiredDetails: [{ "original": "cebollas", "requiredEnglish": "onions" }]

Input: "Necesito avisarle al manager que el cliente ya se fue."
→ needsClarification: false
→ intent: "informar al manager sobre la partida del cliente"
→ communicativeIntent: "informar"
→ intentExplanation: "El usuario quiere dar un aviso, no hacer una pregunta ni una solicitud"
→ requiredDetails: [{ "original": "cliente", "requiredEnglish": "customer" }]

Input: "Bájame el carro y déjalo al frente."
→ needsClarification: false (el destino "al frente" aclara la acción)
→ intent: "traer el carro al frente del dealer"
→ communicativeIntent: "dar instrucción"
→ intentExplanation: "El usuario da una orden directa para mover el vehículo a la zona delantera"
→ requiredDetails: [{ "original": "al frente", "requiredEnglish": "up front" }]

Input: "Bájame el carro."
→ needsClarification: true
→ clarifyingQuestion: "¿Quieres bajarlo de una plataforma o remolque, traerlo desde otro nivel del estacionamiento, o moverlo al frente del dealer?"

Input: "Tráeme el carro."
→ needsClarification: false
→ intent: "pedir que traigan el vehículo"
→ communicativeIntent: "dar instrucción"
→ intentExplanation: "El usuario da una orden directa para que le traigan el carro"
→ requiredDetails: [{ "original": "carro", "requiredEnglish": "car" }]`;

// ── Keepalive ping — wakes Render from cold start ─────────────────────────
app.get('/api/ping', (_req, res) => res.json({ ok: true, version: 7 }));

app.post('/api/analyze-context', async (req, res) => {
  const { userInput } = req.body;

  if (!userInput || typeof userInput !== 'string' || !userInput.trim()) {
    return res.status(400).json({ error: 'userInput es requerido.' });
  }

  console.log(`[analyze] "${userInput.slice(0, 80)}"`);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: ANALYZE_PROMPT },
        { role: 'user', content: `Analiza este texto: "${userInput.trim()}"` },
      ],
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0].message.content;
    const data = JSON.parse(raw);
    console.log(`[analyze] needsClarification: ${data.needsClarification}`);
    console.log(`[analyze] communicativeIntent: ${data.communicativeIntent ?? '—'}`);
    console.log(`[analyze] intentExplanation: ${data.intentExplanation ?? '—'}`);
    console.log(`[analyze] intent: ${data.intent ?? '—'}`);
    console.log(`[analyze] requiredDetails: ${JSON.stringify(data.requiredDetails ?? [])}`);
    res.json(data);
  } catch (error) {
    console.error('❌ Error analizando contexto:', error.message);
    res.status(500).json({ error: 'Error analizando contexto.' });
  }
});


// ── Generate practice ──────────────────────────────────────────────────────

app.post('/api/generate-practice', async (req, res) => {
  const {
    userInput, mode, clarificationContext,
    intent, requiredDetails,
    communicativeIntent, intentExplanation,
  } = req.body;

  if (!userInput || typeof userInput !== 'string' || !userInput.trim()) {
    return res.status(400).json({ error: 'userInput es requerido y no puede estar vacío.' });
  }

  console.log(`[${mode ?? 'unknown'}] Generando práctica: "${userInput.slice(0, 80)}"`);
  if (clarificationContext)  console.log(`[generate] Contexto adicional: "${clarificationContext}"`);
  if (intent)                console.log(`[generate] Intent: "${intent}"`);
  if (communicativeIntent)   console.log(`[generate] communicativeIntent: "${communicativeIntent}"`);
  if (intentExplanation)     console.log(`[generate] intentExplanation: "${intentExplanation}"`);
  if (requiredDetails?.length) console.log(`[generate] RequiredDetails: ${JSON.stringify(requiredDetails)}`);

  const contextNote = clarificationContext
    ? `\nContexto adicional del usuario (úsalo solo para interpretar y elegir vocabulario, NO lo agregues a la frase original ni a "situation"): "${clarificationContext}"`
    : '';

  const intentNote = intent
    ? `\nIntención del usuario: ${intent}`
    : '';

  const communicativeNote = communicativeIntent
    ? `\nIntención comunicativa: ${communicativeIntent} — ${intentExplanation ?? ''}\nRegla: naturalForm DEBE reflejar esta intención real, no solo ser una traducción más larga.\n  • "pedir" → usa "Can I get…", "Could you…", "I'd like…"\n  • "informar" → usa declarativa directa\n  • "preguntar" → usa interrogativa\n  • "confirmar" → usa "Just to confirm…", "Is that right?"\n  • "advertir" → usa "Heads up…", "Be careful…"\n  • "dar instrucción" → usa "We need to…", "Please…"`
    : '';

  const detailsNote = requiredDetails && requiredDetails.length > 0
    ? `\n\nDETALLES OBLIGATORIOS — usa EXACTAMENTE estos términos en basicForm y naturalForm. NO los elimines, generalices ni reemplaces:\n${requiredDetails.map(d => `  • "${d.original}" → "${d.requiredEnglish}"`).join('\n')}`
    : '';

  const userPrompt = `El usuario escribió: "${userInput.trim()}"${intentNote}${communicativeNote}${contextNote}${detailsNote}

⚠️ REGLA CRÍTICA DE IDIOMA — basicForm y naturalForm SIEMPRE en INGLÉS AMERICANO:
✗ INCORRECTO (español): "Necesito ayuda para bajar el coche."
✓ CORRECTO (inglés):    "I need help bringing the car down."
Si algún campo empieza con una palabra española → corrígelo a inglés antes de responder.

REGLA IMPORTANTE: el campo "situation" debe contener EXACTAMENTE lo que escribió el usuario, sin agregar ni quitar palabras.

Devuelve exactamente este JSON (sin markdown, sin texto extra):
{
  "situation": "copia exacta de lo que escribió el usuario",
  "basicForm": "frase en inglés más simple y directa (puede ser traducción literal)",
  "basicPronunciation": "pronunciación SOLO de basicForm — NUNCA copies la pronunciación de naturalForm aquí. Ejemplo: si basicForm='We are out of onions.' → basicPronunciation='wir aut ov ón-yons'",
  "naturalForm": "cómo lo diría un nativo con la intención comunicativa correcta (no solo más palabras)",
  "pronunciation": "pronunciación SOLO de naturalForm en sílabas para hispanohablantes. Ejemplo: si naturalForm='Just so you know, we\\'re out of onions.' → pronunciation='yast so yu nou, wir aut ov ón-yons'",
  "grammarRule": "mini regla en español, máximo 2 oraciones",
  "vocabulary": ["palabra clave 1", "palabra clave 2", "palabra clave 3"],
  "examples": [
    { "english": "variación útil", "spanish": "traducción" },
    { "english": "variación útil", "spanish": "traducción" },
    { "english": "variación útil", "spanish": "traducción" }
  ],
  "basicPhraseBreakdown": [
    { "part": "bloque de basicForm", "meaning": "significado exacto" },
    { "part": "bloque de basicForm", "meaning": "significado exacto" }
  ],
  "phraseBreakdown": [
    { "part": "bloque de naturalForm", "meaning": "significado exacto" },
    { "part": "bloque de naturalForm", "meaning": "significado exacto" },
    { "part": "bloque de naturalForm", "meaning": "significado exacto" }
  ],
  "whyThisPhrase": "por qué estas palabras específicas en español",
  "whenToUse": "cuándo usarla en la vida real, 1 oración",
  "basicVsNatural": "diferencia entre las dos frases mencionando las frases reales, no 'basicForm' ni 'naturalForm'",
  "basicKeywords": [
    { "word": "palabra o expresión clave de basicForm", "meaning": "significado en español", "pronunciation": "pronunciación para hispanohablantes", "usage": "cómo funciona en basicForm", "exampleEnglish": "ejemplo corto en inglés", "exampleSpanish": "traducción del ejemplo" }
  ],
  "keywords": [
    { "word": "palabra o expresión clave de naturalForm", "meaning": "significado en español", "pronunciation": "pronunciación para hispanohablantes", "usage": "cómo funciona en esta frase", "exampleEnglish": "ejemplo corto en inglés", "exampleSpanish": "traducción del ejemplo" }
  ]
}`;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];

  try {
    // ── First attempt ────────────────────────────────────────────────────
    let data = await callGenerate(messages);

    const required = ['situation', 'basicForm', 'basicPronunciation', 'naturalForm', 'pronunciation', 'grammarRule', 'vocabulary', 'examples'];
    for (const field of required) {
      if (!(field in data)) throw new Error(`Campo faltante en la respuesta de IA: ${field}`);
    }

    // ── Spanish output correction ─────────────────────────────────────────
    // If model returned Spanish in basicForm or naturalForm, retry with explicit correction
    if (looksSpanish(data.basicForm) || looksSpanish(data.naturalForm)) {
      console.warn(`[generate] ⚠️ Respuesta en español detectada — basicForm: "${data.basicForm}" — corrigiendo...`);

      const spanishFixMessages = [
        ...messages,
        { role: 'assistant', content: JSON.stringify(data) },
        {
          role: 'user',
          content: `❌ ERROR CRÍTICO: basicForm="${data.basicForm}" y/o naturalForm="${data.naturalForm}" están en ESPAÑOL. Esto está PROHIBIDO.
Genera el JSON COMPLETO de nuevo. basicForm y naturalForm DEBEN comenzar con palabras en inglés como: I, We, You, Can, Could, Please, Help, What, Where, How, Is, Do, Have, Let, Get, Bring, Take, Move...
Ejemplo correcto para esta situación: basicForm: "I need help bringing the car down a level."`,
        },
      ];

      data = await callGenerate(spanishFixMessages);
      console.log(`[generate] 🔄 Respuesta corregida — basicForm: "${data.basicForm}"`);
    }

    // ── Validate requiredDetails ─────────────────────────────────────────
    const missing = findMissingDetails(data, requiredDetails);

    if (missing.length > 0) {
      console.warn(`[generate] ⚠️ Detalles perdidos en 1er intento: ${missing.map(d => d.requiredEnglish).join(', ')} — reintentando`);

      const retryMessages = [
        ...messages,
        { role: 'assistant', content: JSON.stringify(data) },
        {
          role: 'user',
          content: `CORRECCIÓN OBLIGATORIA: La respuesta omitió detalles que el usuario mencionó explícitamente. Debes incluir ${missing.map(d => `"${d.requiredEnglish}"`).join(' y ')} de forma visible en basicForm y naturalForm. No uses sinónimos. Devuelve el JSON completo corregido.`,
        },
      ];

      const retryData = await callGenerate(retryMessages);
      const stillMissing = findMissingDetails(retryData, requiredDetails);

      if (stillMissing.length > 0) {
        console.error(`[generate] ❌ Retry también perdió: ${stillMissing.map(d => d.requiredEnglish).join(', ')}`);
        return res.status(422).json({
          error: `No se pudo conservar los detalles requeridos: ${stillMissing.map(d => d.requiredEnglish).join(', ')}. Por favor reformula tu frase con más contexto.`,
        });
      }

      console.log(`✅ Práctica generada correctamente (con retry)`);
      return res.json(await cleanAndVerify(retryData));
    }

    console.log(`✅ Práctica generada correctamente`);
    res.json(await cleanAndVerify(data));
  } catch (error) {
    console.error('❌ Error al generar práctica:', error.message);
    res.status(500).json({ error: 'No se pudo generar la práctica. Intenta de nuevo.' });
  }
});


// ── Text-to-Speech ────────────────────────────────────────────────────────

app.post('/api/speech', async (req, res) => {
  const { text, speed } = req.body;

  // Validations
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text es requerido y no puede estar vacío.' });
  }
  if (text.trim().length > 500) {
    return res.status(400).json({ error: 'El texto no puede superar los 500 caracteres.' });
  }
  if (speed !== undefined && speed !== 'normal' && speed !== 'slow') {
    return res.status(400).json({ error: 'speed debe ser "normal" o "slow".' });
  }

  // Normal: 0.88 (slightly slower than default for clearer pronunciation)
  // Slow:   0.75 (noticeably slower for study mode)
  const speedValue = speed === 'slow' ? 0.75 : 0.88;

  console.log(`[speech] "${text.trim().slice(0, 60)}" — speed: ${speed ?? 'normal'} (${speedValue})`);

  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',      // standard model — low latency
      voice: 'echo',       // Masculina, clara, natural — mejor para aprender pronunciación
      input: text.trim(),
      speed: speedValue,
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length,
      'Cache-Control': 'no-store',
    });
    res.send(buffer);
    console.log(`[speech] ✅ ${buffer.length} bytes enviados`);
  } catch (error) {
    console.error('❌ Error en TTS:', error.message);
    res.status(500).json({ error: 'No se pudo generar el audio. Intenta nuevamente.' });
  }
});


// ── Multer (audio uploads) ─────────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error(`Formato no soportado: ${file.mimetype}`));
    }
  },
});

/** Maps an audio MIME type to a file extension that OpenAI accepts. */
function mimeToExt(mimeType) {
  const base = mimeType.split(';')[0];
  const map = {
    'audio/webm': 'webm',
    'audio/ogg': 'ogg',
    'audio/mp4': 'mp4',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/aac': 'aac',
    'audio/flac': 'flac',
  };
  return map[base] ?? 'webm';
}


// ── Transcribe ─────────────────────────────────────────────────────────────

app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió archivo de audio.' });
  }

  const mimeType = req.file.mimetype.split(';')[0];
  const ext = mimeToExt(mimeType);
  // Accept ?lang=es for Spanish transcription (used by HowDoISayThisScreen voice input)
  const lang = req.query.lang === 'es' ? 'es' : 'en';
  console.log(`[transcribe] Recibido: ${req.file.size} bytes — ${mimeType} → ${ext} — lang: ${lang}`);

  try {
    const audioFile = await toFile(
      req.file.buffer,
      `recording.${ext}`,
      { type: mimeType },
    );

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'gpt-4o-mini-transcribe',
      language: lang,
    });

    console.log(`[transcribe] ✅ "${transcription.text.slice(0, 80)}"`);
    res.json({ transcript: transcription.text });
  } catch (error) {
    console.error('❌ Error en transcripción:', error.message);
    res.status(500).json({ error: 'Error al transcribir el audio. Verifica que el micrófono funcionó correctamente.' });
  }
});


// ── Transcribe Spanish audio (whisper-1 — accepts webm/mp4/ogg from any browser) ──

app.post('/api/transcribe-es', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió archivo de audio.' });
  }

  const mimeType = req.file.mimetype.split(';')[0];
  const ext = mimeToExt(mimeType);
  console.log(`[transcribe-es] Recibido: ${req.file.size} bytes — ${mimeType} → .${ext}`);

  try {
    const audioFile = await toFile(
      req.file.buffer,
      `recording.${ext}`,
      { type: mimeType },
    );

    // whisper-1 is the most format-compatible model (webm/mp4/ogg/wav/etc.)
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'es',
    });

    const text = (transcription.text ?? '').trim();
    console.log(`[transcribe-es] ✅ "${text.slice(0, 80)}"`);
    res.json({ transcript: text });
  } catch (error) {
    console.error('❌ Error en transcribe-es:', error.message);
    res.status(500).json({ error: `Transcripción fallida: ${error.message}` });
  }
});


// ── Speak in Spanish → Translate to English ───────────────────────────────

const TRANSLATE_SPEECH_PROMPT = `Eres un traductor de inglés para adultos hispanos principiantes en Estados Unidos.
El usuario habló en español. Traduce exactamente lo que dijo al inglés más natural y útil para el trabajo o vida diaria.

REGLAS OBLIGATORIAS:
1. NUNCA omitas el sujeto en inglés. Toda frase debe tener "I", "we", "you", "he", "she", etc.
   MAL: "Need the keys."       BIEN: "I need the keys."
   MAL: "Have to go now."      BIEN: "I have to go now."

2. Conserva el verbo "need" cuando el usuario dijo "necesito", "necesitamos" o "necesitas":
   "necesito las llaves"   → "I need the keys."
   "necesitamos más tiempo" → "We need more time."
   "necesitas firmar aquí" → "You need to sign here."

3. Conserva el imperativo cuando el usuario da una orden directa:
   "tráeme el carro" → "Bring me the car." (NO "I need you to bring me the car.")

4. La traducción debe ser corta, coloquial y directa — como la diría un nativo en el trabajo.
   Evita lenguaje formal, académico o demasiado elaborado.

5. Si la frase es muy corta o ambigua (menos de 3 palabras significativas), devuelve un campo "unclear: true".

Devuelve SOLO este JSON válido (sin markdown ni texto extra):
{
  "spanish": "lo que dijo el usuario exactamente",
  "english": "traducción al inglés",
  "unclear": false
}`;

app.post('/api/translate-speech', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió archivo de audio.' });
  }

  const mimeType = req.file.mimetype.split(';')[0];
  const ext = mimeToExt(mimeType);
  console.log(`[translate-speech] Recibido: ${req.file.size} bytes — ${mimeType} → ${ext}`);

  try {
    // 1 — Transcribe in Spanish
    const audioFile = await toFile(
      req.file.buffer,
      `recording.${ext}`,
      { type: mimeType },
    );

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'gpt-4o-mini-transcribe',
      language: 'es',
    });

    const spanish = transcription.text.trim();
    console.log(`[translate-speech] Transcripción ES: "${spanish.slice(0, 80)}"`);

    if (!spanish) {
      return res.status(422).json({ error: 'No se detectó voz. Intenta hablar más fuerte y cerca del micrófono.' });
    }

    // 2 — Translate to English
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: TRANSLATE_SPEECH_PROMPT },
        { role: 'user', content: `Traduce esto al inglés: "${spanish}"` },
      ],
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    console.log(`[translate-speech] Traducción EN: "${String(result.english ?? '').slice(0, 80)}"`);

    res.json({
      spanish: result.spanish ?? spanish,
      english: result.english ?? '',
      unclear: result.unclear ?? false,
    });
  } catch (error) {
    console.error('❌ Error en translate-speech:', error.message);
    res.status(500).json({ error: 'No se pudo procesar el audio. Verifica que el servidor esté activo.' });
  }
});


// ── Evaluate speaking ──────────────────────────────────────────────────────

const EVALUATE_PROMPT = `Eres un evaluador de práctica de inglés para adultos hispanos.
Recibes la transcripción de lo que dijo el usuario, la frase esperada, la situación original y una guía de pronunciación aproximada.
Devuelve SOLO JSON válido (sin markdown ni texto extra):

{
  "transcript": "transcripción exacta recibida",
  "expectedPhrase": "frase correcta esperada",
  "score": 75,
  "missingWords": ["word1"],
  "extraWords": ["word1"],
  "incorrectWords": ["word1"],
  "correction": "qué mejorar, en español, máximo 2 oraciones",
  "coachNote": "consejo práctico de 1 oración en español",
  "pronunciationFocus": [
    { "word": "word", "tip": "cómo pronunciarlo para hispanohablantes" }
  ]
}

REGLAS DE PUNTUACIÓN (score 0-100):
- 90-100: frase prácticamente idéntica, significado completo.
- 70-89: significado claro, faltan detalles menores.
- 50-69: significado parcial, faltan palabras clave.
- 0-49: diferencias significativas o significado poco claro.

REGLAS DE EVALUACIÓN:
- Ignora: mayúsculas, puntuación, artículos opcionales cuando no cambian el significado.
- Contracciones equivalentes no se penalizan: "I'm" = "I am", "can't" = "cannot".
- missingWords: palabras importantes de la frase esperada ausentes en la transcripción.
- extraWords: solo palabras que cambian el significado (no penalices muletillas).
- incorrectWords: palabras que alteran el sentido de lo dicho.
- correction: específico y claro, en español simple.
- coachNote: 1 oración con consejo práctico de repetición.
- pronunciationFocus: MÁXIMO 2 items. IMPORTANTE: la transcripción es texto — pronunciationFocus
  está basado en la dificultad fonética típica de esas palabras para hispanohablantes, NO en
  la pronunciación acústica real del usuario. Si la transcripción es correcta, puede ser [].
- No inventes errores que no aparezcan en la comparación.`;

app.post('/api/evaluate-speaking', async (req, res) => {
  const { transcript, expectedPhrase, situation, pronunciationGuide } = req.body;

  if (!transcript || !expectedPhrase) {
    return res.status(400).json({ error: 'transcript y expectedPhrase son requeridos.' });
  }

  console.log(`[evaluate] transcript: "${transcript.slice(0, 80)}"`);
  console.log(`[evaluate] expected:   "${expectedPhrase.slice(0, 80)}"`);

  const userPrompt = `Situación original: "${situation ?? ''}"
Guía de pronunciación: "${pronunciationGuide ?? ''}"
Transcripción del usuario: "${transcript}"
Frase esperada: "${expectedPhrase}"

Evalúa y devuelve el JSON.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EVALUATE_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const data = JSON.parse(completion.choices[0].message.content);
    console.log(`[evaluate] ✅ score: ${data.score}`);
    res.json(data);
  } catch (error) {
    console.error('❌ Error evaluando respuesta:', error.message);
    res.status(500).json({ error: 'Error al evaluar la respuesta.' });
  }
});


// ── Health check ───────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── SPA fallback — todas las rutas no-API devuelven index.html ────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅  Servidor IA corriendo en http://localhost:${PORT}`);
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️   OPENAI_API_KEY no está configurada — el servidor usará el fallback del frontend.\n');
  } else {
    console.log('🔑  OPENAI_API_KEY cargada correctamente.\n');
  }
});
