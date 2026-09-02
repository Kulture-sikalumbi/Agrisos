/**
 * Gemini AI service — optional online enhancement layer.
 *
 * Used for:
 *  - Chatbot conversations (ChatbotScreen)
 *  - Structured second-opinion + action plan on ResultScreen
 *
 * If offline or the API call fails, the app continues with the
 * offline classifier result only — no crash, no blocking.
 */

import { GoogleGenerativeAI, Part } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

const MODEL_CANDIDATES = [
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
];

let genAI: GoogleGenerativeAI | null = null;
try {
  if (GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
} catch {
  genAI = null;
}

export function isGeminiConfigured(): boolean {
  return Boolean(genAI);
}

/** Structured Gemini leaf-assessment response (idea.md schema). */
export interface GeminiAdvice {
  primary_diagnosis:
    | 'healthy'
    | 'cmd'
    | 'cbsd'
    | 'senescence'
    | 'abiotic_stress'
    | 'unclear'
    | 'other';
  confidence_assessment: 'high' | 'medium' | 'low';
  severity_score: number; // 1–5 (1=monitor, 5=rogue immediately)
  differential_diagnosis: string;
  immediate_action_steps: string[];
  secondary_inspection_required: string;
  /** Farmer-friendly summary built from the JSON fields. */
  displayText: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const SYSTEM_CONTEXT = `You are Agrisos Assistant, a practical helper for cassava farmers in Zambia (and similar smallholder farms in Southern/East Africa).

You help with:
- Cassava Mosaic Disease (CMD): yellow/green mosaic on leaves, leaf curling/distortion, spread by whiteflies and infected cuttings
- Cassava Brown Streak Disease (CBSD): yellowing on leaves, brown streaks on stems, root rot inside tubers
- Healthy plants: monitoring, spacing, clean planting material
- Prevention: use disease-free cuttings, remove sick plants early, control whiteflies, avoid sharing infected stems, ask extension officers about resistant varieties

Rules:
- Use short sentences and simple English. Farmers may have limited literacy.
- Always give practical next steps the farmer can do today.
- Prefer numbered steps (1, 2, 3).
- Include prevention tips when relevant.
- Mention local agricultural extension officers when the case is serious or unclear.
- Do NOT invent chemical brand names. If chemicals are mentioned, say to ask an extension officer first.
- Prefer cultural controls first (remove sick plants, clean cuttings, resistant varieties, field hygiene).
- For whiteflies: mention that soap sprays or approved insecticides may help only after local officer advice.
- If asked something unrelated to cassava/farming, politely redirect.
- Never claim to be 100% certain from a photo alone.
- If the image is clearly not a cassava leaf (person, object, screenshot, blank), say so and refuse disease treatment advice.`;

const SECOND_OPINION_SYSTEM_PROMPT = `You are an expert cassava plant pathologist assisting smallholder farmers via the Agrisos app.

Disambiguate carefully:
- CMD: asymmetric yellow/green mosaic, leaf distortion/curling, reduced leaf size.
- CBSD leaf signs: feathery chlorosis along secondary veins on leaves that are often NOT strongly distorted. If CBSD is possible, tell the farmer to also inspect stems for brown streaks and roots/tubers for brown dry rot.
- Natural senescence / abiotic stress: uniform yellowing mainly on older lower leaves while the upper canopy stays green → NOT a viral outbreak panic. Label as senescence or abiotic_stress.
- Do not invent chemical brand names.
- Prefer remove-sick-plants + clean cuttings + resistant varieties. Chemicals only via extension officer.
- If the photo is clearly not a cassava leaf, set primary_diagnosis to "other" and tell the farmer to retake — do not give disease spray advice.

Severity (1-5):
1 = healthy / monitor only
2 = mild / watch closely
3 = moderate / act soon
4 = serious / remove plant soon
5 = severe / rogue immediately and protect field

Respond with STRICT JSON only (no markdown fences), matching:
{
  "primary_diagnosis": "healthy|cmd|cbsd|senescence|abiotic_stress|unclear|other",
  "confidence_assessment": "high|medium|low",
  "severity_score": 1,
  "differential_diagnosis": "short plain sentence",
  "immediate_action_steps": ["step1", "step2", "step3"],
  "secondary_inspection_required": "what the farmer should check next on plant/roots/stems"
}`;

function getModel(modelName: string) {
  if (!genAI) throw new Error('Gemini API key not configured.');
  return genAI.getGenerativeModel({ model: modelName });
}

async function generateWithFallback(
  parts: Array<string | Part>
): Promise<string> {
  if (!genAI) throw new Error('Gemini API key not configured.');

  let lastError: unknown = null;
  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = getModel(modelName);
      const result = await model.generateContent(parts);
      const text = result.response.text()?.trim();
      if (text) return text;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error('All Gemini models failed.');
}

function extractJsonObject(text: string): unknown | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? text).trim();
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

function clampSeverity(n: unknown): number {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return 3;
  return Math.min(5, Math.max(1, Math.round(v)));
}

function toAdvice(raw: Record<string, unknown>, fallbackText?: string): GeminiAdvice {
  const primary = String(raw.primary_diagnosis ?? 'unclear').toLowerCase();
  const allowed = new Set([
    'healthy',
    'cmd',
    'cbsd',
    'senescence',
    'abiotic_stress',
    'unclear',
    'other',
  ]);
  const primary_diagnosis = (
    allowed.has(primary) ? primary : 'unclear'
  ) as GeminiAdvice['primary_diagnosis'];

  const conf = String(raw.confidence_assessment ?? 'medium').toLowerCase();
  const confidence_assessment = (
    conf === 'high' || conf === 'low' ? conf : 'medium'
  ) as GeminiAdvice['confidence_assessment'];

  const stepsRaw = raw.immediate_action_steps;
  const immediate_action_steps = Array.isArray(stepsRaw)
    ? stepsRaw.map((s) => String(s)).filter(Boolean).slice(0, 6)
    : [];

  const differential_diagnosis = String(
    raw.differential_diagnosis ?? 'Could not fully confirm from this photo alone.'
  );
  const secondary_inspection_required = String(
    raw.secondary_inspection_required ??
      'Check nearby leaves, stems for streaks, and ask an extension officer if unsure.'
  );
  const severity_score = clampSeverity(raw.severity_score);

  const displayText =
    fallbackText ??
    [
      `Likely issue: ${primary_diagnosis.replaceAll('_', ' ')} (severity ${severity_score}/5, ${confidence_assessment} confidence)`,
      '',
      `What this means: ${differential_diagnosis}`,
      '',
      'Do this now:',
      ...immediate_action_steps.map((s, i) => `${i + 1}. ${s}`),
      '',
      `Also check: ${secondary_inspection_required}`,
    ].join('\n');

  return {
    primary_diagnosis,
    confidence_assessment,
    severity_score,
    differential_diagnosis,
    immediate_action_steps,
    secondary_inspection_required,
    displayText,
  };
}

export async function sendChatMessage(
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  if (!genAI) throw new Error('Gemini API key not configured.');

  let lastError: unknown = null;
  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = getModel(modelName);
      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: SYSTEM_CONTEXT }],
          },
          {
            role: 'model',
            parts: [
              {
                text: 'Understood. I will give short, practical farming advice for cassava diseases and prevention.',
              },
            ],
          },
          ...history.map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.text }],
          })),
        ],
      });

      const result = await chat.sendMessage(userMessage);
      const text = result.response.text()?.trim();
      if (text) return text;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error('All Gemini models failed.');
}

/**
 * Online AI check of the leaf photo + structured action plan for the farmer.
 */
export async function getSecondOpinion(
  imageBase64: string,
  offlineResult: string,
  confidence: number,
  options?: {
    topTwoDelta?: number;
    needsCloudAdvice?: boolean;
  }
): Promise<GeminiAdvice | null> {
  try {
    if (!genAI) return null;

    const imagePart: Part = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64,
      },
    };

    const priorityNote = options?.needsCloudAdvice
      ? 'PRIORITY: offline model is uncertain or classes are close — carefully disambiguate CMD vs CBSD vs senescence/abiotic stress.'
      : 'Offline model is reasonably confident, but still verify and give practical steps.';

    const deltaNote =
      typeof options?.topTwoDelta === 'number'
        ? `Top-two class score gap was ${(options.topTwoDelta * 100).toFixed(1)}% (small gap means confusion risk).`
        : '';

    const prompt = `${SECOND_OPINION_SYSTEM_PROMPT}

Offline phone model predicted: "${offlineResult}" with ${Math.round(confidence * 100)}% confidence.
${priorityNote}
${deltaNote}

Look at the cassava leaf image and return the JSON object only.`;

    const text = await generateWithFallback([prompt, imagePart]);
    const parsed = extractJsonObject(text);
    if (parsed && typeof parsed === 'object') {
      return toAdvice(parsed as Record<string, unknown>);
    }

    // If model ignored JSON, still show readable text.
    return toAdvice(
      {
        primary_diagnosis: 'unclear',
        confidence_assessment: 'low',
        severity_score: 3,
        differential_diagnosis: text.slice(0, 280),
        immediate_action_steps: [
          'Follow the offline steps on this screen',
          'Retake a clearer photo in daylight if unsure',
          'Ask your extension officer if symptoms continue',
        ],
        secondary_inspection_required:
          'Check stems for brown streaks and nearby plants for mosaic or yellowing.',
      },
      text
    );
  } catch {
    return null;
  }
}
