
import { GoogleGenAI, Modality } from "@google/genai";

// Use API key from environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey });

interface EditImageResult {
    editedImageBase64: string | null;
    modelTextResponse: string | null;
}

export async function editImageWithGemini(
    base64Image: string,
    mimeType: string,
    prompt: string
): Promise<EditImageResult> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        let editedImageBase64: string | null = null;
        let modelTextResponse: string | null = null;

        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    editedImageBase64 = part.inlineData.data;
                } else if (part.text) {
                    modelTextResponse = part.text;
                }
            }
        }
        
        if (!editedImageBase64) {
           throw new Error(modelTextResponse || "The AI model did not return an image. It might be due to a policy violation or an issue with the prompt.");
        }

        return { editedImageBase64, modelTextResponse };
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API.");
    }
}
