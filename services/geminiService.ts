
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '' 
});

export const generateProductDescription = async (productName: string, category: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a persuasive and culturally relevant marketing description for a product named "${productName}" in the category "${category}" for an Ethiopian e-commerce marketplace named eMerkato. Focus on quality, authenticity, and why an Ethiopian customer would love it. Keep it under 3 paragraphs.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating description. Please try again.";
  }
};

export const parseTelegramProduct = async (message: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an AI for eMerkato. A seller just posted a product in a Telegram group. Extract the product details into a structured JSON object. 
      Message: "${message}"
      
      Rules:
      1. Extract name, price (number only), category, and description.
      2. Categories MUST be one of: Habesha Clothes, Ceremonial Wear, Spices (Berbere), Coffee Sets (Jebena), Religious Goods, Electronics, General.
      3. If price is in ETB or Birr, extract the number.
      4. If the category is ambiguous, use your best judgment based on Ethiopian culture.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            price: { type: Type.NUMBER },
            category: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ['name', 'price', 'category', 'description']
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return null;
  }
};

export const getSmartSuggestions = async (userHistory: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on a user who recently viewed: ${userHistory}, suggest 3 culturally relevant Ethiopian product categories or specific items they might like for the current season in Ethiopia. Return a JSON array of suggestions with name and reason.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ['name', 'reason']
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
};
