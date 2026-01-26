import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

// API Key côté serveur uniquement
const apiKey = process.env.GOOGLE_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vérifier l'authentification via le header Clerk
  const userId = req.headers['x-clerk-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized - Please sign in' });
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
