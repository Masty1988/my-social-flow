import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  Send,
  Facebook,
  Instagram,
  Linkedin,
  Cpu,
  Search,
  Lightbulb,
  Wand2
} from 'lucide-react';
import { Tone, PostState } from './types';
import { generatePostContent, generateImage } from './services/apiService';
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
    content: null,
    imageUrl: null,
    isGeneratingText: false,
    isGeneratingImage: false,
    error: null,
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.topic.trim()) return;

    setState(prev => ({
      ...prev,
      isGeneratingText: true,
      isGeneratingImage: true,
      content: null,
      imageUrl: null,
      error: null
    }));

    try {
      // Step 1: Generate Text (via API sécurisée)
      const content = await generatePostContent(state.topic, state.tone, getToken);

      setState(prev => ({
        ...prev,
        content: content,
        isGeneratingText: false
      }));

      // Step 2: Generate Image (via API sécurisée)
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
                    disabled={state.isGeneratingText || !state.topic}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                  >
                    {state.isGeneratingText ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Rédaction...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Générer les Posts
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
