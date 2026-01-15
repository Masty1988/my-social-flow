import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Facebook,
  Instagram,
  Linkedin,
  Cpu,
  Search,
  Lightbulb,
  Wand2,
  Copy,
  Check,
  ExternalLink,
  Youtube,
  MessageCircle,
  Music2,
  Camera,
  Pin,
  Image
} from 'lucide-react';
import { Tone } from './types';
import { generatePrompt } from './services/promptService';

interface AppState {
  topic: string;
  tone: Tone;
  platforms: {
    linkedin: boolean;
    facebook: boolean;
    instagram: boolean;
    youtube: boolean;
    tiktok: boolean;
    snapchat: boolean;
    pinterest: boolean;
    threads: boolean;
  };
  generatedPrompt: string | null;
  copied: boolean;
  copiedImage: boolean;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    topic: '',
    tone: Tone.PROFESSIONAL,
    platforms: {
      linkedin: true,
      facebook: true,
      instagram: true,
      youtube: false,
      tiktok: false,
      snapchat: false,
      pinterest: false,
      threads: false,
    },
    generatedPrompt: null,
    copied: false,
    copiedImage: false,
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.topic.trim()) return;

    const hasAnyPlatform = Object.values(state.platforms).some(v => v);
    if (!hasAnyPlatform) {
      return;
    }

    const prompt = generatePrompt(state.topic, state.tone, state.platforms);
    setState(prev => ({ ...prev, generatedPrompt: prompt, copied: false, copiedImage: false }));
  };

  const handleCopy = async () => {
    if (!state.generatedPrompt) return;

    await navigator.clipboard.writeText(state.generatedPrompt);
    setState(prev => ({ ...prev, copied: true }));

    setTimeout(() => {
      setState(prev => ({ ...prev, copied: false }));
    }, 2000);
  };

  const getImagePrompt = (): string => {
    return `Create a modern, professional image for social media about: "${state.topic}".
Style: Clean, minimalist, tech-inspired.
No text in the image.
High quality, 4K, suitable for Instagram/LinkedIn posts.`;
  };

  const handleCopyImagePrompt = async () => {
    await navigator.clipboard.writeText(getImagePrompt());
    setState(prev => ({ ...prev, copiedImage: true }));

    setTimeout(() => {
      setState(prev => ({ ...prev, copiedImage: false }));
    }, 2000);
  };

  const suggestionChips = [
    "Les nouvelles features de React 19",
    "Astuces SEO pour 2025",
    "Ma routine de développeur",
    "L'impact de l'IA sur le code",
    "Gérer le syndrome de l'imposteur"
  ];

  const handlePlatformChange = (platform: keyof typeof state.platforms) => {
    setState(prev => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [platform]: !prev.platforms[platform]
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles size={24} />
            <h1 className="text-xl font-bold tracking-tight">SocialFlow AI</h1>
          </div>
          <div className="flex gap-4 text-sm font-medium text-gray-500">
             <span className="flex items-center gap-1"><Cpu size={14}/> Tech</span>
             <span className="flex items-center gap-1"><Search size={14}/> SEO</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <form onSubmit={handleGenerate} className="space-y-6">

            {/* Topic Input */}
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
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                  onClick={() => setState(prev => ({ ...prev, topic: suggestionChips[Math.floor(Math.random() * suggestionChips.length)] }))}
                >
                  <Wand2 size={18} />
                </button>
              </div>
              {/* Suggestion Chips */}
              <div className="flex flex-wrap gap-2 mt-3">
                {suggestionChips.map((chip, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setState(prev => ({ ...prev, topic: chip }))}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 text-gray-600 rounded-full transition-colors flex items-center gap-1"
                  >
                    <Lightbulb size={12} />
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Réseaux cibles</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none group p-2 rounded-lg hover:bg-gray-50">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${state.platforms.linkedin ? 'bg-[#0077b5] border-[#0077b5]' : 'border-gray-300 bg-white'}`}>
                    {state.platforms.linkedin && <span className="text-white text-xs">✓</span>}
                  </div>
                  <input type="checkbox" className="hidden" checked={state.platforms.linkedin} onChange={() => handlePlatformChange('linkedin')} />
                  <span className="text-gray-600 group-hover:text-[#0077b5] flex items-center gap-1"><Linkedin size={16}/> LinkedIn</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none group p-2 rounded-lg hover:bg-gray-50">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${state.platforms.facebook ? 'bg-[#1877F2] border-[#1877F2]' : 'border-gray-300 bg-white'}`}>
                    {state.platforms.facebook && <span className="text-white text-xs">✓</span>}
                  </div>
                  <input type="checkbox" className="hidden" checked={state.platforms.facebook} onChange={() => handlePlatformChange('facebook')} />
                  <span className="text-gray-600 group-hover:text-[#1877F2] flex items-center gap-1"><Facebook size={16}/> Facebook</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none group p-2 rounded-lg hover:bg-gray-50">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${state.platforms.instagram ? 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] border-[#E1306C]' : 'border-gray-300 bg-white'}`}>
                    {state.platforms.instagram && <span className="text-white text-xs">✓</span>}
                  </div>
                  <input type="checkbox" className="hidden" checked={state.platforms.instagram} onChange={() => handlePlatformChange('instagram')} />
                  <span className="text-gray-600 group-hover:text-[#E1306C] flex items-center gap-1"><Instagram size={16}/> Instagram</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none group p-2 rounded-lg hover:bg-gray-50">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${state.platforms.youtube ? 'bg-[#FF0000] border-[#FF0000]' : 'border-gray-300 bg-white'}`}>
                    {state.platforms.youtube && <span className="text-white text-xs">✓</span>}
                  </div>
                  <input type="checkbox" className="hidden" checked={state.platforms.youtube} onChange={() => handlePlatformChange('youtube')} />
                  <span className="text-gray-600 group-hover:text-[#FF0000] flex items-center gap-1"><Youtube size={16}/> YouTube</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none group p-2 rounded-lg hover:bg-gray-50">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${state.platforms.tiktok ? 'bg-black border-black' : 'border-gray-300 bg-white'}`}>
                    {state.platforms.tiktok && <span className="text-white text-xs">✓</span>}
                  </div>
                  <input type="checkbox" className="hidden" checked={state.platforms.tiktok} onChange={() => handlePlatformChange('tiktok')} />
                  <span className="text-gray-600 group-hover:text-black flex items-center gap-1"><Music2 size={16}/> TikTok</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none group p-2 rounded-lg hover:bg-gray-50">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${state.platforms.snapchat ? 'bg-[#FFFC00] border-[#FFFC00]' : 'border-gray-300 bg-white'}`}>
                    {state.platforms.snapchat && <span className="text-black text-xs">✓</span>}
                  </div>
                  <input type="checkbox" className="hidden" checked={state.platforms.snapchat} onChange={() => handlePlatformChange('snapchat')} />
                  <span className="text-gray-600 group-hover:text-[#FFFC00] flex items-center gap-1"><Camera size={16}/> Snapchat</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none group p-2 rounded-lg hover:bg-gray-50">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${state.platforms.pinterest ? 'bg-[#E60023] border-[#E60023]' : 'border-gray-300 bg-white'}`}>
                    {state.platforms.pinterest && <span className="text-white text-xs">✓</span>}
                  </div>
                  <input type="checkbox" className="hidden" checked={state.platforms.pinterest} onChange={() => handlePlatformChange('pinterest')} />
                  <span className="text-gray-600 group-hover:text-[#E60023] flex items-center gap-1"><Pin size={16}/> Pinterest</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none group p-2 rounded-lg hover:bg-gray-50">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${state.platforms.threads ? 'bg-black border-black' : 'border-gray-300 bg-white'}`}>
                    {state.platforms.threads && <span className="text-white text-xs">✓</span>}
                  </div>
                  <input type="checkbox" className="hidden" checked={state.platforms.threads} onChange={() => handlePlatformChange('threads')} />
                  <span className="text-gray-600 group-hover:text-black flex items-center gap-1"><MessageCircle size={16}/> Threads</span>
                </label>
              </div>
            </div>

            {/* Tone & Submit */}
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
                    disabled={!state.topic}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                  >
                    <Send size={18} />
                    Générer le prompt
                  </button>
               </div>
            </div>
          </form>
        </div>

        {/* Generated Prompt Section */}
        {state.generatedPrompt && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Prompt généré</h2>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  state.copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
              >
                {state.copied ? <Check size={18} /> : <Copy size={18} />}
                {state.copied ? 'Copié !' : 'Copier'}
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                {state.generatedPrompt}
              </pre>
            </div>

            {/* Quick Links - Text AI */}
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">Coller le prompt dans :</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://claude.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-200 transition-colors"
                >
                  <ExternalLink size={16} />
                  Claude
                </a>
                <a
                  href="https://gemini.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                >
                  <ExternalLink size={16} />
                  Gemini
                </a>
                <a
                  href="https://chatgpt.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-medium hover:bg-emerald-200 transition-colors"
                >
                  <ExternalLink size={16} />
                  ChatGPT
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Image Generator Section */}
        {state.generatedPrompt && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Image size={20} className="text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">Prompt Image</h2>
              </div>
              <button
                onClick={handleCopyImagePrompt}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  state.copiedImage
                    ? 'bg-green-100 text-green-700'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                {state.copiedImage ? <Check size={18} /> : <Copy size={18} />}
                {state.copiedImage ? 'Copié !' : 'Copier'}
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                {getImagePrompt()}
              </pre>
            </div>

            {/* Quick Links - Image AI */}
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">Générateurs d'images gratuits :</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.bing.com/images/create"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg font-medium hover:bg-cyan-200 transition-colors"
                >
                  <ExternalLink size={16} />
                  Bing Image Creator
                </a>
                <a
                  href="https://ideogram.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-lg font-medium hover:bg-violet-200 transition-colors"
                >
                  <ExternalLink size={16} />
                  Ideogram
                </a>
                <a
                  href="https://leonardo.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 transition-colors"
                >
                  <ExternalLink size={16} />
                  Leonardo.ai
                </a>
                <a
                  href="https://playground.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-lg font-medium hover:bg-pink-200 transition-colors"
                >
                  <ExternalLink size={16} />
                  Playground
                </a>
                <a
                  href="https://tensor.art"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg font-medium hover:bg-rose-200 transition-colors"
                >
                  <ExternalLink size={16} />
                  Tensor.art
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
