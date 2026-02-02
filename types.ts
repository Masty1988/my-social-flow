export enum Platform {
  FACEBOOK = 'Facebook',
  INSTAGRAM = 'Instagram',
  LINKEDIN = 'LinkedIn'
}

export enum Tone {
  PROFESSIONAL = 'Professionnel',
  CASUAL = 'Décontracté',
  INFORMATIVE = 'Éducatif',
  HUMOROUS = 'Humoristique'
}

export interface GeneratedContent {
  facebook?: string[];
  instagram?: string[];
  linkedin?: string[];
  imagePrompt?: string;
}

export interface ImageAnalysisContent extends GeneratedContent {
  imageDescription?: string;
}

export type InputMode = 'text' | 'image';

export interface PostState {
  topic: string;
  tone: Tone;
  inputMode: InputMode;
  uploadedImage: string | null;
  uploadedImageMimeType: string | null;
  content: GeneratedContent | ImageAnalysisContent | null;
  imageUrl: string | null;
  isGeneratingText: boolean;
  isGeneratingImage: boolean;
  error: string | null;
}
