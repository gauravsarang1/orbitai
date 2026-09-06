import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';
import { Type } from '@google/genai';

export const dynamic = 'force-dynamic';


function computeFallbackMatch(lostItem: any, foundItem: any) {
  const catMatch = lostItem.category === foundItem.category;
  const colorMatch =
    lostItem.primaryColor?.toLowerCase() === foundItem.primaryColor?.toLowerCase() ||
    lostItem.secondaryColor?.toLowerCase() === foundItem.primaryColor?.toLowerCase();
  
  const venueMatch =
    lostItem.location?.venue?.toLowerCase() === foundItem.location?.venue?.toLowerCase();

  const brandMatch =
    lostItem.brand &&
    foundItem.brand &&
    lostItem.brand !== 'N/A' &&
    lostItem.brand.toLowerCase() === foundItem.brand.toLowerCase();

  const visualScore = Math.min(
    100,
    (catMatch ? 50 : 15) + (colorMatch ? 35 : 10) + (brandMatch ? 15 : 0)
  );

  // Word overlap for text similarity
  const lostWords = `${lostItem.title} ${lostItem.description} ${lostItem.ocrText || ''}`
    .toLowerCase()
    .split(/\s+/);
  const foundWords = `${foundItem.title} ${foundItem.description} ${foundItem.ocrText || ''}`
    .toLowerCase()
    .split(/\s+/);

  const commonWords = lostWords.filter((w) => w.length > 3 && foundWords.includes(w));
  const textScore = Math.min(100, 20 + commonWords.length * 20);

  const locationScore = venueMatch ? 90 : 40;
  const colorScore = colorMatch ? 90 : 30;

  const matchScore = Math.round(
    visualScore * 0.35 + textScore * 0.25 + locationScore * 0.25 + colorScore * 0.15
  );

  let overallVerdict = 'LOW_MATCH';
  if (matchScore >= 80) overallVerdict = 'HIGH_MATCH';
  else if (matchScore >= 50) overallVerdict = 'MEDIUM_MATCH';

  return {
    matchScore,
    overallVerdict,
    visualSimilarityScore: visualScore,
    textSimilarityScore: textScore,
    locationScore,
    colorScore,
    aiReasoning: `Heuristic match calculated (${matchScore}% confidence). ${
      catMatch ? 'Category matches.' : 'Different category.'
    } ${venueMatch ? 'Reported at the same location.' : 'Different location reported.'}`,
    breakdown: {
      visualDetails: catMatch
        ? 'Same item category and matching visual features.'
        : 'Different item category detected.',
      textOcrDetails:
        commonWords.length > 0
          ? `Matched key words: ${commonWords.slice(0, 4).join(', ')}.`
          : 'Limited textual keyword overlap.',
      locationTimeDetails: venueMatch
        ? `Both reports coincide at ${lostItem.location?.venue}.`
        : 'Locations differ between reports.',
      colorAttributeDetails: colorMatch
        ? `Matching color scheme (${lostItem.primaryColor}).`
        : 'Distinct primary colors.',
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lostItem, foundItem } = body;

    if (!lostItem || !foundItem) {
      return NextResponse.json(
        { success: false, error: 'Both lostItem and foundItem are required' },
        { status: 400 }
      );
    }

    const lostDetails = `
--- LOST ITEM REPORT ---
Title: ${lostItem.title}
Category: ${lostItem.category}
Color: ${lostItem.primaryColor} ${lostItem.secondaryColor || ''}
Brand: ${lostItem.brand || 'N/A'}
Date Lost: ${lostItem.dateOccurred}
Location Lost: ${lostItem.location?.venue} (${lostItem.location?.areaDetail || ''}, ${lostItem.location?.city || ''})
Description: ${lostItem.description}
OCR Text: ${lostItem.ocrText || 'None'}
Tags: ${(lostItem.aiTags || []).join(', ')}
`;

    const foundDetails = `
--- FOUND ITEM REPORT ---
Title: ${foundItem.title}
Category: ${foundItem.category}
Color: ${foundItem.primaryColor} ${foundItem.secondaryColor || ''}
Brand: ${foundItem.brand || 'N/A'}
Date Found: ${foundItem.dateOccurred}
Location Found: ${foundItem.location?.venue} (${foundItem.location?.areaDetail || ''}, ${foundItem.location?.city || ''})
Custody Location: ${foundItem.custodyLocation || 'N/A'}
Description: ${foundItem.description}
OCR Text: ${foundItem.ocrText || 'None'}
Tags: ${(foundItem.aiTags || []).join(', ')}
`;

    const promptText = `
You are the AI Matching Core for Orbit AI.
Compare the following Lost Item Report against the Found Item Report.

${lostDetails}

${foundDetails}

Evaluate the degree of similarity and likelihood that this Found item belongs to the Lost item reporter.
Calculate scores between 0 and 100 for:
1. Overall Match Score (weighted sum: Visual/Item Type 35%, Text/OCR 25%, Location/Time 25%, Color/Brand 15%).
2. Visual Similarity Score (0-100).
3. Text/OCR Similarity Score (0-100).
4. Location/Time Proximity Score (0-100).
5. Color & Brand Alignment Score (0-100).

Determine Overall Verdict: 'HIGH_MATCH' (>=80%), 'MEDIUM_MATCH' (50-79%), or 'LOW_MATCH' (<50%).

Provide a clear, detailed AI reasoning summary (2-3 sentences) and specific breakdown notes for each criteria.
`;

    const parts: any[] = [];

    // Attach lost item first image if available
    if (lostItem.images && lostItem.images.length > 0 && lostItem.images[0].startsWith('data:image')) {
      const img = lostItem.images[0];
      const base64Data = img.replace(/^data:image\/\w+;base64,/, '');
      const mimeTypeMatch = img.match(/^data:(image\/\w+);base64,/);
      parts.push({
        inlineData: {
          mimeType: mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg',
          data: base64Data,
        },
      });
    }

    // Attach found item first image if available
    if (foundItem.images && foundItem.images.length > 0 && foundItem.images[0].startsWith('data:image')) {
      const img = foundItem.images[0];
      const base64Data = img.replace(/^data:image\/\w+;base64,/, '');
      const mimeTypeMatch = img.match(/^data:(image\/\w+);base64,/);
      parts.push({
        inlineData: {
          mimeType: mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg',
          data: base64Data,
        },
      });
    }

    parts.push({ text: promptText });

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchScore: { type: Type.INTEGER },
              overallVerdict: { type: Type.STRING },
              visualSimilarityScore: { type: Type.INTEGER },
              textSimilarityScore: { type: Type.INTEGER },
              locationScore: { type: Type.INTEGER },
              colorScore: { type: Type.INTEGER },
              aiReasoning: { type: Type.STRING },
              breakdown: {
                type: Type.OBJECT,
                properties: {
                  visualDetails: { type: Type.STRING },
                  textOcrDetails: { type: Type.STRING },
                  locationTimeDetails: { type: Type.STRING },
                  colorAttributeDetails: { type: Type.STRING },
                },
                required: [
                  'visualDetails',
                  'textOcrDetails',
                  'locationTimeDetails',
                  'colorAttributeDetails',
                ],
              },
            },
            required: [
              'matchScore',
              'overallVerdict',
              'visualSimilarityScore',
              'textSimilarityScore',
              'locationScore',
              'colorScore',
              'aiReasoning',
              'breakdown',
            ],
          },
        },
      });

      const responseText = response.text;
      if (responseText) {
        const data = JSON.parse(responseText);
        return NextResponse.json({ success: true, matchResult: data });
      }
    } catch (genAiError: any) {
      console.warn('Gemini API call failed or rate limited in match-items, using heuristic fallback:', genAiError.message);
    }

    // Fallback if API rate limited or errored
    const fallbackResult = computeFallbackMatch(lostItem, foundItem);
    return NextResponse.json({ success: true, matchResult: fallbackResult, isFallback: true });
  } catch (error: any) {
    console.error('Error in match-items:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to compare items',
      },
      { status: 500 }
    );
  }
}

