import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { inventoryService } from '../services/inventoryService';
import { Product, Transaction } from '../types';
import { FileText, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '../components/Button';

export const Reports: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setProducts(inventoryService.getProducts());
    setTransactions(inventoryService.getTransactions());
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Báo Cáo Tổng Hợp</h1>
        <Button variant="outline" icon={<Download size={18} />}>Xuất Excel</Button>
      </div>

      {/* Report 1: Import - Export - Inventory Summary (Xuat Nhap Ton) */}
      <Card title="Báo Cáo Xuất - Nhập - Tồn">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 font-bold">
              <tr>
                <th className="py-3 px-4 border border-gray-200">Mã Hàng</th>
                <th className="py-3 px-4 border border-gray-200">Tên Hàng Hóa</th>
                <th className="py-3 px-4 border border-gray-200 text-center">Đầu Kỳ (HĐ)</th>
                <th className="py-3 px-4 border border-gray-200 text-center text-blue-600">Tổng Nhập</th>
                <th className="py-3 px-4 border border-gray-200 text-center text-orange-600">Tổng Xuất</th>
                <th className="py-3 px-4 border border-gray-200 text-center font-bold">Tồn Cuối</th>
                <th className="py-3 px-4 border border-gray-200 text-right">Giá Trị Tồn</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                // Calculate total exported for this product from transaction history
                const totalExported = transactions
                  .filter(t => t.productId === p.id && t.type === 'EXPORT')
                  .reduce((sum, t) => sum + t.quantity, 0);
                
                // Note: Simplified logic. In real app, "Initial" might be calculated differently based on date range.
                // Here: Initial = Contract Quantity. Current = Real time.
                const totalImported = transactions
                   .filter(t => t.productId === p.id && t.type === 'IMPORT')
                   .reduce((sum, t) => sum + t.quantity, 0);

                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border border-gray-200">{p.code}</td>
                    <td className="py-2 px-4 border border-gray-200 font-medium">{p.name}</td>
                    <td className="py-2 px-4 border border-gray-200 text-center text-gray-500">{p.initialQuantity}</td>
                     <td className="py-2 px-4 border border-gray-200 text-center font-semibold text-blue-600">
                        {totalImported}
                     </td>
                    <td className="py-2 px-4 border border-gray-200 text-center font-semibold text-orange-600">
                        {totalExported}
                    </td>
                    <td className="py-2 px-4 border border-gray-200 text-center font-bold text-gray-900 bg-gray-50">
                        {p.quantity}
                    </td>
                    <td className="py-2 px-4 border border-gray-200 text-right text-gray-600">
                      {new Intl.NumberFormat('vi-VN').format(p.quantity * p.unitPrice)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Report 2: Recent Transaction History */}
      <Card title="Lịch Sử Giao Dịch Gần Nhất">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-b border-gray-200 text-gray-500 uppercase tracking-wider text-xs">
              <tr>
                <th className="py-3 px-4">Ngày / Giờ</th>
                <th className="py-3 px-4">Loại GD</th>
                <th className="py-3 px-4">Hàng Hóa</th>
                <th className="py-3 px-4 text-center">Số Lượng</th>
                <th className="py-3 px-4">Đối Tác / Đơn Vị</th>
                <th className="py-3 px-4">Ghi Chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.slice(0, 10).map((t) => (
                <tr key={t.id}>
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(t.date).toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-4">
                    {t.type === 'IMPORT' ? (
                      <span className="flex items-center text-blue-600 font-medium"><TrendingUp size={14} className="mr-1"/> Nhập</span>
                    ) : (
                       <span className="flex items-center text-orange-600 font-medium"><TrendingDown size={14} className="mr-1"/> Xuất</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{t.productName}</td>
                  <td className="py-3 px-4 text-center font-bold">{t.quantity}</td>
                  <td className="py-3 px-4 text-gray-600">{t.partner}</td>
                  <td className="py-3 px-4 text-gray-500 italic text-xs">{t.notes}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={6} className="text-center py-6 text-gray-400">Chưa có giao dịch nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
