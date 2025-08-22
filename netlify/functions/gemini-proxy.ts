// IMPORTANT: This function is designed for Netlify's Deno runtime, which supports URL imports.
// It directly imports dependencies from esm.sh.

import { GoogleGenAI, Type } from "https://esm.sh/@google/genai@^1.15.0";
// Assuming Netlify's build process can resolve this relative path to your existing types.
import type { DesignPreferences, SlideData, AppSettings, ContentNiche } from "../../types.ts"; 
import { DesignStyle } from "../../types.ts";

// TypeScript type definition for Deno, in case it's not globally available in the build environment.
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Define the expected JSON schemas for AI responses, same as the original service.
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

// --- Action Handlers ---

const handleGenerateCarouselContent = async (
    ai: GoogleGenAI,
    payload: { topic: string; niche: ContentNiche; preferences: DesignPreferences; settings: AppSettings }
) => {
    const { topic, niche, preferences, settings } = payload;
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
    return JSON.parse(jsonText);
};

const handleGenerateSlideImage = async (
    ai: GoogleGenAI,
    payload: { prompt: string; aspectRatio: string; settings: AppSettings }
) => {
    const { prompt, aspectRatio } = payload;
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
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
                    aspectRatio: aspectRatio as any,
                },
            });

            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } catch (error) {
            lastError = error;
            console.error(`Error generating image (attempt ${i + 1}/${maxRetries}):`, error);
            if (i < maxRetries - 1) {
                await sleep(1000 * (i + 1));
            }
        }
    }
    throw lastError || new Error("Image generation failed after multiple retries.");
};

const handleGetAiAssistance = async (
    ai: GoogleGenAI,
    payload: { topic: string; type: 'hook' | 'cta'; settings: AppSettings }
) => {
    const { topic, type, settings } = payload;
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
};


// --- Main Function Handler ---

export default async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
        });
    }

    try {
        const { action, payload } = await request.json();
        
        // Securely get the API key from Netlify's environment variables
        const apiKey = Deno.env.get("API_KEY");

        if (!apiKey) {
            console.error("API_KEY environment variable not set in Netlify.");
            throw new Error("Server configuration error: API key is missing.");
        }
        
        // Use the user's custom key if they provided one, otherwise use the default server key
        const effectiveApiKey = payload.settings?.apiKeyOption === 'custom' && payload.settings?.customApiKey
            ? payload.settings.customApiKey
            : apiKey;

        const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
        let result;

        switch (action) {
            case 'generateCarouselContent':
                result = await handleGenerateCarouselContent(ai, payload);
                break;
            case 'generateSlideImage':
                result = await handleGenerateSlideImage(ai, payload);
                break;
            case 'getAiAssistance':
                result = await handleGetAiAssistance(ai, payload);
                break;
            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Error in Netlify function:", error);
        return new Response(JSON.stringify({ error: error.message || 'An internal server error occurred.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};