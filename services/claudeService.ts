import { GeneratedContent, Tone } from "../types";

interface PlatformSelection {
  linkedin: boolean;
  facebook: boolean;
  instagram: boolean;
}

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error("VITE_ANTHROPIC_API_KEY non définie dans .env.local");
}

export const generatePostContent = async (
  topic: string,
  tone: Tone,
  platforms: PlatformSelection
): Promise<GeneratedContent> => {

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

    IMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans backticks, sans explication.
    Format exact attendu:
    {
      "facebook": ["post 1", "post 2"] ou null si non demandé,
      "instagram": ["post 1", "post 2"] ou null si non demandé,
      "linkedin": ["post 1", "post 2"] ou null si non demandé,
      "imagePrompt": "description en anglais"
    }
  `;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey || "",
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Erreur API Claude");
    }

    const data = await response.json();
    const text = data.content[0].text;

    if (!text) throw new Error("No response from Claude");

    // Nettoyer la réponse au cas où il y aurait des backticks
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(cleanedText) as GeneratedContent;

  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  // Claude ne génère pas d'images, on utilise un placeholder
  // Tu peux intégrer DALL-E ou une autre API d'images ici plus tard
  return "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80";
};
