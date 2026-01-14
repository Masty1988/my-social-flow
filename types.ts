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

export interface PostState {
  topic: string;
  tone: Tone;
  content: GeneratedContent | null;
  imageUrl: string | null;
  isGeneratingText: boolean;
  isGeneratingImage: boolean;
  error: string | null;
}
