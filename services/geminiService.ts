import type { DesignPreferences, SlideData, AppSettings, AspectRatio, Carousel } from '../types';

// --- Helper function for backend calls ---

async function fetchFromBackend(endpoint: string, body: object, backendUrl?: string) {
    // Use the provided URL from settings, or a relative path as a fallback for proxy setups.
    // The endpoint should always start with a '/'
    const url = backendUrl ? `${backendUrl}${endpoint}` : endpoint;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        // Provide a more specific error for 404, which is common if the backend isn't running
        if (response.status === 404) {
            throw new Error(`Server endpoint not found at ${url}. Please ensure the backend server is running correctly and the Backend URL in Settings is correct.`);
        }
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
    return fetchFromBackend('/api/generate-content', { topic, niche, preferences, settings }, settings.backendUrl);
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio, settings: AppSettings): Promise<string> => {
    const data = await fetchFromBackend('/api/generate-image', { prompt, aspectRatio, settings }, settings.backendUrl);
    if (data.imageBase64) {
        return `data:image/png;base64,${data.imageBase64}`;
    }
    throw new Error("Backend did not return a valid image.");
};

export const getAiAssistance = async (topic: string, type: 'hook' | 'cta', settings: AppSettings): Promise<string[]> => {
    return fetchFromBackend('/api/get-assistance', { topic, type, settings }, settings.backendUrl);
};

export const generateCaption = async (carousel: Carousel, settings: AppSettings): Promise<string> => {
    const data = await fetchFromBackend('/api/generate-caption', { carousel, settings }, settings.backendUrl);
    return data.caption;
};

export const regenerateSlideContent = async (topic: string, slide: SlideData, partToRegenerate: 'headline' | 'body', settings: AppSettings): Promise<string> => {
    const data = await fetchFromBackend('/api/regenerate-slide', { topic, slide, partToRegenerate, settings }, settings.backendUrl);
    return data.newText;
};

export const generateThreadFromCarousel = async (carousel: Carousel, settings: AppSettings): Promise<string> => {
    const data = await fetchFromBackend('/api/generate-thread', { carousel, settings }, settings.backendUrl);
    return data.thread;
};