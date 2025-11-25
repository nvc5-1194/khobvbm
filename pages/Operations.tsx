import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { inventoryService } from '../services/inventoryService';
import { Product } from '../types';
import { Plus, Minus, CheckCircle, AlertCircle } from 'lucide-react';

export const Operations: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'IMPORT' | 'EXPORT'>('IMPORT');
  const [importType, setImportType] = useState<'NEW' | 'EXISTING'>('EXISTING');
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form States
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [partner, setPartner] = useState(''); // Supplier (Import) or Dept (Export)
  const [notes, setNotes] = useState('');
  
  // New Product Form State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    code: '', name: '', brand: '', model: '', serial: '', lot: '',
    mfgDate: '', expDate: '', supplier: '', unitPrice: 0, unit: 'Cái', initialQuantity: 0
  });

  useEffect(() => {
    setProducts(inventoryService.getProducts());
  }, []);

  const resetForm = () => {
    setSelectedProductId('');
    setQuantity(0);
    setPartner('');
    setNotes('');
    setNewProduct({
        code: '', name: '', brand: '', model: '', serial: '', lot: '',
        mfgDate: '', expDate: '', supplier: '', unitPrice: 0, unit: 'Cái', initialQuantity: 0
    });
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (importType === 'NEW') {
        if (!newProduct.code || !newProduct.name || !quantity) return;
        
        const productToAdd: Product = {
          ...newProduct as Product,
          id: Date.now().toString(),
          quantity: quantity,
          initialQuantity: quantity, // Set initial base for alert logic
        };
        inventoryService.importProduct(productToAdd, true);
      } else {
        if (!selectedProductId || !quantity) return;
        const product = products.find(p => p.id === selectedProductId);
        if (!product) return;
        
        // Update product object for processing
        inventoryService.importProduct({ ...product, quantity }, false);
      }

      setMessage({ type: 'success', text: 'Nhập kho thành công!' });
      setProducts(inventoryService.getProducts()); // Refresh
      resetForm();
    } catch (err) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra.' });
    }
  };

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !quantity || !partner) {
       setMessage({ type: 'error', text: 'Vui lòng điền đủ thông tin.' });
       return;
    }

    const success = inventoryService.exportProduct(selectedProductId, quantity, partner, notes);
    if (success) {
      setMessage({ type: 'success', text: 'Xuất kho thành công!' });
      setProducts(inventoryService.getProducts()); // Refresh list
      resetForm();
    } else {
      setMessage({ type: 'error', text: 'Số lượng tồn kho không đủ!' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-gray-200 pb-4">
        <button
          onClick={() => { setActiveMode('IMPORT'); setMessage(null); }}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
            activeMode === 'IMPORT' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Plus size={18} className="mr-2" /> Nhập Kho
        </button>
        <button
          onClick={() => { setActiveMode('EXPORT'); setMessage(null); }}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
            activeMode === 'EXPORT' ? 'bg-orange-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Minus size={18} className="mr-2" /> Xuất Kho
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-md flex items-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.type === 'success' ? <CheckCircle className="mr-2"/> : <AlertCircle className="mr-2"/>}
          {message.text}
        </div>
      )}

      {activeMode === 'IMPORT' && (
        <Card title="Phiếu Nhập Kho">
          <div className="mb-6 flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="radio" 
                checked={importType === 'EXISTING'} 
                onChange={() => setImportType('EXISTING')} 
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Nhập bổ sung (Hàng có sẵn)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="radio" 
                checked={importType === 'NEW'} 
                onChange={() => setImportType('NEW')} 
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Nhập mới hoàn toàn</span>
            </label>
          </div>

          <form onSubmit={handleImport} className="space-y-4">
            {importType === 'EXISTING' ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Hàng Hóa</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                    required
                  >
                    <option value="">-- Chọn hàng hóa --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số Lượng Nhập</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={quantity || ''}
                    onChange={e => setQuantity(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Full form for new product */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã Hàng Hóa *</label>
                  <input type="text" className="w-full p-2 border rounded-md" required 
                    value={newProduct.code} onChange={e => setNewProduct({...newProduct, code: e.target.value})} />
                </div>
                <div className="md:col-span-1">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Tên Hàng Hóa *</label>
                  <input type="text" className="w-full p-2 border rounded-md" required
                     value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                </div>
                 <div className="md:col-span-1">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Hãng Sản Xuất</label>
                  <input type="text" className="w-full p-2 border rounded-md"
                     value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} />
                </div>
                <div className="md:col-span-1">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input type="text" className="w-full p-2 border rounded-md"
                    value={newProduct.model} onChange={e => setNewProduct({...newProduct, model: e.target.value})} />
                </div>
                <div className="md:col-span-1">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Serial</label>
                  <input type="text" className="w-full p-2 border rounded-md"
                    value={newProduct.serial} onChange={e => setNewProduct({...newProduct, serial: e.target.value})} />
                </div>
                <div className="md:col-span-1">
                   <label className="block text-sm font-medium text-gray-700 mb-1">LOT</label>
                  <input type="text" className="w-full p-2 border rounded-md"
                    value={newProduct.lot} onChange={e => setNewProduct({...newProduct, lot: e.target.value})} />
                </div>
                <div className="md:col-span-1">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Ngày SX</label>
                  <input type="date" className="w-full p-2 border rounded-md"
                    value={newProduct.mfgDate} onChange={e => setNewProduct({...newProduct, mfgDate: e.target.value})} />
                </div>
                <div className="md:col-span-1">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Hạn SD</label>
                  <input type="date" className="w-full p-2 border rounded-md"
                    value={newProduct.expDate} onChange={e => setNewProduct({...newProduct, expDate: e.target.value})} />
                </div>
                 <div className="md:col-span-1">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị Cung Cấp</label>
                  <input type="text" className="w-full p-2 border rounded-md" required
                    value={newProduct.supplier} onChange={e => setNewProduct({...newProduct, supplier: e.target.value})} />
                </div>
                 <div className="md:col-span-1">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Đơn Vị Tính</label>
                  <input type="text" className="w-full p-2 border rounded-md"
                    value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} />
                </div>
                 <div className="md:col-span-1">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Nguyên Giá (VNĐ) *</label>
                  <input type="number" className="w-full p-2 border rounded-md" required
                    value={newProduct.unitPrice || ''} onChange={e => setNewProduct({...newProduct, unitPrice: Number(e.target.value)})} />
                </div>
                 <div className="md:col-span-1">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Số Lượng Nhập *</label>
                  <input type="number" min="1" className="w-full p-2 border border-blue-300 rounded-md bg-blue-50" required
                    value={quantity || ''} onChange={e => setQuantity(Number(e.target.value))} />
                </div>
              </div>
            )}
            
            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" size="lg">Hoàn Thành Nhập Kho</Button>
            </div>
          </form>
        </Card>
      )}

      {activeMode === 'EXPORT' && (
        <Card title="Phiếu Xuất Kho">
          <form onSubmit={handleExport} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Hàng Hóa Xuất</label>
                 <select 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                    required
                  >
                    <option value="">-- Chọn hàng hóa --</option>
                    {products.filter(p => p.quantity > 0).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.name} (Tồn: {p.quantity})
                      </option>
                    ))}
                  </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số Lượng Xuất</label>
                <input 
                    type="number" 
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={quantity || ''}
                    onChange={e => setQuantity(Number(e.target.value))}
                    required
                  />
              </div>

               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn Vị Sử Dụng / Người Nhận</label>
                <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="VD: Phòng Kế Toán, Anh Nam..."
                    value={partner}
                    onChange={e => setPartner(e.target.value)}
                    required
                  />
              </div>

               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi Chú</label>
                <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Lý do xuất kho..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="danger" size="lg">Xác Nhận Xuất Kho</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
