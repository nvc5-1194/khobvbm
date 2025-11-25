import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Bot, Send, Sparkles } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { inventoryService } from '../services/inventoryService';

export const Assistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse('');

    const products = inventoryService.getProducts();
    const transactions = inventoryService.getTransactions();

    const answer = await geminiService.analyzeInventory(products, transactions, query);
    setResponse(answer || 'Xin lỗi, không có phản hồi.');
    setIsLoading(false);
  };

  const suggestions = [
    "Hàng nào sắp hết hạn sử dụng?",
    "Tổng giá trị kho hiện tại là bao nhiêu?",
    "Liệt kê các mặt hàng có tồn kho dưới 30%",
    "Mặt hàng nào được xuất nhiều nhất tuần qua?"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
          <Bot size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Trợ Lý Kho Thông Minh</h1>
        <p className="text-gray-500 mt-2">Sử dụng AI để phân tích dữ liệu kho và đưa ra gợi ý quản lý.</p>
      </div>

      <Card className="min-h-[400px] flex flex-col">
        <div className="flex-1 p-6 space-y-6">
          {response ? (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Sparkles size={18} className="text-blue-600" />
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl rounded-tl-none text-gray-800 leading-relaxed whitespace-pre-wrap">
                {response}
              </div>
            </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-70">
                <Bot size={48} />
                <p>Hãy đặt câu hỏi về kho hàng của bạn...</p>
             </div>
          )}
        </div>

        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((s, i) => (
              <button 
                key={i}
                onClick={() => setQuery(s)}
                className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={handleAskAI} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ví dụ: Có bao nhiêu Laptop Dell trong kho?"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Button type="submit" disabled={isLoading} className="px-6">
              {isLoading ? 'Đang nghĩ...' : <Send size={20} />}
            </Button>
          </form>
        </div>
      </Card>
      
      <p className="text-xs text-center text-gray-400">
        * Trợ lý AI phân tích dữ liệu dựa trên thông tin nhập liệu hiện tại. Kết quả chỉ mang tính tham khảo.
      </p>
    </div>
  );
};
