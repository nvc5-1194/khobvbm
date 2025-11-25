import React, { useEffect, useState } from 'react';
import { inventoryService } from '../services/inventoryService';
import { Product } from '../types';
import { Card } from '../components/Card';
import { Search, Eye, Filter } from 'lucide-react';
import { Button } from '../components/Button';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    setProducts(inventoryService.getProducts());
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Danh Sách Hàng Hóa</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm mã, tên, hãng..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" icon={<Filter size={18}/>}>Lọc</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-4 px-6">Mã Hàng</th>
                <th className="py-4 px-6">Tên Hàng Hóa</th>
                <th className="py-4 px-6">Hãng / Model</th>
                <th className="py-4 px-6 text-center">Số Lượng</th>
                <th className="py-4 px-6">Đơn Vị</th>
                <th className="py-4 px-6 text-right">Đơn Giá (VND)</th>
                <th className="py-4 px-6 text-center">Trạng Thái</th>
                <th className="py-4 px-6 text-center">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => {
                const stockPercent = (product.quantity / product.initialQuantity);
                const isLow = stockPercent < 0.3;
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-gray-600 font-mono">{product.code}</td>
                    <td className="py-4 px-6 font-medium text-gray-900">{product.name}</td>
                    <td className="py-4 px-6 text-gray-600">{product.brand} <br/><span className="text-xs text-gray-400">{product.model}</span></td>
                    <td className="py-4 px-6 text-center font-bold text-gray-800">{product.quantity}</td>
                    <td className="py-4 px-6 text-gray-600">{product.unit}</td>
                    <td className="py-4 px-6 text-right font-mono text-gray-600">
                      {new Intl.NumberFormat('vi-VN').format(product.unitPrice)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Sắp hết
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Sẵn sàng
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => setSelectedProduct(product)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    Không tìm thấy hàng hóa nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">Chi Tiết: {selectedProduct.name}</h2>
              <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-gray-500 block mb-1">Mã Hàng Hóa</label>
                <p className="font-semibold text-gray-900">{selectedProduct.code}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-gray-500 block mb-1">Hãng Sản Xuất</label>
                <p className="font-semibold text-gray-900">{selectedProduct.brand}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-gray-500 block mb-1">Model</label>
                <p className="font-semibold text-gray-900">{selectedProduct.model}</p>
              </div>
               <div className="col-span-2 sm:col-span-1">
                <label className="text-gray-500 block mb-1">Serial Number</label>
                <p className="font-mono text-gray-900">{selectedProduct.serial}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-gray-500 block mb-1">Số Lot</label>
                <p className="font-mono text-gray-900">{selectedProduct.lot}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-gray-500 block mb-1">Nhà Cung Cấp</label>
                <p className="font-semibold text-blue-600">{selectedProduct.supplier}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-gray-500 block mb-1">Ngày Sản Xuất</label>
                <p className="text-gray-900">{selectedProduct.mfgDate}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-gray-500 block mb-1">Hạn Sử Dụng</label>
                <p className="text-gray-900">{selectedProduct.expDate}</p>
              </div>
              <div className="col-span-2 mt-4 pt-4 border-t grid grid-cols-3 gap-4">
                 <div className="bg-gray-50 p-3 rounded text-center">
                    <span className="block text-xs text-gray-500">Tồn Hiện Tại</span>
                    <span className="text-lg font-bold text-gray-900">{selectedProduct.quantity}</span>
                 </div>
                 <div className="bg-gray-50 p-3 rounded text-center">
                    <span className="block text-xs text-gray-500">Tổng Nhập (HĐ)</span>
                    <span className="text-lg font-bold text-gray-900">{selectedProduct.initialQuantity}</span>
                 </div>
                 <div className="bg-gray-50 p-3 rounded text-center">
                    <span className="block text-xs text-gray-500">Thành Tiền (Tồn)</span>
                    <span className="text-lg font-bold text-blue-600">
                      {new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(selectedProduct.quantity * selectedProduct.unitPrice)}
                    </span>
                 </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={() => setSelectedProduct(null)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
