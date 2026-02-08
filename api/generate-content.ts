import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

// API Key côté serveur uniquement
const apiKey = process.env.GOOGLE_API_KEY;

// Whitelist des utilisateurs autorisés
const ALLOWED_USERS = [
  'user_3989HW7yvgjlQFhnyrc6ioLVNtS'
];

// Décoder le JWT pour extraire le user ID
function getUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload.sub || null;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vérifier l'authentification via le Bearer token
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - Please sign in' });
  }

  // Extraire et vérifier le user ID
  const token = authHeader.substring(7);
  const userId = getUserIdFromToken(token);

  if (!userId || !ALLOWED_USERS.includes(userId)) {
    return res.status(403).json({ error: 'Access denied - You are not authorized to use this service' });
  }

  // Vérifier la clé API
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error - API key missing' });
  }

  const { topic, tone, userPersona, userAudience, userVoice } = req.body;

  if (!topic || !tone) {
    return res.status(400).json({ error: 'Missing required fields: topic and tone' });
  }

  const ai = new GoogleGenAI({ apiKey });

  const persona = userPersona || "Entrepreneur tech / développeur indépendant";
  const audience = userAudience || "Freelances, devs, curieux tech";
  const voice = userVoice || "Accessible, concret, pas de bullshit corporate";

  const prompt = `
Tu es un ghostwriter expert en réseaux sociaux tech.

IMPORTANT: Tu DOIS répondre UNIQUEMENT en FRANÇAIS. Tous les posts doivent être rédigés en français.

=== CONTEXTE UTILISATEUR ===
Persona : ${persona}
Audience cible : ${audience}
Style de voix : ${voice}

=== SUJET DU POST ===
Titre/Actu : "${topic}"
Ton souhaité : "${tone}"

=== TA MISSION ===
Ne fais PAS un résumé de l'actu.
Trouve un ANGLE unique :
- Quel impact concret pour l'audience ?
- Quelle opinion ou question ça soulève ?
- Quel lien avec le quotidien des gens ?

=== RÈGLES PAR PLATEFORME ===

1. FACEBOOK (2 variantes) :
   - Option 1 "Engageant" : Pose une vraie question qui fait réfléchir
   - Option 2 "Informatif" : Un fait surprenant + pourquoi ça compte
   - Max 280 caractères, 2-3 emojis max

2. INSTAGRAM (2 variantes) :
   - Option 1 "Punchy" : Hook en 1ère ligne, emojis stratégiques, CTA clair
   - Option 2 "Story" : Mini-récit personnel ou cas concret
   - Max 200 caractères, hashtags populaires + niche

3. LINKEDIN (2 variantes) :
   - Option 1 "Opinion" : Prends position, sois clivant si besoin
   - Option 2 "Carrousel" : 5-6 slides avec titres accrocheurs
   - Hashtags pertinents uniquement

=== IMAGE ===
Prompt en anglais pour générateur IA.
Style : Moderne, minimaliste, flat design, couleurs vives sur fond sombre.
PAS de texte dans l'image.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            facebook: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2 variantes pour Facebook"
            },
            instagram: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2 variantes pour Instagram"
            },
            linkedin: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2 variantes pour LinkedIn (Classique + Carrousel)"
            },
            imagePrompt: { type: Type.STRING, description: "Prompt pour générer l'image" },
          },
          required: ["facebook", "instagram", "linkedin", "imagePrompt"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text response from Gemini");
    }

    return res.status(200).json(JSON.parse(text));
  } catch (error) {
    console.error("Error generating content:", error);
    return res.status(500).json({ error: 'Failed to generate content' });
  }
}
