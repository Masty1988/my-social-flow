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

import { GeneratedContent, Tone } from "../types";

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
