import { Tone } from "../types";

interface PlatformSelection {
  linkedin: boolean;
  facebook: boolean;
  instagram: boolean;
  youtube: boolean;
  tiktok: boolean;
  snapchat: boolean;
  pinterest: boolean;
  threads: boolean;
}

export const generatePrompt = (
  topic: string,
  tone: Tone,
  platforms: PlatformSelection
): string => {

  let platformInstructions = "";

  if (platforms.linkedin) {
    platformInstructions += `
LINKEDIN :
- Option 1 : Expertise (Analyse pro, point de vue tranché sur le sujet).
- Option 2 : Carrousel (Texte découpé en 3-5 slides logiques).
- Format : Texte aéré, emojis sobres, call-to-action en fin de post.
`;
  }

  if (platforms.facebook) {
    platformInstructions += `
FACEBOOK :
- Option 1 : Post engageant (Question ouverte pour lancer un débat).
- Option 2 : "Le saviez-vous ?" (Info surprenante + explication).
- Format : Texte conversationnel, emojis modérés, incitation au commentaire.
`;
  }

  if (platforms.instagram) {
    platformInstructions += `
INSTAGRAM :
- Option 1 : Visuel & Punchy (Emojis, listes à puces, hashtags pertinents).
- Option 2 : Behind the scenes (Storytelling authentique).
- Format : Court et impactant, 5-10 hashtags max, CTA engageant.
`;
  }

  if (platforms.youtube) {
    platformInstructions += `
YOUTUBE (Description vidéo) :
- Titre accrocheur (60 caractères max).
- Description optimisée SEO (2-3 paragraphes).
- Timestamps suggérés si pertinent.
- Tags recommandés (5-10 mots-clés).
- Format : Hook dans les 2 premières lignes, liens utiles, CTA abonnement.
`;
  }

  if (platforms.tiktok) {
    platformInstructions += `
TIKTOK :
- Hook percutant (3 premières secondes cruciales).
- Script court et dynamique (15-60 secondes).
- Tendances/sons suggérés si pertinent.
- Hashtags viraux + niche (3-5 max).
- Format : Langage Gen-Z friendly, humour bienvenu, CTA simple.
`;
  }

  if (platforms.snapchat) {
    platformInstructions += `
SNAPCHAT :
- Story courte et spontanée.
- Texte overlay minimaliste.
- Ton casual et authentique.
- Format : Message direct, emojis fun, feeling "behind the scenes".
`;
  }

  if (platforms.pinterest) {
    platformInstructions += `
PINTEREST :
- Titre SEO-friendly (40-60 caractères).
- Description riche en mots-clés (150-300 caractères).
- Hashtags pertinents (2-5 max).
- Format : Informatif, inspirant, orienté "save for later".
`;
  }

  if (platforms.threads) {
    platformInstructions += `
THREADS :
- Post conversationnel et authentique.
- Peut être un thread (série de posts liés).
- Ton décontracté, proche de Twitter.
- Format : Court et punchy, pas de hashtags, engagement direct.
`;
  }

  return `Rôle : Tu es un stratège Social Media et un Copywriter d'élite.

Sujet : "${topic}"
Ton : ${tone}

Tâche : Génère des posts UNIQUEMENT pour les plateformes listées ci-dessous.
Ne génère RIEN pour les plateformes non mentionnées.

Règles de rédaction :
- Orthographe : Zéro faute.
- Style : Direct, sans jargon inutile, motivant.
- Format : Aère le texte avec des sauts de ligne.
- Adapte le contenu aux spécificités de chaque plateforme.

${platformInstructions}

IMAGE PROMPT :
À la fin, génère aussi une description en anglais pour une IA générative (style Midjourney/DALL-E).
L'image doit être moderne, esthétique, et adaptée au sujet. Pas de texte dans l'image.`;
};
