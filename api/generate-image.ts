import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

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

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing required field: prompt' });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp-image-generation',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseModalities: ['Text', 'Image'],
      },
    });

    let imageUrl = '';

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          imageUrl = `data:image/png;base64,${base64EncodeString}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error("Error generating image:", error);
    return res.status(500).json({ error: 'Failed to generate image' });
  }
}
