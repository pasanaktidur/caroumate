import type { DesignPreferences, SlideData, AppSettings, AspectRatio, Carousel } from '../types';

const BACKEND_URL = 'http://localhost:3001';

// --- Helper function for backend calls ---
async function fetchFromBackend(endpoint: string, body: object) {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        try {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed request to ${endpoint}`);
        } catch (e) {
            // If response is not JSON, throw a generic error
            throw new Error(`Server returned an error: ${response.status} ${response.statusText}`);
        }
    }

    return response.json();
}

// --- Service Functions (Frontend to Backend) ---

export const generateCarouselContent = async (
    topic: string,
    niche: string,
    preferences: DesignPreferences,
    settings: AppSettings,
): Promise<Omit<SlideData, 'id'>[]> => {
    return fetchFromBackend('/api/generate-content', { topic, niche, preferences, settings });
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    const data = await fetchFromBackend('/api/generate-image', { prompt, aspectRatio });
    if (data.imageBase64) {
        return `data:image/png;base64,${data.imageBase64}`;
    }
    throw new Error("Backend did not return a valid image.");
};

export const getAiAssistance = async (topic: string, type: 'hook' | 'cta', settings: AppSettings): Promise<string[]> => {
    return fetchFromBackend('/api/get-assistance', { topic, type, settings });
};

export const generateCaption = async (carousel: Carousel, settings: AppSettings): Promise<string> => {
    const data = await fetchFromBackend('/api/generate-caption', { carousel, settings });
    return data.caption;
};

export const regenerateSlideContent = async (topic: string, slide: SlideData, partToRegenerate: 'headline' | 'body', settings: AppSettings): Promise<string> => {
    const data = await fetchFromBackend('/api/regenerate-slide', { topic, slide, partToRegenerate, settings });
    return data.newText;
};

export const generateThreadFromCarousel = async (carousel: Carousel, settings: AppSettings): Promise<string> => {
    const data = await fetchFromBackend('/api/generate-thread', { carousel, settings });
    return data.thread;
};