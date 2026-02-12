export enum Platform {
  FACEBOOK = 'Facebook',
  INSTAGRAM = 'Instagram',
  LINKEDIN = 'LinkedIn'
}

export enum Tone {
  PROFESSIONAL = 'Professionnel',
  CASUAL = 'Décontracté',
  INFORMATIVE = 'Éducatif',
  HUMOROUS = 'Humoristique',
  INSPIRING = 'Inspirant'
}

export interface GeneratedContent {
  facebook?: string[];
  instagram?: string[];
  linkedin?: string[];
  imagePrompt?: string;
}

export interface PostState {
  topic: string;
  tone: Tone;
  content: GeneratedContent | null;
  imageUrl: string | null;
  isGeneratingText: boolean;
  isGeneratingImage: boolean;
  error: string | null;
}

export interface ImageToPostsRequest {
  imageBase64: string;
  mimeType: string;
  description: string;
  platforms: string[];
  tone: Tone;
  userPersona: string;
  userAudience: string;
  userVoice: string;
}

export interface ImageToPostsContent {
  facebook?: string[];
  instagram?: string[];
  linkedin?: string[];
  twitter?: string[];
}
