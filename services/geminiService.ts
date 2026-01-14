import { GoogleGenAI, SchemaType } from "@google/genai"; // Vérifie tes imports selon ta version SDK
import { GeneratedContent, Tone } from "../types";

// Types pour tes plateformes (à mettre dans types.ts idéalement, mais ok ici pour la démo)
interface PlatformSelection {
  linkedin: boolean;
  facebook: boolean;
  instagram: boolean;
}

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || process.env.API_KEY; 
// Note: en Vite/React on utilise souvent import.meta.env

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const generatePostContent = async (
  topic: string,
  tone: Tone,
  platforms: PlatformSelection
): Promise<GeneratedContent> => {
  
  // 1. Construction dynamique des instructions
  let platformInstructions = "";
  
  if (platforms.facebook) {
    platformInstructions += `
    FACEBOOK :
    - Option 1 : Post engageant (Question ouverte pour lancer un débat tech).
    - Option 2 : "Le saviez-vous ?" (Info technique surprenante).
    `;
  }
  
  if (platforms.instagram) {
    platformInstructions += `
    INSTAGRAM :
    - Option 1 : Visuel & Punchy (Emojis, listes à puces, hashtag tech).
    - Option 2 : Behind the scenes (Vie de dev/entrepreneur).
    `;
  }
  
  if (platforms.linkedin) {
    platformInstructions += `
    LINKEDIN :
    - Option 1 : Expertise (Analyse pro, point de vue tranché sur le sujet).
    - Option 2 : Carrousel (Texte découpé en 3-5 slides logiques).
    `;
  }

  const prompt = `
    Rôle : Tu es un stratège Social Media Tech et un Copywriter d'élite.
    Sujet : "${topic}"
    Ton : "${tone}"
    
    Tâche : Génère des posts UNIQUEMENT pour les plateformes suivantes selon les règles ci-dessous.
    Ne génère RIEN pour les plateformes non demandées.
    
    Règles de rédaction :
    - Orthographe : Zéro faute.
    - Style : Direct, sans jargon inutile, motivant.
    - Format : Aère le texte.
    
    ${platformInstructions}
    
    IMAGE PROMPT :
    Description en anglais pour une IA générative (Midjourney/DALL-E style). 
    Doit être moderne, tech, cinématique ou minimaliste. Pas de texte dans l'image.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // Modèle stable et rapide
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            // On rend les champs optionnels ("nullable" n'est pas toujours géré pareil, 
            // mais si Gemini ne remplit pas, on aura null ou undefined)
            facebook: { 
              type: SchemaType.ARRAY, 
              items: { type: SchemaType.STRING },
              description: "Variantes Facebook (si demandé)" 
            },
            instagram: { 
              type: SchemaType.ARRAY, 
              items: { type: SchemaType.STRING },
              description: "Variantes Instagram (si demandé)" 
            },
            linkedin: { 
              type: SchemaType.ARRAY, 
              items: { type: SchemaType.STRING },
              description: "Variantes LinkedIn (si demandé)" 
            },
            imagePrompt: { type: SchemaType.STRING, description: "Prompt image" },
          },
          // On ne met rien en "required" strict pour éviter les erreurs si une plateforme est sautée,
          // sauf imagePrompt qu'on veut toujours.
          required: ["imagePrompt"],
        },
      },
    });

    const text = response.text(); // Note: .text() est souvent une méthode sur les dernières versions SDK
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as GeneratedContent;

  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  // ... (Ta fonction image existante reste inchangée)
  // Juste pour rappel, assure-toi d'utiliser un modèle qui supporte l'image generation
  // "gemini-1.5-flash" ne génère pas d'images directement (il fait du texte).
  // Pour l'image, tu dois utiliser soit une API tierce (OpenAI/DallE), 
  // soit le modèle imagen-3 si tu y as accès via Vertex AI, 
  // soit garder ton code actuel si tu as accès à une beta privée Gemini qui fait de l'image.
  
  // SI tu n'as pas accès à la génération d'image native Gemini :
  // Je te conseille de retourner une image placeholder pour l'instant
  // return `https://placehold.co/600x600?text=${encodeURIComponent(prompt.slice(0,20))}`;
  
  // Sinon garde ton code actuel s'il marche !
  return "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80"; // Placeholder temporaire pour test
};
