import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';
import { Type } from '@google/genai';

export const dynamic = 'force-dynamic';


function computeFallbackAnalysis(title: string, description: string, itemType: string) {
  const fullText = `${title || ''} ${description || ''}`.toLowerCase();

  let category = 'Other';
  if (/wallet|bag|backpack|purse|clutch/i.test(fullText)) category = 'Wallets & Bags';
  else if (/phone|iphone|laptop|macbook|ipad|airpod|charger|tablet|headphone|camera/i.test(fullText)) category = 'Electronics';
  else if (/id|card|passport|license|badge/i.test(fullText)) category = 'ID Cards & Documents';
  else if (/key|fob|lanyard/i.test(fullText)) category = 'Keys';
  else if (/watch|ring|necklace|bracelet|earring/i.test(fullText)) category = 'Jewelry & Watches';
  else if (/jacket|coat|hoodie|hat|scarf|glasses|sunglasses/i.test(fullText)) category = 'Clothing & Accessories';
  else if (/dog|cat|pet/i.test(fullText)) category = 'Pets';
  else if (/book|notebook|pen|binder/i.test(fullText)) category = 'Books & Stationery';

  let primaryColor = 'Black';
  if (/blue/i.test(fullText)) primaryColor = 'Blue';
  else if (/red/i.test(fullText)) primaryColor = 'Red';
  else if (/green/i.test(fullText)) primaryColor = 'Green';
  else if (/white|silver/i.test(fullText)) primaryColor = 'Silver / White';
  else if (/brown|tan/i.test(fullText)) primaryColor = 'Brown';
  else if (/gold|yellow/i.test(fullText)) primaryColor = 'Gold';

  const tags = fullText
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 5);

  return {
    suggestedTitle: title || `${category} (${itemType === 'FOUND' ? 'Found' : 'Lost'})`,
    category,
    primaryColor,
    secondaryColor: 'N/A',
    brand: 'N/A',
    extractedOcrText: 'None detected',
    aiTags: tags.length > 0 ? tags : ['item', 'report'],
    summaryDescription: description || `Reported ${itemType.toLowerCase()} item categorized under ${category}.`,
    suggestedVerificationQuestions: [
      'What specific distinct markings, stickers, or scratches are on the item?',
      'Can you describe any specific contents or items inside or attached?',
      'What exact brand logo or text is visible on the interior or back?',
    ],
    isSensitiveDocument: category === 'ID Cards & Documents',
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, imageBase64, itemType } = body;

    const promptText = `
You are an expert AI Lost & Found Item Intelligence Assistant.
Analyze the following item details and image (if provided) to produce structured metadata.

Item Type reported by user: ${itemType || 'LOST'}
User Draft Title: ${title || 'N/A'}
User Description: ${description || 'N/A'}

Your task:
1. Identify or refine the title (clear, specific, e.g. "Midnight Blue Leather Tri-Fold Wallet").
2. Categorize strictly into one of: 'Electronics', 'Wallets & Bags', 'ID Cards & Documents', 'Keys', 'Jewelry & Watches', 'Clothing & Accessories', 'Pets', 'Books & Stationery', 'Other'.
3. Detect primary and optional secondary color.
4. Detect brand if visible (e.g. Apple, Samsonite, Fossil, Nike, Dell, Ray-Ban, None).
5. Extract OCR Text if an image of a document, card, or labeled item is provided (MASK sensitive private credit card numbers or passport numbers with asterisks, e.g. "****-1234").
6. Provide 4-6 concise visual tags (e.g. ["blue-leather", "gold-zipper", "keychain-fob", "scratched-screen"]).
7. Write a clean 2-sentence summary description highlighting key distinguishing features.
8. Generate 3 smart, specific verification questions that the true owner should be able to answer to prove ownership (e.g., "What specific card or photo is inside the second card slot?", "Is there a scratch on the bottom right corner?", "What sticker or monogram is present?").
`;

    const contents: any[] = [];

    if (imageBase64) {
      // Strip base64 prefix if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const mimeTypeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

      contents.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    contents.push({ text: promptText });

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: { parts: contents },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestedTitle: { type: Type.STRING },
              category: { type: Type.STRING },
              primaryColor: { type: Type.STRING },
              secondaryColor: { type: Type.STRING },
              brand: { type: Type.STRING },
              extractedOcrText: { type: Type.STRING },
              aiTags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              summaryDescription: { type: Type.STRING },
              suggestedVerificationQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              isSensitiveDocument: { type: Type.BOOLEAN },
            },
            required: [
              'suggestedTitle',
              'category',
              'primaryColor',
              'aiTags',
              'summaryDescription',
              'suggestedVerificationQuestions',
            ],
          },
        },
      });

      const responseText = response.text;
      if (responseText) {
        const data = JSON.parse(responseText);
        return NextResponse.json({ success: true, analysis: data });
      }
    } catch (genAiError: any) {
      console.warn('Gemini API call failed or rate limited in analyze-item, using fallback:', genAiError.message);
    }

    const fallbackAnalysis = computeFallbackAnalysis(title, description, itemType || 'LOST');
    return NextResponse.json({ success: true, analysis: fallbackAnalysis, isFallback: true });
  } catch (error: any) {
    console.error('Error in analyze-item:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to analyze item',
      },
      { status: 500 }
    );
  }
}

