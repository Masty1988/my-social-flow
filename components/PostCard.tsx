import React, { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';

interface PostCardProps {
  platform: string;
  content: string[];
  icon: React.ReactNode;
  colorClass: string;
  labels?: string[];
}

const PostCard: React.FC<PostCardProps> = ({ platform, content, icon, colorClass, labels }) => {
  const [copied, setCopied] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const currentContent = content[selectedIndex] || "";
  const defaultLabels = ["Option 1", "Option 2"];
  const currentLabels = labels || defaultLabels;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col h-full transition-all hover:shadow-lg">
      <div className={`${colorClass} p-4 flex items-center justify-between text-white`}>
        <div className="flex items-center gap-2 font-semibold">
          {icon}
          <span>{platform}</span>
        </div>
        <button 
          onClick={handleCopy}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium"
          title="Copier le texte"
        >
          {copied ? <span className="flex items-center gap-1"><Check size={16} /> Copié</span> : <span className="flex items-center gap-1"><Copy size={16} /> Copier</span>}
        </button>
      </div>

      {/* Option Tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        {content.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
              selectedIndex === idx 
                ? `border-indigo-500 text-indigo-600 bg-white` 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {currentLabels[idx] || `Option ${idx + 1}`}
          </button>
        ))}
      </div>

      <div className="p-6 flex-grow">
        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
          {currentContent ? (
             currentContent
          ) : (
            <span className="text-gray-400 italic">Contenu non disponible</span>
          )}
        </div>
      </div>
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
        <span className="flex items-center gap-1"><Sparkles size={12}/> Gemini 3 Flash</span>
        <span>{currentContent.length} caractères</span>
      </div>
    </div>
  );
};

export default PostCard;
