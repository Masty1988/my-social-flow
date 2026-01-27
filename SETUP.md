# Configuration de SocialFlow AI

## Architecture de sécurité

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │ ClerkProvider│───▶│  AuthWrapper │───▶│       App.tsx       │ │
│  │  (Auth)     │    │ (Gate)      │    │ (Interface)         │ │
│  └─────────────┘    └─────────────┘    └─────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│                     ┌─────────────┐                            │
│                     │ apiService  │ ◀── Envoie JWT Token       │
│                     └─────────────┘                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     VERCEL EDGE (Middleware)                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ middleware.ts                                            │   │
│  │ - Intercepte /api/*                                      │   │
│  │ - Vérifie le JWT Clerk                                   │   │
│  │ - 401 si non authentifié                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ ✅ Authentifié
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  VERCEL SERVERLESS FUNCTIONS                    │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │ /api/generate-content │    │ /api/generate-image  │          │
│  │ (Appelle Gemini)      │    │ (Appelle Gemini)     │          │
│  └──────────────────────┘    └──────────────────────┘          │
│                              │                                  │
│                              ▼                                  │
│                     ┌─────────────┐                            │
│                     │ GOOGLE_API_KEY │ ◀── Jamais exposée       │
│                     │ (Côté serveur) │    côté client          │
│                     └─────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

## 1. Configuration Clerk (Authentification)

### Créer un compte Clerk

1. Rendez-vous sur [clerk.com](https://clerk.com)
2. Créez un compte et un nouveau projet
3. Dans **Configure > Email, Phone, Username**, activez:
   - Email address
   - **Passkeys** (pour FaceID/TouchID)

### Récupérer les clés

Dans le dashboard Clerk > **API Keys**:
- `VITE_CLERK_PUBLISHABLE_KEY` (pk_test_xxx ou pk_live_xxx)
- `CLERK_SECRET_KEY` (sk_test_xxx ou sk_live_xxx)

## 2. Configuration Google Cloud (Gemini API)

### Informations du projet

- **Project ID**: `gen-lang-client-0280468357`
- **Credits disponibles**: 255€

### Créer une clé API

1. [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** > **Credentials** > **+ CREATE CREDENTIALS** > **API Key**
3. Copiez la clé générée

### Activer la Generative Language API

1. **APIs & Services** > **Library**
2. Recherchez **"Generative Language API"**
3. Cliquez sur **ENABLE**

## 3. Variables d'environnement

### En local (.env.local)

```env
# Clerk (Authentification)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Google Gemini (côté serveur uniquement sur Vercel)
GOOGLE_API_KEY=AIzaXXXXXXXXXXXXXXX
```

### Sur Vercel

Dans **Settings** > **Environment Variables**, ajoutez:

| Variable | Value | Environments |
|----------|-------|--------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | pk_test_xxx | All |
| `CLERK_SECRET_KEY` | sk_test_xxx | All |
| `GOOGLE_API_KEY` | AIzaXXX | All |

**Important**: `GOOGLE_API_KEY` n'a PAS le préfixe `VITE_` car elle ne doit JAMAIS être exposée côté client.

## 4. Test en local

```bash
npm install
npm run dev
```

L'application sera disponible sur http://localhost:3000

### Mode développement sans Clerk

Si `VITE_CLERK_PUBLISHABLE_KEY` n'est pas définie, l'app fonctionne sans authentification (utile pour tester l'UI).

## 5. Déploiement Vercel

```bash
vercel --prod
```

Ou connectez votre repo GitHub pour le déploiement automatique.

## Modèles Gemini utilisés

- **gemini-2.0-flash**: Génération de contenu texte
- **gemini-2.0-flash-exp-image-generation**: Génération d'images

## Flux d'authentification

1. **Utilisateur non connecté**: Voit la page de connexion (Passkey/Email)
2. **Connexion via Clerk**: Passkey (FaceID/TouchID) ou Magic Link Email
3. **Utilisateur connecté**: Accès à l'interface de génération
4. **Appel API**: Le JWT Clerk est envoyé dans le header `Authorization`
5. **Middleware**: Vérifie le JWT avant d'exécuter la fonction
6. **Génération**: Si authentifié, appelle Gemini côté serveur

## Dépannage

### "Missing VITE_CLERK_PUBLISHABLE_KEY"

L'app fonctionne sans auth en mode dev. Pour activer l'auth, ajoutez la clé dans `.env.local`.

### Erreur 401 Unauthorized

1. Vérifiez que vous êtes bien connecté
2. Vérifiez que `CLERK_SECRET_KEY` est configurée sur Vercel
3. Vérifiez les logs Vercel pour plus de détails

### Erreur 500 Server Error

1. Vérifiez que `GOOGLE_API_KEY` est configurée sur Vercel
2. Vérifiez que la Generative Language API est activée
3. Vérifiez les logs Vercel
