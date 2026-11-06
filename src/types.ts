export interface InventoryItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  category?: string;
  unit?: string;
  notes?: string;
  lastUpdated?: string;
}

export interface SaleRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantitySold: number;
  unitPrice: number;
  totalAmount: number;
  customerName?: string;
  timestamp: string; // ISO string
}

export type SortField = 'no' | 'name' | 'unitPrice' | 'quantity' | 'totalPrice';
export type SortDirection = 'asc' | 'desc';

export interface InventoryStats {
  totalItems: number;
  totalQuantity: number;
  grandTotal: number;
  averageItemValue: number;
  lowStockCount: number;
  todaySalesTotal: number;
  todaySalesCount: number;
  todayUnitsSold: number;
}

export interface ActiveCell {
  rowIndex: number;
  colKey: 'name' | 'unitPrice' | 'quantity' | 'totalPrice';
}

