import { GoogleGenAI, Type } from "@google/genai";
import type { DesignPreferences, SlideData, AppSettings, ContentNiche, AspectRatio } from '../types';

// Helper to get the Gemini API client
const getAiClient = (settings: AppSettings) => {
    // In a client-side only application, the API key must be provided by the user.
    const apiKey = settings.apiKey;

    if (!apiKey) {
        throw new Error("Kunci API belum dikonfigurasi. Silakan buka Pengaturan dan masukkan kunci API Google AI Anda.");
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
            throw new Error("Respons AI kosong. Prompt mungkin diblokir karena alasan keamanan. Silakan coba topik yang berbeda.");
        }

        const jsonResponse = text.trim();
        const parsedSlides = JSON.parse(jsonResponse);
        
        if (!Array.isArray(parsedSlides)) {
            throw new Error("Respons AI tidak dalam format array yang diharapkan.");
        }

        return parsedSlides;
    } catch (error) {
        console.error("Error generating carousel content:", error);
        // Re-throw the specific error from getAiClient or a generic one for other issues.
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Gagal membuat konten carousel dari AI. Silakan periksa prompt dan kunci API Anda.");
    }
};

export const generateSlideImage = async (prompt: string, aspectRatio: string, settings: AppSettings): Promise<string> => {
    try {
        const ai = getAiClient(settings);

        // The Imagen API supports "3:4", which is the closest to Instagram's "4:5".
        // We'll generate a 3:4 image and let the UI crop it to 4:5 using object-cover.
        const apiAspectRatio = aspectRatio === '4:5' ? '3:4' : aspectRatio;
        
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: `Create a visually stunning image for a social media carousel slide. The style should be modern and engaging. Prompt: "${prompt}"`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: apiAspectRatio as "1:1" | "3:4" | "9:16",
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("AI tidak mengembalikan gambar apa pun.");
        }

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;

    } catch (error) {
        console.error("Error generating slide image:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Gagal membuat gambar. Model mungkin memiliki masalah keamanan dengan prompt.");
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
            throw new Error("Respons asisten AI kosong. Silakan coba topik lain atau ubah kalimat Anda.");
        }
        const jsonResponse = text.trim();
        const parsedSuggestions = JSON.parse(jsonResponse);

        if (!Array.isArray(parsedSuggestions)) {
            throw new Error("Respons AI tidak dalam format array yang diharapkan.");
        }
        
        return parsedSuggestions;
    } catch (error) {
        console.error(`Error getting AI assistance for ${type}:`, error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(`Gagal mendapatkan saran ${type} dari AI.`);
    }
};

export const generateHashtags = async (topic: string, settings: AppSettings): Promise<string[]> => {
    try {
        const ai = getAiClient(settings);

        const prompt = `
            You are a social media growth expert.
            Generate a list of 20-30 highly relevant and effective hashtags for an Instagram carousel about "${topic}".
            Include a mix of:
            - Broad, high-traffic hashtags (e.g., #digitalmarketing)
            - Niche-specific hashtags (e.g., #contentcreationtips)
            - Post-specific hashtags (e.g., #instagramgrowthhacks)

            Do not include the '#' symbol in your response.
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
            throw new Error("Respons hashtag AI kosong. Silakan coba topik yang berbeda.");
        }
        const jsonResponse = text.trim();
        const parsedHashtags = JSON.parse(jsonResponse);

        if (!Array.isArray(parsedHashtags)) {
            throw new Error("Respons AI tidak dalam format array yang diharapkan.");
        }

        return parsedHashtags;
    } catch (error) {
        console.error("Error generating hashtags:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Gagal membuat hashtag dari AI.");
    }
};