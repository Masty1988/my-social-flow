/**
 * Middleware Clerk pour Vercel Edge Functions
 *
 * Ce middleware intercepte toutes les requêtes AVANT qu'elles n'atteignent les API routes.
 * Il vérifie l'authentification pour les routes protégées.
 *
 * Flux:
 * 1. Client envoie requête vers /api/generate-content
 * 2. Middleware intercepte: "Montre-moi ton cookie de session"
 * 3. Si pas de session -> Rejet 401 Unauthorized
 * 4. Si session valide -> La requête passe avec le userId dans les headers
 *
 * IMPORTANT: La page d'accueil (/) reste accessible pour charger l'interface
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Définir les routes PROTÉGÉES (nécessitent authentification)
const isProtectedRoute = createRouteMatcher([
  '/api/generate-content(.*)',
  '/api/generate-image(.*)',
]);

// Définir les routes PUBLIQUES (accessibles sans auth)
const isPublicRoute = createRouteMatcher([
  '/',           // Page d'accueil - l'interface se charge
  '/sign-in(.*)', // Page de connexion Clerk
  '/sign-up(.*)', // Page d'inscription Clerk
]);

export default clerkMiddleware(async (auth, req) => {
  // Si c'est une route protégée, vérifier l'authentification
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  // Matcher: le middleware s'exécute sur ces routes
  matcher: [
    // Exclure les fichiers statiques et _next
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Toujours exécuter pour les API routes
    '/(api|trpc)(.*)',
  ],
};
