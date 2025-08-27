import { GoogleGenAI, Type } from "@google/genai";
import type { DesignPreferences, SlideData, AppSettings, AspectRatio, Carousel } from '../types';

// --- Backend Communication ---
const BACKEND_URL = 'http://localhost:3001';

async function postToServer<T>(endpoint: string, body: object): Promise<T> {
    try {
        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server responded with status: ${response.status}`);
        }
        return await response.json() as T;
    } catch (error) {
        console.error(`Network or fetch error at ${endpoint}:`, error);
        if (error instanceof Error) {
            throw new Error(`Failed to connect to the server: ${error.message}`);
        }
        throw new Error('An unknown network error occurred.');
    }
}

// --- Frontend AI Client ---
const getAiClient = (apiKey: string) => {
    if (!apiKey) {
        throw new Error("Custom API Key is not configured. Please add it in the settings.");
    }
    return new GoogleGenAI({ apiKey });
};

// --- Hybrid Service Functions ---

export const generateCarouselContent = async (
    topic: string,
    niche: string,
    preferences: DesignPreferences,
    settings: AppSettings,
): Promise<Omit<SlideData, 'id'>[]> => {
    if (settings.apiKeySource === 'custom') {
        const ai = getAiClient(settings.apiKey);
        const slideSchema = {
            type: Type.OBJECT,
            properties: {
                headline: { type: Type.STRING },
                body: { type: Type.STRING },
                visual_prompt: { type: Type.STRING, description: "A creative, descriptive prompt for an AI image generator to create a visual for this slide. Should be in English." },
            },
            required: ['headline', 'body', 'visual_prompt']
        };
        const prompt = `Create a social media carousel content plan. The main topic is "${topic}". The target audience or niche is "${niche}". The desired content style is "${preferences.style}". Generate between 5 to 7 slides. Each slide must have a 'headline', a 'body', and a 'visual_prompt'. The first slide must be a very strong hook. The last slide must be a clear call to action.`;
        
        const response = await ai.models.generateContent({
            model: settings.aiModel,
            contents: prompt,
            config: {
                systemInstruction: settings.systemPrompt,
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: slideSchema },
            },
        });
        const json = JSON.parse(response.text.trim());
        return json;
    } else {
        return postToServer<Omit<SlideData, 'id'>[]>('/api/generate-content', { topic, niche, preferences, settings });
    }
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio, settings: AppSettings): Promise<string> => {
    if (settings.apiKeySource === 'custom') {
        const ai = getAiClient(settings.apiKey);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [{ text: `${prompt}. Generate the image in a ${aspectRatio} aspect ratio.` }]
            },
            config: {
                responseModalities: ['IMAGE', 'TEXT'],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error("AI did not return an image from your prompt.");
    } else {
        const response = await postToServer<{ imageBase64: string }>('/api/generate-image', { prompt, aspectRatio });
        return `data:image/png;base64,${response.imageBase64}`;
    }
};

export const getAiAssistance = async (topic: string, type: 'hook' | 'cta', settings: AppSettings): Promise<string[]> => {
     if (settings.apiKeySource === 'custom') {
        const ai = getAiClient(settings.apiKey);
        const prompt = type === 'hook'
            ? `Generate 5 short, catchy hook ideas for a social media carousel about "${topic}".`
            : `Generate 5 clear call-to-action (CTA) ideas for a carousel about "${topic}".`;
        
        const response = await ai.models.generateContent({
            model: settings.aiModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
        });
        return JSON.parse(response.text.trim());
    } else {
        return postToServer<string[]>('/api/get-assistance', { topic, type, settings });
    }
};

export const generateHashtags = async (topic: string, settings: AppSettings): Promise<string[]> => {
    if (settings.apiKeySource === 'custom') {
        const ai = getAiClient(settings.apiKey);
        const prompt = `Generate a list of 20 relevant hashtags for a post about "${topic}". Do not include the '#' symbol.`;
        const response = await ai.models.generateContent({
            model: settings.aiModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
        });
        return JSON.parse(response.text.trim());
    } else {
        return postToServer<string[]>('/api/generate-hashtags', { topic, settings });
    }
};

export const regenerateSlideContent = async (topic: string, slide: SlideData, partToRegenerate: 'headline' | 'body', settings: AppSettings): Promise<string> => {
    if (settings.apiKeySource === 'custom') {
        const ai = getAiClient(settings.apiKey);
        const prompt = `The carousel topic is "${topic}". For a slide with headline "${slide.headline}" and body "${slide.body}", regenerate ONLY the ${partToRegenerate}. Provide a new, improved, and concise version. Return only the new text.`;
        const response = await ai.models.generateContent({ model: settings.aiModel, contents: prompt });
        return response.text.trim().replace(/^"|"$/g, '');
    } else {
        const response = await postToServer<{ newText: string }>('/api/regenerate-slide', { topic, slide, partToRegenerate, settings });
        return response.newText;
    }
};

export const generateThreadFromCarousel = async (carousel: Carousel, settings: AppSettings): Promise<string> => {
     if (settings.apiKeySource === 'custom') {
        const ai = getAiClient(settings.apiKey);
        const carouselContent = carousel.slides.map((s, i) => `Slide ${i+1}: Headline: ${s.headline}, Body: ${s.body}`).join('\n\n');
        const prompt = `Convert the following carousel content into a single, cohesive social media thread (like for Threads or X). Your response must be a single block of text. Use emojis. Combine ideas and add transitions. Number each post (e.g., 1/5, 2/5). Start with a strong hook.\n\nContent:\n${carouselContent}`;
        const response = await ai.models.generateContent({ model: settings.aiModel, contents: prompt });
        return response.text.trim();
    } else {
        const response = await postToServer<{ thread: string }>('/api/generate-thread', { carousel, settings });
        return response.thread;
    }
};