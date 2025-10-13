import * as React from 'react';
import type { AppView, UserProfile, Carousel, SlideData, DesignPreferences, AppSettings } from './types';
import { AIModel } from './types';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { generateCarouselContent, getAiAssistance, generateCaption, generateImage, regenerateSlideContent, generateThreadFromCarousel } from './services/geminiService';

import { translations } from './lib/translations';
import { SETTINGS_STORAGE_KEY, USER_STORAGE_KEY, HISTORY_STORAGE_KEY, DOWNLOADS_STORAGE_KEY, defaultSettings } from './lib/constants';

import { Header } from './components/Header';
import { MobileFooter } from './components/MobileFooter';
import { Footer } from './components/Footer';
import { LoginScreen } from './components/LoginScreen';
import { ProfileSetupModal } from './components/ProfileSetupModal';
import { Dashboard } from './components/Dashboard';
import { Generator } from './components/Generator';
import { SettingsModal } from './components/SettingsModal';
import { TutorialScreen } from './components/TutorialScreen';
import { AiAssistantModal } from './components/AiAssistantModal';
import { CaptionModal } from './components/CaptionModal';
import { ThreadModal } from './components/ThreadModal';

export type TFunction = (key: string, params?: { [key: string]: any }) => string;

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

    const [language, setLanguage] = React.useState<keyof typeof translations>('id');
    
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
    const [isCaptionModalOpen, setIsCaptionModalOpen] = React.useState(false);
    const [isGeneratingCaption, setIsGeneratingCaption] = React.useState(false);
    const [generatedCaption, setGeneratedCaption] = React.useState<string>('');
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
                    fonts: { ...defaultSettings.brandKit!.fonts, ...(parsedSettings.brandKit?.fonts || {}) },
                    brandingStyle: { ...defaultSettings.brandKit!.brandingStyle, ...(parsedSettings.brandKit?.brandingStyle || {}) },
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
    
    const t: TFunction = React.useCallback((key: string, params?: { [key: string]: any }) => {
        let text = (translations[language] as any)[key] || key;
        if (params) {
            Object.keys(params).forEach(pKey => {
                const regex = new RegExp(`{{${pKey}}}`, 'g');
                text = text.replace(regex, String(params[pKey]));
            });
        }
        return text;
    }, [language]);

    const parseAndDisplayError = React.useCallback((error: any): string => {
        let errorMessage = error.message || t('errorUnknown');

        // Case 1: The error from Gemini API is a JSON string
        if (errorMessage.startsWith('{') && errorMessage.endsWith('}')) {
            try {
                const errorObj = JSON.parse(errorMessage);
                if (errorObj.error) {
                    const { code, message, status, details } = errorObj.error;

                    if (code === 429 || status === "RESOURCE_EXHAUSTED") {
                        const helpLinkDetails = details?.find((d: any) => d['@type'] === 'type.googleapis.com/google.rpc.Help');
                        const helpLink = helpLinkDetails?.links?.[0]?.url;
                        return t('errorQuotaExceeded', {
                            link: helpLink || 'https://ai.google.dev/gemini-api/docs/rate-limits'
                        });
                    }
                    
                    const lowerMessage = message?.toLowerCase() || '';
                    if (code === 400 && (lowerMessage.includes('api key not valid') || lowerMessage.includes('permission denied'))) {
                         return t('errorInvalidApiKey');
                    }
                    
                    return message || errorMessage;
                }
            } catch (e) {
                // Not a valid JSON, fall through to general checks.
            }
        }
        
        // Case 2: For other errors (not JSON), check for common substrings.
        const lowerCaseMessage = errorMessage.toLowerCase();
        
        if (lowerCaseMessage.includes('api key not valid') || lowerCaseMessage.includes('permission denied')) {
            return t('errorInvalidApiKey');
        }

        if (lowerCaseMessage.includes('api key is not configured')) {
            return t('errorApiKeyNotConfigured');
        }
        
        if (errorMessage.includes("AI did not return an image from your prompt.")) {
            return t('errorImageGen');
        }

        return errorMessage;
    }, [t]);

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
            niche: [],
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
        const cleanedProfile = {
            ...profile,
            niche: profile.niche.filter(n => n.trim() !== ''),
        };
        setUser({ ...cleanedProfile, profileComplete: true });
        setView('DASHBOARD');
    };
    
    const goToDashboard = () => {
        if (view === 'LOGIN' || view === 'PROFILE_SETUP') return;
        if (currentCarousel) {
            // Save the latest changes to history before switching views
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
    
    const handleDeleteCarousel = (carouselId: string) => {
        if (window.confirm(t('deleteCarouselConfirm'))) {
            setCarouselHistory(prev => prev.filter(c => c.id !== carouselId));
        }
    };

    const handleClearHistory = () => {
        if (window.confirm(t('clearHistoryConfirm'))) {
            setCarouselHistory([]);
        }
    };
    
    const executeImageGenerationForAllSlides = async (carousel: Carousel): Promise<Carousel> => {
        let updatedCarousel = carousel;
        for (let i = 0; i < carousel.slides.length; i++) {
            const slide = carousel.slides[i];
            setGenerationMessage(t('generatingImageMessage', { current: i + 1, total: carousel.slides.length }));
            setIsGeneratingImageForSlide(slide.id);
            try {
                const imageUrl = await generateImage(slide.visual_prompt, carousel.preferences.aspectRatio);
                // Create new slides array with the new image
                const newSlides = updatedCarousel.slides.map(s => s.id === slide.id ? { ...s, backgroundImage: imageUrl } : s);
                // Update the local carousel variable for the next iteration
                updatedCarousel = { ...updatedCarousel, slides: newSlides };
                // Update the state to reflect changes in the UI
                setCurrentCarousel(updatedCarousel);
            } catch (imageErr) {
                console.error(`Failed to generate image for slide ${i + 1}:`, imageErr);
                // Optionally set an error state on the slide itself, for now we just log and continue
            }
        }
        return updatedCarousel;
    };


    const handleGenerateCarousel = React.useCallback(async (topic: string, niche: string, preferences: DesignPreferences, magicCreate: boolean) => {
        if (!user) return;
        setIsGenerating(true);
        setError(null);
        setCurrentCarousel(null);
        setCurrentTopic(topic);
        
        let newCarousel: Carousel | null = null;

        try {
            setGenerationMessage(t('generatingContentMessage'));
            const nicheToUse = niche || (user.niche.length > 0 ? user.niche[0] : 'General');
            const slidesContent = await generateCarouselContent(topic, nicheToUse, preferences, settings);

            const initialSlides: SlideData[] = slidesContent.map(s => ({ ...s, id: crypto.randomUUID() }));
            
            newCarousel = {
                id: crypto.randomUUID(),
                title: topic,
                createdAt: new Date().toISOString(),
                slides: initialSlides,
                category: nicheToUse,
                preferences,
            };
            
            setCurrentCarousel(newCarousel);
            setSelectedSlideId(initialSlides[0]?.id ?? null);

            if (magicCreate) {
                const finalCarousel = await executeImageGenerationForAllSlides(newCarousel);
                setCarouselHistory(prev => [finalCarousel, ...prev]);
            } else {
                 setCarouselHistory(prev => [newCarousel!, ...prev]);
            }

        } catch (err: any) {
            setError(parseAndDisplayError(err));
        } finally {
            setIsGenerating(false);
            setGenerationMessage('');
            setIsGeneratingImageForSlide(null);
        }
    }, [user, settings, t, parseAndDisplayError]);

    const handleGenerateImageForSlide = async (slideId: string) => {
        if (!currentCarousel) return;
        const slide = currentCarousel.slides.find(s => s.id === slideId);
        if (!slide) return;
    
        setIsGeneratingImageForSlide(slideId);
        setError(null);
    
        try {
            const imageUrl = await generateImage(slide.visual_prompt, currentCarousel.preferences.aspectRatio);
            handleUpdateSlide(slideId, { backgroundImage: imageUrl });
        } catch (err: any) {
            setError(parseAndDisplayError(err));
        } finally {
            setIsGeneratingImageForSlide(null);
        }
    };
    
    const handleGenerateAllImages = async () => {
        if (!currentCarousel) return;
        setIsGenerating(true);
        setError(null);
        try {
            const finalCarousel = await executeImageGenerationForAllSlides(currentCarousel);
            // Update history with the newly generated images
            setCarouselHistory(prev => {
                const index = prev.findIndex(c => c.id === finalCarousel.id);
                if (index > -1) {
                    const newHistory = [...prev];
                    newHistory[index] = finalCarousel;
                    return newHistory;
                }
                return prev; // Should not happen if carousel is current
            });
        } catch(err: any) {
            setError(parseAndDisplayError(err));
        } finally {
            setIsGenerating(false);
            setGenerationMessage('');
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
            setError(parseAndDisplayError(err));
        } finally {
            setRegeneratingPart(null);
        }
    };

    const handleGenerateCaption = async () => {
        if (!currentCarousel) return;
        setIsCaptionModalOpen(true);
        setIsGeneratingCaption(true);
        setGeneratedCaption('');
        setError(null);
        try {
            const caption = await generateCaption(currentCarousel, settings);
            setGeneratedCaption(caption);
        } catch (err: any) {
            setError(parseAndDisplayError(err));
            // Also set error inside the modal if needed
        } finally {
            setIsGeneratingCaption(false);
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
            setError(parseAndDisplayError(err));
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
                const slideId = element.getAttribute('data-carousel-slide');
                const slide = currentCarousel.slides.find(s => s.id === slideId);
                if (!slide) continue;

                const visualUrl = slide.backgroundImage ?? currentCarousel.preferences.backgroundImage;
                const isVideo = visualUrl?.startsWith('data:video');
                
                if (isVideo) {
                    // Handle video slide
                    // 1. Add video file to zip
                    const videoResponse = await fetch(visualUrl);
                    const videoBlob = await videoResponse.blob();
                    const extension = videoBlob.type.split('/')[1] || 'mp4';
                    zip.file(`slide-${i + 1}.${extension}`, videoBlob);

                    // 2. Add transparent overlay PNG to zip
                    const videoElement = element.querySelector('video');
                    if (videoElement) videoElement.style.visibility = 'hidden'; // Use visibility to keep layout

                    const overlayCanvas = await html2canvas(element, {
                        allowTaint: true,
                        useCORS: true,
                        backgroundColor: null, // Transparent background
                        scale: 8,
                    });
                    const overlayBlob = await new Promise<Blob | null>(resolve => overlayCanvas.toBlob(resolve, 'image/png'));
                    if (overlayBlob) {
                        zip.file(`slide-${i + 1}_overlay.png`, overlayBlob);
                    }

                    if (videoElement) videoElement.style.visibility = 'visible'; // Restore video visibility
                } else {
                    // Handle image slide
                    const finalBgColor = slide?.backgroundColor ?? currentCarousel.preferences.backgroundColor;
                    const canvas = await html2canvas(element, {
                        allowTaint: true,
                        useCORS: true,
                        backgroundColor: visualUrl ? null : finalBgColor,
                        scale: 8,
                    });
                    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
                    if (blob) {
                        zip.file(`slide-${i + 1}.png`, blob);
                    }
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
    
    const handleUploadVisualForSlide = (e: React.ChangeEvent<HTMLInputElement>, slideId: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const visualUrl = reader.result as string;
                handleUpdateSlide(slideId, { backgroundImage: visualUrl });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveVisualForSlide = (slideId: string) => {
        handleUpdateSlide(slideId, { backgroundImage: undefined });
    };

    const handleUpdateCarouselPreferences = (updates: Partial<DesignPreferences>, topicValue: string) => {
        setCurrentCarousel(prev => {
            if (prev) {
                return { ...prev, preferences: { ...prev.preferences, ...updates } };
            }
            return {
                id: 'temp-' + crypto.randomUUID(),
                title: topicValue,
                createdAt: new Date().toISOString(),
                slides: [],
                category: user?.niche[0] || 'General',
                preferences: {
                    ...defaultSettings.brandKit!, // This is not right, should be preferences.
                    ...{
                        backgroundColor: '#FFFFFF',
                        fontColor: '#111827',
                        backgroundOpacity: 1,
                        style: 'Minimalist' as any,
                        font: 'Inter' as any,
                        aspectRatio: '1:1' as any,
                        backgroundImage: undefined,
                        brandingText: '',
                        brandingStyle: { color: '#111827', opacity: 0.75, position: 'bottom-right', fontSize: 0.7 },
                        headlineStyle: { fontSize: 1.4, fontWeight: 'bold', textAlign: 'center', textStroke: { color: '#000000', width: 0 } },
                        bodyStyle: { fontSize: 0.8, textAlign: 'center', textStroke: { color: '#000000', width: 0 } },
                        slideNumberStyle: { show: false, color: '#FFFFFF', opacity: 0.8, position: 'top-right', fontSize: 0.7 },
                    },
                    ...updates,
                },
            };
        });
    };
    
    const handleApplyBrandKit = () => {
        if (!settings.brandKit) return;
    
        const { colors, fonts, brandingText, brandingStyle } = settings.brandKit;
    
        const mainFont = fonts.body || 'Inter' as any;
    
        handleUpdateCarouselPreferences({
            backgroundColor: colors.primary,
            fontColor: colors.text,
            font: mainFont,
            brandingText: brandingText,
            brandingStyle: brandingStyle,
            headlineStyle: {
                ...currentCarousel?.preferences.headlineStyle,
            },
            bodyStyle: {
                ...currentCarousel?.preferences.bodyStyle,
            }
        }, currentTopic);
        
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

    const handleApplyAssistantSuggestion = (suggestion: string, type: 'hook' | 'cta') => {
        if (!selectedSlideId) {
            console.warn("No slide selected to apply suggestion.");
            return;
        }

        const fieldToUpdate = type === 'hook' ? 'headline' : 'body';
        handleUpdateSlide(selectedSlideId, { [fieldToUpdate]: suggestion });
        setIsAssistantOpen(false); // Close modal after applying.
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
                    onDelete={handleDeleteCarousel}
                    onClearHistory={handleClearHistory}
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
                    onErrorDismiss={() => setError(null)}
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
                    onOpenCaption={handleGenerateCaption}
                    onOpenThread={handleGenerateThread}
                    onDownload={handleDownloadCarousel}
                    isDownloading={isDownloading}
                    isGeneratingImageForSlide={isGeneratingImageForSlide}
                    onGenerateImageForSlide={handleGenerateImageForSlide}
                    onGenerateAllImages={handleGenerateAllImages}
                    onRegenerateContent={handleRegenerateContent}
                    onUploadVisualForSlide={handleUploadVisualForSlide}
                    onRemoveVisualForSlide={handleRemoveVisualForSlide}
                    onApplyBrandKit={handleApplyBrandKit}
                    brandKitConfigured={!!settings.brandKit}
                    t={t}
                    regeneratingPart={regeneratingPart}
                />
            );
            case 'SETTINGS': return (
                <SettingsModal
                    currentSettings={settings}
                    onSave={(newSettings) => {
                        handleSaveSettings(newSettings);
                        setView(previousView);
                    }}
                    onClose={() => setView(previousView)}
                    t={t}
                    onShowTutorial={() => setView('TUTORIAL')}
                />
            );
            case 'TUTORIAL': return (
                <TutorialScreen
                    onBack={() => setView('DASHBOARD')}
                    content={translations[language].tutorial}
                />
            );
            default: return <LoginScreen onLogin={handleLogin} t={t} />;
        }
    };

    return (
        <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
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
            <main className="flex-grow flex flex-col pb-16 md:pb-0 lg:overflow-y-auto">
                {renderContent()}
            </main>
            <Footer />
            {isAssistantOpen && (
                <AiAssistantModal 
                    topic={currentTopic}
                    onClose={() => setIsAssistantOpen(false)}
                    settings={settings}
                    t={t}
                    parseError={parseAndDisplayError}
                    onApplySuggestion={handleApplyAssistantSuggestion}
                    selectedSlideId={selectedSlideId}
                />
            )}
            {isCaptionModalOpen && (
                <CaptionModal
                    topic={currentTopic}
                    onClose={() => setIsCaptionModalOpen(false)}
                    isLoading={isGeneratingCaption}
                    caption={generatedCaption}
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
                    onShowTutorial={() => {
                        setIsSettingsOpen(false);
                        setView('TUTORIAL');
                    }}
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