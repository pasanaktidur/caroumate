

export interface DesignPreferences {
  backgroundColor: string;
  fontColor: string;
  backgroundImage?: string;
  style: DesignStyle;
  font: FontChoice;
  aspectRatio: AspectRatio;
  brandingText?: string;
}

export interface UserProfile {
  name: string;
  niche: ContentNiche;
  profileComplete: boolean;
}

export interface SlideData {
  id: string;
  headline: string;
  body: string;
  visual_prompt: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
}

export interface Carousel {
  id: string;
  title: string;
  createdAt: string;
  slides: SlideData[];
  category: string;
  preferences: DesignPreferences;
}

export type AppView = 'LOGIN' | 'PROFILE_SETUP' | 'DASHBOARD' | 'GENERATOR';

export enum AIModel {
    GEMINI_2_5_FLASH = 'gemini-2.5-flash', // Fast and cost-effective for most tasks.
}

export interface AppSettings {
  aiModel: AIModel;
  apiKeyOption: 'caroumate' | 'custom';
  customApiKey: string;
  systemPrompt: string;
}

export type Language = 'en' | 'id';

export enum DesignStyle {
  MINIMALIST = 'Minimalist',
  BOLD = 'Bold & Punchy',
  COLORFUL = 'Vibrant & Colorful',
  ELEGANT = 'Elegant & Refined',
  VINTAGE = 'Retro & Vintage',
}

export enum ContentNiche {
  MARKETING = 'Digital Marketing',
  TECH = 'Technology',
  WELLNESS = 'Health & Wellness',
  FINANCE = 'Personal Finance',
  FOOD = 'Food & Cooking',
  TRAVEL = 'Travel',
}

export enum AspectRatio {
    SQUARE = '1:1',
    PORTRAIT = '3:4',
    STORY = '9:16',
}

export enum FontChoice {
  // Original Sans
  SANS = 'Inter',
  LATO = 'Lato',
  MONTSERRAT = 'Montserrat',
  OPEN_SANS = 'Open Sans',
  POPPINS = 'Poppins',
  RALEWAY = 'Raleway',
  ROBOTO = 'Roboto',
  // Original Serif
  SERIF = 'Lora',
  MERRIWEATHER = 'Merriweather',
  PT_SERIF = 'PT Serif',
  PLAYFAIR_DISPLAY = 'Playfair Display',
  // Original Display
  LOBSTER = 'Lobster',
  OSWALD = 'Oswald',
  // Original Mono
  MONO = 'Roboto Mono',
  SOURCE_CODE_PRO = 'Source Code Pro',
  // New Sans
  NUNITO = 'Nunito',
  WORK_SANS = 'Work Sans',
  RUBIK = 'Rubik',
  BEBAS_NEUE = 'Bebas Neue',
  ANTON = 'Anton',
  DM_SANS = 'DM Sans',
  BARLOW = 'Barlow',
  CABIN = 'Cabin',
  TITILLIUM_WEB = 'Titillium Web',
  // New Serif
  CORMORANT_GARAMOND = 'Cormorant Garamond',
  EB_GARAMOND = 'EB Garamond',
  BITTER = 'Bitter',
  CRIMSON_TEXT = 'Crimson Text',
  SPECTRAL = 'Spectral',
  ZILLA_SLAB = 'Zilla Slab',
  CARDO = 'Cardo',
  BREE_SERIF = 'Bree Serif',
  // New Display
  PACIFICO = 'Pacifico',
  CAVEAT = 'Caveat',
  DANCING_SCRIPT = 'Dancing Script',
  PERMANENT_MARKER = 'Permanent Marker',
  ALFA_SLAB_ONE = 'Alfa Slab One',
  RIGHTEOUS = 'Righteous',
  SATISFY = 'Satisfy',
  ABRIL_FATFACE = 'Abril Fatface',
  CHEWY = 'Chewy',
  // New Mono
  SPACE_MONO = 'Space Mono',
  IBM_PLEX_MONO = 'IBM Plex Mono',
  // New Handwriting
  INDIE_FLOWER = 'Indie Flower',
  PATRICK_HAND = 'Patrick Hand',
  PLAYPEN_SANS = 'Playpen Sans',
  BALSAMIQ_SANS = 'Balsamiq Sans',
}