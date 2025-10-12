import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { DesignPreferences, SlideData, AppSettings, AspectRatio, Carousel } from '../types';

// --- Frontend AI Client ---
const getAiClient = (apiKey: string) => {
    if (!apiKey) {
        throw new Error("API Key is not configured. Please add your Google AI API Key in the settings.");
    }
    return new GoogleGenAI({ apiKey });
};

// --- Service Functions (Frontend Only) ---

export const generateCarouselContent = async (
    topic: string,
    niche: string,
    preferences: DesignPreferences,
    settings: AppSettings,
): Promise<Omit<SlideData, 'id'>[]> => {
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
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio, settings: AppSettings): Promise<string> => {
    const ai = getAiClient(settings.apiKey);

    const fullPrompt = `${prompt}. The image should have an aspect ratio of ${aspectRatio}.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: fullPrompt }]
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT], // Must include both Modality.IMAGE and Modality.TEXT
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
    }

    throw new Error("AI did not return an image from your prompt.");
};

export const getAiAssistance = async (topic: string, type: 'hook' | 'cta', settings: AppSettings): Promise<string[]> => {
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
};

export const generateHashtags = async (topic: string, settings: AppSettings): Promise<string[]> => {
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
};

export const regenerateSlideContent = async (topic: string, slide: SlideData, partToRegenerate: 'headline' | 'body', settings: AppSettings): Promise<string> => {
    const ai = getAiClient(settings.apiKey);
    const prompt = `The carousel topic is "${topic}". For a slide with headline "${slide.headline}" and body "${slide.body}", regenerate ONLY the ${partToRegenerate}. Provide a new, improved, and concise version. Return only the new text.`;
    const response = await ai.models.generateContent({ model: settings.aiModel, contents: prompt });
    return response.text.trim().replace(/^"|"$/g, '');
};

export const generateThreadFromCarousel = async (carousel: Carousel, settings: AppSettings): Promise<string> => {
    const ai = getAiClient(settings.apiKey);
    const carouselContent = carousel.slides.map((s, i) => `Slide ${i+1}: Headline: ${s.headline}, Body: ${s.body}`).join('\n\n');
    const prompt = `Convert the following carousel content into a single, cohesive social media thread (like for Threads or X). Your response must be a single block of text. Use emojis. Combine ideas and add transitions. Number each post (e.g., 1/5, 2/5). Start with a strong hook.\n\nContent:\n${carouselContent}`;
    const response = await ai.models.generateContent({ model: settings.aiModel, contents: prompt });
    return response.text.trim();
};