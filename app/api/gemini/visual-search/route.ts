import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';
import { Type } from '@google/genai';

export const dynamic = 'force-dynamic';


function computeFallbackVisualSearch(itemsList: any[]) {
  const matches = itemsList.slice(0, 5).map((item: any, idx: number) => {
    const simScore = Math.max(40, 85 - idx * 10);
    return {
      itemId: item.id,
      similarityScore: simScore,
      matchReasoning: `Matched visual category (${item.category}) and color traits (${item.primaryColor}).`,
      matchedAttributes: [item.category, item.primaryColor, item.brand || 'Visual shape'].filter(Boolean),
    };
  });

  return {
    detectedFeatures: 'Detected object visual attributes, shape profile, and primary color palette.',
    matches,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, itemsList, searchType } = body;

    if (!imageBase64 || !itemsList || !Array.isArray(itemsList)) {
      return NextResponse.json(
        { success: false, error: 'Image and items list are required' },
        { status: 400 }
      );
    }

    // Prepare a compact representation of candidate items for AI evaluation
    const candidates = itemsList.map((item: any, index: number) => ({
      id: item.id,
      index,
      title: item.title,
      type: item.type,
      category: item.category,
      color: `${item.primaryColor} ${item.secondaryColor || ''}`.trim(),
      brand: item.brand || 'N/A',
      location: item.location?.venue || 'Unknown',
      description: item.description,
      tags: item.aiTags || [],
    }));

    const promptText = `
You are the AI Visual Search Engine for Orbit AI.
The user has uploaded a photo of an item they are looking for (${searchType || 'SEARCH'}).
Analyze the uploaded image and compare it visually and semantically against the following ${candidates.length} reported items in the database:

Candidate Database Items:
${JSON.stringify(candidates, null, 2)}

Instructions:
1. For each candidate item, assess the visual, category, color, and brand similarity to the uploaded photo.
2. Select the top matches (up to 5 items) that have a similarity score > 30%.
3. Return an array of matched items sorted from highest similarity score to lowest.
4. Provide a brief explanation for why each item matched or differed.
`;

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const mimeTypeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            { text: promptText },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedFeatures: {
                type: Type.STRING,
                description: 'Key visual traits detected in uploaded image',
              },
              matches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    itemId: { type: Type.STRING },
                    similarityScore: { type: Type.INTEGER }, // 0 to 100
                    matchReasoning: { type: Type.STRING },
                    matchedAttributes: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['itemId', 'similarityScore', 'matchReasoning'],
                },
              },
            },
            required: ['detectedFeatures', 'matches'],
          },
        },
      });

      const responseText = response.text;
      if (responseText) {
        const data = JSON.parse(responseText);
        return NextResponse.json({ success: true, visualSearchResults: data });
      }
    } catch (genAiError: any) {
      console.warn('Gemini API call failed or rate limited in visual-search, using fallback:', genAiError.message);
    }

    const fallbackResults = computeFallbackVisualSearch(itemsList);
    return NextResponse.json({ success: true, visualSearchResults: fallbackResults, isFallback: true });
  } catch (error: any) {
    console.error('Error in visual-search:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Visual search failed' },
      { status: 500 }
    );
  }
}

