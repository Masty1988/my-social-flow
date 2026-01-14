import React from 'react';
import { Download, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string | null;
  isLoading: boolean;
  prompt?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, isLoading, prompt }) => {
  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'social-post-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex items-center gap-2 font-semibold">
        <ImageIcon size={20} />
        <span>Visuel Généré</span>
      </div>
      
      <div className="p-4 flex-grow flex items-center justify-center bg-gray-50 min-h-[300px] relative group">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 text-indigo-600">
            <Loader2 className="animate-spin" size={32} />
            <span className="text-sm font-medium">Création du visuel en cours...</span>
          </div>
        ) : imageUrl ? (
          <div className="relative w-full h-full flex flex-col">
            <img 
              src={imageUrl} 
              alt="Generated social media visual" 
              className="w-full h-auto max-h-[400px] object-contain rounded-lg shadow-sm"
            />
             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <button 
                  onClick={handleDownload}
                  className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <Download size={18} /> Télécharger
                </button>
             </div>
             {prompt && (
               <div className="mt-4 text-xs text-gray-400 italic">
                 Prompt: {prompt}
               </div>
             )}
          </div>
        ) : (
          <div className="text-gray-400 text-sm text-center px-6">
            L'image apparaîtra ici une fois le contenu généré.
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePreview;
