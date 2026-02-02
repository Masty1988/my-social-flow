/**
 * Service API côté client
 *
 * Ce service appelle les API routes sécurisées (/api/*) au lieu d'appeler
 * directement l'API Gemini depuis le frontend.
 *
 * Avantages:
 * - La clé API Gemini n'est JAMAIS exposée côté client
 * - Les requêtes passent par le middleware d'authentification
 * - Seuls les utilisateurs connectés peuvent générer du contenu
 */

import { GeneratedContent, ImageAnalysisContent, Tone } from "../types";

/**
 * Génère le contenu des posts pour les réseaux sociaux
 * @param topic - Le sujet du post
 * @param tone - Le ton souhaité
 * @param getToken - Fonction Clerk pour obtenir le JWT
 */
export const generatePostContent = async (
  topic: string,
  tone: Tone,
  getToken: () => Promise<string | null>
): Promise<GeneratedContent> => {
  const token = await getToken();

  if (!token) {
    throw new Error("Non authentifié - Veuillez vous connecter");
  }

  const response = await fetch('/api/generate-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ topic, tone }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Session expirée - Veuillez vous reconnecter");
    }
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la génération');
  }

  return response.json();
};

/**
 * Génère une image basée sur le prompt
 * @param prompt - Description de l'image à générer
 * @param getToken - Fonction Clerk pour obtenir le JWT
 */
export const generateImage = async (
  prompt: string,
  getToken: () => Promise<string | null>
): Promise<string> => {
  const token = await getToken();

  if (!token) {
    throw new Error("Non authentifié - Veuillez vous connecter");
  }

  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Session expirée - Veuillez vous reconnecter");
    }
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la génération');
  }

  const data = await response.json();
  return data.imageUrl;
};

/**
 * Analyse une image et génère du contenu pour les réseaux sociaux
 * @param imageBase64 - L'image en base64 (sans le préfixe data:...)
 * @param mimeType - Le type MIME de l'image (image/jpeg, image/png, etc.)
 * @param tone - Le ton souhaité
 * @param getToken - Fonction Clerk pour obtenir le JWT
 */
export const analyzeImageContent = async (
  imageBase64: string,
  mimeType: string,
  tone: Tone,
  getToken: () => Promise<string | null>
): Promise<ImageAnalysisContent> => {
  const token = await getToken();

  if (!token) {
    throw new Error("Non authentifié - Veuillez vous connecter");
  }

  const response = await fetch('/api/analyze-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ imageBase64, mimeType, tone }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Session expirée - Veuillez vous reconnecter");
    }
    if (response.status === 403) {
      throw new Error("Accès refusé - Vous n'êtes pas autorisé");
    }
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de l\'analyse de l\'image');
  }

  return response.json();
};
