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

  // Mapping ton → style visuel pour le prompt image
  const toneImageStyles: Record<string, string> = {
    'Professionnel': 'Refined minimalist aesthetic, elegant and sober. Muted color palette (navy, charcoal, slate grey, silver). Subtle gradients, geometric precision, premium feel. Deep dark background (charcoal, midnight blue, or dark slate). Clean lines, sophisticated lighting, high-end editorial look. NO bright or saturated colors.',
    'Décontracté': 'Modern and colorful aesthetic, contemporary design trends. Vibrant palette (electric blue, coral, lime green, warm yellow). Bold gradient backgrounds, textured surfaces, lifestyle photography feel. Energetic composition with depth and movement. Trendy, fresh, approachable visual energy.',
    'Éducatif': 'Clear and structured visual, knowledge-sharing aesthetic. Balanced palette (teal, deep blue, warm orange accents). Infographic-inspired depth with 3D elements. Dark blue or deep slate background with subtle texture. Layered composition suggesting organization and clarity.',
    'Humoristique': 'Fun, dynamic, and bold style. Highly saturated colors (hot pink, bright orange, electric purple, neon green). Pop-art inspired energy, playful exaggerated proportions. Neon-tinted or vibrant gradient background. Unexpected visual juxtapositions, cartoon-meets-reality aesthetic. Maximum visual energy and personality.',
    'Inspirant': 'Cinematic dark mode aesthetic, dramatic and epic. Rich deep tones (midnight blue, deep purple, gold accents, amber highlights). Moody background with dramatic volumetric light rays, lens flares, or god rays. Film-grade lighting, atmospheric depth, bokeh effects. Motivational grandeur, aspirational mood. Think movie poster or album cover quality.',
  };

  const imageStyle = toneImageStyles[tone] || toneImageStyles['Professionnel'];

  // Contexte utilisateur pour personnaliser le visuel
  const profileImageContext = (userPersona || userAudience)
    ? `The visual should feel relevant to someone who is: ${persona}, targeting: ${audience}.`
    : '';

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
   - Option 1 "Opinion" : Prends position, sois clivant si besoin. Post long format LinkedIn classique avec hook en première ligne, développement argumenté, et conclusion forte. Hashtags pertinents.
   - Option 2 "Carrousel" : Génère un contenu structuré pour un carrousel LinkedIn.
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
     - Ajouter 3-5 hashtags pertinents après la dernière slide

=== IMAGE ===
Génère un prompt EN ANGLAIS pour un générateur d'images IA.

INTERDICTIONS ABSOLUES (ne jamais enfreindre) :
- INTERDIT : fond blanc, fond uni blanc, fond clair neutre. C'est la règle #1 la plus importante.
- INTERDIT : texte, lettres, mots, chiffres, typographie dans l'image.
- INTERDIT : clipart, flat design générique, illustrations vectorielles basiques, stock photo générique.
- INTERDIT : visages humains réalistes, logos de marques existantes.

OBLIGATIONS pour le prompt image :
- Commence TOUJOURS par décrire le fond/l'ambiance (couleur riche, dégradé, texture, scène).
- Décris une scène ou composition visuelle concrète et spécifique en lien avec "${topic}".
- Inclus des détails sur l'éclairage (direction, intensité, couleur de la lumière).
- Ajoute de la profondeur : premier plan, arrière-plan, perspective.
- Mentionne des textures (métal brossé, verre, bois, néon, fumée, particules...).
- Style visuel imposé par le ton : ${imageStyle}
${profileImageContext}
- Le prompt doit faire au moins 3 phrases détaillées pour un rendu de haute qualité.
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

    // Parsing robuste de la réponse JSON
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parse error - raw response:", text);
      // Tentative de nettoyage : retirer les blocs markdown ```json ... ```
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

    // Validation souple : s'assurer que les champs attendus existent
    const result = {
      facebook: Array.isArray(parsed.facebook) ? parsed.facebook : [],
      instagram: Array.isArray(parsed.instagram) ? parsed.instagram : [],
      linkedin: Array.isArray(parsed.linkedin) ? parsed.linkedin : [],
      imagePrompt: typeof parsed.imagePrompt === 'string' ? parsed.imagePrompt : '',
    };

    return res.status(200).json(result);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Error generating content:", errMsg, error);
    // Message plus explicite pour le debug côté client
    return res.status(500).json({
      error: errMsg.includes('did not match')
        ? 'Le modèle a renvoyé une réponse inattendue. Réessayez.'
        : 'Failed to generate content',
    });
  }
}
