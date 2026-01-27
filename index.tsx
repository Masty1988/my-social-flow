import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import AuthWrapper from './components/AuthWrapper';

// Clé publique Clerk (safe côté client)
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn("Missing VITE_CLERK_PUBLISHABLE_KEY - Auth disabled in dev mode");
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Si pas de clé Clerk, afficher l'app sans auth (dev mode)
if (!PUBLISHABLE_KEY) {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <AuthWrapper>
          <App />
        </AuthWrapper>
      </ClerkProvider>
    </React.StrictMode>
  );
}