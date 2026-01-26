# Configuration de l'API Gemini pour SocialFlow AI

## Informations du projet Google Cloud

- **Project ID**: `gen-lang-client-0280468357`
- **Credits disponibles**: 255€

## Etapes pour générer la clé API

### 1. Accéder à Google Cloud Console

Rendez-vous sur [Google Cloud Console](https://console.cloud.google.com/)

### 2. Créer une clé API

1. Dans le menu de navigation, allez dans **APIs & Services** > **Credentials**
2. Cliquez sur **+ CREATE CREDENTIALS** en haut de la page
3. Sélectionnez **API Key**
4. Une nouvelle clé API sera générée automatiquement
5. **Copiez cette clé** (vous pouvez la renommer pour mieux l'identifier)

### 3. Activer la Generative Language API

1. Dans le menu de navigation, allez dans **APIs & Services** > **Library**
2. Recherchez **"Generative Language API"**
3. Cliquez sur le résultat et appuyez sur **ENABLE**

### 4. Configurer la clé dans le projet

#### En local

Ouvrez le fichier `.env.local` à la racine du projet et remplacez le placeholder :

```env
VITE_GOOGLE_API_KEY=votre_clé_api_ici
```

#### Sur Vercel

1. Allez dans les **Settings** de votre projet Vercel
2. Naviguez vers **Environment Variables**
3. Ajoutez la variable :
   - **Name**: `VITE_GOOGLE_API_KEY`
   - **Value**: votre clé API
   - **Environment**: Production, Preview, Development

## Test de l'API

Lancez l'application en local pour tester :

```bash
npm install
npm run dev
```

L'application sera disponible sur http://localhost:3000

## Sécurité

- Ne commitez jamais le fichier `.env.local` (il est dans `.gitignore`)
- Restreignez votre clé API dans la console Google Cloud si nécessaire (par domaine ou IP)
- Surveillez votre utilisation dans la console pour éviter les surprises

## Modèles Gemini utilisés

- **gemini-3-flash-preview**: Génération de contenu texte (posts réseaux sociaux)
- **gemini-2.5-flash-image**: Génération d'images

## Dépannage

### Erreur "API_KEY is missing"

Vérifiez que :
1. Le fichier `.env.local` existe à la racine
2. La variable s'appelle bien `VITE_GOOGLE_API_KEY`
3. Redémarrez le serveur de développement après modification du `.env.local`

### Erreur 403 ou "API not enabled"

1. Vérifiez que la **Generative Language API** est bien activée
2. Vérifiez que la clé API appartient au bon projet
3. Vérifiez les restrictions éventuelles sur la clé API
