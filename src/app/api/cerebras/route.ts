// src/app/api/cerebras/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Cerebras } from '@cerebras/cerebras_cloud_sdk';

const cerebras = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'llama-3.3-70b', max_tokens = 1024, temperature = 0.2, top_p = 1 } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const completion = await cerebras.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: model,
      max_completion_tokens: max_tokens,
      temperature: temperature,
      top_p: top_p,
      stream: false,
    });

    // Correctly extract the content from the first choice
    let aiResponse = "";
    if (
      completion &&
      Array.isArray(completion.choices) &&
      completion.choices.length > 0 &&
      completion.choices[0]?.message?.content
    ) {
        aiResponse = completion.choices[0].message.content.trim();
    } else {
        console.error("Cerebras API returned unexpected response structure:", completion);
        return NextResponse.json({ error: "Cerebras API returned an unexpected response structure." }, { status: 500 });
    }

    // Return the extracted AI response text
    return NextResponse.json({ response: aiResponse }); // Send the string, not the whole completion object

  } catch (error: unknown) {
    console.error("Error calling Cerebras API:", error);
    if (error instanceof Error) {
        return NextResponse.json({ error: `Cerebras API Error: ${error.message}` }, { status: 500 });
    } else {
        return NextResponse.json({ error: "An unknown error occurred while processing your request." }, { status: 500 });
    }
  }
}