import * as React from 'react';
import type { AppView, UserProfile, Carousel, SlideData, DesignPreferences, AppSettings, Language, TextStyle } from './types';
import { ContentNiche, DesignStyle, FontChoice, AspectRatio, AIModel } from './types';
import { GoogleIcon, SparklesIcon, LoaderIcon, DownloadIcon, SettingsIcon, InstagramIcon, ThreadsIcon, MoonIcon, SunIcon, AvatarIcon, LogoutIcon, HashtagIcon, HomeIcon, BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon, CaseIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, AlignJustifyIcon, LeftArrowIcon, RightArrowIcon } from './components/icons';
import { generateCarouselContent, getAiAssistance, generateHashtags } from './services/geminiService';
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
    loginButton: 'Generate Your Carousel Instantly',
    heroTagline: 'CarouMate AI',
    heroTitle1: 'Create Viral Carousels',
    heroTitle2: 'in Seconds',
    featuresTitle: 'Features',
    featuresSubtitle: 'Everything you need to go viral',
    featuresDescription: 'Stop wasting time on tedious design. Focus on your message, and let our AI handle the rest.',
    feature1Title: 'AI Content Generation',
    feature1Description: 'Generate engaging headlines, body text, and visual ideas from a single topic.',
    feature2Title: 'Deep Customization',
    feature2Description: 'Tailor every aspect of your carousel, from fonts and colors to layouts and branding.',
    feature3Title: 'Instant Download',
    feature3Description: 'Export your full carousel as high-resolution images, ready to post.',


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
    generator: 'Generator',
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
    generatorCustomBgLabel: 'Background Image',
    generatorRemoveBgButton: 'Remove image',
    generatorCreateButton: 'Create Carousel',
    generatorGeneratingButton: 'Generating...',
    generatorAssistantButton: 'AI Assistant',
    generatorHashtagButton: 'Generate Hashtags',
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
    errorUnknown: 'An unknown error occurred.',
    errorImageGen: 'An unknown image generation error occurred.',
    errorHashtagGen: 'Failed to generate hashtags.',
    errorDownload: 'Sorry, there was an issue creating the download file.',
    generatingContentMessage: 'Crafting your carousel content...',
    applyTo: 'Apply to:',
    applyToAll: 'All Slides',
    applyToSelected: 'Selected Slide',
    uploadVisual: 'Upload Visual',
    removeButton: 'Remove',

    // SlideCard
    generatingVisual: 'Generating visual...',

    // AiAssistantModal
    assistantTitle: 'AI Assistant',
    assistantSubtitle1: 'Stuck? Get some ideas for your carousel about "',
    assistantSubtitle2: '".',
    getHookButton: 'Get Hook Ideas',
    getCTAButton: 'Get CTA Ideas',
    assistantEmpty: 'Select a category above to see suggestions.',

    // HashtagModal
    hashtagModalTitle: 'AI Hashtag Generator',
    hashtagModalSubtitle1: 'Here are some suggested hashtags for "',
    hashtagModalSubtitle2: '".',
    hashtagModalCopyButton: 'Copy All',
    hashtagModalCopiedButton: 'Copied!',
    hashtagModalEmpty: 'Generate hashtags to see suggestions here.',

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
    loginButton: 'Hasilkan Carousel Anda Seketika',
    heroTagline: 'CarouMate AI',
    heroTitle1: 'Buat Carousel Viral',
    heroTitle2: 'dalam Detik',
    featuresTitle: 'Fitur',
    featuresSubtitle: 'Semua yang Anda butuhkan untuk menjadi viral',
    featuresDescription: 'Berhentilah membuang waktu untuk desain yang membosankan. Fokus pada pesan Anda, dan biarkan AI kami yang mengurus sisanya.',
    feature1Title: 'Pembuatan Konten AI',
    feature1Description: 'Hasilkan judul, isi teks, dan ide visual yang menarik dari satu topik.',
    feature2Title: 'Kustomisasi Mendalam',
    feature2Description: 'Sesuaikan setiap aspek carousel Anda, mulai dari font dan warna hingga tata letak dan branding.',
    feature3Title: 'Unduh Instan',
    feature3Description: 'Ekspor seluruh carousel Anda sebagai gambar beresolusi tinggi, siap untuk diposting.',

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
    generator: 'Generator',
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
    generatorCustomBgLabel: 'Gambar Latar',
    generatorRemoveBgButton: 'Hapus Gambar',
    generatorCreateButton: 'Buat Carousel',
    generatorGeneratingButton: 'Membuat...',
    generatorAssistantButton: 'Asisten AI',
    generatorHashtagButton: 'Buat Hashtag',
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
    errorUnknown: 'Terjadi kesalahan yang tidak diketahui.',
    errorImageGen: 'Terjadi kesalahan pembuatan gambar yang tidak diketahui.',
    errorHashtagGen: 'Gagal membuat hashtag.',
    errorDownload: 'Maaf, terjadi masalah saat membuat file unduhan.',
    generatingContentMessage: 'Menyusun konten carousel Anda...',
    applyTo: 'Terapkan ke:',
    applyToAll: 'Semua Slide',
    applyToSelected: 'Slide Terpilih',
    uploadVisual: 'Unggah Visual',
    removeButton: 'Hapus',

    // SlideCard
    generatingVisual: 'Membuat visual...',

    // AiAssistantModal
    assistantTitle: 'Asisten AI',
    assistantSubtitle1: 'Buntu? Dapatkan beberapa ide untuk carousel Anda tentang "',
    assistantSubtitle2: '".',
    getHookButton: 'Dapatkan Ide Hook',
    getCTAButton: 'Dapatkan Ide CTA',
    assistantEmpty: 'Pilih kategori di atas untuk melihat saran.',
    
    // HashtagModal
    hashtagModalTitle: 'Generator Hashtag AI',
    hashtagModalSubtitle1: 'Berikut adalah beberapa saran hashtag untuk "',
    hashtagModalSubtitle2: '".',
    hashtagModalCopyButton: 'Salin Semua',
    hashtagModalCopiedButton: 'Tersalin!',
    hashtagModalEmpty: 'Buat hashtag untuk melihat saran di sini.',

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

const parseGeminiErrorMessage = (error: any, fallbackMessage: string): string => {
    const message = error?.message || fallbackMessage;
    try {
        // The error message from the Gemini SDK might be a JSON string
        if (typeof message === 'string' && message.startsWith('{') && message.endsWith('}')) {
            const parsedError = JSON.parse(message);
            // Following the structure like {"error":{"code":400,"message":"..."}}
            return parsedError?.error?.message || message;
        }
        // If it's not a JSON string, return as is
        return message;
    } catch (e) {
        // In case of parsing error, return the original message
        return message;
    }
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
                    <SparklesIcon className="w-7 h-7 sm:w-8 sm:h-8 text-primary-600" />
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">CarouMate</h1>
                </div>
                {user && (
                    <div className="flex items-center space-x-1 sm:space-x-4">
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
                            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={onOpenSettings}
                            className="hidden md:inline-block p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 transition-colors"
                            aria-label={t('settingsAriaLabel')}
                        >
                            <SettingsIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onLogout}
                            className="text-sm font-medium text-primary-600 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/50 border border-transparent rounded-md hover:bg-primary-200 dark:hover:bg-primary-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 transition-colors sm:px-4 sm:py-2 p-2"
                            aria-label={t('logout')}
                        >
                            <span className="hidden sm:inline">{t('logout')}</span>
                            <LogoutIcon className="sm:hidden w-5 h-5" />
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
    
    const finalPrefs = React.useMemo(() => {
        const slideOverrides = {
            backgroundColor: slide.backgroundColor,
            fontColor: slide.fontColor,
            headlineStyle: slide.headlineStyle,
            bodyStyle: slide.bodyStyle
        };

        return {
            ...preferences,
            backgroundColor: slideOverrides.backgroundColor ?? preferences.backgroundColor,
            fontColor: slideOverrides.fontColor ?? preferences.fontColor,
            headlineStyle: { ...preferences.headlineStyle, ...(slideOverrides.headlineStyle || {}) },
            bodyStyle: { ...preferences.bodyStyle, ...(slideOverrides.bodyStyle || {}) },
        };
    }, [slide, preferences]);

    const font = fontClassMap[finalPrefs.font] || 'font-sans';
    const aspectRatioClass = aspectRatioClassMap[finalPrefs.aspectRatio] || 'aspect-square';

    const getDynamicStyles = (style: TextStyle, type: 'headline' | 'body') => {
        const cssStyle: React.CSSProperties = {
            fontWeight: style.fontWeight,
            fontStyle: style.fontStyle,
            textDecorationLine: style.textDecorationLine,
            textAlign: style.textAlign,
            textTransform: style.textTransform,
        };
        if (style.fontSize) {
            const baseRem = style.fontSize;

            // Define viewport-based scaling. This creates fluid typography.
            // A common pattern is a small base REM value plus a VW unit.
            const preferredVw = type === 'headline' ? '2.5vw' : '1.2vw';
            const preferredRem = type === 'headline' ? '0.75rem' : '0.6rem';
            const preferredValue = `calc(${preferredRem} + ${preferredVw})`;

            // Set a minimum font size to prevent text from becoming unreadably small
            const minRem = baseRem * 0.65;
            
            // Use clamp() to smoothly scale the font size between a min, a preferred, and a max value.
            // The font size set by the user acts as the maximum size.
            cssStyle.fontSize = `clamp(${minRem.toFixed(2)}rem, ${preferredValue}, ${baseRem}rem)`;
        }
        return cssStyle;
    };
    
    const headlineStyles = getDynamicStyles(finalPrefs.headlineStyle, 'headline');
    const bodyStyles = getDynamicStyles(finalPrefs.bodyStyle, 'body');


    const styleClasses = React.useMemo(() => {
        switch (finalPrefs.style) {
            case DesignStyle.BOLD: return 'border-4 border-gray-900 dark:border-gray-200';
            case DesignStyle.ELEGANT: return 'border border-gray-300 dark:border-gray-600 shadow-md dark:shadow-xl dark:shadow-black/20';
            case DesignStyle.COLORFUL: return `border-4 border-transparent bg-gradient-to-br from-pink-300 to-indigo-400`;
            case DesignStyle.VINTAGE: return 'border-2 border-yellow-800 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
            default: return 'border border-gray-200 dark:border-gray-700';
        }
    }, [finalPrefs.style]);

    const finalBackgroundImage = finalPrefs.backgroundImage;
    
    return (
        <div
            data-carousel-slide={slide.id}
            onClick={onClick}
            className={`h-[85%] flex-shrink-0 relative flex flex-col justify-center items-center p-6 pb-10 text-center rounded-lg cursor-pointer transition-all duration-300 transform ${styleClasses} ${font} ${aspectRatioClass} ${isSelected ? 'ring-4 ring-primary-500 ring-offset-2 scale-105 shadow-2xl shadow-primary-600/50' : 'hover:scale-102'}`}
            style={{
                backgroundColor: finalPrefs.style !== DesignStyle.COLORFUL && !finalBackgroundImage ? finalPrefs.backgroundColor : undefined,
                color: finalPrefs.fontColor
            }}
        >
            {/* Background Image Layer */}
            {finalBackgroundImage && (
                <>
                    <img src={finalBackgroundImage} alt="Slide background" className="absolute inset-0 w-full h-full object-cover rounded-md -z-10" />
                    <div className="absolute inset-0 bg-black/30 rounded-md -z-10"></div> {/* Dark overlay for readability */}
                </>
            )}

            {/* Content Layer */}
            <div className="z-10 flex flex-col items-center">
                <h2 className="font-bold leading-tight mb-4" style={{...headlineStyles, lineHeight: '1.2' }}>{slide.headline}</h2>
                <p className="" style={{ ...bodyStyles, lineHeight: '1.5' }}>{slide.body}</p>
            </div>
            
            {/* Branding Text */}
            {finalPrefs.brandingText && (
                <div className="absolute bottom-4 left-0 right-0 text-center text-xs sm:text-sm z-20 px-4 pointer-events-none">
                    <p style={{ opacity: 0.75 }}>{finalPrefs.brandingText}</p>
                </div>
            )}
        </div>
    );
};


// --- MOBILE FOOTER COMPONENT ---
const MobileFooter: React.FC<{
    currentView: AppView;
    onNavigate: (view: AppView) => void;
    onOpenSettings: () => void;
    t: TFunction;
}> = ({ currentView, onNavigate, onOpenSettings, t }) => {
    
    const navItems = [
        { view: 'DASHBOARD' as AppView, label: t('dashboardTitle'), icon: <HomeIcon className="w-6 h-6 mx-auto mb-1" /> },
        { view: 'GENERATOR' as AppView, label: t('generator'), icon: <SparklesIcon className="w-6 h-6 mx-auto mb-1" /> },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-t-lg z-50">
            <div className="flex justify-around items-center h-16">
                {navItems.map(item => (
                    <button
                        key={item.view}
                        onClick={() => onNavigate(item.view)}
                        className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors duration-200 ${
                            currentView === item.view
                                ? 'text-primary-600 dark:text-primary-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                        }`}
                        aria-current={currentView === item.view ? 'page' : undefined}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </button>
                ))}
                 <button
                    onClick={onOpenSettings}
                    className="flex flex-col items-center justify-center w-full h-full text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                    aria-label={t('settingsAriaLabel')}
                >
                    <SettingsIcon className="w-6 h-6 mx-auto mb-1" />
                    <span>{t('settingsTitle')}</span>
                </button>
            </div>
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

    const [language, setLanguage] = React.useState<Language>('id');
    
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
    const [isHashtagModalOpen, setIsHashtagModalOpen] = React.useState(false);
    const [isGeneratingHashtags, setIsGeneratingHashtags] = React.useState(false);
    const [generatedHashtags, setGeneratedHashtags] = React.useState<string[]>([]);
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
            name: '',
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
            // Save the latest changes to history before switching views
            setCarouselHistory(prev => {
                const index = prev.findIndex(c => c.id === currentCarousel.id);
                // If it's an existing carousel, update it
                if (index !== -1) {
                    const newHistory = [...prev];
                    newHistory[index] = currentCarousel;
                    return newHistory;
                }
                // If it's a new one not yet in history, check if it should be added.
                // The main generation logic already adds it, so this might not be needed.
                // However, to be safe, let's just update if it exists.
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

            const initialSlides: SlideData[] = slidesContent.map(s => ({ ...s, id: crypto.randomUUID() }));
            
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
            setCarouselHistory(prev => [newCarousel, ...prev]);

        } catch (err: any)
        {
            setError(err.message || t('errorUnknown'));
        } finally {
            setIsGenerating(false);
            setGenerationMessage('');
        }
    }, [user, settings, t]);

    const handleGenerateHashtags = async () => {
        if (!currentTopic) return;
        setIsHashtagModalOpen(true);
        setIsGeneratingHashtags(true);
        setGeneratedHashtags([]);
        setError(null);
        try {
            const hashtags = await generateHashtags(currentTopic, settings);
            setGeneratedHashtags(hashtags);
        } catch (err: any) {
            setError(err.message || t('errorHashtagGen'));
        } finally {
            setIsGeneratingHashtags(false);
        }
    };

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
                    scale: 8,
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
            setError(t('errorDownload'));
        } finally {
            setIsDownloading(false);
        }
    };

    const handleUpdateSlide = (slideId: string, updates: Partial<SlideData>) => {
        setCurrentCarousel(prev => {
            if (!prev) return null;
            const updatedSlides = prev.slides.map(s => s.id === slideId ? { ...s, ...updates } : s);
            return { ...prev, slides: updatedSlides };
        });
    };

    const handleUpdateCarouselPreferences = (updates: Partial<DesignPreferences>, topicValue: string) => {
        setCurrentCarousel(prev => {
            // If there's already a carousel (real or temporary), update it
            if (prev) {
                return { ...prev, preferences: { ...prev.preferences, ...updates } };
            }
            
            // If no carousel exists, create a new temporary one to store preferences
            const newTempCarousel: Carousel = {
                id: 'temp-' + crypto.randomUUID(), // unique temp id
                title: topicValue, // Will be set by topic input
                createdAt: new Date().toISOString(),
                slides: [],
                category: user?.niche || ContentNiche.MARKETING, // Use user's niche if available
                preferences: {
                    // Start with defaults
                    backgroundColor: '#FFFFFF',
                    fontColor: '#111827',
                    style: DesignStyle.MINIMALIST,
                    font: FontChoice.MONO,
                    aspectRatio: AspectRatio.SQUARE,
                    backgroundImage: undefined,
                    brandingText: '',
                    headlineStyle: { fontSize: 2.2, fontWeight: 'bold', textAlign: 'center' },
                    bodyStyle: { fontSize: 1.1, textAlign: 'center' },
                    // Apply the specific update
                    ...updates,
                },
            };
            return newTempCarousel;
        });
    };
    
    const handleClearSlideOverrides = (property: keyof SlideData) => {
        setCurrentCarousel(prev => {
            if (!prev) return null;
            const updatedSlides = prev.slides.map(slide => {
                const newSlide = { ...slide };
                delete newSlide[property];
                return newSlide;
            });
            return { ...prev, slides: updatedSlides };
        });
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
                    setCurrentCarousel={setCurrentCarousel}
                    selectedSlide={selectedSlide}
                    onSelectSlide={setSelectedSlideId}
                    onUpdateSlide={handleUpdateSlide}
                    onUpdateCarouselPreferences={handleUpdateCarouselPreferences}
                    onClearSlideOverrides={handleClearSlideOverrides}
                    onMoveSlide={handleMoveSlide}
                    onOpenAssistant={() => setIsAssistantOpen(true)}
                    onOpenHashtag={handleGenerateHashtags}
                    onDownload={handleDownloadCarousel}
                    isDownloading={isDownloading}
                    isHashtagModalOpen={isHashtagModalOpen}
                    t={t}
                />
            );
            default: return <LoginScreen onLogin={handleLogin} t={t} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
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
            <main className="flex-grow pb-16 md:pb-0">
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
            {isHashtagModalOpen && (
                <HashtagModal
                    topic={currentTopic}
                    onClose={() => setIsHashtagModalOpen(false)}
                    isLoading={isGeneratingHashtags}
                    hashtags={generatedHashtags}
                    error={error}
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
            {user && user.profileComplete && (
                <MobileFooter
                    currentView={view}
                    onNavigate={(targetView) => {
                        if (targetView === 'DASHBOARD') goToDashboard();
                        else setView(targetView);
                    }}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    t={t}
                />
            )}
        </div>
    );
}


// --- VIEW & MODAL COMPONENTS ---

const SampleCarouselPreview: React.FC = () => {
    const slideStyle = "h-[200px] sm:h-[250px] w-[160px] sm:w-[200px] flex-shrink-0 relative flex flex-col justify-center items-center p-4 text-center rounded-lg shadow-lg";

    return (
        <div className="relative mx-auto w-full max-w-md">
            {/* Phone Mockup */}
            <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[450px] w-[220px] sm:h-[550px] sm:w-[270px] shadow-2xl shadow-primary-600/30">
                <div className="w-[72px] h-[4px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                <div className="h-[48px] w-[3px] bg-gray-800 absolute -right-[17px] top-[140px] rounded-r-lg"></div>
                <div className="rounded-[2rem] overflow-hidden w-full h-full bg-primary-950">
                    {/* Carousel Preview inside phone */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center space-x-4">
                        {/* Slide 1 */}
                        <div className={`${slideStyle} bg-gold-500 text-white font-poppins z-10 -translate-x-8 -rotate-12`}>
                            <h2 className="font-bold text-lg leading-tight">Unlock Your Potential</h2>
                            <p className="text-xs mt-2">5 Mindset Shifts for Success</p>
                        </div>
                        {/* Slide 2 */}
                        <div className={`${slideStyle} bg-white text-gray-900 font-sans z-20`}>
                            <SparklesIcon className="w-10 h-10 text-primary-500 mb-3" />
                            <h2 className="font-bold text-xl leading-tight">CarouMate AI</h2>
                            <p className="text-xs mt-2">Stunning carousels, instantly.</p>
                        </div>
                         {/* Slide 3 */}
                        <div className={`${slideStyle} bg-accent-500 text-white font-montserrat z-10 translate-x-8 rotate-12`}>
                             <h2 className="font-bold text-lg leading-tight">Swipe to Learn →</h2>
                            <p className="text-xs mt-2">Your guide to going viral.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LoginScreen: React.FC<{ onLogin: () => void; t: TFunction; }> = ({ onLogin, t }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-950">
            <main>
                {/* Hero Section */}
                <div className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 bg-gradient-to-b from-white dark:from-gray-900 via-gray-50 dark:via-gray-950 to-white dark:to-gray-900">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center">
                            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                                <h1>
                                    <span className="block text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">{t('heroTagline')}</span>
                                    <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                                        <span className="text-gray-900 dark:text-white">{t('heroTitle1')}</span>
                                        <span className="text-primary-600 dark:text-primary-400"> {t('heroTitle2')}</span>
                                    </span>
                                </h1>
                                <p className="mt-3 text-base text-gray-600 dark:text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                                    {t('loginSubtitle')}
                                </p>
                                <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:mx-0 lg:text-left">
                                    <button
                                        onClick={onLogin}
                                        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:ring-offset-gray-950 focus:ring-primary-500 shadow-lg shadow-primary-600/40 hover:shadow-xl hover:shadow-primary-500/40 transform hover:-translate-y-1 transition-all duration-300"
                                    >
                                       {t('loginButton')}
                                    </button>
                                </div>
                            </div>
                            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                                <SampleCarouselPreview />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="py-16 bg-white dark:bg-gray-900 overflow-hidden">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:text-center">
                            <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase">{t('featuresTitle')}</h2>
                            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                                {t('featuresSubtitle')}
                            </p>
                            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
                                {t('featuresDescription')}
                            </p>
                        </div>

                        <div className="mt-12">
                            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                                <div className="relative transition-transform transform hover:scale-105 duration-300 p-4">
                                    <dt>
                                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                                            <SparklesIcon className="h-6 w-6" />
                                        </div>
                                        <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">{t('feature1Title')}</p>
                                    </dt>
                                    <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                                        {t('feature1Description')}
                                    </dd>
                                </div>
                                <div className="relative transition-transform transform hover:scale-105 duration-300 p-4">
                                    <dt>
                                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                                            <SettingsIcon className="h-6 w-6" />
                                        </div>
                                        <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">{t('feature2Title')}</p>
                                    </dt>
                                    <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                                        {t('feature2Description')}
                                    </dd>
                                </div>
                                <div className="relative transition-transform transform hover:scale-105 duration-300 p-4">
                                    <dt>
                                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                                            <DownloadIcon className="h-6 w-6" />
                                        </div>
                                        <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">{t('feature3Title')}</p>
                                    </dt>
                                    <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                                        {t('feature3Description')}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </main>
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
            <button onClick={onNewCarousel} className="mt-4 sm:mt-0 w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg shadow-primary-600/40 hover:shadow-xl hover:shadow-primary-500/40 transition-shadow">
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

const ApplyScopeControl: React.FC<{
    scope: 'all' | 'selected';
    setScope: (scope: 'all' | 'selected') => void;
    isDisabled: boolean;
    t: TFunction;
    fieldId: string;
}> = ({ scope, setScope, isDisabled, t, fieldId }) => (
    <div className="flex items-center space-x-4 mt-1">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('applyTo')}</span>
        <div className="flex items-center">
            <input
                id={`${fieldId}-scope-all`}
                type="radio"
                name={`${fieldId}-scope`}
                value="all"
                checked={scope === 'all'}
                onChange={() => setScope('all')}
                className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            />
            <label htmlFor={`${fieldId}-scope-all`} className="ml-2 block text-xs text-gray-700 dark:text-gray-300">{t('applyToAll')}</label>
        </div>
        <div className="flex items-center">
            <input
                id={`${fieldId}-scope-selected`}
                type="radio"
                name={`${fieldId}-scope`}
                value="selected"
                checked={scope === 'selected'}
                onChange={() => setScope('selected')}
                disabled={isDisabled}
                className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500 disabled:opacity-50"
            />
            <label htmlFor={`${fieldId}-scope-selected`} className="ml-2 block text-xs text-gray-700 dark:text-gray-300 disabled:opacity-50">{t('applyToSelected')}</label>
        </div>
    </div>
);

const TextFormatToolbar: React.FC<{ style: TextStyle, onStyleChange: (newStyle: TextStyle) => void }> = ({ style, onStyleChange }) => {
    const toggleStyle = (key: keyof TextStyle, value: any, defaultValue: any) => {
        onStyleChange({ ...style, [key]: style[key] === value ? defaultValue : value });
    };

    const toggleDecoration = (value: 'underline' | 'line-through') => {
        const decorations = new Set((style.textDecorationLine || '').split(' ').filter(Boolean));
        if (decorations.has(value)) {
            decorations.delete(value);
        } else {
            decorations.add(value);
        }
        onStyleChange({ ...style, textDecorationLine: Array.from(decorations).join(' ') });
    };

    const isDecorationActive = (value: string) => (style.textDecorationLine || '').includes(value);

    return (
        <div className="flex flex-wrap items-center gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-md border dark:border-gray-600">
            <button type="button" onClick={() => toggleStyle('fontWeight', 'bold', 'normal')} className={`p-1.5 rounded ${style.fontWeight === 'bold' ? 'bg-primary-200 dark:bg-primary-800' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}><BoldIcon className="w-4 h-4" /></button>
            <button type="button" onClick={() => toggleStyle('fontStyle', 'italic', 'normal')} className={`p-1.5 rounded ${style.fontStyle === 'italic' ? 'bg-primary-200 dark:bg-primary-800' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}><ItalicIcon className="w-4 h-4" /></button>
            <button type="button" onClick={() => toggleDecoration('underline')} className={`p-1.5 rounded ${isDecorationActive('underline') ? 'bg-primary-200 dark:bg-primary-800' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}><UnderlineIcon className="w-4 h-4" /></button>
            <button type="button" onClick={() => toggleDecoration('line-through')} className={`p-1.5 rounded ${isDecorationActive('line-through') ? 'bg-primary-200 dark:bg-primary-800' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}><StrikethroughIcon className="w-4 h-4" /></button>
            <button type="button" onClick={() => toggleStyle('textTransform', 'uppercase', 'none')} className={`p-1.5 rounded ${style.textTransform === 'uppercase' ? 'bg-primary-200 dark:bg-primary-800' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}><CaseIcon className="w-4 h-4" /></button>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-500 mx-1"></div>
            <button type="button" onClick={() => onStyleChange({ ...style, textAlign: 'left' })} className={`p-1.5 rounded ${style.textAlign === 'left' ? 'bg-primary-200 dark:bg-primary-800' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}><AlignLeftIcon className="w-4 h-4" /></button>
            <button type="button" onClick={() => onStyleChange({ ...style, textAlign: 'center' })} className={`p-1.5 rounded ${style.textAlign === 'center' ? 'bg-primary-200 dark:bg-primary-800' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}><AlignCenterIcon className="w-4 h-4" /></button>
            <button type="button" onClick={() => onStyleChange({ ...style, textAlign: 'right' })} className={`p-1.5 rounded ${style.textAlign === 'right' ? 'bg-primary-200 dark:bg-primary-800' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}><AlignRightIcon className="w-4 h-4" /></button>
            <button type="button" onClick={() => onStyleChange({ ...style, textAlign: 'justify' })} className={`p-1.5 rounded ${style.textAlign === 'justify' ? 'bg-primary-200 dark:bg-primary-800' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}><AlignJustifyIcon className="w-4 h-4" /></button>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-500 mx-1"></div>
            <input
                type="number"
                value={style.fontSize ? style.fontSize * 10 : ''}
                onChange={e => onStyleChange({ ...style, fontSize: parseFloat(e.target.value) / 10 })}
                className="w-12 p-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500"
                step="1"
                min="5"
                max="100"
                placeholder="Size"
                aria-label="Font size"
            />
        </div>
    );
};

const Generator: React.FC<{
    user: UserProfile;
    isGenerating: boolean;
    generationMessage: string;
    error: string | null;
    onGenerate: (topic: string, preferences: DesignPreferences) => void;
    currentCarousel: Carousel | null;
    setCurrentCarousel: (carousel: Carousel | null) => void;
    selectedSlide: SlideData | undefined;
    onSelectSlide: (id: string) => void;
    onUpdateSlide: (id: string, updates: Partial<SlideData>) => void;
    onUpdateCarouselPreferences: (updates: Partial<DesignPreferences>, currentTopic: string) => void;
    onClearSlideOverrides: (property: keyof SlideData) => void;
    onMoveSlide: (id: string, direction: 'left' | 'right') => void;
    onOpenAssistant: () => void;
    onOpenHashtag: () => void;
    onDownload: () => void;
    isDownloading: boolean;
    isHashtagModalOpen: boolean;
    t: TFunction;
}> = (props) => {
    const { onGenerate, currentCarousel, selectedSlide, onUpdateSlide, onUpdateCarouselPreferences, onClearSlideOverrides, onSelectSlide, onMoveSlide, ...rest } = props;
    const { isGenerating, generationMessage, error, onOpenAssistant, onOpenHashtag, onDownload, isDownloading, isHashtagModalOpen, t } = rest;

    const [topic, setTopic] = React.useState('');
    
    // Scopes for applying styles
    const [colorScope, setColorScope] = React.useState<'all' | 'selected'>('all');
    
    const preferences = currentCarousel?.preferences ?? {
        backgroundColor: '#FFFFFF',
        fontColor: '#111827',
        style: DesignStyle.MINIMALIST,
        font: FontChoice.MONO,
        aspectRatio: AspectRatio.SQUARE,
        backgroundImage: undefined,
        brandingText: '',
        headlineStyle: { fontSize: 2.2, fontWeight: 'bold', textAlign: 'center' },
        bodyStyle: { fontSize: 1.1, textAlign: 'center' },
    };

    React.useEffect(() => {
        if (currentCarousel) {
            setTopic(currentCarousel.title);
        } else {
             setTopic('');
        }
    }, [currentCarousel]);
    
    const handleStyleChange = <K extends keyof DesignPreferences, V extends DesignPreferences[K]>(
        scope: 'all' | 'selected',
        key: K,
        value: V,
        slideKey: keyof SlideData
    ) => {
        if (scope === 'all') {
            onUpdateCarouselPreferences({ [key]: value }, topic);
            onClearSlideOverrides(slideKey);
        } else {
            if (selectedSlide) {
                onUpdateSlide(selectedSlide.id, { [slideKey]: value });
            }
        }
    };
    
    const handleGlobalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageUrl = reader.result as string;
          onUpdateCarouselPreferences({ backgroundImage: imageUrl }, topic);
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
                                <select value={preferences.style} onChange={e => onUpdateCarouselPreferences({style: e.target.value as DesignStyle}, topic)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                                    {Object.values(DesignStyle).map(s => <option key={s} value={s}>{s}</option>)}
                               </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorAspectRatioLabel')}</label>
                                <select value={preferences.aspectRatio} onChange={e => onUpdateCarouselPreferences({aspectRatio: e.target.value as AspectRatio}, topic)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                                    {Object.values(AspectRatio).map(value => <option key={value} value={value}>{aspectRatioDisplayMap[value]}</option>)}
                                </select>
                              </div>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorFontLabel')}</label>
                              <select value={preferences.font} onChange={e => onUpdateCarouselPreferences({font: e.target.value as FontChoice}, topic)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                                  {Object.values(FontChoice).map(f => <option key={f} value={f}>{f}</option>)}
                              </select>
                           </div>
                           <div>
                                <label htmlFor="brandingText" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorBrandingLabel')}</label>
                                <input type="text" id="brandingText" value={preferences.brandingText || ''} onChange={e => onUpdateCarouselPreferences({brandingText: e.target.value}, topic)} placeholder={t('generatorBrandingPlaceholder')} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                           </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="bgColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorBgColorLabel')}</label>
                                        <div className="mt-1 flex items-center">
                                            <input id="bgColor" type="color" value={selectedSlide?.backgroundColor ?? preferences.backgroundColor} onChange={e => handleStyleChange(colorScope, 'backgroundColor', e.target.value, 'backgroundColor')} className="h-10 w-12 p-1 block rounded-l-md border border-gray-300 dark:border-gray-600 cursor-pointer" />
                                            <input type="text" value={selectedSlide?.backgroundColor ?? preferences.backgroundColor} onChange={e => handleStyleChange(colorScope, 'backgroundColor', e.target.value, 'backgroundColor')} className="block w-full h-10 px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-200 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="fontColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorFontColorLabel')}</label>
                                        <div className="mt-1 flex items-center">
                                            <input id="fontColor" type="color" value={selectedSlide?.fontColor ?? preferences.fontColor} onChange={e => handleStyleChange(colorScope, 'fontColor', e.target.value, 'fontColor')} className="h-10 w-12 p-1 block rounded-l-md border border-gray-300 dark:border-gray-600 cursor-pointer" />
                                            <input type="text" value={selectedSlide?.fontColor ?? preferences.fontColor} onChange={e => handleStyleChange(colorScope, 'fontColor', e.target.value, 'fontColor')} className="block w-full h-10 px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-200 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                                        </div>
                                    </div>
                               </div>
                               <ApplyScopeControl scope={colorScope} setScope={setColorScope} isDisabled={!selectedSlide} t={t} fieldId="color" />
                           </div>
                           <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorCustomBgLabel')}</label>
                                <input type="file" accept="image/*" onChange={handleGlobalImageUpload} className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-primary-900/50 file:text-primary-700 dark:file:text-primary-300 hover:file:bg-primary-100 dark:hover:file:bg-primary-800/50"/>
                                {preferences.backgroundImage && (
                                    <button onClick={() => onUpdateCarouselPreferences({ backgroundImage: undefined }, topic)} type="button" className="text-xs text-red-500 hover:text-red-700 mt-1">{t('generatorRemoveBgButton')}</button>
                                )}
                           </div>
                        </div>
                    </details>
                    
                    <div className="border-t dark:border-gray-700 pt-6 space-y-4">
                        <button type="submit" disabled={isGenerating} className="w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg shadow-primary-600/40 hover:shadow-xl hover:shadow-primary-500/40 transition-shadow">
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            {isGenerating ? t('generatorGeneratingButton') : t('generatorCreateButton')}
                        </button>
                        <div className="flex space-x-4">
                            <button type="button" onClick={onOpenAssistant} disabled={!topic} className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
                                {t('generatorAssistantButton')}
                            </button>
                            <button type="button" onClick={onOpenHashtag} disabled={!topic} className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
                                <HashtagIcon className="w-4 h-4 mr-2" />
                                {t('generatorHashtagButton')}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Slide Editor */}
                {selectedSlide && (
                    <div className="space-y-4 border-t dark:border-gray-700 pt-6 mt-6">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('generatorStep3Title')}</h2>
                        <div className="space-y-2">
                            <label htmlFor="headline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorHeadlineLabel')}</label>
                            <TextFormatToolbar 
                                style={selectedSlide.headlineStyle ?? preferences.headlineStyle}
                                onStyleChange={(newStyle) => onUpdateSlide(selectedSlide.id, { headlineStyle: newStyle })}
                            />
                            <textarea id="headline" value={selectedSlide.headline} onChange={e => onUpdateSlide(selectedSlide.id, { headline: e.target.value })} rows={2} className="block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorBodyLabel')}</label>
                             <TextFormatToolbar 
                                style={selectedSlide.bodyStyle ?? preferences.bodyStyle}
                                onStyleChange={(newStyle) => onUpdateSlide(selectedSlide.id, { bodyStyle: newStyle })}
                            />
                            <textarea id="body" value={selectedSlide.body} onChange={e => onUpdateSlide(selectedSlide.id, { body: e.target.value })} rows={4} className="block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                         <div>
                            <label htmlFor="visual_prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorVisualPromptLabel')}</label>
                            <textarea id="visual_prompt" value={selectedSlide.visual_prompt} onChange={e => onUpdateSlide(selectedSlide.id, { visual_prompt: e.target.value })} rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div className="flex justify-between items-center pt-2">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorMoveSlideLabel')}</label>
                             <div className="flex space-x-2">
                                <button type="button" onClick={() => onMoveSlide(selectedSlide.id, 'left')} className="p-2 border dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                                    <span className="sr-only">Move slide left</span>
                                    <LeftArrowIcon className="w-5 h-5" />
                                </button>
                                <button type="button" onClick={() => onMoveSlide(selectedSlide.id, 'right')} className="p-2 border dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                                    <span className="sr-only">Move slide right</span>
                                    <RightArrowIcon className="w-5 h-5" />
                                </button>
                             </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Panel: Preview */}
            <div className="w-full lg:w-2/3 xl:w-3/4 bg-gray-100 dark:bg-gray-900 p-6 flex flex-col items-center justify-center min-h-[500px] lg:min-h-0 lg:h-[calc(100vh-112px)]">
                {isGenerating && <Loader text={generationMessage} />}
                {error && !isHashtagModalOpen && <div className="text-center p-8 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg"><h3 className="font-bold">{t('errorTitle')}</h3><p>{error}</p></div>}

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
                             <div className="flex items-center space-x-4 overflow-x-auto py-4 px-4 w-full h-full">
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
                    <button onClick={() => fetchSuggestions('cta')} disabled={isLoading} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-accent-500 rounded-md hover:bg-accent-600 disabled:bg-gray-400">{t('getCTAButton')}</button>
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

const HashtagModal: React.FC<{
    topic: string;
    onClose: () => void;
    isLoading: boolean;
    hashtags: string[];
    error: string | null;
    t: TFunction;
}> = ({ topic, onClose, isLoading, hashtags, error, t }) => {
    const [copyText, setCopyText] = React.useState(t('hashtagModalCopyButton'));

    const handleCopy = () => {
        const hashtagString = hashtags.map(h => `#${h}`).join(' ');
        navigator.clipboard.writeText(hashtagString);
        setCopyText(t('hashtagModalCopiedButton'));
        setTimeout(() => setCopyText(t('hashtagModalCopyButton')), 2000);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('hashtagModalTitle')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold">&times;</button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t('hashtagModalSubtitle1')}<strong>{topic}</strong>{t('hashtagModalSubtitle2')}</p>
                
                <div className="h-64 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md border dark:border-gray-700 mb-4">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoaderIcon className="w-12 h-12" /></div>}
                    {!isLoading && error && <p className="text-center text-red-500 h-full flex items-center justify-center">{error}</p>}
                    {!isLoading && !error && hashtags.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">{t('hashtagModalEmpty')}</p>}
                    {!isLoading && !error && hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {hashtags.map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-gold-100 text-gold-800 text-sm font-medium rounded-full dark:bg-gold-900 dark:text-gold-300">#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
                {!isLoading && hashtags.length > 0 && (
                     <button onClick={handleCopy} className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-gray-400 transition-colors">
                        {copyText}
                     </button>
                )}
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
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                    <InstagramIcon className="w-5 h-5" />
                </a>
                 <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Threads" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                    <ThreadsIcon className="w-5 h-5" />
                </a>
            </div>
        </div>
    </footer>
);