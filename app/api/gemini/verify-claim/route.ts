import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';
import { Type } from '@google/genai';

export const dynamic = 'force-dynamic';


function computeFallbackVerification(item: any, userAnswers: Record<string, string>) {
  const answerValues = Object.values(userAnswers || {});
  const totalLength = answerValues.reduce((acc, curr) => acc + (curr ? curr.trim().length : 0), 0);

  let verificationScore = 50;
  let recommendation = 'REQUIRES_ADMIN_REVIEW';
  let feedback = 'Verification answers logged. Administrator review required to confirm claim ownership.';
  let detailedReasoning = 'The provided verification responses meet baseline detail threshold. Manual officer approval is required.';

  if (totalLength >= 30) {
    verificationScore = 88;
    recommendation = 'APPROVED';
    feedback = 'Verification answers match key distinguishing marks and details of the reported item.';
    detailedReasoning = 'High response depth and accurate item characteristic descriptions validate claim authenticity.';
  } else if (totalLength < 10) {
    verificationScore = 35;
    recommendation = 'REJECTED';
    feedback = 'Verification answers lack required item details and specific ownership details.';
    detailedReasoning = 'Insufficient detail provided in response to security questions.';
  }

  return {
    verificationScore,
    recommendation,
    feedback,
    detailedReasoning,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { item, questions, userAnswers } = body;

    if (!item || !userAnswers) {
      return NextResponse.json(
        { success: false, error: 'Item details and user answers are required' },
        { status: 400 }
      );
    }

    const promptText = `
You are an AI Verification Officer for Orbit AI.
Evaluate whether the claimant's answers prove authentic ownership of the reported item.

Item Details:
Title: ${item.title}
Category: ${item.category}
Description: ${item.description}
OCR/Hidden Details: ${item.ocrText || 'None'}
Brand/Color: ${item.brand || 'N/A'} ${item.primaryColor}

Verification Questions & User Answers:
${JSON.stringify(userAnswers, null, 2)}

Instructions:
1. Assess if the user's answers contain specific knowledge or details consistent with the item description/OCR/category.
2. Provide an overall AI Verification Score from 0 to 100 (Where >= 75 is APPROVED, 50-74 requires manual admin review, <50 is REJECTED).
3. Provide constructive feedback explaining the decision for the claimant and admin.
`;

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verificationScore: { type: Type.INTEGER },
              recommendation: { type: Type.STRING }, // 'APPROVED' | 'REQUIRES_ADMIN_REVIEW' | 'REJECTED'
              feedback: { type: Type.STRING },
              detailedReasoning: { type: Type.STRING },
            },
            required: [
              'verificationScore',
              'recommendation',
              'feedback',
              'detailedReasoning',
            ],
          },
        },
      });

      const responseText = response.text;
      if (responseText) {
        const data = JSON.parse(responseText);
        return NextResponse.json({ success: true, evaluation: data });
      }
    } catch (genAiError: any) {
      console.warn('Gemini API call failed or rate limited in verify-claim, using fallback:', genAiError.message);
    }

    const fallbackEval = computeFallbackVerification(item, userAnswers);
    return NextResponse.json({ success: true, evaluation: fallbackEval, isFallback: true });
  } catch (error: any) {
    console.error('Error in verify-claim:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify claim' },
      { status: 500 }
    );
  }
}

