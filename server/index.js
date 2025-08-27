const express = require('express');
const { GoogleGenAI, Type } = require('@google/genai');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for potential image data

// --- Gemini AI Setup ---
const apiKey = process.env.API_KEY;
if (!apiKey) {
    console.error("FATAL ERROR: API_KEY not found in environment variables. Please create a .env file in the /server directory with your key.");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });

// --- API Endpoints ---

// Helper to handle AI API calls and error responses
async function callGenerativeModel(res, model, params) {
    try {
        const response = await ai.models.generateContent({ model, ...params });
        const text = response.text;

        if (!text) {
            console.warn('AI returned an empty text response.', { model, params, response });
            return res.status(500).json({
                error: 'The AI returned an empty response. This might be due to safety filters or an issue with the prompt.',
                details: response.candidates?.[0]?.finishReason,
            });
        }
        
        // For JSON responses, parse it before sending
        if (params.config?.responseMimeType === 'application/json') {
             res.json(JSON.parse(text.trim()));
        } else {
             res.json({ text: text.trim() });
        }
    } catch (error) {
        console.error(`Error calling Google AI for model ${model}:`, error);
        res.status(500).json({ error: `Failed to generate response from AI model ${model}.`, details: error.message });
    }
}


// 1. Generate Carousel Content
app.post('/api/generate-content', async (req, res) => {
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
    res.json(JSON.parse(response.text.trim()));
});

// 2. Generate Image
app.post('/api/generate-image', async (req, res) => {
    try {
        const { prompt, aspectRatio } = req.body;
        if (!prompt || !aspectRatio) {
            return res.status(400).json({ error: 'Missing prompt or aspectRatio.' });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [{ text: `${prompt}. Generate the image in a ${aspectRatio} aspect ratio.` }],
            },
            config: {
                responseModalities: ['IMAGE', 'TEXT'],
            },
        });
        
        const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);

        if (!imagePart || !imagePart.inlineData.data) {
            console.warn('AI did not return a valid image part', response);
            return res.status(500).json({ error: "AI did not return an image from your prompt.", details: response.candidates?.[0]?.finishReason });
        }

        res.json({ imageBase64: imagePart.inlineData.data });

    } catch (error) {
        console.error('Error in /api/generate-image:', error);
        res.status(500).json({ error: 'Failed to generate image.', details: error.message });
    }
});

// 3. Get AI Assistance (Hooks/CTAs)
app.post('/api/get-assistance', async (req, res) => {
    const { topic, type, settings } = req.body; // type is 'hook' or 'cta'
    if (!topic || !type || !settings) {
        return res.status(400).json({ error: 'Missing topic, type, or settings.' });
    }

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
    res.json(JSON.parse(response.text.trim()));
});

// 4. Generate Hashtags
app.post('/api/generate-hashtags', async (req, res) => {
    const { topic, settings } = req.body;
    if (!topic || !settings) {
        return res.status(400).json({ error: 'Missing topic or settings.' });
    }

    const prompt = `Generate a list of 20 relevant and effective social media hashtags for a post about "${topic}". Include a mix of broad, niche, and community-specific hashtags. Do not include the '#' symbol in your response.`;
    
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
    res.json(JSON.parse(response.text.trim()));
});

// 5. Regenerate Slide Content
app.post('/api/regenerate-slide', async (req, res) => {
    const { topic, slide, partToRegenerate, settings } = req.body;
    if (!topic || !slide || !partToRegenerate || !settings) {
        return res.status(400).json({ error: 'Missing required fields for regeneration.' });
    }
    
    const prompt = `The overall carousel topic is "${topic}". For a specific slide with the current headline "${slide.headline}" and body "${slide.body}", I need you to regenerate ONLY the ${partToRegenerate}. Provide a new, improved, and concise version of just that part. Return only the new text.`;

    const response = await ai.models.generateContent({
        model: settings.aiModel,
        contents: prompt,
    });
    
    const text = response.text;
    if (!text) {
        return res.status(500).json({ error: 'AI returned an empty response for slide regeneration.', details: response });
    }

    res.json({ newText: text.trim().replace(/^"|"$/g, '') }); // Also remove quotes if AI adds them
});

// 6. Generate Thread from Carousel
app.post('/api/generate-thread', async (req, res) => {
    const { carousel, settings } = req.body;
    if (!carousel || !settings) {
        return res.status(400).json({ error: 'Missing carousel or settings.' });
    }

    const carouselContent = carousel.slides.map((s, i) => `Slide ${i+1}:\nHeadline: ${s.headline}\nBody: ${s.body}`).join('\n\n');
    const prompt = `You are an expert social media manager. Convert the following carousel content into a single, cohesive social media thread (like for Threads or X). Your response must be a single block of text. Use emojis to add personality. Combine related ideas smoothly and add natural transitions between posts. Each post in the thread should be clearly numbered (e.g., 1/5, 2/5). Start with a strong hook that makes people want to read more.\n\nCarousel Content to Convert:\n${carouselContent}`;
    
    const response = await ai.models.generateContent({
        model: settings.aiModel,
        contents: prompt,
    });

    const text = response.text;
    if (!text) {
        return res.status(500).json({ error: 'AI returned an empty response for thread generation.', details: response });
    }

    res.json({ thread: text.trim() });
});

app.listen(port, () => {
    console.log(`CarouMate backend server listening on http://localhost:${port}`);
    console.log('Ensure you have a .env file in this directory with your API_KEY.');
});