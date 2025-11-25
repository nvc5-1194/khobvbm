import { GoogleGenAI } from "@google/genai";
import { Product, Transaction } from "../types";

// NOTE: In a real app, never expose API keys on the client side.
// This is for demonstration using the provided environment variable pattern.
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

export const geminiService = {
  analyzeInventory: async (products: Product[], transactions: Transaction[], userQuery: string) => {
    if (!apiKey) return "Vui lòng cấu hình API Key để sử dụng tính năng này.";

    try {
      // Prepare context data (simplify to save tokens)
      const contextData = {
        summary: `Tổng số mặt hàng: ${products.length}.`,
        products: products.map(p => ({
          name: p.name,
          code: p.code,
          qty: p.quantity,
          initial: p.initialQuantity,
          exp: p.expDate,
          supplier: p.supplier
        })),
        recentTransactions: transactions.slice(0, 10).map(t => ({
          type: t.type,
          item: t.productName,
          qty: t.quantity,
          date: t.date,
          partner: t.partner
        }))
      };

      const systemPrompt = `
        Bạn là một trợ lý ảo quản lý kho hàng chuyên nghiệp (AI Warehouse Manager).
        Dưới đây là dữ liệu kho hàng hiện tại dưới dạng JSON.
        Hãy trả lời câu hỏi của người dùng dựa trên dữ liệu này.
        Trả lời ngắn gọn, súc tích bằng Tiếng Việt.
        Nếu phát hiện vấn đề (hàng sắp hết, hàng hết hạn), hãy cảnh báo.
        
        Dữ liệu kho: ${JSON.stringify(contextData)}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userQuery,
        config: {
          systemInstruction: systemPrompt,
        }
      });

      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Xin lỗi, tôi gặp sự cố khi phân tích dữ liệu kho. Vui lòng thử lại sau.";
    }
  }
};
