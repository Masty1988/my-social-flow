/**
 * Composant AuthWrapper
 *
 * Gère l'affichage conditionnel basé sur l'état d'authentification.
 * - Si non connecté: Affiche la page de connexion avec les options Passkey/Email
 * - Si connecté: Affiche l'application
 */

import React from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from '@clerk/clerk-react';
import { Fingerprint, Mail } from 'lucide-react';
import Logo from './Logo';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  return (
    <>
      {/* Utilisateur NON connecté - Afficher page de connexion */}
      <SignedOut>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <Logo size={48} />
                <h1 className="text-3xl font-bold tracking-tight text-blue-600">Social AI</h1>
              </div>
              <p className="text-gray-500">
                Votre Agent Social Media Personnel
              </p>
            </div>

            {/* Card de connexion */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
                Connexion requise
              </h2>

              <p className="text-gray-500 text-sm text-center mb-8">
                Connectez-vous pour accéder à la génération de contenu IA.
                Vos crédits API sont protégés.
              </p>

              {/* Options de connexion */}
              <div className="space-y-4">
                {/* Passkey (FaceID/TouchID) */}
                <SignInButton mode="modal">
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-200">
                    <Fingerprint size={24} />
                    Connexion avec Passkey
                  </button>
                </SignInButton>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-400">ou</span>
                  </div>
                </div>

                {/* Email Magic Link */}
                <SignInButton mode="modal">
                  <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 border border-gray-200">
                    <Mail size={20} />
                    Connexion par Email
                  </button>
                </SignInButton>
              </div>

              {/* Info sécurité */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">
                  Authentification sécurisée par Clerk.
                  <br />
                  Aucun mot de passe requis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>

      {/* Utilisateur connecté - Afficher l'application */}
      <SignedIn>
        {children}
      </SignedIn>
    </>
  );
};

/**
 * Composant UserMenu pour le header
 * Affiche le bouton utilisateur avec menu de déconnexion
 */
export const UserMenu: React.FC = () => {
  const { user } = useUser();

  return (
    <SignedIn>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 hidden sm:inline">
          {user?.primaryEmailAddress?.emailAddress}
        </span>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-9 h-9",
            },
          }}
        />
      </div>
    </SignedIn>
  );
};

export default AuthWrapper;
