import * as React from 'react';
import type { AppView, UserProfile, Carousel, SlideData, DesignPreferences, AppSettings, Language } from './types';
import { ContentNiche, DesignStyle, FontChoice, AspectRatio, AIModel } from './types';
import { GoogleIcon, SparklesIcon, LoaderIcon, DownloadIcon, SettingsIcon, InstagramIcon, ThreadsIcon, MoonIcon, SunIcon, AvatarIcon } from './components/icons';
import { generateCarouselContent, generateSlideImage, getAiAssistance } from './services/geminiService';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';

// --- TRANSLATIONS & I18N ---
const translations = {
  en: {
    // Header
    welcome: 'Welcome, {{name}}!',
    logout: 'Logout',
    settingsAriaLabel: 'Open settings',
    languageAriaLabel: 'Change language',
    toggleThemeAriaLabel: 'Toggle theme',

    // Login Screen
    loginTitle: 'Welcome to CarouMate',
    loginSubtitle: 'Your AI partner for creating stunning social media carousels in minutes.',
    loginButton: 'Login as Guest',

    // Profile Setup
    profileTitle: 'Tell us about you!',
    profileSubtitle: 'This helps our AI tailor content just for you.',
    profileNameLabel: 'Your Name',
    profileNicheLabel: 'Your Primary Content Niche',
    profileButton: 'Get Started',

    // Dashboard
    dashboardTitle: 'Dashboard',
    dashboardSubtitle: 'Your creative workspace.',
    newCarouselButton: 'Create New Carousel',
    statsTotalCarousels: 'Total Carousels',
    statsDownloads: 'Downloads',
    statsMostUsedCategory: 'Most Used Category',
    historyTitle: 'Your History',
    historyEditButton: 'Edit',
    historyEmpty: "You haven't created any carousels yet.",
    historyEmptyHint: 'Click "Create New Carousel" to get started!',

    // Generator
    generatorStep1Title: '1. Enter Your Idea',
    generatorTopicLabel: "What's your carousel about?",
    generatorTopicPlaceholder: "e.g., '5 tips for growing on Instagram in 2024'",
    generatorStep2Title: '2. Customize Your Design',
    generatorStyleLabel: 'Style',
    generatorAspectRatioLabel: 'Aspect Ratio',
    generatorFontLabel: 'Font',
    generatorBrandingLabel: 'Branding (@username)',
    generatorBrandingPlaceholder: '@yourhandle',
    generatorBgColorLabel: 'BG Color',
    generatorFontColorLabel: 'Font Color',
    generatorCustomBgLabel: 'Custom Background',
    generatorRemoveBgButton: 'Remove background',
    generatorCreateButton: 'Create Carousel',
    generatorGeneratingButton: 'Generating...',
    generatorAssistantButton: 'AI Assistant (Get Ideas)',
    generatorStep3Title: '3. Edit Your Content',
    generatorHeadlineLabel: 'Headline',
    generatorBodyLabel: 'Body Text',
    generatorVisualPromptLabel: 'Visual Prompt',
    generatorMoveSlideLabel: 'Move Slide',
    downloadAllButton: 'Download All',
    downloadingButton: 'Downloading...',
    previewEmptyTitle: "Let's create something amazing!",
    previewEmptySubtitle: 'Fill in the details on the left and click "Create Carousel" to begin.',
    errorTitle: 'An Error Occurred',
    generatingContentMessage: 'Crafting your carousel content...',
    generatingVisualsMessage: 'Generating stunning visuals...',

    // SlideCard
    generatingVisual: 'Generating visual...',

    // AiAssistantModal
    assistantTitle: 'AI Assistant',
    assistantSubtitle1: 'Stuck? Get some ideas for your carousel about "',
    assistantSubtitle2: '".',
    getHookButton: 'Get Hook Ideas',
    getCTAButton: 'Get CTA Ideas',
    assistantEmpty: 'Select a category above to see suggestions.',

    // SettingsModal
    settingsTitle: 'Settings',
    aiModelLabel: 'AI Model',
    aiModelHint: "Choose the AI model. 'gemini-2.5-flash' is fast, while 'gemini-2.5-pro' is more powerful for complex content.",
    apiKeyLabel: 'Google AI API Key',
    apiKeyPlaceholder: 'Enter your Google AI API key',
    apiKeyHint: 'Your API key is stored securely in your browser and is required for all AI features.',
    systemPromptLabel: 'System Prompt',
    systemPromptPlaceholder: 'e.g., You are a witty content creator...',
    cancelButton: 'Cancel',
    saveButton: 'Save Changes',
  },
  id: {
    // Header
    welcome: 'Selamat datang, {{name}}!',
    logout: 'Keluar',
    settingsAriaLabel: 'Buka pengaturan',
    languageAriaLabel: 'Ubah bahasa',
    toggleThemeAriaLabel: 'Ganti tema',

    // Login Screen
    loginTitle: 'Selamat Datang di CarouMate',
    loginSubtitle: 'Partner AI Anda untuk membuat carousel media sosial yang memukau dalam hitungan menit.',
    loginButton: 'Masuk sebagai Tamu',

    // Profile Setup
    profileTitle: 'Beri tahu kami tentang Anda!',
    profileSubtitle: 'Ini membantu AI kami menyesuaikan konten khusus untuk Anda.',
    profileNameLabel: 'Nama Anda',
    profileNicheLabel: 'Niche Konten Utama Anda',
    profileButton: 'Mulai',

    // Dashboard
    dashboardTitle: 'Dasbor',
    dashboardSubtitle: 'Ruang kerja kreatif Anda.',
    newCarouselButton: 'Buat Carousel Baru',
    statsTotalCarousels: 'Total Carousel',
    statsDownloads: 'Unduhan',
    statsMostUsedCategory: 'Kategori Paling Banyak Digunakan',
    historyTitle: 'Riwayat Anda',
    historyEditButton: 'Ubah',
    historyEmpty: 'Anda belum membuat carousel apa pun.',
    historyEmptyHint: 'Klik "Buat Carousel Baru" untuk memulai!',

    // Generator
    generatorStep1Title: '1. Masukkan Ide Anda',
    generatorTopicLabel: 'Tentang apa carousel Anda?',
    generatorTopicPlaceholder: "cth., '5 tips untuk berkembang di Instagram pada 2024'",
    generatorStep2Title: '2. Sesuaikan Desain Anda',
    generatorStyleLabel: 'Gaya',
    generatorAspectRatioLabel: 'Rasio Aspek',
    generatorFontLabel: 'Font',
    generatorBrandingLabel: 'Branding (@username)',
    generatorBrandingPlaceholder: '@handleanda',
    generatorBgColorLabel: 'Warna Latar',
    generatorFontColorLabel: 'Warna Font',
    generatorCustomBgLabel: 'Latar Belakang Kustom',
    generatorRemoveBgButton: 'Hapus latar belakang',
    generatorCreateButton: 'Buat Carousel',
    generatorGeneratingButton: 'Membuat...',
    generatorAssistantButton: 'Asisten AI (Dapatkan Ide)',
    generatorStep3Title: '3. Edit Konten Anda',
    generatorHeadlineLabel: 'Judul',
    generatorBodyLabel: 'Teks Isi',
    generatorVisualPromptLabel: 'Prompt Visual',
    generatorMoveSlideLabel: 'Pindahkan Slide',
    downloadAllButton: 'Unduh Semua',
    downloadingButton: 'Mengunduh...',
    previewEmptyTitle: 'Ayo buat sesuatu yang luar biasa!',
    previewEmptySubtitle: 'Isi detail di sebelah kiri dan klik "Buat Carousel" untuk memulai.',
    errorTitle: 'Terjadi Kesalahan',
    generatingContentMessage: 'Menyusun konten carousel Anda...',
    generatingVisualsMessage: 'Membuat visual yang memukau...',

    // SlideCard
    generatingVisual: 'Membuat visual...',

    // AiAssistantModal
    assistantTitle: 'Asisten AI',
    assistantSubtitle1: 'Buntu? Dapatkan beberapa ide untuk carousel Anda tentang "',
    assistantSubtitle2: '".',
    getHookButton: 'Dapatkan Ide Hook',
    getCTAButton: 'Dapatkan Ide CTA',
    assistantEmpty: 'Pilih kategori di atas untuk melihat saran.',

    // SettingsModal
    settingsTitle: 'Pengaturan',
    aiModelLabel: 'Model AI',
    aiModelHint: "Pilih model AI. 'gemini-2.5-flash' cepat, sedangkan 'gemini-2.5-pro' lebih kuat untuk konten yang kompleks.",
    apiKeyLabel: 'Kunci API Google AI',
    apiKeyPlaceholder: 'Masukkan kunci API Google AI Anda',
    apiKeyHint: 'Kunci API Anda disimpan dengan aman di browser Anda dan diperlukan untuk semua fitur AI.',
    systemPromptLabel: 'Prompt Sistem',
    systemPromptPlaceholder: 'cth., Anda adalah seorang pembuat konten yang jenaka...',
    cancelButton: 'Batal',
    saveButton: 'Simpan Perubahan',
  },
};


// --- HELPERS, CONSTANTS & UI COMPONENTS ---
type TFunction = (key: string, params?: { [key: string]: any }) => string;

const SETTINGS_STORAGE_KEY = 'caroumate-settings';
const USER_STORAGE_KEY = 'caroumate-user';
const HISTORY_STORAGE_KEY = 'caroumate-history';
const DOWNLOADS_STORAGE_KEY = 'caroumate-downloads';


const defaultSettings: AppSettings = {
    aiModel: AIModel.GEMINI_2_5_FLASH,
    apiKey: '',
    systemPrompt: 'You are an expert social media content strategist specializing in creating viral carousels.'
};

const fontClassMap: { [key in FontChoice]: string } = {
  [FontChoice.SANS]: 'font-sans',
  [FontChoice.SERIF]: 'font-serif',
  [FontChoice.MONO]: 'font-mono',
  [FontChoice.LATO]: 'font-lato',
  [FontChoice.LOBSTER]: 'font-lobster',
  [FontChoice.MERRIWEATHER]: 'font-merriweather',
  [FontChoice.MONTSERRAT]: 'font-montserrat',
  [FontChoice.OPEN_SANS]: 'font-open-sans',
  [FontChoice.OSWALD]: 'font-oswald',
  [FontChoice.PT_SERIF]: 'font-pt-serif',
  [FontChoice.PLAYFAIR_DISPLAY]: 'font-playfair-display',
  [FontChoice.POPPINS]: 'font-poppins',
  [FontChoice.RALEWAY]: 'font-raleway',
  [FontChoice.ROBOTO]: 'font-roboto',
  [FontChoice.SOURCE_CODE_PRO]: 'font-source-code-pro',
  [FontChoice.NUNITO]: 'font-nunito',
  [FontChoice.WORK_SANS]: 'font-work-sans',
  [FontChoice.RUBIK]: 'font-rubik',
  [FontChoice.BEBAS_NEUE]: 'font-bebas-neue',
  [FontChoice.ANTON]: 'font-anton',
  [FontChoice.DM_SANS]: 'font-dm-sans',
  [FontChoice.BARLOW]: 'font-barlow',
  [FontChoice.CABIN]: 'font-cabin',
  [FontChoice.TITILLIUM_WEB]: 'font-titillium-web',
  [FontChoice.CORMORANT_GARAMOND]: 'font-cormorant-garamond',
  [FontChoice.EB_GARAMOND]: 'font-eb-garamond',
  [FontChoice.BITTER]: 'font-bitter',
  [FontChoice.CRIMSON_TEXT]: 'font-crimson-text',
  [FontChoice.SPECTRAL]: 'font-spectral',
  [FontChoice.ZILLA_SLAB]: 'font-zilla-slab',
  [FontChoice.CARDO]: 'font-cardo',
  [FontChoice.PACIFICO]: 'font-pacifico',
  [FontChoice.CAVEAT]: 'font-caveat',
  [FontChoice.DANCING_SCRIPT]: 'font-dancing-script',
  [FontChoice.PERMANENT_MARKER]: 'font-permanent-marker',
  [FontChoice.ALFA_SLAB_ONE]: 'font-alfa-slab-one',
  [FontChoice.RIGHTEOUS]: 'font-righteous',
  [FontChoice.SATISFY]: 'font-satisfy',
  [FontChoice.ABRIL_FATFACE]: 'font-abril-fatface',
  [FontChoice.SPACE_MONO]: 'font-space-mono',
  [FontChoice.IBM_PLEX_MONO]: 'font-ibm-plex-mono',
  [FontChoice.INDIE_FLOWER]: 'font-indie-flower',
  [FontChoice.PATRICK_HAND]: 'font-patrick-hand',
  [FontChoice.PLAYPEN_SANS]: 'font-playpen-sans',
  [FontChoice.BREE_SERIF]: 'font-bree-serif',
  [FontChoice.CHEWY]: 'font-chewy',
  [FontChoice.BALSAMIQ_SANS]: 'font-balsamiq-sans',
};

const aspectRatioClassMap: { [key in AspectRatio]: string } = {
    [AspectRatio.SQUARE]: 'aspect-square',
    [AspectRatio.PORTRAIT]: 'aspect-[4/5]',
    [AspectRatio.STORY]: 'aspect-[9/16]',
};

const aspectRatioDisplayMap: { [key in AspectRatio]: string } = {
    [AspectRatio.SQUARE]: '1:1 (Square)',
    [AspectRatio.PORTRAIT]: '4:5 (Portrait)',
    [AspectRatio.STORY]: '9:16 (Story)',
};

const Header: React.FC<{
    user: UserProfile | null;
    onLogout: () => void;
    onDashboard: () => void;
    onOpenSettings: () => void;
    language: Language;
    onLanguageChange: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    t: TFunction;
}> = ({ user, onLogout, onDashboard, onOpenSettings, language, onLanguageChange, theme, onToggleTheme, t }) => (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm dark:shadow-gray-700/[.5] sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-2 cursor-pointer" onClick={onDashboard}>
                    <SparklesIcon className="w-8 h-8 text-primary-600" />
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">CarouMate</h1>
                </div>
                {user && (
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <span className="text-gray-600 dark:text-gray-400 hidden md:block">{t('welcome', { name: user.name.split(' ')[0] })}</span>
                        <button
                            onClick={onLanguageChange}
                            className="p-2 w-10 text-center text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 transition-colors font-semibold"
                            aria-label={t('languageAriaLabel')}
                        >
                            {language === 'en' ? 'ID' : 'EN'}
                        </button>
                         <button
                            onClick={onToggleTheme}
                            className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 transition-colors"
                            aria-label={t('toggleThemeAriaLabel')}
                        >
                            {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                        </button>
                        <button
                            onClick={onOpenSettings}
                            className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 transition-colors"
                            aria-label={t('settingsAriaLabel')}
                        >
                            <SettingsIcon className="w-6 h-6" />
                        </button>
                        <button
                            onClick={onLogout}
                            className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/50 border border-transparent rounded-md hover:bg-primary-200 dark:hover:bg-primary-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 transition-colors"
                        >
                            {t('logout')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    </header>
);

const Loader: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <LoaderIcon className="w-24 h-24" />
        <p className="text-lg text-gray-600 dark:text-gray-400 animate-pulse">{text}</p>
    </div>
);

const SlideCard: React.FC<{ slide: SlideData; preferences: DesignPreferences; isSelected: boolean; onClick: () => void; t: TFunction; }> = ({ slide, preferences, isSelected, onClick, t }) => {
    const font = fontClassMap[preferences.font] || 'font-sans';
    const aspectRatioClass = aspectRatioClassMap[preferences.aspectRatio] || 'aspect-square';

    const { headlineSize, bodySize } = React.useMemo(() => {
        switch (preferences.aspectRatio) {
            case AspectRatio.STORY: // 9:16, narrowest
                return { headlineSize: 'text-base sm:text-lg', bodySize: 'text-xs sm:text-sm' };
            case AspectRatio.PORTRAIT: // 4:5, narrow
                return { headlineSize: 'text-lg sm:text-xl', bodySize: 'text-sm' };
            case AspectRatio.SQUARE: // 1:1, widest
            default:
                return { headlineSize: 'text-xl sm:text-2xl', bodySize: 'text-sm sm:text-base' };
        }
    }, [preferences.aspectRatio]);

    const styleClasses = React.useMemo(() => {
        switch (preferences.style) {
            case DesignStyle.BOLD: return 'border-4 border-gray-900 dark:border-gray-200';
            case DesignStyle.ELEGANT: return 'border border-gray-300 dark:border-gray-600 shadow-md dark:shadow-xl dark:shadow-black/20';
            case DesignStyle.COLORFUL: return `border-4 border-transparent bg-gradient-to-br from-pink-300 to-indigo-400`;
            case DesignStyle.VINTAGE: return 'border-2 border-yellow-800 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
            default: return 'border border-gray-200 dark:border-gray-700';
        }
    }, [preferences.style]);

    return (
        <div
            data-carousel-slide={slide.id}
            onClick={onClick}
            className={`h-[280px] sm:h-[320px] md:h-[400px] flex-shrink-0 relative flex flex-col justify-center items-center p-6 pb-10 text-center rounded-lg cursor-pointer transition-all duration-300 transform ${styleClasses} ${font} ${aspectRatioClass} ${isSelected ? 'ring-4 ring-primary-500 ring-offset-2 scale-105' : 'hover:scale-102'}`}
            style={{
                backgroundColor: preferences.style !== DesignStyle.COLORFUL && !preferences.backgroundImage ? preferences.backgroundColor : undefined,
                color: preferences.fontColor
            }}
        >
            {/* Background Image Layer */}
            {preferences.backgroundImage ? (
                <>
                    <img src={preferences.backgroundImage} alt="Custom background" className="absolute inset-0 w-full h-full object-cover rounded-md -z-10" />
                    <div className="absolute inset-0 bg-black/30 rounded-md -z-10"></div> {/* Dark overlay for readability */}
                </>
            ) : slide.imageUrl ? (
                <img src={slide.imageUrl} alt={slide.visual_prompt} className="absolute inset-0 w-full h-full object-cover rounded-md -z-10 opacity-20" />
            ) : null}

            {/* Loading Indicator for AI Image */}
            {(slide.isGeneratingImage && !preferences.backgroundImage) ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                    <LoaderIcon className="w-12 h-12" />
                    <p className="text-sm">{t('generatingVisual')}</p>
                </div>
            ) : (
                <div className="z-10 flex flex-col items-center">
                    <h2 className={`font-bold leading-tight mb-4 ${headlineSize}`}>{slide.headline}</h2>
                    <p className={`${bodySize}`}>{slide.body}</p>
                </div>
            )}

            {/* Branding Text */}
            {preferences.brandingText && (
                <div className="absolute bottom-4 left-0 right-0 text-center text-xs sm:text-sm z-20 px-4 pointer-events-none">
                    <p style={{ opacity: 0.75 }}>{preferences.brandingText}</p>
                </div>
            )}
        </div>
    );
};


// --- MAIN APP COMPONENT ---

export default function App() {
    const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
            return localStorage.getItem('theme') as 'light' | 'dark';
        }
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });
    
    React.useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const [language, setLanguage] = React.useState<Language>('en');
    
    // --- State Initialization from localStorage ---
    const [user, setUser] = React.useState<UserProfile | null>(() => {
        try {
            const savedUser = localStorage.getItem(USER_STORAGE_KEY);
            return savedUser ? JSON.parse(savedUser) : null;
        } catch { return null; }
    });
    
    const [view, setView] = React.useState<AppView>(() => {
        try {
            const savedUser = localStorage.getItem(USER_STORAGE_KEY);
            if (savedUser) {
                const user: UserProfile = JSON.parse(savedUser);
                if (user.profileComplete) return 'DASHBOARD';
                return 'PROFILE_SETUP';
            }
        } catch {}
        return 'LOGIN';
    });
    
    const [carouselHistory, setCarouselHistory] = React.useState<Carousel[]>(() => {
        try {
            const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
            return savedHistory ? JSON.parse(savedHistory) : [];
        } catch { return []; }
    });
    
    const [downloadCount, setDownloadCount] = React.useState<number>(() => {
        try {
            const savedCount = localStorage.getItem(DOWNLOADS_STORAGE_KEY);
            return savedCount ? JSON.parse(savedCount) : 0;
        } catch { return 0; }
    });

    const [currentCarousel, setCurrentCarousel] = React.useState<Carousel | null>(null);
    const [selectedSlideId, setSelectedSlideId] = React.useState<string | null>(null);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [isDownloading, setIsDownloading] = React.useState(false);
    const [generationMessage, setGenerationMessage] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const [isAssistantOpen, setIsAssistantOpen] = React.useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const [currentTopic, setCurrentTopic] = React.useState('');

    const [settings, setSettings] = React.useState<AppSettings>(() => {
        try {
            const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
        } catch (error) {
            console.error("Could not load settings:", error);
            return defaultSettings;
        }
    });

    // --- Data Persistence Effects ---
    React.useEffect(() => {
        try {
            if (user) {
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
            } else {
                localStorage.removeItem(USER_STORAGE_KEY);
            }
        } catch (error) { console.error("Could not save user profile:", error); }
    }, [user]);

    React.useEffect(() => {
        try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(carouselHistory));
        } catch (error) { console.error("Could not save carousel history:", error); }
    }, [carouselHistory]);
    
    const handleLanguageChange = () => {
        setLanguage(lang => lang === 'en' ? 'id' : 'en');
    };
    
    const t = React.useCallback((key: string, params?: { [key: string]: any }) => {
        let text = translations[language][key] || key;
        if (params) {
            Object.keys(params).forEach(pKey => {
                const regex = new RegExp(`{{${pKey}}}`, 'g');
                text = text.replace(regex, String(params[pKey]));
            });
        }
        return text;
    }, [language]);

    const handleSaveSettings = (newSettings: AppSettings) => {
        setSettings(newSettings);
        try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
        } catch (error) {
            console.error("Could not save settings:", error);
        }
        setIsSettingsOpen(false);
    };

    const handleLogin = () => {
        const guestUser: UserProfile = {
            name: 'Guest User',
            email: 'guest@example.com',
            picture: '', // No picture for guest
            niche: ContentNiche.MARKETING,
            profileComplete: false
        };
        setUser(guestUser);
        setView('PROFILE_SETUP');
    };
    
    const handleLogout = () => {
        setUser(null);
        setCarouselHistory([]);
        setDownloadCount(0);
        setView('LOGIN');
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(HISTORY_STORAGE_KEY);
        localStorage.removeItem(DOWNLOADS_STORAGE_KEY);
    };

    const handleProfileSetup = (profile: Omit<UserProfile, 'profileComplete'>) => {
        setUser({ ...profile, profileComplete: true });
        setView('DASHBOARD');
    };
    
    const goToDashboard = () => {
        if (view === 'LOGIN' || view === 'PROFILE_SETUP') return;
        if (currentCarousel) {
            setCarouselHistory(prev => {
                const index = prev.findIndex(c => c.id === currentCarousel.id);
                if (index !== -1) {
                    const newHistory = [...prev];
                    newHistory[index] = currentCarousel;
                    return newHistory;
                }
                return prev;
            });
        }
        setCurrentCarousel(null);
        setView('DASHBOARD');
    }

    const startNewCarousel = () => {
        setCurrentCarousel(null);
        setSelectedSlideId(null);
        setView('GENERATOR');
    };

    const handleEditCarousel = (carouselId: string) => {
        const carouselToEdit = carouselHistory.find(c => c.id === carouselId);
        if (carouselToEdit) {
            setCurrentCarousel(carouselToEdit);
            setCurrentTopic(carouselToEdit.title);
            setSelectedSlideId(carouselToEdit.slides[0]?.id || null);
            setView('GENERATOR');
        }
    };
    
    const handleGenerateCarousel = React.useCallback(async (topic: string, preferences: DesignPreferences) => {
        if (!user) return;
        setIsGenerating(true);
        setError(null);
        setCurrentCarousel(null);
        setCurrentTopic(topic);
        
        try {
            setGenerationMessage(t('generatingContentMessage'));
            const slidesContent = await generateCarouselContent(topic, user.niche, preferences, settings);

            const initialSlides: SlideData[] = slidesContent.map(s => ({ ...s, id: crypto.randomUUID(), isGeneratingImage: !preferences.backgroundImage }));
            const newCarousel: Carousel = {
                id: crypto.randomUUID(),
                title: topic,
                createdAt: new Date().toISOString(),
                slides: initialSlides,
                category: user.niche,
                preferences,
            };
            setCurrentCarousel(newCarousel);
            setSelectedSlideId(initialSlides[0]?.id ?? null);

            if (preferences.backgroundImage) {
                 setCarouselHistory(prev => [ newCarousel, ...prev ]);
            } else {
                setGenerationMessage(t('generatingVisualsMessage'));
                
                let finalSlides = [...initialSlides];
                let hasErrors = false;

                for (let i = 0; i < initialSlides.length; i++) {
                    const slide = initialSlides[i];
                    try {
                        const imageUrl = await generateSlideImage(slide.visual_prompt, preferences.aspectRatio, settings);
                        const updatedSlide = { ...slide, imageUrl, isGeneratingImage: false };
                        finalSlides[i] = updatedSlide;
                        
                        setCurrentCarousel(prev => {
                            if (!prev) return null;
                            const newSlides = [...prev.slides];
                            newSlides[i] = updatedSlide;
                            return { ...prev, slides: newSlides };
                        });

                    } catch (err: any) {
                        console.error(`Failed to generate image for slide "${slide.headline}":`, err);
                        const updatedSlide = { ...slide, isGeneratingImage: false };
                        finalSlides[i] = updatedSlide;
                        hasErrors = true;
                        
                        setCurrentCarousel(prev => {
                            if (!prev) return null;
                            const newSlides = [...prev.slides];
                            newSlides[i] = updatedSlide;
                            return { ...prev, slides: newSlides };
                        });
                    }
                    if (i < initialSlides.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 4000));
                    }
                }
                
                const finalCarousel = { ...newCarousel, slides: finalSlides };
                setCarouselHistory(prev => [ finalCarousel, ...prev ]);

                if (hasErrors) {
                    setError("Some images couldn't be generated, likely due to API rate limits. Please wait a moment before trying again.");
                }
            }

        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsGenerating(false);
            setGenerationMessage('');
        }
    }, [user, settings, t]);

    const handleDownloadCarousel = async () => {
        if (!currentCarousel) return;
        setIsDownloading(true);
        setError(null);
        try {
            const zip = new JSZip();
            const slideElements = document.querySelectorAll('[data-carousel-slide]');
            
            const slideOrderMap = new Map(currentCarousel.slides.map((slide, index) => [slide.id, index]));
            const orderedElements = Array.from(slideElements).sort((a, b) => {
                const idA = a.getAttribute('data-carousel-slide') || '';
                const idB = b.getAttribute('data-carousel-slide') || '';
                return Number(slideOrderMap.get(idA) ?? 99) - Number(slideOrderMap.get(idB) ?? 99);
            });


            for (let i = 0; i < orderedElements.length; i++) {
                const element = orderedElements[i] as HTMLElement;
                const canvas = await html2canvas(element, {
                    allowTaint: true,
                    useCORS: true,
                    backgroundColor: null,
                    scale: 2,
                });
                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
                if (blob) {
                    zip.file(`slide-${i + 1}.png`, blob);
                }
            }

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(zipBlob);
            const safeTitle = currentCarousel.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.download = `${safeTitle || 'carousel'}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            const newCount = downloadCount + 1;
            setDownloadCount(newCount);
            localStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(newCount));

        } catch (error) {
            console.error("Failed to download carousel:", error);
            setError("Sorry, there was an issue creating the download file.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleUpdateSlide = (slideId: string, updates: Partial<SlideData>) => {
        if (!currentCarousel) return;
        const updatedSlides = currentCarousel.slides.map(s => s.id === slideId ? { ...s, ...updates } : s);
        setCurrentCarousel({ ...currentCarousel, slides: updatedSlides });
    };

    const handleMoveSlide = (slideId: string, direction: 'left' | 'right') => {
        if (!currentCarousel) return;
        const slides = [...currentCarousel.slides];
        const index = slides.findIndex(s => s.id === slideId);
        if (index === -1) return;

        const newIndex = direction === 'left' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= slides.length) return;
        
        [slides[index], slides[newIndex]] = [slides[newIndex], slides[index]];
        setCurrentCarousel({ ...currentCarousel, slides });
    };

    const selectedSlide = React.useMemo(() => {
        return currentCarousel?.slides.find(s => s.id === selectedSlideId);
    }, [currentCarousel, selectedSlideId]);
    
    const mostUsedCategory = React.useMemo(() => {
        if (carouselHistory.length === 0) return 'N/A';
        const categoryCounts = carouselHistory.reduce((acc, carousel) => {
            acc[carousel.category] = (acc[carousel.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(categoryCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }, [carouselHistory]);

    const renderContent = () => {
        switch (view) {
            case 'LOGIN': return <LoginScreen onLogin={handleLogin} t={t} />;
            case 'PROFILE_SETUP': return <ProfileSetupModal user={user!} onSetupComplete={handleProfileSetup} t={t} />;
            case 'DASHBOARD': return (
                <Dashboard
                    onNewCarousel={startNewCarousel}
                    history={carouselHistory}
                    onEdit={handleEditCarousel}
                    t={t}
                    downloadCount={downloadCount}
                    mostUsedCategory={mostUsedCategory}
                />
            );
            case 'GENERATOR': return (
                <Generator
                    user={user!}
                    isGenerating={isGenerating}
                    generationMessage={generationMessage}
                    error={error}
                    onGenerate={handleGenerateCarousel}
                    currentCarousel={currentCarousel}
                    selectedSlide={selectedSlide}
                    onSelectSlide={setSelectedSlideId}
                    onUpdateSlide={handleUpdateSlide}
                    onMoveSlide={handleMoveSlide}
                    onOpenAssistant={() => setIsAssistantOpen(true)}
                    onDownload={handleDownloadCarousel}
                    isDownloading={isDownloading}
                    t={t}
                />
            );
            default: return <LoginScreen onLogin={handleLogin} t={t} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Header
                user={user}
                onLogout={handleLogout}
                onDashboard={goToDashboard}
                onOpenSettings={() => setIsSettingsOpen(true)}
                language={language}
                onLanguageChange={handleLanguageChange}
                theme={theme}
                onToggleTheme={toggleTheme}
                t={t}
            />
            <main className="flex-grow">
                {renderContent()}
            </main>
            <Footer />
            {isAssistantOpen && (
                <AiAssistantModal 
                    topic={currentTopic}
                    onClose={() => setIsAssistantOpen(false)}
                    settings={settings}
                    t={t}
                />
            )}
            {isSettingsOpen && (
                <SettingsModal
                    currentSettings={settings}
                    onClose={() => setIsSettingsOpen(false)}
                    onSave={handleSaveSettings}
                    t={t}
                />
            )}
        </div>
    );
}


// --- VIEW & MODAL COMPONENTS ---

const LoginScreen: React.FC<{ onLogin: () => void; t: TFunction; }> = ({ onLogin, t }) => {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-128px)]">
            <div className="text-center p-8 max-w-md mx-auto">
                <SparklesIcon className="w-20 h-20 text-primary-500 mx-auto mb-4"/>
                <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t('loginTitle')}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t('loginSubtitle')}</p>
                <button
                    onClick={onLogin}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg"
                >
                   {t('loginButton')}
                </button>
            </div>
        </div>
    );
};


const ProfileSetupModal: React.FC<{ user: UserProfile, onSetupComplete: (profile: Omit<UserProfile, 'profileComplete'>) => void; t: TFunction; }> = ({ user, onSetupComplete, t }) => {
    const [name, setName] = React.useState(user.name || '');
    const [niche, setNiche] = React.useState<ContentNiche>(user.niche || ContentNiche.MARKETING);
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSetupComplete({ ...user, name, niche });
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-lg w-full m-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t('profileTitle')}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t('profileSubtitle')}</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('profileNameLabel')}</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                        <label htmlFor="niche" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('profileNicheLabel')}</label>
                        <select id="niche" value={niche} onChange={e => setNiche(e.target.value as ContentNiche)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                            {Object.values(ContentNiche).map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        {t('profileButton')}
                    </button>
                </form>
            </div>
        </div>
    );
};


const Dashboard: React.FC<{
    onNewCarousel: () => void;
    history: Carousel[];
    onEdit: (id: string) => void;
    t: TFunction;
    downloadCount: number;
    mostUsedCategory: string;
}> = ({ onNewCarousel, history, onEdit, t, downloadCount, mostUsedCategory }) => (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('dashboardTitle')}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{t('dashboardSubtitle')}</p>
            </div>
            <button onClick={onNewCarousel} className="mt-4 sm:mt-0 w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg">
                <SparklesIcon className="w-5 h-5 mr-2 -ml-1" />
                {t('newCarouselButton')}
            </button>
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"><h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('statsTotalCarousels')}</h4><p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{history.length}</p></div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"><h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('statsDownloads')}</h4><p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{downloadCount}</p></div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"><h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('statsMostUsedCategory')}</h4><p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{mostUsedCategory}</p></div>
        </div>

        {/* History Section */}
        <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('historyTitle')}</h3>
            {history.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {history.map(c => (
                            <li key={c.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div className="mb-4 sm:mb-0">
                                    <p className="text-lg font-semibold text-primary-700 dark:text-primary-400">{c.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center space-x-4 self-end sm:self-center">
                                    <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-900/50 rounded-full">{c.category}</span>
                                    <button
                                        onClick={() => onEdit(c.id)}
                                        className="px-4 py-2 text-sm font-medium text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/50 rounded-md hover:bg-primary-200 dark:hover:bg-primary-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 transition-colors"
                                    >
                                        {t('historyEditButton')}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <p className="text-gray-500 dark:text-gray-400">{t('historyEmpty')}</p>
                    <p className="text-gray-500 dark:text-gray-400">{t('historyEmptyHint')}</p>
                </div>
            )}
        </div>
    </div>
);


const Generator: React.FC<{
    user: UserProfile;
    isGenerating: boolean;
    generationMessage: string;
    error: string | null;
    onGenerate: (topic: string, preferences: DesignPreferences) => void;
    currentCarousel: Carousel | null;
    selectedSlide: SlideData | undefined;
    onSelectSlide: (id: string) => void;
    onUpdateSlide: (id: string, updates: Partial<SlideData>) => void;
    onMoveSlide: (id: string, direction: 'left' | 'right') => void;
    onOpenAssistant: () => void;
    onDownload: () => void;
    isDownloading: boolean;
    t: TFunction;
}> = (props) => {
    const { user, isGenerating, generationMessage, error, onGenerate, currentCarousel, selectedSlide, onSelectSlide, onUpdateSlide, onMoveSlide, onOpenAssistant, onDownload, isDownloading, t } = props;
    const [topic, setTopic] = React.useState('');
    const [preferences, setPreferences] = React.useState<DesignPreferences>({
        backgroundColor: '#FFFFFF',
        fontColor: '#111827',
        style: DesignStyle.MINIMALIST,
        font: FontChoice.SANS,
        aspectRatio: AspectRatio.SQUARE,
        backgroundImage: undefined,
        brandingText: '',
    });

    React.useEffect(() => {
        if (currentCarousel) {
            setTopic(currentCarousel.title);
            setPreferences(currentCarousel.preferences);
        }
    }, [currentCarousel]);
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreferences(p => ({ ...p, backgroundImage: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onGenerate(topic, preferences);
    };

    return (
        <div className="flex flex-col lg:flex-row">
            {/* Left Panel: Input & Editor */}
            <div className="w-full lg:w-1/3 xl:w-1/4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 lg:h-[calc(100vh-112px)] lg:overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('generatorStep1Title')}</h2>
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorTopicLabel')}</label>
                        <textarea id="topic" value={topic} onChange={e => setTopic(e.target.value)} rows={3} placeholder={t('generatorTopicPlaceholder')} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
                    </div>

                    {/* Design Preferences */}
                    <details className="space-y-4 border-t dark:border-gray-700 pt-6" open>
                        <summary className="text-xl font-bold text-gray-800 dark:text-gray-200 cursor-pointer">{t('generatorStep2Title')}</summary>
                        <div className="pt-4 space-y-4">
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorStyleLabel')}</label>
                                <select value={preferences.style} onChange={e => setPreferences(p => ({...p, style: e.target.value as DesignStyle}))} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                                    {Object.values(DesignStyle).map(s => <option key={s} value={s}>{s}</option>)}
                               </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorAspectRatioLabel')}</label>
                                <select value={preferences.aspectRatio} onChange={e => setPreferences(p => ({...p, aspectRatio: e.target.value as AspectRatio}))} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                                    {Object.values(AspectRatio).map(value => <option key={value} value={value}>{aspectRatioDisplayMap[value]}</option>)}
                                </select>
                              </div>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorFontLabel')}</label>
                              <select value={preferences.font} onChange={e => setPreferences(p => ({...p, font: e.target.value as FontChoice}))} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                                  {Object.values(FontChoice).map(f => <option key={f} value={f}>{f}</option>)}
                              </select>
                           </div>
                           <div>
                                <label htmlFor="brandingText" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorBrandingLabel')}</label>
                                <input
                                    type="text"
                                    id="brandingText"
                                    value={preferences.brandingText || ''}
                                    onChange={e => setPreferences(p => ({ ...p, brandingText: e.target.value }))}
                                    placeholder={t('generatorBrandingPlaceholder')}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                />
                           </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="bgColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorBgColorLabel')}</label>
                                    <div className="mt-1 flex items-center">
                                        <input id="bgColor" type="color" value={preferences.backgroundColor} onChange={e => setPreferences(p => ({...p, backgroundColor: e.target.value}))} className="h-10 w-12 p-1 block rounded-l-md border border-gray-300 dark:border-gray-600 cursor-pointer" />
                                        <input type="text" value={preferences.backgroundColor} onChange={e => setPreferences(p => ({...p, backgroundColor: e.target.value}))} className="block w-full h-10 px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-200 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="fontColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorFontColorLabel')}</label>
                                    <div className="mt-1 flex items-center">
                                        <input id="fontColor" type="color" value={preferences.fontColor} onChange={e => setPreferences(p => ({...p, fontColor: e.target.value}))} className="h-10 w-12 p-1 block rounded-l-md border border-gray-300 dark:border-gray-600 cursor-pointer" />
                                        <input type="text" value={preferences.fontColor} onChange={e => setPreferences(p => ({...p, fontColor: e.target.value}))} className="block w-full h-10 px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-200 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                                    </div>
                                </div>
                           </div>
                           <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorCustomBgLabel')}</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-primary-900/50 file:text-primary-700 dark:file:text-primary-300 hover:file:bg-primary-100 dark:hover:file:bg-primary-800/50"/>
                                {preferences.backgroundImage && (
                                    <button onClick={() => setPreferences(p => ({ ...p, backgroundImage: undefined }))} className="text-xs text-red-500 hover:text-red-700 mt-1">{t('generatorRemoveBgButton')}</button>
                                )}
                           </div>
                        </div>
                    </details>
                    
                    <div className="border-t dark:border-gray-700 pt-6 space-y-4">
                        <button type="submit" disabled={isGenerating} className="w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            {isGenerating ? t('generatorGeneratingButton') : t('generatorCreateButton')}
                        </button>
                        <button type="button" onClick={onOpenAssistant} disabled={!topic} className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
                            {t('generatorAssistantButton')}
                        </button>
                    </div>
                </form>

                {/* Slide Editor */}
                {selectedSlide && (
                    <div className="space-y-4 border-t dark:border-gray-700 pt-6 mt-6">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('generatorStep3Title')}</h2>
                        <div>
                            <label htmlFor="headline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorHeadlineLabel')}</label>
                            <textarea id="headline" value={selectedSlide.headline} onChange={e => onUpdateSlide(selectedSlide.id, { headline: e.target.value })} rows={2} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div>
                            <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorBodyLabel')}</label>
                            <textarea id="body" value={selectedSlide.body} onChange={e => onUpdateSlide(selectedSlide.id, { body: e.target.value })} rows={4} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                         <div>
                            <label htmlFor="visual_prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorVisualPromptLabel')}</label>
                            <textarea id="visual_prompt" value={selectedSlide.visual_prompt} onChange={e => onUpdateSlide(selectedSlide.id, { visual_prompt: e.target.value })} rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div className="flex justify-between items-center pt-2">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorMoveSlideLabel')}</label>
                             <div className="flex space-x-2">
                                <button onClick={() => onMoveSlide(selectedSlide.id, 'left')} className="px-3 py-1 border dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">&larr;</button>
                                <button onClick={() => onMoveSlide(selectedSlide.id, 'right')} className="px-3 py-1 border dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">&rarr;</button>
                             </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Panel: Preview */}
            <div className="w-full lg:w-2/3 xl:w-3/4 bg-gray-100 dark:bg-gray-900 p-6 flex flex-col items-center justify-center min-h-[500px] lg:min-h-0 lg:h-[calc(100vh-112px)]">
                {isGenerating && <Loader text={generationMessage} />}
                {error && <div className="text-center p-8 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg"><h3 className="font-bold">{t('errorTitle')}</h3><p>{error}</p></div>}

                {!isGenerating && currentCarousel && (
                    <div className="w-full h-full flex flex-col">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 flex-shrink-0">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 truncate pr-4 mb-2 sm:mb-0">{currentCarousel.title}</h2>
                            <button
                                onClick={onDownload}
                                disabled={isDownloading}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <DownloadIcon className="w-5 h-5 mr-2" />
                                {isDownloading ? t('downloadingButton') : t('downloadAllButton')}
                            </button>
                        </div>
                        <div className="flex-grow flex items-center justify-center overflow-hidden">
                             <div className="flex items-center space-x-4 overflow-x-auto py-4 px-4 w-full">
                                {currentCarousel.slides.map(slide => (
                                    <SlideCard
                                        key={slide.id}
                                        slide={slide}
                                        preferences={preferences}
                                        isSelected={selectedSlide?.id === slide.id}
                                        onClick={() => onSelectSlide(slide.id)}
                                        t={t}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {!isGenerating && !currentCarousel && (
                     <div className="text-center p-8">
                        <SparklesIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4"/>
                        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">{t('previewEmptyTitle')}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{t('previewEmptySubtitle')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const AiAssistantModal: React.FC<{
    topic: string;
    onClose: () => void;
    settings: AppSettings;
    t: TFunction;
}> = ({ topic, onClose, settings, t }) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const [type, setType] = React.useState<'hook' | 'cta' | null>(null);

    const fetchSuggestions = async (suggestionType: 'hook' | 'cta') => {
        setIsLoading(true);
        setType(suggestionType);
        setSuggestions([]);
        const results = await getAiAssistance(topic, suggestionType, settings);
        setSuggestions(results);
        setIsLoading(false);
    };
    
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('assistantTitle')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold">&times;</button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t('assistantSubtitle1')}<strong>{topic}</strong>{t('assistantSubtitle2')}</p>
                
                <div className="flex space-x-4 mb-4">
                    <button onClick={() => fetchSuggestions('hook')} disabled={isLoading} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-gray-400">{t('getHookButton')}</button>
                    <button onClick={() => fetchSuggestions('cta')} disabled={isLoading} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400">{t('getCTAButton')}</button>
                </div>

                <div className="h-64 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md border dark:border-gray-700">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoaderIcon className="w-12 h-12" /></div>}
                    {!isLoading && suggestions.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">{t('assistantEmpty')}</p>}
                    {suggestions.length > 0 && (
                        <ul className="space-y-3">
                            {suggestions.map((s, i) => (
                                <li key={i} className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-200 dark:border-gray-600">{s}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

const SettingsModal: React.FC<{
    currentSettings: AppSettings;
    onClose: () => void;
    onSave: (settings: AppSettings) => void;
    t: TFunction;
}> = ({ currentSettings, onClose, onSave, t }) => {
    const [localSettings, setLocalSettings] = React.useState<AppSettings>(currentSettings);

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave(localSettings);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('settingsTitle')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold">&times;</button>
                </div>
                <form onSubmit={handleSave} className="space-y-6">
                    {/* AI Model */}
                    <div>
                        <label htmlFor="aiModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('aiModelLabel')}</label>
                        <select
                            id="aiModel"
                            name="aiModel"
                            value={localSettings.aiModel}
                            onChange={handleChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        >
                            {Object.values(AIModel).map(model => (
                                <option key={model} value={model}>{model}</option>
                            ))}
                        </select>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('aiModelHint')}</p>
                    </div>

                    {/* API Key */}
                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('apiKeyLabel')}</label>
                        <input
                            type="password"
                            name="apiKey"
                            id="apiKey"
                            placeholder={t('apiKeyPlaceholder')}
                            value={localSettings.apiKey}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                         <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('apiKeyHint')}</p>
                    </div>

                    {/* System Prompt */}
                    <div>
                        <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('systemPromptLabel')}</label>
                         <textarea
                            id="systemPrompt"
                            name="systemPrompt"
                            value={localSettings.systemPrompt}
                            onChange={handleChange}
                            rows={4}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder={t('systemPromptPlaceholder')}
                        />
                    </div>
                    
                    {/* Buttons */}
                    <div className="flex justify-end space-x-4 pt-4">
                         <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-500 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500">
                            {t('cancelButton')}
                         </button>
                         <button type="submit" className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500">
                            {t('saveButton')}
                         </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Footer: React.FC = () => (
    <footer className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-0">
                &copy; {new Date().getFullYear()} Pasanaktidur. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
                <a href="https://instagram.com/pasanaktidur" target="_blank" rel="noopener noreferrer" aria-label="Instagram @pasanaktidur" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                    <InstagramIcon className="w-5 h-5" />
                </a>
                 <a href="https://threads.net/@pasanaktidur" target="_blank" rel="noopener noreferrer" aria-label="Threads @pasanaktidur" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                    <ThreadsIcon className="w-5 h-5" />
                </a>
            </div>
        </div>
    </footer>
);