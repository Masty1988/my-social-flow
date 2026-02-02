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

  const { imageBase64, mimeType, tone } = req.body;

  if (!imageBase64 || !mimeType) {
    return res.status(400).json({ error: 'Missing required fields: imageBase64 and mimeType' });
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Tu es un expert en gestion de réseaux sociaux spécialisé dans le monde de la tech et du développement.

    Analyse cette image et génère du contenu pour les réseaux sociaux.

    Contexte: L'image provient probablement d'un développeur ou d'une personne dans la tech.
    Cherche des éléments comme : setup de bureau, écrans de code, matériel informatique,
    vie de développeur, conférences tech, hackathons, ou tout élément tech/dev.

    Ton souhaité: "${tone || 'professionnel'}".

    IMPORTANT: Tu DOIS répondre UNIQUEMENT en FRANÇAIS. Tous les posts doivent être rédigés en français.

    Génère 2 variantes de posts pour CHAQUE plateforme (Facebook, Instagram, LinkedIn) basés sur l'analyse de l'image.

    Règles pour les variantes :

    1. FACEBOOK :
       - Option 1 : Post engageant qui pose une question à la communauté en rapport avec l'image.
       - Option 2 : Post informatif court type "Le saviez-vous ?" en lien avec ce que montre l'image.

    2. INSTAGRAM :
       - Option 1 : Post court et punchy avec beaucoup d'emojis, décrivant l'image de façon fun.
       - Option 2 : Post type "Storytelling" (partage d'expérience liée à l'image).

    3. LINKEDIN :
       - Option 1 : Post "Thought Leadership" classique (Opinion/Expertise) inspiré par l'image.
       - Option 2 : Structure pour un CARROUSEL (Slide 1, Slide 2, Slide 3...) basé sur le thème de l'image.

    Général :
    - Tous les textes DOIVENT être en FRANÇAIS.
    - Ajoute des hashtags pertinents à la fin (tech, dev, etc.).
    - Image Prompt : Description en anglais pour améliorer ou recréer l'image avec un générateur d'image IA.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: imageBase64
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            imageDescription: {
              type: Type.STRING,
              description: "Brève description de ce que montre l'image"
            },
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
            imagePrompt: { type: Type.STRING, description: "Prompt pour générer/améliorer l'image" },
          },
          required: ["imageDescription", "facebook", "instagram", "linkedin", "imagePrompt"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text response from Gemini");
    }

    return res.status(200).json(JSON.parse(text));
  } catch (error) {
    console.error("Error analyzing image:", error);
    return res.status(500).json({ error: 'Failed to analyze image' });
  }
}
