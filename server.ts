import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json({ limit: '10mb' }));

// Health and AI status check (Zero key exposure)
app.get('/api/gemini/status', (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    available: hasKey,
    mode: hasKey ? 'cloud_automated' : 'local_synthesizer',
    message: hasKey 
      ? 'کلید Gemini به‌صورت کاملاً امن و ابری بارگذاری شده است.'
      : 'کلید ابری یافت نشد؛ موتور هوشمند محلی کوره فعال است.'
  });
});

// Automated server-side proxy for Gemini AI (Completely secure, no client leaks)
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'کلید امنیتی سرور هنوز ست نشده است. سوئیچ به پردازش محلی انجام می‌شود.'
      });
    }

    const { prompt, existingManifest } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const systemPrompt = `You are the AI Forge Engine for TAVANA PRODUCT FORGE.
Generate or modify a valid, production-grade JSON SiteManifest for a 1-page high-converting, mobile-first website in Persian (Farsi).
CRITICAL RULES:
1. Return ONLY valid raw JSON matching the SiteManifest schema.
2. The schemaVersion must be 1.
3. Language must be "fa", rtl must be true.
4. Allowed block types: "hero", "features", "services", "gallery", "testimonials", "pricing", "faq", "contact", "about", "cta", "footer".
5. High quality Persian professional copywriting.`;

    const userMessage = existingManifest
      ? `Current SiteManifest:\n${JSON.stringify(existingManifest, null, 2)}\n\nApply this modification: "${prompt}". Return ONLY the updated JSON SiteManifest.`
      : `Generate a complete high-converting Persian website SiteManifest for: "${prompt}". Return ONLY the valid JSON SiteManifest.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] },
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const responseText = response.text || '';
    const cleanJson = responseText.trim().replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);

    return res.json({ success: true, manifest: parsed });
  } catch (error: any) {
    console.error('Gemini Server Proxy Error:', error);
    return res.status(500).json({ 
      error: error?.message || 'خطا در ارتباط امن با هوش مصنوعی سرور' 
    });
  }
});

// Vite middleware for dev or static serving for prod
if (!isProd) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true, port: Number(PORT), host: '0.0.0.0' },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running securely on port ${PORT}`);
});
