
import { GoogleGenAI, Type } from "@google/genai";
import type { DesignPreferences, SlideData, AppSettings } from '../types';
import { ContentNiche, DesignStyle } from '../types';


const getAiClient = (apiKey: string) => {
    return new GoogleGenAI({ apiKey });
};


const slideSchema = {
    type: Type.OBJECT,
    properties: {
        headline: {
            type: Type.STRING,
            description: "A short, catchy headline for the slide (max 10 words)."
        },
        body: {
            type: Type.STRING,
            description: "Concise body text for the slide. Keep it brief, engaging, and easy to read (max 25 words)."
        },
        visual_prompt: {
            type: Type.STRING,
            description: "A detailed, descriptive prompt for an AI image generator to create a relevant visual for this slide. Describe the scene, style, colors, and composition."
        },
    },
    required: ["headline", "body", "visual_prompt"],
};

const carouselSchema = {
    type: Type.ARRAY,
    items: slideSchema,
};

export const generateCarouselContent = async (
    topic: string,
    niche: ContentNiche,
    preferences: DesignPreferences,
    settings: AppSettings,
): Promise<Omit<SlideData, 'id'>[]> => {
    const apiKey = settings.apiKeyOption === 'custom' && settings.customApiKey
        ? settings.customApiKey
        : process.env.API_KEY;

    if (!apiKey) {
        throw new Error("API key is not configured. Please set it in the settings or environment.");
    }
    const ai = getAiClient(apiKey);
    
    try {
        const prompt = `
            You are an expert social media content strategist. Your task is to create a compelling Instagram carousel.

            **Topic:** ${topic}
            **Content Niche:** ${niche}
            **Design Style:** ${preferences.style}. The visuals should reflect this style. For example, for '${DesignStyle.MINIMALIST}', suggest clean lines, negative space, and a simple color palette. For '${DesignStyle.BOLD}', suggest high contrast and strong typography.
            **Aspect Ratio:** ${preferences.aspectRatio}. Visual prompts should be suitable for this format.
            **Target Audience:** People interested in ${niche}.

            **Instructions:**
            1.  Generate a sequence of 5 to 7 slides for an Instagram carousel.
            2.  The first slide must be a strong hook to grab attention.
            3.  The middle slides should provide value, tips, or steps related to the topic.
            4.  The final slide must be a clear Call to Action (CTA), encouraging likes, shares, comments, or follows.
            5.  For each slide, provide a short headline, a concise body text, and a descriptive visual prompt for an AI image generator.
            6.  Ensure the text is broken down into easily digestible pieces, perfect for a fast-scrolling audience.
            7.  The tone should be engaging, informative, and tailored to the ${niche} audience.
            8.  When creating the visual_prompt, assume the text overlay could be light or dark, so create backgrounds with good contrast.

            Strictly adhere to the provided JSON schema for your response.
        `;

        const response = await ai.models.generateContent({
            model: settings.aiModel,
            contents: prompt,
            config: {
                systemInstruction: settings.systemPrompt || undefined,
                responseMimeType: "application/json",
                responseSchema: carouselSchema,
                temperature: 0.8,
                topP: 0.95,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        if (!Array.isArray(parsedData)) {
            throw new Error("AI response is not an array.");
        }
        
        return parsedData;

    } catch (error) {
        console.error("Error generating carousel content:", error);
        throw new Error("Failed to generate carousel content. Please try again.");
    }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateSlideImage = async (prompt: string, aspectRatio: '1:1' | '3:4' | '9:16' | string, settings: AppSettings): Promise<string> => {
    const apiKey = settings.apiKeyOption === 'custom' && settings.customApiKey
        ? settings.customApiKey
        : process.env.API_KEY;

    if (!apiKey) {
        throw new Error("API key is not configured. Please set it in the settings or environment.");
    }
    const ai = getAiClient(apiKey);
    
    const maxRetries = 3;
    let lastError: any = null;

    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: `${prompt}, high quality, vibrant, social media post`,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: aspectRatio,
                },
            });

            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } catch (error) {
            lastError = error;
            console.error(`Error generating image (attempt ${i + 1}/${maxRetries}):`, error);
            if (i < maxRetries - 1) {
                // Wait before retrying (exponential backoff)
                await sleep(1000 * (i + 1));
            }
        }
    }

    // If all retries fail, throw the last captured error.
    console.error("All retries failed for image generation.");
    throw lastError || new Error("Image generation failed after multiple retries.");
};


export const getAiAssistance = async (topic: string, type: 'hook' | 'cta', settings: AppSettings): Promise<string[]> => {
     const apiKey = settings.apiKeyOption === 'custom' && settings.customApiKey
        ? settings.customApiKey
        : process.env.API_KEY;

    if (!apiKey) {
        throw new Error("API key is not configured. Please set it in the settings or environment.");
    }
    const ai = getAiClient(apiKey);
    
    try {
        const prompt = type === 'hook'
            ? `Brainstorm 5 alternative, scroll-stopping hooks for an Instagram carousel about "${topic}". They should be short, intriguing, and make someone want to swipe. List them as an array of strings.`
            : `Brainstorm 5 powerful and effective Call to Actions (CTAs) for an Instagram carousel about "${topic}". CTAs should encourage engagement (likes, comments, shares, saves, follows). List them as an array of strings.`;

        const response = await ai.models.generateContent({
            model: settings.aiModel,
            contents: prompt,
            config: {
                systemInstruction: settings.systemPrompt || undefined,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                },
                temperature: 0.9,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error(`Error getting AI assistance for ${type}:`, error);
        return [`Failed to get ${type} suggestions. Please try again.`];
    }
};