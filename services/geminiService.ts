import { GoogleGenAI, Type } from '@google/genai';
import type { DesignPreferences, SlideData, AppSettings, AspectRatio, Carousel } from '../types';

// --- Service Functions (Direct to Gemini API) ---

export const generateCarouselContent = async (
    topic: string,
    niche: string,
    preferences: DesignPreferences,
    settings: AppSettings,
): Promise<Omit<SlideData, 'id'>[]> => {
    if (!settings.apiKey) {
        throw new Error("API Key is not configured.");
    }
    const ai = new GoogleGenAI({ apiKey: settings.apiKey });

    const slideSchema = {
        type: Type.OBJECT,
        properties: {
            headline: { type: Type.STRING },
            body: { type: Type.STRING },
            visual_prompt: { type: Type.STRING, description: "A creative, descriptive prompt for an AI image generator (e.g., DALL-E, Midjourney) to create a visual for this slide. Should be in English." },
        },
        required: ['headline', 'body', 'visual_prompt']
    };

    const prompt = `Create a social media carousel content plan. The main topic is "${topic}". The target audience or niche is "${niche}". The desired content style is "${preferences.style}". Generate between 5 to 7 slides. Each slide must have a 'headline', a 'body', and a 'visual_prompt'. The first slide must be a very strong hook to grab attention. The last slide must be a clear call to action. The tone should be engaging, informative, and tailored to the niche.`;

    const response = await ai.models.generateContent({
        model: settings.aiModel,
        contents: prompt,
        config: {
            systemInstruction: settings.systemPrompt,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: slideSchema
            },
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON response from AI:", response.text);
        throw new Error("AI returned invalid content format.");
    }
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio, settings: AppSettings): Promise<string> => {
    if (!settings.apiKey) {
        throw new Error("API Key is not configured.");
    }
    const ai = new GoogleGenAI({ apiKey: settings.apiKey });

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const imageBase64 = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${imageBase64}`;
    }
    
    throw new Error("AI did not return an image from your prompt.");
};

export const getAiAssistance = async (topic: string, type: 'hook' | 'cta', settings: AppSettings): Promise<string[]> => {
    if (!settings.apiKey) {
        throw new Error("API Key is not configured.");
    }
    const ai = new GoogleGenAI({ apiKey: settings.apiKey });

    const prompt = type === 'hook'
        ? `Generate 5 short, catchy, and scroll-stopping hook ideas for a social media carousel about "${topic}".`
        : `Generate 5 clear and compelling call-to-action (CTA) ideas for the final slide of a social media carousel about "${topic}".`;

    const response = await ai.models.generateContent({
        model: settings.aiModel,
        contents: prompt,
        config: {
            systemInstruction: settings.systemPrompt,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
        },
    });
    
    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON response from AI:", response.text);
        throw new Error("AI returned invalid content format.");
    }
};

export const generateCaption = async (carousel: Carousel, settings: AppSettings): Promise<string> => {
    if (!settings.apiKey) {
        throw new Error("API Key is not configured.");
    }
    const ai = new GoogleGenAI({ apiKey: settings.apiKey });

    const carouselContent = carousel.slides.map((s, i) => `Slide ${i+1}: Headline: ${s.headline}, Body: ${s.body}`).join('\n');
    const prompt = `You are an expert social media manager. Based on the following carousel content, write an engaging and compelling caption for a social media post (like Instagram or LinkedIn). The caption should summarize the key points and encourage engagement (e.g., asking a question). After the main caption, add a blank line, and then provide exactly 3 relevant, viral hashtags on a new line.\n\nCarousel Content:\n${carouselContent}`;

    const response = await ai.models.generateContent({
        model: settings.aiModel,
        contents: prompt,
        config: {
            systemInstruction: settings.systemPrompt,
        },
    });

    const text = response.text;
    if (!text) {
        throw new Error('AI returned an empty response for caption generation.');
    }
    return text.trim();
};

export const regenerateSlideContent = async (topic: string, slide: SlideData, partToRegenerate: 'headline' | 'body', settings: AppSettings): Promise<string> => {
    if (!settings.apiKey) {
        throw new Error("API Key is not configured.");
    }
    const ai = new GoogleGenAI({ apiKey: settings.apiKey });

    const prompt = `The overall carousel topic is "${topic}". For a specific slide with the current headline "${slide.headline}" and body "${slide.body}", I need you to regenerate ONLY the ${partToRegenerate}. Provide a new, improved, and concise version of just that part. Return only the new text.`;

    const response = await ai.models.generateContent({
        model: settings.aiModel,
        contents: prompt,
    });
    
    const text = response.text;
    if (!text) {
        throw new Error('AI returned an empty response for slide regeneration.');
    }
    return text.trim().replace(/^"|"$/g, ''); // Also remove quotes if AI adds them
};

export const generateThreadFromCarousel = async (carousel: Carousel, settings: AppSettings): Promise<string> => {
    if (!settings.apiKey) {
        throw new Error("API Key is not configured.");
    }
    const ai = new GoogleGenAI({ apiKey: settings.apiKey });
    
    const carouselContent = carousel.slides.map((s, i) => `Slide ${i+1}:\nHeadline: ${s.headline}\nBody: ${s.body}`).join('\n\n');
    const prompt = `You are an expert social media manager. Convert the following carousel content into a single, cohesive social media thread (like for Threads or X). Your response must be a single block of text. Use emojis to add personality. Combine related ideas smoothly and add natural transitions between posts. Each post in the thread should be clearly numbered (e.g., 1/5, 2/5). Start with a strong hook that makes people want to read more.\n\nCarousel Content to Convert:\n${carouselContent}`;
    
    const response = await ai.models.generateContent({
        model: settings.aiModel,
        contents: prompt,
    });

    const text = response.text;
    if (!text) {
        throw new Error('AI returned an empty response for thread generation.');
    }
    return text.trim();
};