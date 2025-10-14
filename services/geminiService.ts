import type { DesignPreferences, SlideData, AppSettings, AspectRatio, Carousel } from '../types';

// --- Helper function for backend calls ---

// Determine backend URL based on environment
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

// If developing locally, point to the backend server. Otherwise, use a relative path.
const BACKEND_URL = isLocalhost ? 'http://localhost:3001' : '';

async function fetchFromBackend(endpoint: string, body: object) {
    const url = `${BACKEND_URL}${endpoint}`;
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
            throw new Error(`Server endpoint not found at ${url}. Please ensure the backend server is running correctly.`);
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