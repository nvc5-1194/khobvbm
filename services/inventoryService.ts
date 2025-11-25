import { Product, Transaction, StockAlert } from '../types';

const PRODUCTS_KEY = 'inventory_products';
const TRANSACTIONS_KEY = 'inventory_transactions';

// Seed data function to populate the app if empty
const seedData = () => {
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    const dummyProducts: Product[] = [
      {
        id: '1',
        code: 'LT-DELL-001',
        name: 'Laptop Dell XPS 13',
        brand: 'Dell',
        model: '9310',
        serial: '8H29S12',
        lot: 'LOT202301',
        mfgDate: '2023-01-15',
        expDate: '2028-01-15',
        supplier: 'FPT Distribution',
        unitPrice: 25000000,
        quantity: 5,
        initialQuantity: 50, // 10% left -> Alert
        unit: 'Chiếc'
      },
      {
        id: '2',
        code: 'DT-IP-15',
        name: 'iPhone 15 Pro Max',
        brand: 'Apple',
        model: 'A2890',
        serial: 'G6X7Y8Z9',
        lot: 'LOT202309',
        mfgDate: '2023-09-01',
        expDate: '2030-01-01',
        supplier: 'Viettel Store',
        unitPrice: 30000000,
        quantity: 80,
        initialQuantity: 100, // 80% left -> OK
        unit: 'Chiếc'
      },
      {
        id: '3',
        code: 'SERVER-HP-01',
        name: 'Server HP ProLiant',
        brand: 'HP',
        model: 'DL380',
        serial: 'USM12345',
        lot: 'LOT202212',
        mfgDate: '2022-12-01',
        expDate: '2027-12-01',
        supplier: 'CMC Telecom',
        unitPrice: 120000000,
        quantity: 2,
        initialQuantity: 10, // 20% left -> Alert
        unit: 'Bộ'
      }
    ];
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(dummyProducts));
  }
};

seedData();

export const inventoryService = {
  getProducts: (): Product[] => {
    const data = localStorage.getItem(PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getProductById: (id: string): Product | undefined => {
    const products = inventoryService.getProducts();
    return products.find(p => p.id === id);
  },

  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Import new product type or add stock to existing
  importProduct: (product: Product, isNew: boolean): void => {
    const products = inventoryService.getProducts();
    let updatedProducts = [...products];

    if (isNew) {
      updatedProducts.push(product);
    } else {
      updatedProducts = updatedProducts.map(p => 
        p.id === product.id 
          ? { ...p, quantity: p.quantity + product.quantity } 
          : p
      );
    }
    
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
    
    // Log transaction
    inventoryService.logTransaction({
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      type: 'IMPORT',
      quantity: product.quantity,
      date: new Date().toISOString(),
      partner: product.supplier,
      totalAmount: product.quantity * product.unitPrice,
      notes: isNew ? 'Nhập mới ban đầu' : 'Nhập bổ sung'
    });
  },

  // Export product to a unit
  exportProduct: (productId: string, quantity: number, consumingUnit: string, notes: string): boolean => {
    const products = inventoryService.getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product || product.quantity < quantity) {
      return false;
    }

    const updatedProducts = products.map(p => 
      p.id === productId ? { ...p, quantity: p.quantity - quantity } : p
    );
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));

    inventoryService.logTransaction({
      id: Date.now().toString(),
      productId,
      productName: product.name,
      type: 'EXPORT',
      quantity,
      date: new Date().toISOString(),
      partner: consumingUnit,
      totalAmount: quantity * product.unitPrice,
      notes
    });

    return true;
  },

  logTransaction: (transaction: Transaction) => {
    const transactions = inventoryService.getTransactions();
    transactions.unshift(transaction); // Newest first
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  },

  getAlerts: (): StockAlert[] => {
    const products = inventoryService.getProducts();
    return products
      .map(p => {
        const percentage = (p.quantity / p.initialQuantity) * 100;
        return {
          productId: p.id,
          productName: p.name,
          current: p.quantity,
          initial: p.initialQuantity,
          percentage
        };
      })
      .filter(alert => alert.percentage < 30);
  },

  calculateInventoryValue: (): number => {
    const products = inventoryService.getProducts();
    return products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
  }
};
