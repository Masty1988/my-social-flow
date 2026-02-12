import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent, Tone } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing from environment variables");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY_FOR_BUILD' });

export const generatePostContent = async (
  topic: string,
  tone: Tone
): Promise<GeneratedContent> => {
  
  // Mapping ton → style visuel pour le prompt image
  const toneImageStyles: Record<string, string> = {
    'Professionnel': 'Clean polished aesthetic, muted colors (navy, charcoal, silver), subtle gradients, dark or deep-colored background.',
    'Décontracté': 'Vibrant energetic colors, modern trendy aesthetic, colorful gradient or textured background.',
    'Éducatif': 'Clear structured visual, infographic-inspired, balanced colors (teal, deep blue), dark blue or slate background.',
    'Humoristique': 'Fun dynamic style, bold saturated colors, pop-art energy, colorful or neon-tinted background.',
    'Inspirant': 'Cinematic dramatic lighting, dark mode, rich deep tones, epic atmosphere, dark moody background with dramatic light rays.',
  };

  const imageStyle = toneImageStyles[tone] || toneImageStyles['Professionnel'];

  const prompt = `
    Tu es un expert en gestion de réseaux sociaux pour la tech.
    Sujet: "${topic}".
    Ton: "${tone}".

    Génère 2 variantes de posts pour CHAQUE plateforme (Facebook, Instagram, LinkedIn) et une description visuelle pour une image.

    Règles pour les variantes :

    1. FACEBOOK :
       - Option 1 : Post engageant qui pose une question à la communauté.
       - Option 2 : Post informatif court type "Le saviez-vous ?".

    2. INSTAGRAM :
       - Option 1 : Post court et punchy avec beaucoup d'emojis.
       - Option 2 : Post type "Storytelling" (partage d'expérience).

    3. LINKEDIN :
       - Option 1 : Post "Thought Leadership" classique (Opinion/Expertise).
       - Option 2 : Structure pour un CARROUSEL LinkedIn avec ce format :
         --- Slide 1 : [Hook / Accroche]
         --- Slide 2 : [Point clé 1]
         --- Slide 3 : [Point clé 2]
         --- Slide 4 : [Point clé 3]
         --- Slide 5 : [Point clé 4]
         --- Slide 6 : [CTA / Conclusion]
         Chaque slide = 1 idée, phrase courte et impactante.

    Général :
    - Ajoute des hashtags pertinents à la fin.
    - Image Prompt : Description EN ANGLAIS pour un générateur d'image IA.
      JAMAIS de fond blanc. JAMAIS de texte dans l'image. JAMAIS de clipart ou flat design générique.
      Style visuel adapté au ton : ${imageStyle}
      Privilégie des visuels impactants avec profondeur, textures et éclairage travaillé.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
    if (!text) throw new Error("No text response from Gemini");

    return JSON.parse(text) as GeneratedContent;
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    let imageUrl = '';
    
    if (response.candidates && response.candidates[0].content.parts) {
       for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          imageUrl = `data:image/png;base64,${base64EncodeString}`;
          break; // Found the image
        }
      }
    }

    if (!imageUrl) {
      throw new Error("No image generated.");
    }

    return imageUrl;

  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
