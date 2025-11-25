import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { inventoryService } from '../services/inventoryService';
import { Product, StockAlert } from '../types';
import { AlertTriangle, Package, TrendingUp, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface DashboardProps {
  onChangeTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onChangeTab }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const data = inventoryService.getProducts();
    setProducts(data);
    setAlerts(inventoryService.getAlerts());
    setTotalValue(inventoryService.calculateInventoryValue());
  }, []);

  const totalItems = products.reduce((acc, curr) => acc + curr.quantity, 0);
  
  // Data for Charts
  const brandData = products.reduce((acc: any[], curr) => {
    const found = acc.find(i => i.name === curr.brand);
    if (found) {
      found.value += curr.quantity;
    } else {
      acc.push({ name: curr.brand, value: curr.quantity });
    }
    return acc;
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng Quan Kho Hàng</h1>
          <p className="text-gray-500 mt-1">Cập nhật thông tin mới nhất về hàng hóa.</p>
        </div>
        <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
          {new Date().toLocaleDateString('vi-VN')}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng Mã Hàng</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{products.length}</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Package size={20} />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng Số Lượng</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalItems}</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <TrendingUp size={20} />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Giá Trị Tồn Kho</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumSignificantDigits: 3 }).format(totalValue)}
              </h3>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <DollarSign size={20} />
            </div>
          </div>
        </Card>

        <Card className={`border-l-4 ${alerts.length > 0 ? 'border-l-red-500' : 'border-l-gray-300'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Cảnh Báo Tồn Thấp</p>
              <h3 className={`text-2xl font-bold mt-1 ${alerts.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {alerts.length}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${alerts.length > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
              <AlertTriangle size={20} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-2">
          <Card title="Cảnh Báo Sắp Hết Hàng (<30%)" className="h-full">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không có cảnh báo nào. Kho hàng ổn định.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="py-3 px-4">Tên Hàng Hóa</th>
                      <th className="py-3 px-4 text-center">Tồn / HĐ</th>
                      <th className="py-3 px-4 text-center">Tỷ Lệ</th>
                      <th className="py-3 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {alerts.map((alert) => (
                      <tr key={alert.productId} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{alert.productName}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-red-600 font-bold">{alert.current}</span> / {alert.initial}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
                            {alert.percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button 
                            onClick={() => onChangeTab('operations')}
                            className="text-blue-600 hover:underline text-xs"
                          >
                            Nhập thêm
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Brand Distribution Chart */}
        <div className="lg:col-span-1">
          <Card title="Phân Bố Theo Hãng" className="h-full min-h-[300px]">
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={brandData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     fill="#8884d8"
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {brandData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <RechartsTooltip formatter={(value) => [value + ' sản phẩm', 'Số lượng']} />
                   <Legend />
                 </PieChart>
               </ResponsiveContainer>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
