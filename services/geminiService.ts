import type { DesignPreferences, SlideData, AppSettings, ContentNiche } from '../types';

// Helper function to call our Netlify API proxy
const callApiProxy = async (action: string, payload: object) => {
    // The '/api/' path is automatically routed by Netlify to our serverless function
    const response = await fetch('/api/gemini-proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload }),
    });

    const result = await response.json();

    if (!response.ok) {
        console.error("Error from API proxy:", result);
        throw new Error(result.error || 'An error occurred while communicating with the server.');
    }

    return result;
};


export const generateCarouselContent = async (
    topic: string,
    niche: ContentNiche,
    preferences: DesignPreferences,
    settings: AppSettings,
): Promise<Omit<SlideData, 'id'>[]> => {
    // The API key is now handled server-side.
    // We just pass the relevant data to the proxy.
    return callApiProxy('generateCarouselContent', { topic, niche, preferences, settings });
};

export const generateSlideImage = async (prompt: string, aspectRatio: string, settings: AppSettings): Promise<string> => {
    // API key is handled server-side
    return callApiProxy('generateSlideImage', { prompt, aspectRatio, settings });
};

export const getAiAssistance = async (topic: string, type: 'hook' | 'cta', settings: AppSettings): Promise<string[]> => {
    // API key is handled server-side
    return callApiProxy('getAiAssistance', { topic, type, settings });
};
