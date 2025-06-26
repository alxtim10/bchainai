import { ChatMessage } from "@/components/hero/hooks";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { marked } from "marked";
import { NextResponse } from "next/server";

// Define the shape of your request body
interface GenerateRequest {
  prompt: string;
  history: ChatMessage[];
}

// Define the shape of your response data
interface GenerateResponse {
  output?: string;
  error?: string;
}

export async function POST(req: Request): Promise<NextResponse<GenerateResponse>> {
  try {
    const { prompt, history }: GenerateRequest = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set.");
      return NextResponse.json(
        { error: "Server configuration error: API key not found." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel(
      {
        model: "gemini-2.0-flash",
        systemInstruction: {
          role: "system",
          parts: [
            {
              text: "You are a highly knowledgeable blockchain expert and assistant. Your primary goal is to provide accurate, concise, and helpful information exclusively related to blockchain technology, cryptocurrencies, decentralized finance (DeFi), NFTs, smart contracts, Web3, and related concepts. You also provide information about decentralized and centralized exchange details. If a question falls outside of this domain, politely state that you can only answer questions related to blockchain. Avoid discussing personal opinions, general knowledge, or unrelated topics."
            },
          ],
        }
      });

    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 2048,
      }
    })

    const result = await chat.sendMessage(prompt);
    const responseText = result.response.text();

    // const result = await model.generateContent(prompt);
    // const responseText = result.response.text();
    const htmlOutput = await marked.parse(responseText);

    return NextResponse.json({ output: htmlOutput });
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      { error: `Failed to generate content: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}