import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI client (Server-Side only)
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
};

// API Route: AI Contract Obligation Extraction
app.post('/api/extract-obligations', async (req, res) => {
  try {
    const { contractText, fileName, category } = req.body;

    if (!contractText || typeof contractText !== 'string' || contractText.trim().length === 0) {
      return res.status(400).json({ error: 'Contract text is required for AI extraction.' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please configure your API key in Secrets.',
        code: 'MISSING_API_KEY'
      });
    }

    const prompt = `You are an expert enterprise legal counsel and contract operations AI specializing in extracting legally binding obligations.
Read the following contract text carefully and extract EVERY obligation actually written in it.

STRICT EXTRACTION RULES:
1. Never invent obligations, parties, dates, or amounts. Ground EVERY obligation in an exact source_quote from the text.
2. If something is ambiguous, conditional, or unclear, assign a confidence score under 0.70 so it can be flagged as "Needs review".
3. Return obligations in the exact JSON schema requested.
4. For risk_level:
   - 'high': Penalties, auto-renewal with short notice, uncapped liability, non-compete, or severe damages.
   - 'medium': Reporting requirements, standard SLAs, quarterly milestones.
   - 'low': Routine payment notices, standard business hour notices.
5. Provide a realistic suggested_task with owner role and priority.

Contract Name: ${fileName || 'Uploaded Agreement'}
Contract Category: ${category || 'General Agreement'}

Contract Text:
"""
${contractText.slice(0, 50000)}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            contractTitle: { type: Type.STRING },
            counterparty: { type: Type.STRING },
            obligations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  clause_reference: { type: Type.STRING },
                  source_quote: { type: Type.STRING },
                  obligated_party: { type: Type.STRING },
                  beneficiary_party: { type: Type.STRING },
                  obligation_summary: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    enum: [
                      'payment',
                      'delivery',
                      'reporting',
                      'confidentiality',
                      'compliance',
                      'termination',
                      'renewal',
                      'SLA',
                      'other'
                    ]
                  },
                  deadline: { type: Type.STRING },
                  normalized_due_date: { type: Type.STRING, nullable: true },
                  recurrence: {
                    type: Type.STRING,
                    enum: ['one-time', 'monthly', 'quarterly', 'annual'],
                    nullable: true
                  },
                  amount: { type: Type.NUMBER, nullable: true },
                  currency: { type: Type.STRING, nullable: true },
                  risk_level: {
                    type: Type.STRING,
                    enum: ['low', 'medium', 'high']
                  },
                  risk_reason: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  suggested_task: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      suggested_owner_role: { type: Type.STRING },
                      suggested_due_date: { type: Type.STRING },
                      priority: {
                        type: Type.STRING,
                        enum: ['low', 'medium', 'high', 'critical']
                      }
                    },
                    required: ['title', 'description', 'suggested_owner_role', 'suggested_due_date', 'priority']
                  }
                },
                required: [
                  'clause_reference',
                  'source_quote',
                  'obligated_party',
                  'beneficiary_party',
                  'obligation_summary',
                  'type',
                  'deadline',
                  'risk_level',
                  'risk_reason',
                  'confidence',
                  'suggested_task'
                ]
              }
            }
          },
          required: ['obligations']
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response received from Gemini AI model.');
    }

    const parsedData = JSON.parse(responseText);
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error during AI obligation extraction:', error);
    return res.status(500).json({
      error: error.message || 'Failed to extract obligations from contract.',
      details: error.toString()
    });
  }
});

// Mount Vite or serve static
const startServer = async () => {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
