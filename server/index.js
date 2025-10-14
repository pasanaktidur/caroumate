const express = require('express');
const { GoogleGenAI, Type, Modality } = require('@google/genai');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for potential image data

// --- Main Gemini AI Setup (for non-image tasks) ---
const mainApiKey = process.env.API_KEY;
if (!mainApiKey) {
    console.warn("WARNING: Main API_KEY not found in .env. Some functionalities might be limited if they rely on this key.");
}
const mainAi = new GoogleGenAI({ apiKey: mainApiKey });

// --- Secure Image Generation API Key Pool ---
const imageApiKeys = (process.env.IMAGE_API_KEYS || "").split(',').filter(Boolean);
if (imageApiKeys.length === 0) {
    console.error("FATAL ERROR: IMAGE_API_KEYS not found or empty in .env file. Image generation will fail. Please add at least one key.");
}
let currentImageApiKeyIndex = 0;


// --- API Endpoints ---

// 1. Generate Carousel Content
app.post('/api/generate-content', async (req, res) => {
    try {
        const { topic, niche, preferences, settings } = req.body;
        if (!topic || !niche || !preferences || !settings) {
            return res.status(400).json({ error: 'Missing required fields in request body.' });
        }

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
        
        const response = await mainAi.models.generateContent({
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
        res.json(JSON.parse(response.text.trim()));
    } catch (error) {
        console.error('Error in /api/generate-content:', error);
        res.status(500).json({ error: 'Failed to generate carousel content.', details: error.message });
    }
});

// 2. Generate Image (SECURE & ROTATED)
app.post('/api/generate-image', async (req, res) => {
    try {
        if (imageApiKeys.length === 0) {
             return res.status(500).json({ error: 'Image generation is not configured on the server. Missing IMAGE_API_KEYS in .env file.' });
        }
        
        // --- Key Rotation Logic ---
        const apiKeyToUse = imageApiKeys[currentImageApiKeyIndex];
        currentImageApiKeyIndex = (currentImageApiKeyIndex + 1) % imageApiKeys.length;
        
        const imageGenerationAi = new GoogleGenAI({ apiKey: apiKeyToUse });
        // --- End Key Rotation Logic ---


        const { prompt, aspectRatio } = req.body;
        if (!prompt || !aspectRatio) {
            return res.status(400).json({ error: 'Missing prompt or aspectRatio.' });
        }

        const response = await imageGenerationAi.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return res.json({ imageBase64: response.generatedImages[0].image.imageBytes });
        }
        
        console.warn('AI did not return a valid image', response);
        return res.status(500).json({ error: "AI did not return an image from your prompt." });

    } catch (error) {
        console.error('Error in /api/generate-image:', error);
        // Provide a more specific error message if the key is likely invalid
        if (error.message && error.message.toLowerCase().includes('api key not valid')) {
             return res.status(500).json({ error: 'An API key in the server\'s image generation pool is invalid.', details: error.message });
        }
        res.status(500).json({ error: 'Failed to generate image.', details: error.message });
    }
});

// 3. Get AI Assistance (Hooks/CTAs)
app.post('/api/get-assistance', async (req, res) => {
    try {
        const { topic, type, settings } = req.body; // type is 'hook' or 'cta'
        if (!topic || !type || !settings) {
            return res.status(400).json({ error: 'Missing topic, type, or settings.' });
        }

        const prompt = type === 'hook'
            ? `Generate 5 short, catchy, and scroll-stopping hook ideas for a social media carousel about "${topic}".`
            : `Generate 5 clear and compelling call-to-action (CTA) ideas for the final slide of a social media carousel about "${topic}".`;
        
        const response = await mainAi.models.generateContent({
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
        res.json(JSON.parse(response.text.trim()));
    } catch (error) {
        console.error('Error in /api/get-assistance:', error);
        res.status(500).json({ error: 'Failed to get AI assistance.', details: error.message });
    }
});

// 4. Generate Caption from Carousel
app.post('/api/generate-caption', async (req, res) => {
    try {
        const { carousel, settings } = req.body;
        if (!carousel || !settings) {
            return res.status(400).json({ error: 'Missing carousel or settings.' });
        }

        const carouselContent = carousel.slides.map((s, i) => `Slide ${i+1}: Headline: ${s.headline}, Body: ${s.body}`).join('\n');
        const prompt = `You are an expert social media manager. Based on the following carousel content, write an engaging and compelling caption for a social media post (like Instagram or LinkedIn). The caption should summarize the key points and encourage engagement (e.g., asking a question). After the main caption, add a blank line, and then provide exactly 3 relevant, viral hashtags on a new line.\n\nCarousel Content:\n${carouselContent}`;
        
        const response = await mainAi.models.generateContent({
            model: settings.aiModel,
            contents: prompt,
            config: {
                systemInstruction: settings.systemPrompt,
            },
        });

        const text = response.text;
        if (!text) {
            return res.status(500).json({ error: 'AI returned an empty response for caption generation.', details: response });
        }

        res.json({ caption: text.trim() });
    } catch (error) {
        console.error('Error in /api/generate-caption:', error);
        res.status(500).json({ error: 'Failed to generate caption.', details: error.message });
    }
});

// 5. Regenerate Slide Content
app.post('/api/regenerate-slide', async (req, res) => {
    try {
        const { topic, slide, partToRegenerate, settings } = req.body;
        if (!topic || !slide || !partToRegenerate || !settings) {
            return res.status(400).json({ error: 'Missing required fields for regeneration.' });
        }
        
        const prompt = `The overall carousel topic is "${topic}". For a specific slide with the current headline "${slide.headline}" and body "${slide.body}", I need you to regenerate ONLY the ${partToRegenerate}. Provide a new, improved, and concise version of just that part. Return only the new text.`;

        const response = await mainAi.models.generateContent({
            model: settings.aiModel,
            contents: prompt,
        });
        
        const text = response.text;
        if (!text) {
            return res.status(500).json({ error: 'AI returned an empty response for slide regeneration.', details: response });
        }

        res.json({ newText: text.trim().replace(/^"|"$/g, '') }); // Also remove quotes if AI adds them
    } catch (error) {
        console.error('Error in /api/regenerate-slide:', error);
        res.status(500).json({ error: 'Failed to regenerate slide content.', details: error.message });
    }
});

// 6. Generate Thread from Carousel
app.post('/api/generate-thread', async (req, res) => {
    try {
        const { carousel, settings } = req.body;
        if (!carousel || !settings) {
            return res.status(400).json({ error: 'Missing carousel or settings.' });
        }

        const carouselContent = carousel.slides.map((s, i) => `Slide ${i+1}:\nHeadline: ${s.headline}\nBody: ${s.body}`).join('\n\n');
        const prompt = `You are an expert social media manager. Convert the following carousel content into a single, cohesive social media thread (like for Threads or X). Your response must be a single block of text. Use emojis to add personality. Combine related ideas smoothly and add natural transitions between posts. Each post in the thread should be clearly numbered (e.g., 1/5, 2/5). Start with a strong hook that makes people want to read more.\n\nCarousel Content to Convert:\n${carouselContent}`;
        
        const response = await mainAi.models.generateContent({
            model: settings.aiModel,
            contents: prompt,
        });

        const text = response.text;
        if (!text) {
            return res.status(500).json({ error: 'AI returned an empty response for thread generation.', details: response });
        }

        res.json({ thread: text.trim() });
    } catch (error) {
        console.error('Error in /api/generate-thread:', error);
        res.status(500).json({ error: 'Failed to generate thread.', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`CarouMate backend server listening on http://localhost:${port}`);
    if (imageApiKeys.length > 0) {
        console.log(`Successfully loaded ${imageApiKeys.length} API key(s) for image generation.`);
    } else {
        console.log('WARNING: No API keys for image generation were found. Please create a .env file in this directory with your IMAGE_API_KEYS.');
    }
});