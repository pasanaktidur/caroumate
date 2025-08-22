import { GoogleGenAI, Type } from "@google/genai";
import type { DesignPreferences, SlideData, AppSettings, ContentNiche, AspectRatio } from '../types';

// Helper to get the Gemini API client
const getAiClient = (settings: AppSettings) => {
    // In a client-side only application, the API key must be provided by the user.
    const apiKey = settings.apiKey;

    if (!apiKey) {
        throw new Error("API key is not configured. Please go to Settings and enter your Google AI API key.");
    }
    
    return new GoogleGenAI({ apiKey });
};

export const generateCarouselContent = async (
    topic: string,
    niche: ContentNiche,
    preferences: DesignPreferences,
    settings: AppSettings,
): Promise<Omit<SlideData, 'id'>[]> => {
    try {
        const ai = getAiClient(settings);
        
        const slideSchema = {
            type: Type.OBJECT,
            properties: {
                headline: { type: Type.STRING, description: 'A catchy, short headline for the slide (max 10 words).' },
                body: { type: Type.STRING, description: 'The main content of the slide (2-3 sentences, max 40 words).' },
                visual_prompt: { type: Type.STRING, description: 'A detailed, descriptive prompt for an AI image generator to create a relevant background visual. Describe the scene, style, colors, and mood. E.g., "A vibrant, abstract painting of a brain with ideas flowing out as colorful streams, minimalist style."' }
            },
            required: ['headline', 'body', 'visual_prompt']
        };

        const prompt = `
            You are an expert social media content creator. Your task is to generate the content for an engaging Instagram carousel.
            The carousel is about: "${topic}".
            The target niche is: ${niche}.
            The desired style is: ${preferences.style}.

            Generate content for 5-7 slides.
            The first slide should be a strong hook to grab attention.
            The last slide should be a clear call to action (CTA).
            The slides in between should provide value, tips, or steps related to the topic.
            
            For each slide, provide a headline, body text, and a visual prompt for an AI image generator.
            The headline should be short and punchy.
            The body text should be concise and easy to read.
            The visual prompt should be descriptive to generate a beautiful and relevant image.
            
            Strictly follow the JSON schema provided.
        `;

        const response = await ai.models.generateContent({
            model: settings.aiModel,
            contents: prompt,
            config: {
                systemInstruction: settings.systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: slideSchema
                }
            }
        });
        
        const text = response.text;
        if (!text) {
            throw new Error("AI response was empty. The prompt may have been blocked for safety reasons. Please try a different topic.");
        }

        const jsonResponse = text.trim();
        const parsedSlides = JSON.parse(jsonResponse);
        
        if (!Array.isArray(parsedSlides)) {
            throw new Error("AI response was not in the expected array format.");
        }

        return parsedSlides;
    } catch (error) {
        console.error("Error generating carousel content:", error);
        // Re-throw the specific error from getAiClient or a generic one for other issues.
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to generate carousel content from AI. Please check your prompt and API key.");
    }
};

export const generateSlideImage = async (prompt: string, aspectRatio: string, settings: AppSettings): Promise<string> => {
    try {
        const ai = getAiClient(settings);
        
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: `Create a visually stunning image for a social media carousel slide. The style should be modern and engaging. Prompt: "${prompt}"`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: aspectRatio as "1:1" | "3:4" | "9:16",
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("AI did not return any images.");
        }

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;

    } catch (error) {
        console.error("Error generating slide image:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to generate image. The model may have safety concerns with the prompt.");
    }
};

export const getAiAssistance = async (topic: string, type: 'hook' | 'cta', settings: AppSettings): Promise<string[]> => {
    try {
        const ai = getAiClient(settings);
        
        const promptType = type === 'hook' 
            ? 'engaging hooks (catchy opening titles)' 
            : 'strong calls to action (CTAs)';
        
        const prompt = `
            You are an expert social media copywriter.
            Brainstorm 5 creative and effective ${promptType} for an Instagram carousel about "${topic}".
            Each suggestion should be a single, complete sentence.
            Strictly follow the JSON schema provided.
        `;

        const response = await ai.models.generateContent({
            model: settings.aiModel,
            contents: prompt,
            config: {
                systemInstruction: settings.systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        
        const text = response.text;
        if (!text) {
            throw new Error("AI assistance response was empty. Please try a different topic or rephrase.");
        }
        const jsonResponse = text.trim();
        const parsedSuggestions = JSON.parse(jsonResponse);

        if (!Array.isArray(parsedSuggestions)) {
            throw new Error("AI response was not in the expected array format.");
        }
        
        return parsedSuggestions;
    } catch (error) {
        console.error(`Error getting AI assistance for ${type}:`, error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(`Failed to get AI-powered ${type} suggestions.`);
    }
};