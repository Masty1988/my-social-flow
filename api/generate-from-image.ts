import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GOOGLE_API_KEY;

const ALLOWED_USERS = [
  'user_3989HW7yvgjlQFhnyrc6ioLVNtS'
];

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - Please sign in' });
  }

  const token = authHeader.substring(7);
  const userId = getUserIdFromToken(token);

  if (!userId || !ALLOWED_USERS.includes(userId)) {
    return res.status(403).json({ error: 'Access denied - You are not authorized to use this service' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error - API key missing' });
  }

  const { imageBase64, mimeType, description, platforms, tone, userPersona, userAudience, userVoice } = req.body;

  if (!imageBase64 || !platforms || platforms.length === 0) {
    return res.status(400).json({ error: 'Missing required fields: imageBase64 and platforms' });
  }

  const ai = new GoogleGenAI({ apiKey });

  const persona = userPersona || "Entrepreneur tech / développeur indépendant";
  const audience = userAudience || "Freelances, devs, curieux tech";
  const voice = userVoice || "Accessible, concret, pas de bullshit corporate";

  const platformInstructions: Record<string, string> = {
    linkedin: `LINKEDIN (2 variantes) :
   - Option 1 "Opinion" : Prends position sur ce que montre l'image, sois clivant si besoin. Post long format LinkedIn classique avec hook, développement argumenté, et conclusion forte. Hashtags pertinents.
   - Option 2 "Carrousel" : Génère un contenu structuré pour un carrousel LinkedIn basé sur l'image.
     FORMAT OBLIGATOIRE - chaque slide séparée par "---" :
     --- Slide 1 : Hook percutant qui crée la curiosité et donne envie de swiper (max 15 mots)
     --- Slide 2 : Premier point clé - 1 seule idée, phrase courte et impactante (max 20 mots)
     --- Slide 3 : Deuxième point clé - 1 seule idée, phrase courte et impactante (max 20 mots)
     --- Slide 4 : Troisième point clé - 1 seule idée, phrase courte et impactante (max 20 mots)
     --- Slide 5 : Quatrième point clé - 1 seule idée, phrase courte et impactante (max 20 mots)
     --- Slide 6 : CTA fort / Conclusion engageante qui pousse à l'action (commentaire, partage, follow)
     RÈGLES CARROUSEL :
     - Chaque slide doit être autonome et compréhensible seule
     - Le tout raconte une histoire cohérente avec une progression logique
     - Utiliser des chiffres, données concrètes ou exemples quand possible
     - Ajouter 3-5 hashtags pertinents après la dernière slide`,
    twitter: `TWITTER/X (2 variantes) :
   - Option 1 "Thread" : Tweet d'accroche + 2-3 tweets de développement
   - Option 2 "Viral" : Un seul tweet percutant, max 280 caractères
   - 2-3 hashtags max`,
    instagram: `INSTAGRAM (2 variantes) :
   - Option 1 "Punchy" : Hook en 1ère ligne, emojis stratégiques, CTA clair
   - Option 2 "Story" : Mini-récit personnel ou cas concret inspiré par l'image
   - Max 200 caractères, hashtags populaires + niche`,
    facebook: `FACEBOOK (2 variantes) :
   - Option 1 "Engageant" : Pose une vraie question qui fait réfléchir en lien avec l'image
   - Option 2 "Informatif" : Un fait surprenant + pourquoi ça compte
   - Max 280 caractères, 2-3 emojis max`,
  };

  const selectedPlatformRules = platforms
    .map((p: string) => platformInstructions[p.toLowerCase()])
    .filter(Boolean)
    .join('\n\n');

  const descriptionContext = description
    ? `\nDescription/contexte fourni par l'utilisateur : "${description}"`
    : '';

  const prompt = `
Tu es un ghostwriter expert en réseaux sociaux tech.

IMPORTANT: Tu DOIS répondre UNIQUEMENT en FRANÇAIS. Tous les posts doivent être rédigés en français.

=== CONTEXTE UTILISATEUR ===
Persona : ${persona}
Audience cible : ${audience}
Style de voix : ${voice}

=== TA MISSION ===
Analyse l'image fournie et génère des posts pour les réseaux sociaux sélectionnés.
${descriptionContext}

Ton souhaité : "${tone || 'Professionnel'}"

Trouve un ANGLE unique basé sur l'image :
- Que montre cette image et quel est son intérêt ?
- Quel impact concret pour l'audience ?
- Quelle opinion ou question ça soulève ?
- Quel lien avec le quotidien des gens ?

=== RÈGLES PAR PLATEFORME ===

${selectedPlatformRules}

=== RÈGLES GÉNÉRALES ===
- Inclure des emojis pertinents
- Inclure des hashtags adaptés à chaque plateforme
- NE PAS décrire l'image littéralement, mais s'en inspirer pour créer du contenu engageant
- Adapter le format et la longueur à chaque plateforme
  `;

  // Build response schema dynamically based on selected platforms
  const schemaProperties: Record<string, unknown> = {};
  for (const platform of platforms) {
    const key = platform.toLowerCase();
    schemaProperties[key] = {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: `2 variantes pour ${platform}`
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: imageBase64,
              },
            },
            { text: prompt },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: schemaProperties,
          required: platforms.map((p: string) => p.toLowerCase()),
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text response from Gemini");
    }

    // Parsing robuste de la réponse JSON
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parse error (image-to-posts) - raw response:", text);
      const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        console.error("JSON parse fallback failed - cleaned response:", cleaned);
        return res.status(500).json({
          error: 'La réponse du modèle n\'a pas pu être interprétée. Réessayez.',
        });
      }
    }

    // Validation souple : s'assurer que chaque plateforme est un array
    const result: Record<string, string[]> = {};
    for (const platform of platforms) {
      const key = platform.toLowerCase();
      result[key] = Array.isArray(parsed[key]) ? parsed[key] : [];
    }

    return res.status(200).json(result);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Error generating content from image:", errMsg, error);
    return res.status(500).json({
      error: errMsg.includes('did not match')
        ? 'Le modèle a renvoyé une réponse inattendue. Réessayez.'
        : 'Failed to generate content from image',
    });
  }
}
