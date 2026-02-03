import React, { useState, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  Send,
  Facebook,
  Instagram,
  Linkedin,
  Cpu,
  Search,
  Lightbulb,
  Wand2,
  Type,
  ImageIcon,
  Upload,
  X
} from 'lucide-react';
import { Tone, PostState, InputMode } from './types';
import { generatePostContent, generateImage, analyzeImageContent } from './services/apiService';
import PostCard from './components/PostCard';
import ImagePreview from './components/ImagePreview';
import { UserMenu } from './components/AuthWrapper';
import Logo from './components/Logo';

const App: React.FC = () => {
  // Hook Clerk pour l'authentification
  const { getToken } = useAuth();

  const [state, setState] = useState<PostState>({
    topic: '',
    tone: Tone.PROFESSIONAL,
    inputMode: 'text',
    uploadedImage: null,
    uploadedImageMimeType: null,
    content: null,
    imageUrl: null,
    isGeneratingText: false,
    isGeneratingImage: false,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gérer l'upload d'image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setState(prev => ({ ...prev, error: 'Veuillez sélectionner une image valide' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      // Extraire le base64 sans le préfixe data:...
      const base64 = result.split(',')[1];
      setState(prev => ({
        ...prev,
        uploadedImage: result, // Pour l'affichage (avec préfixe)
        uploadedImageMimeType: file.type,
        error: null
      }));
    };
    reader.readAsDataURL(file);
  };

  const clearUploadedImage = () => {
    setState(prev => ({
      ...prev,
      uploadedImage: null,
      uploadedImageMimeType: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation selon le mode
    if (state.inputMode === 'text' && !state.topic.trim()) return;
    if (state.inputMode === 'image' && !state.uploadedImage) return;

    setState(prev => ({
      ...prev,
      isGeneratingText: true,
      isGeneratingImage: true,
      content: null,
      imageUrl: null,
      error: null
    }));

    try {
      if (state.inputMode === 'text') {
        // Mode texte : génération classique
        const content = await generatePostContent(state.topic, state.tone, getToken);
        setState(prev => ({
          ...prev,
          content: content,
          isGeneratingText: false
        }));

        if (content.imagePrompt) {
          const imageUrl = await generateImage(content.imagePrompt, getToken);
          setState(prev => ({
            ...prev,
            imageUrl,
            isGeneratingImage: false
          }));
        } else {
          setState(prev => ({ ...prev, isGeneratingImage: false }));
        }
      } else {
        // Mode image : analyse avec Gemini Vision
        const base64 = state.uploadedImage!.split(',')[1];
        const content = await analyzeImageContent(
          base64,
          state.uploadedImageMimeType!,
          state.tone,
          getToken
        );

        setState(prev => ({
          ...prev,
          content: content,
          isGeneratingText: false,
          // En mode image, on utilise l'image uploadée comme preview
          imageUrl: state.uploadedImage,
          isGeneratingImage: false
        }));
      }

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isGeneratingText: false,
        isGeneratingImage: false
      }));
    }
  };

  const suggestionChips = [
    "Les nouvelles features de React 19",
    "Astuces SEO pour 2025",
    "Ma routine de développeur",
    "L'impact de l'IA sur le code",
    "Comment optimiser ses images web",
    "Le futur du CSS avec Tailwind",
    "3 extensions Chrome pour SEO",
    "Gérer le syndrome de l'imposteur",
    "Mon setup télétravail idéal"
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={36} />
            <h1 className="text-xl font-bold tracking-tight text-blue-600">Social AI</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-4 text-sm font-medium text-gray-500">
              <span className="flex items-center gap-1"><Cpu size={14}/> Tech</span>
              <span className="flex items-center gap-1"><Search size={14}/> SEO</span>
              <span className="flex items-center gap-1"><Lightbulb size={14}/> Visibilité</span>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Intro Section */}
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Votre Agent Social Media Personnel</h2>
          <p className="text-gray-500">
            Automatisez la création de vos posts.
            Obtenez 2 variantes pour Facebook, Instagram et LinkedIn (Format Classique & Carrousel) en un clic.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-10 max-w-3xl mx-auto">
          <form onSubmit={handleGenerate} className="space-y-6">

            {/* Mode Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit mx-auto">
              <button
                type="button"
                onClick={() => setState(prev => ({ ...prev, inputMode: 'text' }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  state.inputMode === 'text'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Type size={18} />
                Texte
              </button>
              <button
                type="button"
                onClick={() => setState(prev => ({ ...prev, inputMode: 'image' }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  state.inputMode === 'image'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ImageIcon size={18} />
                Image
              </button>
            </div>

            {/* Mode Texte */}
            {state.inputMode === 'text' && (
              <div>
                <label htmlFor="topic" className="block text-sm font-semibold text-gray-700 mb-2">
                  Sujet du post
                </label>
                <div className="relative">
                  <input
                    id="topic"
                    type="text"
                    value={state.topic}
                    onChange={(e) => setState(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="Ex: Les avantages du Server-Side Rendering..."
                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                    title="Suggérer un sujet"
                    onClick={() => setState(prev => ({ ...prev, topic: suggestionChips[Math.floor(Math.random() * suggestionChips.length)] }))}
                  >
                    <Wand2 size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {suggestionChips.map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setState(prev => ({ ...prev, topic: chip }))}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mode Image */}
            {state.inputMode === 'image' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Uploadez une image
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Photo de setup, écran de code, bureau de dev... L'IA analysera l'image pour générer des posts tech.
                </p>

                {!state.uploadedImage ? (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all">
                    <Upload size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Cliquez pour uploader</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (max 10MB)</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={state.uploadedImage}
                      alt="Image uploadée"
                      className="w-full h-48 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={clearUploadedImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ton</label>
                <select
                  value={state.tone}
                  onChange={(e) => setState(prev => ({ ...prev, tone: e.target.value as Tone }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  {Object.values(Tone).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
               </div>
               
               <div className="flex items-end">
                 <button
                    type="submit"
                    disabled={
                      state.isGeneratingText ||
                      (state.inputMode === 'text' && !state.topic) ||
                      (state.inputMode === 'image' && !state.uploadedImage)
                    }
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                  >
                    {state.isGeneratingText ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        {state.inputMode === 'image' ? 'Analyse...' : 'Rédaction...'}
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        {state.inputMode === 'image' ? 'Analyser l\'image' : 'Générer les Posts'}
                      </>
                    )}
                  </button>
               </div>
            </div>
          </form>
        </div>

        {state.error && (
          <div className="max-w-3xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-center">
            {state.error}
          </div>
        )}

        {/* Results Section */}
        {(state.content || state.isGeneratingText) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Visual Column */}
            <div className="lg:col-span-1 order-2 lg:order-1">
               <ImagePreview 
                  imageUrl={state.imageUrl} 
                  isLoading={state.isGeneratingImage} 
                  prompt={state.content?.imagePrompt}
               />
            </div>

            {/* Content Columns */}
            <div className="lg:col-span-2 order-1 lg:order-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {state.content?.linkedin && (
                <PostCard
                  platform="LinkedIn"
                  icon={<Linkedin size={20} />}
                  content={state.content.linkedin}
                  colorClass="bg-[#0077b5]"
                  labels={["Classique", "Carrousel"]}
                />
              )}
              {state.content?.facebook && (
                <PostCard
                  platform="Facebook"
                  icon={<Facebook size={20} />}
                  content={state.content.facebook}
                  colorClass="bg-[#1877F2]"
                  labels={["Engageant", "Informatif"]}
                />
              )}
              {state.content?.instagram && (
                <div className="md:col-span-2">
                  <PostCard
                    platform="Instagram"
                    icon={<Instagram size={20} />}
                    content={state.content.instagram}
                    colorClass="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]"
                    labels={["Court & Punchy", "Storytelling"]}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
