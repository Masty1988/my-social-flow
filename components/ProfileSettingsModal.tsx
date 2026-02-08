import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEYS = {
  persona: 'userPersona',
  audience: 'userAudience',
  voice: 'userVoice',
};

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  const [persona, setPersona] = useState('');
  const [audience, setAudience] = useState('');
  const [voice, setVoice] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPersona(localStorage.getItem(STORAGE_KEYS.persona) || '');
      setAudience(localStorage.getItem(STORAGE_KEYS.audience) || '');
      setVoice(localStorage.getItem(STORAGE_KEYS.voice) || '');
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEYS.persona, persona);
    localStorage.setItem(STORAGE_KEYS.audience, audience);
    localStorage.setItem(STORAGE_KEYS.voice, voice);
    setSaved(true);
    setTimeout(() => onClose(), 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Mon Profil</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tu te présentes comment ?
            </label>
            <input
              type="text"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              placeholder="Ex: Dev freelance passionné d'IA"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tu parles à qui ?
            </label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Ex: Autres devs et entrepreneurs curieux"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Ton style ?
            </label>
            <input
              type="text"
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              placeholder="Ex: Accessible, concret, pas corporate"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-200"
        >
          {saved ? '✓ Enregistré' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;
