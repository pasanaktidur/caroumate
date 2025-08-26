












import * as React from 'react';
import type { AppView, UserProfile, Carousel, SlideData, DesignPreferences, AppSettings, Language, TextStyle, BrandKit } from './types';
import { DesignStyle, FontChoice, AspectRatio, AIModel } from './types';
import { GoogleIcon, SparklesIcon, LoaderIcon, DownloadIcon, SettingsIcon, InstagramIcon, ThreadsIcon, MoonIcon, SunIcon, AvatarIcon, LogoutIcon, HashtagIcon, HomeIcon, BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon, CaseIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, AlignJustifyIcon, LeftArrowIcon, RightArrowIcon, GiftIcon, ImageIcon, TrashIcon, PaletteIcon, UploadIcon, RefreshIcon } from './components/icons';
import { generateCarouselContent, getAiAssistance, generateHashtags, generateImage, regenerateSlideContent, generateThreadFromCarousel } from './services/geminiService';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';

// --- TRANSLATIONS & I1N ---
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
    heroTitle2: 'in Minutes',
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
    profileNichePlaceholder: 'e.g., "Software Development"',
    profileButton: 'Get Started',

    // Dashboard
    dashboardTitle: 'Dashboard',
    dashboardSubtitle: 'Your creative workspace.',
    newCarouselButton: 'Create New Carousel',
    tutorialButton: 'User Guide',
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
    generatorCreateButton: 'Create Carousel!',
    generatorGeneratingButton: 'Generating...',
    generatorAssistantButton: 'AI Assistant',
    generatorHashtagButton: 'Generate Hashtags',
    generatorThreadButton: 'Convert to Thread',
    generatorStep3Title: '3. Edit Your Content',
    generatorHeadlineLabel: 'Headline',
    generatorBodyLabel: 'Body Text',
    generatorVisualPromptLabel: 'Visual Prompt',
    generatorMoveSlideLabel: 'Move Slide',
    regenerateHeadlineAria: 'Regenerate headline',
    regenerateBodyAria: 'Regenerate body text',
    downloadAllButton: 'Download All',
    downloadingButton: 'Downloading...',
    previewEmptyTitle: "Let's create something amazing!",
    previewEmptySubtitleDesktop: 'Fill in the details on the left and click "Create Carousel!" to begin.',
    previewEmptySubtitleMobile: 'Fill in the details above and click "Create Carousel!" to begin.',
    errorTitle: 'An Error Occurred',
    errorUnknown: 'An unknown error occurred.',
    errorImageGen: 'Failed to generate image. The AI may have refused the prompt for safety reasons.',
    errorHashtagGen: 'Failed to generate hashtags.',
    errorThreadGen: 'Failed to generate thread.',
    errorDownload: 'Sorry, there was an issue creating the download file.',
    generatingContentMessage: 'Crafting your carousel content...',
    generatingImageMessage: 'Generating your image...',
    applyTo: 'Apply to:',
    applyToAll: 'All Slides',
    applyToSelected: 'Selected Slide',
    uploadVisual: 'Upload Visual',
    removeButton: 'Remove',
    generateImageButton: 'Generate Image',
    applyBrandKit: 'Apply Brand Kit',

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

    // ThreadModal
    threadModalTitle: 'ThreadMate: AI Thread Converter',
    threadModalSubtitle: 'Your carousel content, repurposed for Threads/X.',
    threadModalCopyButton: 'Copy Thread',
    threadModalCopiedButton: 'Copied!',
    threadModalGenerating: 'Repurposing your content...',

    // SettingsModal
    settingsTitle: 'Settings',
    aiModelLabel: 'AI Model',
    aiModelHint: "Choose the AI model. 'gemini-2.5-flash' is fast, while 'gemini-2.5-pro' is more powerful for complex content.",
    apiKeySourceLabel: 'API Key Source',
    apiKeySourceCarouMate: 'Use CarouMate API Key (Default)',
    apiKeySourceCustom: 'Use your own Google AI API Key',
    apiKeyLabel: 'Google AI API Key',
    apiKeyPlaceholder: 'Enter your Google AI API key',
    apiKeyHint: 'Your API key is stored securely in your browser and is required for all AI features.',
    systemPromptLabel: 'System Prompt',
    systemPromptPlaceholder: 'e.g., You are a witty content creator...',
    setDefaultButton: 'Set to default',
    cancelButton: 'Cancel',
    saveButton: 'Save Changes',
    savedButton: 'Saved!',
    donate: 'Buy me a coffee',
    brandKitTitle: 'Brand Kit',
    brandKitSubtitle: 'Set your brand colors, fonts, and logo for one-click styling.',
    brandKitPrimaryColor: 'Primary Color',
    brandKitSecondaryColor: 'Secondary Color',
    brandKitTextColor: 'Text Color',
    brandKitHeadlineFont: 'Headline Font',
    brandKitBodyFont: 'Body Font',
    brandKitLogo: 'Logo',
    brandKitUploadLogo: 'Upload Logo',
    brandKitBrandingText: 'Branding Text',

    // Tutorial Screen
    tutorialTitle: 'CarouMate User Guide',
    tutorialDownloadPDF: 'Download as PDF',
    tutorialBackToDashboard: 'Back to Dashboard',
    tutorialGeneratingPDF: 'Generating PDF...',

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
    heroTitle2: 'dalam Menit',
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
    profileNichePlaceholder: 'cth., "Pengembangan Perangkat Lunak"',
    profileButton: 'Mulai',

    // Dashboard
    dashboardTitle: 'Dasbor',
    dashboardSubtitle: 'Ruang kerja kreatif Anda.',
    newCarouselButton: 'Buat Carousel Baru',
    tutorialButton: 'Panduan Pengguna',
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
    generatorCreateButton: 'Buat Carousel!',
    generatorGeneratingButton: 'Membuat...',
    generatorAssistantButton: 'Asisten AI',
    generatorHashtagButton: 'Buat Hashtag',
    generatorThreadButton: 'Ubah jadi Thread',
    generatorStep3Title: '3. Edit Konten Anda',
    generatorHeadlineLabel: 'Judul',
    generatorBodyLabel: 'Teks Isi',
    generatorVisualPromptLabel: 'Prompt Visual',
    generatorMoveSlideLabel: 'Pindahkan Slide',
    regenerateHeadlineAria: 'Buat ulang judul',
    regenerateBodyAria: 'Buat ulang isi teks',
    downloadAllButton: 'Unduh Semua',
    downloadingButton: 'Mengunduh...',
    previewEmptyTitle: 'Ayo buat sesuatu yang luar biasa!',
    previewEmptySubtitleDesktop: 'Isi detail di sebelah kiri dan klik "Buat Carousel!" untuk memulai.',
    previewEmptySubtitleMobile: 'Isi detail di atas dan klik "Buat Carousel!" untuk memulai.',
    errorTitle: 'Terjadi Kesalahan',
    errorUnknown: 'Terjadi kesalahan yang tidak diketahui.',
    errorImageGen: 'Gagal membuat gambar. AI mungkin menolak prompt karena alasan keamanan.',
    errorHashtagGen: 'Gagal membuat hashtag.',
    errorThreadGen: 'Gagal membuat thread.',
    errorDownload: 'Maaf, terjadi masalah saat membuat file unduhan.',
    generatingContentMessage: 'Menyusun konten carousel Anda...',
    generatingImageMessage: 'Menghasilkan gambar Anda...',
    applyTo: 'Terapkan ke:',
    applyToAll: 'Semua Slide',
    applyToSelected: 'Slide Terpilih',
    uploadVisual: 'Unggah Visual',
    removeButton: 'Hapus',
    generateImageButton: 'Hasilkan Gambar',
    applyBrandKit: 'Terapkan Brand Kit',

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

    // ThreadModal
    threadModalTitle: 'ThreadMate: Konverter Thread AI',
    threadModalSubtitle: 'Konten carousel Anda, diubah formatnya untuk Threads/X.',
    threadModalCopyButton: 'Salin Thread',
    threadModalCopiedButton: 'Tersalin!',
    threadModalGenerating: 'Mengubah format konten Anda...',

    // SettingsModal
    settingsTitle: 'Pengaturan',
    aiModelLabel: 'Model AI',
    aiModelHint: "Pilih model AI. 'gemini-2.5-flash' cepat, sedangkan 'gemini-2.5-pro' lebih kuat untuk konten yang kompleks.",
    apiKeySourceLabel: 'Sumber Kunci API',
    apiKeySourceCarouMate: 'Gunakan Kunci API CarouMate (Default)',
    apiKeySourceCustom: 'Gunakan Kunci API Google AI Anda sendiri',
    apiKeyLabel: 'Kunci API Google AI',
    apiKeyPlaceholder: 'Masukkan kunci API Google AI Anda',
    apiKeyHint: 'Kunci API Anda disimpan dengan aman di browser Anda dan diperlukan untuk semua fitur AI.',
    systemPromptLabel: 'Prompt Sistem',
    systemPromptPlaceholder: 'cth., Anda adalah seorang pembuat konten yang jenaka...',
    setDefaultButton: 'Kembalikan ke default',
    cancelButton: 'Batal',
    saveButton: 'Simpan Perubahan',
    savedButton: 'Tersimpan!',
    donate: 'Traktir Kopi',
    brandKitTitle: 'Brand Kit',
    brandKitSubtitle: 'Atur warna, font, dan logo merek Anda untuk styling sekali klik.',
    brandKitPrimaryColor: 'Warna Primer',
    brandKitSecondaryColor: 'Warna Sekunder',
    brandKitTextColor: 'Warna Teks',
    brandKitHeadlineFont: 'Font Judul',
    brandKitBodyFont: 'Font Isi',
    brandKitLogo: 'Logo',
    brandKitUploadLogo: 'Unggah Logo',
    brandKitBrandingText: 'Teks Branding',

    // Tutorial Screen
    tutorialTitle: 'Panduan Pengguna CarouMate',
    tutorialDownloadPDF: 'Unduh sebagai PDF',
    tutorialBackToDashboard: 'Kembali ke Dasbor',
    tutorialGeneratingPDF: 'Membuat PDF...',
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
    apiKeySource: 'caroumate',
    apiKey: '',
    systemPrompt: 'You are an expert social media content strategist specializing in creating viral carousels.',
    brandKit: {
        colors: {
            primary: '#FFFFFF',
            secondary: '#00C2CB',
            text: '#111827',
        },
        fonts: {
            headline: FontChoice.POPPINS,
            body: FontChoice.SANS,
        },
        logo: '',
        brandingText: ''
    }
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
  [FontChoice.BREE_SERIF]: 'font-bree-serif',
  // New Display
  [FontChoice.PACIFICO]: 'font-pacifico',
  [FontChoice.CAVEAT]: 'font-caveat',
  [FontChoice.DANCING_SCRIPT]: 'font-dancing-script',
  [FontChoice.PERMANENT_MARKER]: 'font-permanent-marker',
  [FontChoice.ALFA_SLAB_ONE]: 'font-alfa-slab-one',
  [FontChoice.RIGHTEOUS]: 'font-righteous',
  [FontChoice.SATISFY]: 'font-satisfy',
  [FontChoice.ABRIL_FATFACE]: 'font-abril-fatface',
  [FontChoice.CHEWY]: 'font-chewy',
  // New Mono
  [FontChoice.SPACE_MONO]: 'font-space-mono',
  [FontChoice.IBM_PLEX_MONO]: 'font-ibm-plex-mono',
  // New Handwriting
  [FontChoice.INDIE_FLOWER]: 'font-indie-flower',
  [FontChoice.PATRICK_HAND]: 'font-patrick-hand',
  [FontChoice.PLAYPEN_SANS]: 'font-playpen-sans',
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
                        <a
                            href="http://lynk.id/pasanaktidur/s/re2yoep3v6r0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:inline-flex items-center text-sm font-medium text-accent-700 dark:text-accent-300 bg-accent-100 dark:bg-accent-900/50 border border-transparent rounded-md hover:bg-accent-200 dark:hover:bg-accent-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 transition-colors px-4 py-2"
                            aria-label={t('donate')}
                        >
                            <GiftIcon className="w-5 h-5 mr-2" />
                            {t('donate')}
                        </a>
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

const SlideCard: React.FC<{
    slide: SlideData;
    preferences: DesignPreferences;
    isSelected: boolean;
    onClick: () => void;
    isGeneratingImage: boolean;
    t: TFunction;
}> = ({ slide, preferences, isSelected, onClick, isGeneratingImage, t }) => {
    
    const finalPrefs = React.useMemo(() => {
        const slideOverrides = {
            backgroundColor: slide.backgroundColor,
            fontColor: slide.fontColor,
            backgroundImage: slide.backgroundImage,
            headlineStyle: slide.headlineStyle,
            bodyStyle: slide.bodyStyle
        };

        return {
            ...preferences,
            backgroundColor: slideOverrides.backgroundColor ?? preferences.backgroundColor,
            fontColor: slideOverrides.fontColor ?? preferences.fontColor,
            backgroundImage: slideOverrides.backgroundImage ?? preferences.backgroundImage,
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

            // Based on user request for mobile, let's set a floor.
            const minRem = type === 'headline' ? 0.75 : 0.6; // 12px for headline, 9.6px for body

            // A simple, scalable preferred value that grows with viewport width.
            const preferredVw = type === 'headline' ? '2.5vw' : '1.5vw';
            const preferredValue = `calc(${minRem}rem + ${preferredVw})`;
            
            // Use clamp() to smoothly scale the font size between a mobile-friendly minimum, a responsive preferred value, and the user's configured maximum size.
            cssStyle.fontSize = `clamp(${minRem}rem, ${preferredValue}, ${baseRem}rem)`;
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
            className={`w-64 sm:w-72 flex-shrink-0 relative rounded-lg cursor-pointer transition-all duration-300 transform ${styleClasses} ${font} ${aspectRatioClass} ${isSelected ? 'ring-4 ring-primary-500 ring-offset-2 scale-105 shadow-2xl shadow-primary-600/50' : 'hover:scale-102'}`}
            style={{
                backgroundColor: finalPrefs.style !== DesignStyle.COLORFUL && !finalBackgroundImage ? finalPrefs.backgroundColor : undefined,
                color: finalPrefs.fontColor
            }}
        >
            {isGeneratingImage && (
                <div className="absolute inset-0 bg-black/60 rounded-md z-30 flex flex-col items-center justify-center space-y-2">
                    <LoaderIcon className="w-12 h-12" />
                    <span className="text-sm text-white">{t('generatingVisual')}</span>
                </div>
            )}
            
            {/* Background Image Layer */}
            {finalBackgroundImage && (
                <>
                    <img src={finalBackgroundImage} alt="Slide background" className="absolute inset-0 w-full h-full object-cover rounded-md -z-10" />
                    <div className="absolute inset-0 bg-black/30 rounded-md -z-10"></div> {/* Dark overlay for readability */}
                </>
            )}

            {/* Content Wrapper */}
            <div className="absolute inset-0 flex flex-col justify-center items-center p-6 pb-10 text-center overflow-hidden">
                {/* Content Layer */}
                <div className="z-10 flex flex-col items-center">
                    <h2 className="font-bold leading-tight mb-4" style={{...headlineStyles, lineHeight: '1.2' }}>{slide.headline}</h2>
                    <p className="" style={{ ...bodyStyles, lineHeight: '1.5' }}>{slide.body}</p>
                </div>
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
    t: TFunction;
}> = ({ currentView, onNavigate, t }) => {
    
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
                    onClick={() => onNavigate('SETTINGS')}
                    className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors duration-200 ${
                        currentView === 'SETTINGS'
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                    aria-current={currentView === 'SETTINGS' ? 'page' : undefined}
                    aria-label={t('settingsAriaLabel')}
                >
                    <SettingsIcon className="w-6 h-6 mx-auto mb-1" />
                    <span>{t('settingsTitle')}</span>
                </button>
                <a
                    href="http://lynk.id/pasanaktidur/s/re2yoep3v6r0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center w-full h-full text-xs font-medium text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 transition-colors duration-200"
                    aria-label={t('donate')}
                >
                    <GiftIcon className="w-6 h-6 mx-auto mb-1" />
                    <span>{t('donate')}</span>
                </a>
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

    const [previousView, setPreviousView] = React.useState<AppView>('DASHBOARD');
    
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
    const [isGeneratingImageForSlide, setIsGeneratingImageForSlide] = React.useState<string | null>(null);
    const [isDownloading, setIsDownloading] = React.useState(false);
    const [generationMessage, setGenerationMessage] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const [isAssistantOpen, setIsAssistantOpen] = React.useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const [isHashtagModalOpen, setIsHashtagModalOpen] = React.useState(false);
    const [isGeneratingHashtags, setIsGeneratingHashtags] = React.useState(false);
    const [generatedHashtags, setGeneratedHashtags] = React.useState<string[]>([]);
    const [currentTopic, setCurrentTopic] = React.useState('');
    const [regeneratingPart, setRegeneratingPart] = React.useState<{ slideId: string; part: 'headline' | 'body' } | null>(null);
    const [isThreadModalOpen, setIsThreadModalOpen] = React.useState(false);
    const [isGeneratingThread, setIsGeneratingThread] = React.useState(false);
    const [generatedThread, setGeneratedThread] = React.useState('');

    const [settings, setSettings] = React.useState<AppSettings>(() => {
        try {
            const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            const parsedSettings = savedSettings ? JSON.parse(savedSettings) : {};
            // Deep merge to ensure brandKit and its nested properties are not lost if not present in saved settings
            return {
                ...defaultSettings,
                ...parsedSettings,
                brandKit: {
                    ...defaultSettings.brandKit,
                    ...(parsedSettings.brandKit || {}),
                    colors: { ...defaultSettings.brandKit!.colors, ...(parsedSettings.brandKit?.colors || {}) },
                    fonts: { ...defaultSettings.brandKit!.fonts, ...(parsedSettings.brandKit?.fonts || {}) }
                }
            };
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
            niche: '',
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

    const handleGenerateImageForSlide = async (slideId: string) => {
        if (!currentCarousel) return;
        const slide = currentCarousel.slides.find(s => s.id === slideId);
        if (!slide) return;
    
        setIsGeneratingImageForSlide(slideId);
        setError(null);
    
        try {
            const imageUrl = await generateImage(slide.visual_prompt, currentCarousel.preferences.aspectRatio, settings);
            handleUpdateSlide(slideId, { backgroundImage: imageUrl });
        } catch (err: any) {
            setError(err.message || t('errorImageGen'));
        } finally {
            setIsGeneratingImageForSlide(null);
        }
    };

    const handleRegenerateContent = async (slideId: string, part: 'headline' | 'body') => {
        if (!currentCarousel || regeneratingPart) return;
    
        const slide = currentCarousel.slides.find(s => s.id === slideId);
        if (!slide) return;
    
        setRegeneratingPart({ slideId, part });
        setError(null);
    
        try {
            const newText = await regenerateSlideContent(currentCarousel.title, slide, part, settings);
            handleUpdateSlide(slideId, { [part]: newText });
        } catch (err: any) {
            setError(err.message || t('errorUnknown'));
        } finally {
            setRegeneratingPart(null);
        }
    };

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

    const handleGenerateThread = async () => {
        if (!currentCarousel) return;
        setIsThreadModalOpen(true);
        setIsGeneratingThread(true);
        setGeneratedThread('');
        setError(null);
        try {
            const thread = await generateThreadFromCarousel(currentCarousel, settings);
            setGeneratedThread(thread);
        } catch (err: any) {
            setError(err.message || t('errorThreadGen'));
        } finally {
            setIsGeneratingThread(false);
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
    
    const handleUploadImageForSlide = (e: React.ChangeEvent<HTMLInputElement>, slideId: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result as string;
                handleUpdateSlide(slideId, { backgroundImage: imageUrl });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImageForSlide = (slideId: string) => {
        handleUpdateSlide(slideId, { backgroundImage: undefined });
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
                category: user?.niche || 'General', // Use user's niche if available
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
    
    const handleApplyBrandKit = () => {
        if (!settings.brandKit) return;
    
        const { colors, fonts, brandingText } = settings.brandKit;
    
        // A simple heuristic to choose the headline font based on what the user set.
        // For the main font, we use the body font for readability.
        const mainFont = fonts.body || FontChoice.SANS;
    
        // Update carousel preferences with brand kit values
        handleUpdateCarouselPreferences({
            backgroundColor: colors.primary,
            fontColor: colors.text,
            font: mainFont, // Apply the main body font to the whole carousel
            brandingText: brandingText,
            headlineStyle: {
                ...currentCarousel?.preferences.headlineStyle, // Keep existing styles like alignment, weight
            },
            bodyStyle: {
                ...currentCarousel?.preferences.bodyStyle,
            }
        }, currentTopic);
        
        // As applying brand kit should be a global change, we clear any slide-specific color overrides.
        handleClearSlideOverrides('backgroundColor');
        handleClearSlideOverrides('fontColor');
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
                    onShowTutorial={() => setView('TUTORIAL')}
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
                    onOpenThread={handleGenerateThread}
                    onDownload={handleDownloadCarousel}
                    isDownloading={isDownloading}
                    isHashtagModalOpen={isHashtagModalOpen}
                    isGeneratingImageForSlide={isGeneratingImageForSlide}
                    onGenerateImageForSlide={handleGenerateImageForSlide}
                    onRegenerateContent={handleRegenerateContent}
                    onUploadImageForSlide={handleUploadImageForSlide}
                    onRemoveImageForSlide={handleRemoveImageForSlide}
                    onApplyBrandKit={handleApplyBrandKit}
                    brandKitConfigured={!!settings.brandKit}
                    t={t}
                    regeneratingPart={regeneratingPart}
                />
            );
            case 'SETTINGS': return (
                <SettingsScreen
                    currentSettings={settings}
                    onSave={(newSettings) => {
                        handleSaveSettings(newSettings);
                        setView(previousView);
                    }}
                    onClose={() => setView(previousView)}
                    t={t}
                />
            );
            case 'TUTORIAL': return (
                <TutorialScreen
                    onBack={() => setView('DASHBOARD')}
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
            {isThreadModalOpen && (
                <ThreadModal
                    onClose={() => {
                        setIsThreadModalOpen(false);
                        setError(null);
                    }}
                    isLoading={isGeneratingThread}
                    threadContent={generatedThread}
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
                        if (targetView === 'DASHBOARD') {
                            goToDashboard();
                        } else if (targetView === 'SETTINGS') {
                            setPreviousView(view);
                            setView('SETTINGS');
                        } else {
                            setView(targetView);
                        }
                    }}
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
    const [niche, setNiche] = React.useState(user.niche || '');
    
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
                        <input type="text" id="niche" value={niche} onChange={e => setNiche(e.target.value)} required placeholder={t('profileNichePlaceholder')} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
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
    onShowTutorial: () => void;
    history: Carousel[];
    onEdit: (id: string) => void;
    t: TFunction;
    downloadCount: number;
    mostUsedCategory: string;
}> = ({ onNewCarousel, onShowTutorial, history, onEdit, t, downloadCount, mostUsedCategory }) => (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('dashboardTitle')}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{t('dashboardSubtitle')}</p>
            </div>
            <div className="flex w-full sm:w-auto space-x-4">
                <button onClick={onShowTutorial} className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                    {t('tutorialButton')}
                </button>
                <button onClick={onNewCarousel} className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg shadow-primary-600/40 hover:shadow-xl hover:shadow-primary-500/40 transition-shadow">
                    <SparklesIcon className="w-5 h-5 mr-2 -ml-1" />
                    {t('newCarouselButton')}
                </button>
            </div>
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

const ColorInput: React.FC<{
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
}> = ({ id, label, value, onChange }) => {
    const [textValue, setTextValue] = React.useState(value);

    React.useEffect(() => {
        setTextValue(value);
    }, [value]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newText = e.target.value;
        setTextValue(newText);
        if (/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(newText)) {
            onChange(newText);
        }
    };
    
    return (
        <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">{label}</label>
            <div className="mt-1 flex items-center space-x-2">
                <input
                    type="color"
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-10 h-8 p-0 border-none rounded cursor-pointer bg-transparent"
                    aria-label={`${label} color picker`}
                />
                <input
                    type="text"
                    value={textValue}
                    onChange={handleTextChange}
                    className="block w-full px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    aria-label={`${label} hex code`}
                />
            </div>
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
    onOpenThread: () => void;
    onDownload: () => void;
    isDownloading: boolean;
    isHashtagModalOpen: boolean;
    isGeneratingImageForSlide: string | null;
    onGenerateImageForSlide: (slideId: string) => void;
    onUploadImageForSlide: (e: React.ChangeEvent<HTMLInputElement>, slideId: string) => void;
    onRemoveImageForSlide: (slideId: string) => void;
    onApplyBrandKit: () => void;
    brandKitConfigured: boolean;
    regeneratingPart: { slideId: string; part: 'headline' | 'body' } | null;
    onRegenerateContent: (slideId: string, part: 'headline' | 'body') => void;
    t: TFunction;
}> = (props) => {
    const { onGenerate, currentCarousel, selectedSlide, onUpdateSlide, onUpdateCarouselPreferences, onClearSlideOverrides, onSelectSlide, onMoveSlide, onRegenerateContent, onOpenThread, ...rest } = props;
    const { isGenerating, generationMessage, error, onOpenAssistant, onOpenHashtag, onDownload, isDownloading, isHashtagModalOpen, isGeneratingImageForSlide, onGenerateImageForSlide, onUploadImageForSlide, onRemoveImageForSlide, onApplyBrandKit, brandKitConfigured, t, regeneratingPart } = rest;
    
    const fileInputRef = React.useRef<HTMLInputElement>(null);
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
        }
    }, [currentCarousel?.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(topic, preferences);
    };
    
    const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result as string;
                if (colorScope === 'selected' && selectedSlide) {
                    onUpdateSlide(selectedSlide.id, { backgroundImage: imageUrl });
                } else {
                    onUpdateCarouselPreferences({ backgroundImage: imageUrl }, topic);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveBgImage = () => {
         if (colorScope === 'selected' && selectedSlide) {
            onUpdateSlide(selectedSlide.id, { backgroundImage: undefined });
        } else {
            onUpdateCarouselPreferences({ backgroundImage: undefined }, topic);
            // Also clear per-slide overrides if applying to all
            onClearSlideOverrides('backgroundImage');
        }
    };

    const handleStyleChange = (key: keyof DesignPreferences, value: any) => {
        if (colorScope === 'selected' && selectedSlide) {
            onUpdateSlide(selectedSlide.id, { [key]: value } as Partial<SlideData>);
        } else {
            onUpdateCarouselPreferences({ [key]: value }, topic);
            if(key === 'backgroundColor' || key === 'fontColor'){
                onClearSlideOverrides(key as keyof SlideData);
            }
        }
    };
    
    const handleTextStyleChange = (type: 'headlineStyle' | 'bodyStyle', style: TextStyle) => {
        if (colorScope === 'selected' && selectedSlide) {
            onUpdateSlide(selectedSlide.id, { [type]: style });
        } else {
            onUpdateCarouselPreferences({ [type]: style }, topic);
            onClearSlideOverrides(type);
        }
    };
    
    const slideFileInputRef = React.useRef<HTMLInputElement>(null);

    const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;

    return (
        <div className="flex-grow flex flex-col lg:flex-row h-full">
            {/* Left Panel: Controls */}
            <div className="lg:w-1/3 xl:w-1/4 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4 sm:p-6 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1: Idea */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('generatorStep1Title')}</h3>
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorTopicLabel')}</label>
                        <textarea
                            id="topic"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            required
                            placeholder={t('generatorTopicPlaceholder')}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            rows={3}
                        />
                    </div>
                    
                    {/* Step 2: Design */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('generatorStep2Title')}</h3>
                        <div className="space-y-4">
                            {/* Style Select */}
                            <div>
                                <label htmlFor="style" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorStyleLabel')}</label>
                                <select id="style" value={preferences.style} onChange={e => onUpdateCarouselPreferences({ style: e.target.value as DesignStyle }, topic)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                                    {Object.values(DesignStyle).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            {/* Aspect Ratio */}
                            <div>
                                <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorAspectRatioLabel')}</label>
                                <select id="aspectRatio" value={preferences.aspectRatio} onChange={e => onUpdateCarouselPreferences({ aspectRatio: e.target.value as AspectRatio }, topic)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                                    {Object.values(AspectRatio).map(ar => <option key={ar} value={ar}>{aspectRatioDisplayMap[ar]}</option>)}
                                </select>
                            </div>
                            {/* Font Select */}
                            <div>
                                <label htmlFor="font" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorFontLabel')}</label>
                                <select id="font" value={preferences.font} onChange={e => onUpdateCarouselPreferences({ font: e.target.value as FontChoice }, topic)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                                    {Object.entries(FontChoice).map(([key, value]) => <option key={key} value={value} className={fontClassMap[value]}>{value}</option>)}
                                </select>
                            </div>
                             {/* Branding */}
                            <div>
                                <label htmlFor="branding" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorBrandingLabel')}</label>
                                <input type="text" id="branding" value={preferences.brandingText} onChange={e => onUpdateCarouselPreferences({ brandingText: e.target.value }, topic)} placeholder={t('generatorBrandingPlaceholder')} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                            </div>
                             {/* Colors & BG */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Colors & Background</label>
                                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md mt-1 space-y-3">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1">
                                            <ColorInput
                                                id="bgColor"
                                                label={t('generatorBgColorLabel')}
                                                value={selectedSlide?.backgroundColor ?? preferences.backgroundColor}
                                                onChange={value => handleStyleChange('backgroundColor', value)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <ColorInput
                                                id="fontColor"
                                                label={t('generatorFontColorLabel')}
                                                value={selectedSlide?.fontColor ?? preferences.fontColor}
                                                onChange={value => handleStyleChange('fontColor', value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                         <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full text-sm font-medium text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/50 rounded-md py-2 hover:bg-primary-200 dark:hover:bg-primary-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 transition-colors">{t('generatorCustomBgLabel')}</button>
                                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleBgImageUpload} className="hidden" />
                                        {(preferences.backgroundImage || selectedSlide?.backgroundImage) && (
                                            <button type="button" onClick={handleRemoveBgImage} className="w-full text-sm mt-2 text-red-600">{t('generatorRemoveBgButton')}</button>
                                        )}
                                    </div>
                                    <ApplyScopeControl scope={colorScope} setScope={setColorScope} isDisabled={!selectedSlide} t={t} fieldId="color" />
                                </div>
                            </div>
                            
                            {brandKitConfigured && (
                                <button
                                    type="button"
                                    onClick={onApplyBrandKit}
                                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-primary-600 text-sm font-medium rounded-md text-primary-600 dark:text-primary-300 bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    <PaletteIcon className="w-4 h-4 mr-2"/>
                                    {t('applyBrandKit')}
                                </button>
                            )}

                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button type="submit" disabled={isGenerating} className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed">
                            {isGenerating ? <><LoaderIcon className="w-5 h-5 mr-2 animate-spin" /> {t('generatorGeneratingButton')}</> : <><SparklesIcon className="w-5 h-5 mr-2" /> {t('generatorCreateButton')}</>}
                        </button>
                         <div className="grid grid-cols-2 gap-3">
                            <button type="button" disabled={!topic} onClick={onOpenAssistant} className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
                                {t('generatorAssistantButton')}
                            </button>
                            <button type="button" disabled={!topic} onClick={onOpenHashtag} className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
                                {t('generatorHashtagButton')}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Step 3: Edit */}
                {currentCarousel && selectedSlide && (
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('generatorStep3Title')}</h3>
                        <div className="space-y-4">
                            {/* Headline */}
                            <div>
                                <div className="flex justify-between items-center">
                                    <label htmlFor="headline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorHeadlineLabel')}</label>
                                    <button
                                        type="button"
                                        onClick={() => onRegenerateContent(selectedSlide.id, 'headline')}
                                        disabled={!!regeneratingPart}
                                        className="p-2 rounded-full text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label={t('regenerateHeadlineAria')}
                                    >
                                        {regeneratingPart?.slideId === selectedSlide.id && regeneratingPart?.part === 'headline'
                                            ? <LoaderIcon className="w-5 h-5 animate-spin" />
                                            : <RefreshIcon className="w-5 h-5" />
                                        }
                                    </button>
                                </div>
                                <textarea id="headline" value={selectedSlide.headline} onChange={e => onUpdateSlide(selectedSlide.id, { headline: e.target.value })} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" rows={2} />
                                <div className="mt-2">
                                     <TextFormatToolbar style={selectedSlide.headlineStyle ?? preferences.headlineStyle} onStyleChange={(newStyle) => handleTextStyleChange('headlineStyle', newStyle)} />
                                </div>
                            </div>
                            {/* Body */}
                            <div>
                                <div className="flex justify-between items-center">
                                    <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorBodyLabel')}</label>
                                    <button
                                        type="button"
                                        onClick={() => onRegenerateContent(selectedSlide.id, 'body')}
                                        disabled={!!regeneratingPart}
                                        className="p-2 rounded-full text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label={t('regenerateBodyAria')}
                                    >
                                        {regeneratingPart?.slideId === selectedSlide.id && regeneratingPart?.part === 'body'
                                            ? <LoaderIcon className="w-5 h-5 animate-spin" />
                                            : <RefreshIcon className="w-5 h-5" />
                                        }
                                    </button>
                                </div>
                                <textarea id="body" value={selectedSlide.body} onChange={e => onUpdateSlide(selectedSlide.id, { body: e.target.value })} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" rows={4} />
                                <div className="mt-2">
                                    <TextFormatToolbar style={selectedSlide.bodyStyle ?? preferences.bodyStyle} onStyleChange={(newStyle) => handleTextStyleChange('bodyStyle', newStyle)} />
                                </div>
                            </div>
                            {/* Visual Prompt */}
                            <div>
                                <label htmlFor="visual_prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorVisualPromptLabel')}</label>
                                <textarea id="visual_prompt" value={selectedSlide.visual_prompt} onChange={e => onUpdateSlide(selectedSlide.id, { visual_prompt: e.target.value })} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" rows={3} />
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => onGenerateImageForSlide(selectedSlide.id)}
                                        disabled={!!isGeneratingImageForSlide}
                                        className="w-full inline-flex items-center justify-center text-sm py-2 px-3 border border-transparent rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus-ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                    >
                                        {isGeneratingImageForSlide === selectedSlide.id ? <LoaderIcon className="w-4 h-4 animate-spin"/> : <SparklesIcon className="w-4 h-4 mr-1" />}
                                        {t('generateImageButton')}
                                    </button>
                                     <button
                                        type="button"
                                        onClick={() => slideFileInputRef.current?.click()}
                                        className="w-full inline-flex items-center justify-center text-sm py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    >
                                        <ImageIcon className="w-4 h-4 mr-1"/>
                                        {t('uploadVisual')}
                                    </button>
                                    <input type="file" ref={slideFileInputRef} onChange={(e) => onUploadImageForSlide(e, selectedSlide.id)} accept="image/*" className="hidden"/>
                                </div>
                                {selectedSlide.backgroundImage && (
                                    <button
                                        type="button"
                                        onClick={() => onRemoveImageForSlide(selectedSlide.id)}
                                        className="w-full text-sm mt-2 text-red-600 hover:underline"
                                    >
                                        <TrashIcon className="w-4 h-4 inline-block mr-1"/>
                                        {t('removeButton')}
                                    </button>
                                )}
                            </div>
                            
                            {/* Move Slide */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('generatorMoveSlideLabel')}</label>
                                <div className="flex items-center space-x-2 mt-1">
                                    <button type="button" onClick={() => onMoveSlide(selectedSlide.id, 'left')} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"><LeftArrowIcon className="w-5 h-5" /></button>
                                    <button type="button" onClick={() => onMoveSlide(selectedSlide.id, 'right')} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"><RightArrowIcon className="w-5 h-5" /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Panel: Preview */}
            <div className="flex-grow bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
                {error && (
                    <div className="absolute top-20 z-50 max-w-xl w-full bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-md shadow-lg" role="alert">
                        <strong className="font-bold">{t('errorTitle')}: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                {isGenerating && <Loader text={generationMessage} />}

                {!isGenerating && currentCarousel && (
                    <div className="w-full flex flex-col items-center">
                         <div className="flex items-center space-x-4 overflow-x-auto py-4 px-4 w-full snap-x snap-mandatory">
                            {currentCarousel.slides.map(slide => (
                                <div key={slide.id} className="snap-center">
                                    <SlideCard
                                        slide={slide}
                                        preferences={currentCarousel.preferences}
                                        isSelected={slide.id === selectedSlide?.id}
                                        onClick={() => onSelectSlide(slide.id)}
                                        isGeneratingImage={isGeneratingImageForSlide === slide.id}
                                        t={t}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <button
                                onClick={onDownload}
                                disabled={isDownloading}
                                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
                            >
                               {isDownloading ? <><LoaderIcon className="w-6 h-6 mr-3 animate-spin" /> {t('downloadingButton')}</> : <><DownloadIcon className="w-6 h-6 mr-3" /> {t('downloadAllButton')}</>}
                            </button>
                             <button
                                onClick={onOpenThread}
                                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                               <ThreadsIcon className="w-6 h-6 mr-3" /> {t('generatorThreadButton')}
                            </button>
                        </div>
                    </div>
                )}

                {!isGenerating && !currentCarousel && (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('previewEmptyTitle')}</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">{isDesktop ? t('previewEmptySubtitleDesktop') : t('previewEmptySubtitleMobile')}</p>
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
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const fetchSuggestions = async (type: 'hook' | 'cta') => {
        setIsLoading(true);
        setError(null);
        setSuggestions([]);
        try {
            const result = await getAiAssistance(topic, type, settings);
            setSuggestions(result);
        } catch (err: any) {
            setError(err.message || t('errorUnknown'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full m-4 space-y-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('assistantTitle')}</h2>
                <p className="text-gray-600 dark:text-gray-400">{t('assistantSubtitle1')}"<span className="font-semibold">{topic}</span>"{t('assistantSubtitle2')}</p>
                <div className="flex space-x-4">
                    <button onClick={() => fetchSuggestions('hook')} className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">{t('getHookButton')}</button>
                    <button onClick={() => fetchSuggestions('cta')} className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-accent-500 hover:bg-accent-600">{t('getCTAButton')}</button>
                </div>
                <div className="mt-4 p-4 h-64 overflow-y-auto bg-gray-50 dark:bg-gray-700/50 rounded-md">
                    {isLoading && <Loader text="..." />}
                    {error && <p className="text-red-500">{error}</p>}
                    {!isLoading && !error && suggestions.length > 0 && (
                        <ul className="space-y-3">
                            {suggestions.map((s, i) => <li key={i} className="p-3 bg-white dark:bg-gray-800 rounded shadow-sm text-gray-700 dark:text-gray-300">{s}</li>)}
                        </ul>
                    )}
                    {!isLoading && !error && suggestions.length === 0 && <p className="text-gray-500 text-center pt-8">{t('assistantEmpty')}</p>}
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
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        const textToCopy = hashtags.map(h => `#${h}`).join(' ');
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full m-4 space-y-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('hashtagModalTitle')}</h2>
                <p className="text-gray-600 dark:text-gray-400">{t('hashtagModalSubtitle1')}"<span className="font-semibold">{topic}</span>"{t('hashtagModalSubtitle2')}</p>
                <div className="mt-4 p-4 h-64 overflow-y-auto bg-gray-50 dark:bg-gray-700/50 rounded-md flex flex-wrap gap-2">
                    {isLoading && <Loader text="..." />}
                    {error && <p className="text-red-500">{error}</p>}
                    {!isLoading && !error && hashtags.length > 0 && (
                       hashtags.map((h, i) => <span key={i} className="px-2 py-1 bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 rounded-full text-sm">#{h}</span>)
                    )}
                    {!isLoading && !error && hashtags.length === 0 && <p className="text-gray-500 text-center w-full pt-8">{t('hashtagModalEmpty')}</p>}
                </div>
                {hashtags.length > 0 && (
                    <button onClick={handleCopy} className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                        {copied ? t('hashtagModalCopiedButton') : t('hashtagModalCopyButton')}
                    </button>
                )}
            </div>
        </div>
    );
};

const ThreadModal: React.FC<{
    onClose: () => void;
    isLoading: boolean;
    threadContent: string;
    error: string | null;
    t: TFunction;
}> = ({ onClose, isLoading, threadContent, error, t }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(threadContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full m-4 space-y-4 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center space-x-3">
                    <ThreadsIcon className="w-8 h-8 text-primary-500"/>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('threadModalTitle')}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('threadModalSubtitle')}</p>
                    </div>
                </div>
                <div className="mt-4 p-4 min-h-[16rem] h-64 overflow-y-auto bg-gray-50 dark:bg-gray-700/50 rounded-md whitespace-pre-wrap font-sans">
                    {isLoading && <Loader text={t('threadModalGenerating')} />}
                    {error && <p className="text-red-500">{error}</p>}
                    {!isLoading && !error && threadContent && (
                       <p className="text-gray-800 dark:text-gray-200">{threadContent}</p>
                    )}
                </div>
                {threadContent && !isLoading && (
                    <button onClick={handleCopy} className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                        {copied ? t('threadModalCopiedButton') : t('threadModalCopyButton')}
                    </button>
                )}
            </div>
        </div>
    );
};

const SettingsScreen: React.FC<{
    currentSettings: AppSettings;
    onSave: (settings: AppSettings) => void;
    onClose: () => void;
    t: TFunction;
    isModal?: boolean;
}> = ({ currentSettings, onSave, onClose, t, isModal = false }) => {
    const [settings, setSettings] = React.useState(currentSettings);
    const [saved, setSaved] = React.useState(false);

    React.useEffect(() => {
        setSettings(currentSettings); // Sync with external changes
    }, [currentSettings]);

    const handleSave = () => {
        onSave(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleBrandKitChange = (key: keyof BrandKit, value: any) => {
        setSettings(prev => ({
            ...prev,
            brandKit: { ...(prev.brandKit!), [key]: value }
        }));
    };

    const handleBrandKitColorChange = (key: keyof BrandKit['colors'], value: string) => {
        setSettings(prev => ({
            ...prev,
            brandKit: {
                ...prev.brandKit!,
                colors: { ...prev.brandKit!.colors, [key]: value }
            }
        }));
    };

    const handleBrandKitFontChange = (key: keyof BrandKit['fonts'], value: FontChoice) => {
         setSettings(prev => ({
            ...prev,
            brandKit: {
                ...prev.brandKit!,
                fonts: { ...prev.brandKit!.fonts, [key]: value }
            }
        }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleBrandKitChange('logo', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const settingsForm = (
        <div className="space-y-6">
            {/* AI Settings */}
            <div className="space-y-4 p-4 border dark:border-gray-700 rounded-md">
                 <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Settings</h3>
                <div>
                    <label htmlFor="aiModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('aiModelLabel')}</label>
                    <select id="aiModel" value={settings.aiModel} onChange={e => setSettings({ ...settings, aiModel: e.target.value as AIModel })} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                        {Object.values(AIModel).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('aiModelHint')}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('apiKeySourceLabel')}</label>
                    <fieldset className="mt-2">
                        <legend className="sr-only">API Key Source</legend>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <input id="key-source-caroumate" name="key-source" type="radio" value="caroumate" checked={settings.apiKeySource === 'caroumate'} onChange={e => setSettings({...settings, apiKeySource: e.target.value as 'caroumate' | 'custom'})} className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                                <label htmlFor="key-source-caroumate" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">{t('apiKeySourceCarouMate')}</label>
                            </div>
                            <div className="flex items-center">
                                <input id="key-source-custom" name="key-source" type="radio" value="custom" checked={settings.apiKeySource === 'custom'} onChange={e => setSettings({...settings, apiKeySource: e.target.value as 'caroumate' | 'custom'})} className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                                <label htmlFor="key-source-custom" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">{t('apiKeySourceCustom')}</label>
                            </div>
                        </div>
                    </fieldset>
                </div>

                {settings.apiKeySource === 'custom' && (
                     <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('apiKeyLabel')}</label>
                        <input type="password" id="apiKey" value={settings.apiKey} onChange={e => setSettings({ ...settings, apiKey: e.target.value })} placeholder={t('apiKeyPlaceholder')} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('apiKeyHint')}</p>
                    </div>
                )}
                 <div>
                    <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('systemPromptLabel')}</label>
                    <textarea id="systemPrompt" value={settings.systemPrompt} onChange={e => setSettings({ ...settings, systemPrompt: e.target.value })} rows={3} placeholder={t('systemPromptPlaceholder')} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
                    <button type="button" onClick={() => setSettings({...settings, systemPrompt: defaultSettings.systemPrompt })} className="text-xs text-primary-600 hover:underline mt-1">{t('setDefaultButton')}</button>
                </div>
            </div>

            {/* Brand Kit */}
            <div className="space-y-4 p-4 border dark:border-gray-700 rounded-md">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('brandKitTitle')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('brandKitSubtitle')}</p>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <ColorInput
                            id="brandKitPrimaryColor"
                            label={t('brandKitPrimaryColor')}
                            value={settings.brandKit?.colors.primary || '#FFFFFF'}
                            onChange={value => handleBrandKitColorChange('primary', value)}
                        />
                    </div>
                    <div>
                        <ColorInput
                            id="brandKitSecondaryColor"
                            label={t('brandKitSecondaryColor')}
                            value={settings.brandKit?.colors.secondary || '#00C2CB'}
                            onChange={value => handleBrandKitColorChange('secondary', value)}
                        />
                    </div>
                    <div>
                        <ColorInput
                            id="brandKitTextColor"
                            label={t('brandKitTextColor')}
                            value={settings.brandKit?.colors.text || '#111827'}
                            onChange={value => handleBrandKitColorChange('text', value)}
                        />
                    </div>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="headlineFont" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('brandKitHeadlineFont')}</label>
                        <select id="headlineFont" value={settings.brandKit?.fonts.headline} onChange={e => handleBrandKitFontChange('headline', e.target.value as FontChoice)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                            {Object.entries(FontChoice).map(([key, value]) => <option key={key} value={value} className={fontClassMap[value]}>{value}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="bodyFont" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('brandKitBodyFont')}</label>
                        <select id="bodyFont" value={settings.brandKit?.fonts.body} onChange={e => handleBrandKitFontChange('body', e.target.value as FontChoice)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                            {Object.entries(FontChoice).map(([key, value]) => <option key={key} value={value} className={fontClassMap[value]}>{value}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('brandKitLogo')}</label>
                        <div className="mt-1 flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                                {settings.brandKit?.logo ? <img src={settings.brandKit.logo} alt="logo preview" className="max-w-full max-h-full object-contain" /> : <ImageIcon className="w-8 h-8 text-gray-400" />}
                            </div>
                            <input type="file" accept="image/*" onChange={handleLogoUpload} id="logo-upload" className="hidden"/>
                            <label htmlFor="logo-upload" className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-500">
                                {t('brandKitUploadLogo')}
                            </label>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="brandingText" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('brandKitBrandingText')}</label>
                        <input type="text" id="brandingText" value={settings.brandKit?.brandingText} onChange={e => handleBrandKitChange('brandingText', e.target.value)} placeholder="@yourhandle" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">{t('cancelButton')}</button>
                <button type="button" onClick={handleSave} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 w-28 text-center">
                    {saved ? t('savedButton') : t('saveButton')}
                </button>
            </div>
        </div>
    );
    
    if (isModal) {
         return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full m-4" onClick={e => e.stopPropagation()}>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('settingsTitle')}</h2>
                    <div className="max-h-[70vh] overflow-y-auto pr-2">
                        {settingsForm}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('settingsTitle')}</h2>
            <div className="max-w-2xl mx-auto">
                {settingsForm}
            </div>
        </div>
    );
};

const SettingsModal: React.FC<{
    currentSettings: AppSettings;
    onSave: (settings: AppSettings) => void;
    onClose: () => void;
    t: TFunction;
}> = (props) => <SettingsScreen {...props} isModal={true} />;

const TutorialScreen: React.FC<{ onBack: () => void; t: TFunction }> = ({ onBack, t }) => {
    const [isDownloading, setIsDownloading] = React.useState(false);

    const handleDownloadPdf = async () => {
        const tutorialContent = document.getElementById('tutorial-content');
        if (!tutorialContent) return;

        setIsDownloading(true);
        try {
            const canvas = await html2canvas(tutorialContent, {
                scale: 2,
                useCORS: true,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#0D0D0D' : '#f7f7f7',
                windowWidth: 1200 // Ensure a consistent width for rendering
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save('Panduan_CarouMate.pdf');
        } catch (error) {
            console.error('Could not generate PDF', error);
            alert('Gagal membuat PDF. Silakan coba lagi.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('tutorialTitle')}</h2>
                    <div className="flex space-x-4">
                        <button onClick={onBack} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">{t('tutorialBackToDashboard')}</button>
                        <button onClick={handleDownloadPdf} disabled={isDownloading} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300">
                             {isDownloading ? (
                                <><LoaderIcon className="w-4 h-4 mr-2 animate-spin" />{t('tutorialGeneratingPDF')}</>
                            ) : (
                                <><DownloadIcon className="w-4 h-4 mr-2" />{t('tutorialDownloadPDF')}</>
                            )}
                        </button>
                    </div>
                </div>

                <div id="tutorial-content" className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <article className="prose prose-lg dark:prose-invert max-w-none">
                        <h1>Selamat Datang di CarouMate!</h1>
                        <p>Panduan ini akan memandu Anda melalui semua fitur hebat CarouMate untuk membantu Anda membuat konten viral dalam hitungan menit.</p>

                        <h2>1. Memulai: Dalam Satu Menit Pertama</h2>
                        <ol>
                            <li><strong>Masuk & Pengaturan Profil:</strong> Cukup klik tombol utama, lalu isi nama dan <em>niche</em> konten Anda (misalnya, "Pemasaran Digital," "Kebugaran," "Kuliner"). Ini membantu AI kami memberikan konten yang lebih relevan untuk Anda.</li>
                        </ol>

                        <h2>2. Generator: Pusat Kreatif Anda</h2>
                        <p>Ini adalah tempat keajaiban terjadi. Prosesnya sederhana:</p>
                        <ol>
                            <li><strong>Masukkan Ide Anda:</strong> Di kolom pertama, masukkan topik carousel Anda. Semakin spesifik, semakin baik! <em>Contoh: "5 cara meningkatkan produktivitas saat WFH".</em></li>
                            <li><strong>Tentukan Gaya Anda:</strong> Pilih <strong>Gaya, Rasio Aspek, Font,</strong> dan <strong>Warna</strong> yang sesuai dengan merek Anda. Anda juga bisa menambahkan teks branding seperti @username Anda.</li>
                            <li><strong>Klik "Buat Carousel!":</strong> Duduk dan rileks sementara AI kami menyusun draf pertama carousel Anda, lengkap dengan teks dan ide visual untuk setiap slide.</li>
                        </ol>

                        <h2>3. Menyempurnakan Karya Anda</h2>
                        <p>Setelah carousel dibuat, klik pada slide mana pun untuk memilihnya dan mulai mengedit di panel kiri.</p>
                        <ul>
                            <li><strong>Edit Teks & AI Refresh:</strong> Ubah <strong>Judul</strong> dan <strong>Teks Isi</strong>. Tidak puas? Klik ikon segarkan <RefreshIcon className="w-5 h-5 inline-block"/> di sebelah kolom teks untuk meminta AI membuat versi baru. Gunakan toolbar pemformatan untuk membuat teks tebal, miring, mengubah ukuran, dan lainnya.</li>
                            <li><strong>Kustomisasi Visual:</strong> Edit <strong>Prompt Visual</strong> (dalam Bahasa Inggris), lalu klik <strong>"Hasilkan Gambar"</strong> untuk membuat visual dengan AI. Atau, klik <strong>"Unggah Visual"</strong> untuk menggunakan gambar Anda sendiri.</li>
                            <li><strong>Atur Ulang Slide:</strong> Gunakan tombol panah <LeftArrowIcon className="w-5 h-5 inline-block"/> <RightArrowIcon className="w-5 h-5 inline-block"/> untuk mengubah urutan slide Anda dengan mudah.</li>
                        </ul>

                        <h2>4. Tingkatkan Konten dengan AI Tools</h2>
                        <p>Di bawah tombol "Buat Carousel", Anda akan menemukan alat bantu canggih:</p>
                        <ul>
                            <li><strong>Asisten AI:</strong> Butuh ide untuk judul yang menarik (hook) atau ajakan bertindak (CTA) yang kuat? Fitur ini memberikan saran instan dari AI.</li>
                            <li><strong>Buat Hashtag:</strong> Dapatkan daftar hashtag yang relevan dan efektif untuk postingan Anda secara otomatis.</li>
                            <li><strong>Ubah jadi Thread:</strong> Fitur andalan! Setelah carousel Anda selesai, klik tombol ini untuk mengubah semua konten Anda menjadi format <em>thread</em> yang siap diposting di X (Twitter) atau Threads.</li>
                        </ul>

                        <h2>5. Unduh & Jadilah Viral</h2>
                        <p>Setelah semuanya sempurna, klik tombol <strong>"Unduh Semua"</strong>. CarouMate akan mengemas semua slide Anda ke dalam file .zip berisi gambar PNG berkualitas tinggi, siap untuk diunggah.</p>
                        
                        <h2>Tips Pro: Manfaatkan Brand Kit</h2>
                        <p>Buka <strong>Pengaturan</strong> <SettingsIcon className="w-5 h-5 inline-block"/>. Konfigurasikan <strong>Brand Kit</strong> Anda dengan mengatur warna, font, logo, dan teks branding. Setelah itu, di halaman generator, cukup klik tombol <strong>"Terapkan Brand Kit"</strong> untuk menerapkan gaya merek Anda secara instan. Ini adalah penghemat waktu yang luar biasa!</p>
                        
                        <p className="mt-8 font-bold text-center">Selamat Mencipta!</p>
                    </article>
                </div>
            </div>
        </div>
    );
};

const Footer: React.FC = () => (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto hidden md:block">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} CarouMate. All rights reserved.</p>
            <div className="flex justify-center space-x-6 mt-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500"><InstagramIcon className="w-6 h-6" /></a>
                <a href="https://threads.net" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500"><ThreadsIcon className="w-6 h-6" /></a>
            </div>
        </div>
    </footer>
);