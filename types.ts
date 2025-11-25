export interface Product {
  id: string;
  code: string; // Mã hàng hóa
  name: string; // Tên hàng hóa
  brand: string; // Hãng
  model: string;
  serial: string;
  lot: string;
  mfgDate: string; // Năm sản xuất (YYYY-MM-DD)
  expDate: string; // Hạn sử dụng (YYYY-MM-DD)
  supplier: string; // Đơn vị cung cấp
  unitPrice: number; // Nguyên giá
  quantity: number; // Số lượng hiện tại
  initialQuantity: number; // Số lượng nhập ban đầu (dùng để tính % cảnh báo)
  unit: string; // Đơn vị tính (Cái, Bộ, Kg...)
}

export type TransactionType = 'IMPORT' | 'EXPORT';

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  type: TransactionType;
  quantity: number;
  date: string;
  partner: string; // Đơn vị nhận (với Export) hoặc Cung cấp (với Import bổ sung)
  notes?: string;
  totalAmount: number; // Thành tiền
}

export interface StockAlert {
  productId: string;
  productName: string;
  current: number;
  initial: number;
  percentage: number;
}
