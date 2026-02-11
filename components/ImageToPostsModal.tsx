import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  X,
  Upload,
  Camera,
  Send,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Image as ImageIcon,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { Tone, ImageToPostsContent } from '../types';
import { generateFromImage } from '../services/apiService';

interface ImageToPostsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLATFORMS = [
  { key: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={16} />, color: 'bg-[#0077b5]' },
  { key: 'twitter', label: 'Twitter/X', icon: <Twitter size={16} />, color: 'bg-black' },
  { key: 'instagram', label: 'Instagram', icon: <Instagram size={16} />, color: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]' },
  { key: 'facebook', label: 'Facebook', icon: <Facebook size={16} />, color: 'bg-[#1877F2]' },
];

const ImageToPostsModal: React.FC<ImageToPostsModalProps> = ({ isOpen, onClose }) => {
  const { getToken } = useAuth();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin']);
  const [tone, setTone] = useState<Tone>(Tone.PROFESSIONAL);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<ImageToPostsContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 10 Mo');
      return;
    }
    setImageFile(file);
    setError(null);
    setResults(null);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const togglePlatform = (key: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    );
  };

  const handleGenerate = async () => {
    if (!imageFile || selectedPlatforms.length === 0) return;

    setIsGenerating(true);
    setError(null);
    setResults(null);

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const content = await generateFromImage(
        base64,
        imageFile.type,
        description,
        selectedPlatforms,
        tone,
        getToken
      );

      setResults(content);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setDescription('');
    setResults(null);
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    setSelectedPlatforms(['linkedin']);
    setTone(Tone.PROFESSIONAL);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Camera size={20} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Générer depuis une image</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Upload Zone */}
          {!imagePreview ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
              }`}
            >
              <Upload size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700">
                Glissez-déposez une image ici
              </p>
              <p className="text-xs text-gray-400 mt-1">ou cliquez pour parcourir (max 10 Mo)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Aperçu"
                className="w-full max-h-64 object-contain rounded-xl border border-gray-200"
              />
              <button
                onClick={handleReset}
                className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-600 p-1.5 rounded-lg shadow-sm transition-colors"
                title="Supprimer l'image"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Description optionnelle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description / contexte (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Photo de mon nouveau setup de bureau pour le télétravail..."
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm resize-none"
            />
          </div>

          {/* Sélection des plateformes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Réseaux sociaux
            </label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(({ key, label, icon, color }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePlatform(key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                    selectedPlatforms.includes(key)
                      ? `${color} text-white border-transparent shadow-sm`
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Ton */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ton</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
            >
              {Object.values(Tone).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Bouton Générer */}
          {!results && (
            <button
              onClick={handleGenerate}
              disabled={!imageFile || selectedPlatforms.length === 0 || isGenerating}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Générer les Posts
                </>
              )}
            </button>
          )}

          {/* Résultats */}
          {results && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Sparkles size={16} className="text-indigo-600" />
                Posts générés
              </div>
              {PLATFORMS.filter(p => selectedPlatforms.includes(p.key)).map(({ key, label, icon, color }) => {
                const posts = results[key as keyof ImageToPostsContent];
                if (!posts || posts.length === 0) return null;
                return (
                  <ResultCard
                    key={key}
                    platform={label}
                    icon={icon}
                    colorClass={color}
                    content={posts}
                  />
                );
              })}
              <button
                onClick={handleReset}
                className="w-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-2.5 px-4 rounded-xl transition-all text-sm"
              >
                <div className="flex items-center justify-center gap-2">
                  <ImageIcon size={16} />
                  Nouvelle image
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant interne pour afficher les résultats par plateforme
const ResultCard: React.FC<{
  platform: string;
  icon: React.ReactNode;
  colorClass: string;
  content: string[];
}> = ({ platform, icon, colorClass, content }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentContent = content[selectedIndex] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className={`${colorClass} p-3 flex items-center justify-between text-white`}>
        <div className="flex items-center gap-2 font-semibold text-sm">
          {icon}
          <span>{platform}</span>
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
        >
          {copied ? (
            <><Check size={14} /> Copié</>
          ) : (
            <><Copy size={14} /> Copier</>
          )}
        </button>
      </div>

      {content.length > 1 && (
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          {content.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                selectedIndex === idx
                  ? 'border-indigo-500 text-indigo-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Option {idx + 1}
            </button>
          ))}
        </div>
      )}

      <div className="p-4">
        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
          {currentContent}
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
        <span className="flex items-center gap-1"><Sparkles size={12} /> Gemini Flash</span>
        <span>{currentContent.length} caractères</span>
      </div>
    </div>
  );
};

export default ImageToPostsModal;
