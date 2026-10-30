import { GoogleGenAI } from '@google/genai';
import { createMysteryAIResponseSchema } from '../validators/schemas.js';

const DIFFICULTY_CONFIG = {
  Easy: { suspects: 3, clues: 5, hints: 2, bonus: 100 },
  Medium: { suspects: 4, clues: 7, hints: 3, bonus: 150 },
  Hard: { suspects: 5, clues: 9, hints: 3, bonus: 200 },
};

let ai;

const getAI = () => {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const buildMysteryPrompt = (premise, difficulty) => {
  const config = DIFFICULTY_CONFIG[difficulty];
  const suspectIds = Array.from({ length: config.suspects }, (_, i) => `suspect_${i + 1}`);
  const clueIds = Array.from({ length: config.clues }, (_, i) => `clue_${i + 1}`);
  const hintIds = Array.from({ length: config.hints }, (_, i) => `hint_${i + 1}`);

  return `You are a master mystery story generator. Create a complete, compelling, and logically sound mystery investigation case based on the premise below.

PREMISE: ${premise}
DIFFICULTY: ${difficulty}

EXACT REQUIREMENTS FOR THIS DIFFICULTY:
- EXACTLY ${config.suspects} suspects (IDs: ${suspectIds.join(', ')})
- EXACTLY ${config.clues} clues (IDs: ${clueIds.join(', ')})
- EXACTLY ${config.hints} hints (IDs: ${hintIds.join(', ')})

Return ONLY a valid JSON object matching this structure:
{
  "title": "A unique, compelling mystery title (at least 5 characters)",
  "story": "A rich, atmospheric narrative of at least 200 words setting up the crime scene, context, and naturally introducing the suspects. Do NOT reveal the culprit.",
  "difficulty": "${difficulty}",
  "suspects": [
    {
      "id": "suspect_1",
      "name": "Full Name",
      "occupation": "Specific Occupation or Role",
      "description": "Physical appearance, demeanor, and personality (at least 2 descriptive sentences, minimum 20 characters)",
      "publicMotive": "A plausible, publicly known reason why they might be suspected (e.g. recent dispute, financial debt, inheritance, rivalry). MUST be a detailed sentence of at least 15 characters. NEVER leave empty, 'None', or 'N/A'.",
      "privateMotive": "A secret personal motive, hidden resentment, or concealed agenda revealed only after the case is solved. MUST be a detailed sentence of at least 15 characters. NEVER leave empty, 'None', or 'N/A'.",
      "alibi": "Their specific claimed alibi during the incident (where they claim to have been and what they claim to have been doing). MUST be a detailed sentence of at least 15 characters. NEVER leave empty, 'None', or 'N/A'.",
      "background": "Relevant history, relationship to the victim/scene, and background (at least 2 sentences, minimum 20 characters)"
    }
  ],
  "clues": [
    {
      "id": "clue_1",
      "title": "Concise clue title",
      "description": "Detailed investigative evidence discovered by the player (at least 2 sentences, minimum 25 characters). Should provide meaningful clues or test suspect alibis without prematurely revealing the solution.",
      "category": "physical"
    }
  ],
  "hints": [
    {
      "id": "hint_1",
      "text": "A thoughtful clue or deduction guide that directs player attention toward contradictions in alibis or evidence without directly naming the culprit (at least 20 characters)."
    }
  ],
  "solution": {
    "culpritId": "suspect_1",
    "motive": "The true, complete motive explaining why the culprit committed the crime (at least 25 characters).",
    "explanation": "A comprehensive explanation of how the crime was committed, how the culprit bypassed security/alibis, and how the supporting clues definitively prove their guilt (at least 150 words).",
    "supportingClueIds": ["clue_1", "clue_2"]
  }
}

MANDATORY RULES:
1. SUSPECT COUNT & COMPLETION:
   - Provide EXACTLY ${config.suspects} suspects in the suspects array with IDs: ${suspectIds.join(', ')}.
   - EVERY suspect (including innocent suspects and later suspects like ${suspectIds.slice(-2).join(' and ')}) MUST have complete, unique, non-empty text for publicMotive, privateMotive, and alibi.
   - NEVER use 'None', 'N/A', 'Unknown', 'No motive', or strings shorter than 10 characters for publicMotive, privateMotive, or alibi. Every person in a detective investigation has a suspicious public motive and a claimed alibi.
2. CLUE COUNT & CATEGORIES:
   - Provide EXACTLY ${config.clues} clues with IDs: ${clueIds.join(', ')}.
   - Categories must be one of: 'physical', 'witness', 'document', 'forensic', 'behavioral'.
3. HINT COUNT:
   - Provide EXACTLY ${config.hints} hints with IDs: ${hintIds.join(', ')}.
4. LOGICAL CONSISTENCY:
   - The culpritId MUST be one of: ${suspectIds.join(', ')}.
   - supportingClueIds MUST be an array containing 1 or more IDs from: ${clueIds.join(', ')}.
   - The culprit's alibi should have a subtle contradiction exposed by the clues.
5. FORMAT:
   - Output valid JSON only, without markdown fences or additional commentary.`;
};

const buildCorrectionPrompt = (basePrompt, validationErrors, difficulty) => {
  const config = DIFFICULTY_CONFIG[difficulty];
  const suspectIds = Array.from({ length: config.suspects }, (_, i) => `suspect_${i + 1}`);

  return `${basePrompt}

============================================================
CORRECTION REQUIRED: YOUR PREVIOUS RESPONSE FAILED VALIDATION
============================================================
The previous JSON generation was rejected due to the following validation errors:
${validationErrors.map(err => `  - ${err}`).join('\n')}

YOU MUST STRICTLY FIX EACH OF THESE ISSUES:
1. Ensure EVERY suspect (${suspectIds.join(', ')}) has complete, detailed, non-empty strings (at least 15 characters) for "publicMotive", "privateMotive", and "alibi".
   - DO NOT output "None", "N/A", "Unknown", or empty text for ANY suspect.
   - Even innocent suspects must have a plausible public motive, a private secret, and a claimed alibi.
2. Ensure exactly ${config.suspects} suspects, exactly ${config.clues} clues, and exactly ${config.hints} hints are generated.
3. Ensure the culpritId matches one of the generated suspect IDs (${suspectIds.join(', ')}).
4. Return ONLY the corrected, fully-formed JSON object.`;
};

const extractJSON = (text) => {
  // Try to extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  // Clean markdown code blocks if present
  const cleaned = text
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim();
  return cleaned;
};

const generateMysteryData = async (premise, difficulty) => {
  const client = getAI();
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  const fallbackModel = primaryModel === 'gemini-2.5-flash-lite' ? 'gemini-2.5-flash' : 'gemini-2.5-flash-lite';
  const basePrompt = buildMysteryPrompt(premise, difficulty);
  const schema = createMysteryAIResponseSchema(difficulty);

  const maxAttempts = 3;
  let currentPrompt = basePrompt;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const modelToUse = attempt === 2 ? fallbackModel : primaryModel;
    console.log(`[GeminiService] Generation attempt ${attempt}/${maxAttempts} using model: ${modelToUse}`);

    try {
      const response = await client.models.generateContent({
        model: modelToUse,
        contents: currentPrompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error('Empty response from Gemini API');
      }

      const jsonText = extractJSON(rawText);
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch (parseErr) {
        console.warn(`[GeminiService] Attempt ${attempt} JSON parse failed: ${parseErr.message}`);
        currentPrompt = buildCorrectionPrompt(
          basePrompt,
          [`Invalid JSON: ${parseErr.message}. Ensure response is 100% valid, well-formed JSON.`],
          difficulty
        );
        lastError = new Error(`Invalid JSON from Gemini: ${parseErr.message}`);
        continue;
      }

      const validation = schema.safeParse(parsed);
      if (!validation.success) {
        const errorDetails = validation.error.issues.map(
          issue => `${issue.path.join('.')}: ${issue.message}`
        );
        console.warn(`[GeminiService] Attempt ${attempt} validation failed with ${errorDetails.length} issue(s):`);
        errorDetails.forEach(msg => console.warn(`  - ${msg}`));

        currentPrompt = buildCorrectionPrompt(basePrompt, errorDetails, difficulty);
        lastError = new Error(`AI response validation failed: ${errorDetails.join('; ')}`);
        continue;
      }

      console.log(`[GeminiService] Attempt ${attempt} succeeded! Title: "${validation.data.title}" (${difficulty})`);
      return validation.data;
    } catch (apiError) {
      console.warn(`[GeminiService] Attempt ${attempt} operational error with ${modelToUse}:`, apiError.message);
      lastError = apiError;
    }
  }

  throw new Error(`Mystery generation failed after ${maxAttempts} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
};

export { generateMysteryData, DIFFICULTY_CONFIG };
