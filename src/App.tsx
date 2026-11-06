/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { InventoryItem, SortField, SortDirection, SaleRecord } from './types.ts';
import { SAMPLE_MATERIALS } from './data/sampleData.ts';
import { Header } from './components/Header.tsx';
import { StatsCards } from './components/StatsCards.tsx';
import { Toolbar } from './components/Toolbar.tsx';
import { ExcelTable } from './components/ExcelTable.tsx';
import { AddMaterialModal } from './components/AddMaterialModal.tsx';
import { ConfirmModal } from './components/ConfirmModal.tsx';
import { ToastContainer, ToastMessage } from './components/Toast.tsx';
import { SellModal } from './components/SellModal.tsx';
import { DailySalesModal } from './components/DailySalesModal.tsx';
import { exportInventoryToExcel } from './utils/exportExcel.ts';
import { formatGHS } from './utils/formatters.ts';

const LOCAL_STORAGE_ITEMS_KEY = 'royal_wunzaligu_enterprise_inventory_v1';
const LOCAL_STORAGE_SALES_KEY = 'royal_wunzaligu_enterprise_sales_v1';

export default function App() {
  // Load inventory items from localStorage or fallback to sample data
  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ITEMS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse inventory localStorage:', e);
    }
    return SAMPLE_MATERIALS;
  });

  // Load sales history from localStorage
  const [sales, setSales] = useState<SaleRecord[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SALES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse sales localStorage:', e);
    }
    // Default starter sale for today to show daily sales card
    const now = new Date();
    return [
      {
        id: 'sale-init-1',
        itemId: 'mat-001',
        itemName: '11mm Iron Rod',
        quantitySold: 10,
        unitPrice: 68.0,
        totalAmount: 680.0,
        customerName: 'Kofi Mensah - Site A',
        timestamp: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: 'sale-init-2',
        itemId: 'mat-004',
        itemName: 'Emulsion Paint White',
        quantitySold: 2,
        unitPrice: 220.0,
        totalAmount: 440.0,
        customerName: 'Accra Construction Ltd',
        timestamp: new Date(now.getTime() - 1000 * 60 * 15).toISOString(),
      },
    ];
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(() => new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLowStockOnly, setIsLowStockOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>('no');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDailySalesModalOpen, setIsDailySalesModalOpen] = useState(false);
  const [selectedItemForSale, setSelectedItemForSale] = useState<InventoryItem | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    isDestructive: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    isDestructive: false,
    onConfirm: () => {},
  });

  // Auto-save inventory items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(items));
      setLastSaved(new Date());
    } catch (e) {
      console.error('Error saving inventory:', e);
    }
  }, [items]);

  // Auto-save sales history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SALES_KEY, JSON.stringify(sales));
    } catch (e) {
      console.error('Error saving sales:', e);
    }
  }, [sales]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Update item field directly from table or formula bar
  const handleUpdateItem = useCallback(
    (
      id: string,
      field: 'name' | 'unitPrice' | 'quantity' | 'category' | 'unit',
      value: string | number
    ) => {
      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              [field]: value,
              lastUpdated: new Date().toISOString(),
            };
          }
          return item;
        })
      );
    },
    []
  );

  // Add empty row directly into table
  const handleAddNewEmptyRow = useCallback(() => {
    const newId = `mat-${Date.now()}`;
    const newItem: InventoryItem = {
      id: newId,
      name: '',
      unitPrice: 0,
      quantity: 0,
      category: 'General Hardware',
      unit: 'Pcs',
    };

    setItems((prev) => [newItem, ...prev]);
    addToast({
      type: 'info',
      title: 'Empty row added',
      description: 'Enter material name, price, and quantity.',
      duration: 3000,
    });
  }, [addToast]);

  // Add material from structured modal
  const handleAddFromModal = useCallback(
    (newItemData: Omit<InventoryItem, 'id'>) => {
      const newItem: InventoryItem = {
        ...newItemData,
        id: `mat-${Date.now()}`,
      };
      setItems((prev) => [newItem, ...prev]);
      addToast({
        type: 'success',
        title: 'Material added successfully',
        description: `"${newItem.name}" added to ledger.`,
      });
    },
    [addToast]
  );

  // SELL ACTION: REDUCES STOCK & RECORDS SALE TRANSACTION
  const handleConfirmSale = useCallback(
    (
      item: InventoryItem,
      quantitySold: number,
      unitPrice: number,
      customerName?: string
    ) => {
      const remainingStock = Math.max(0, item.quantity - quantitySold);
      const totalAmount = Math.round(quantitySold * unitPrice * 100) / 100;

      // 1. Decrement inventory stock
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, quantity: remainingStock } : i))
      );

      // 2. Add sale record
      const newSaleRecord: SaleRecord = {
        id: `sale-${Date.now()}`,
        itemId: item.id,
        itemName: item.name,
        quantitySold,
        unitPrice,
        totalAmount,
        customerName,
        timestamp: new Date().toISOString(),
      };

      setSales((prev) => [newSaleRecord, ...prev]);

      // 3. Feedback toast
      addToast({
        type: 'success',
        title: `Sold ${quantitySold} ${item.unit || 'units'} of ${item.name}`,
        description: `Recorded GHS ${totalAmount.toFixed(2)}. Remaining stock: ${remainingStock} ${item.unit || 'units'}.`,
        duration: 4500,
      });

      // 4. Low stock warning if stock dropped < 5
      if (remainingStock < 5) {
        setTimeout(() => {
          addToast({
            type: 'warning',
            title: `Low Stock Warning for "${item.name}"!`,
            description: `Only ${remainingStock} left in store. Please arrange restocking.`,
            duration: 5000,
          });
        }, 1000);
      }
    },
    [addToast]
  );

  // Delete row with Undo
  const handleDeleteItem = useCallback(
    (id: string) => {
      const index = items.findIndex((i) => i.id === id);
      if (index === -1) return;
      const itemToDelete = items[index];

      setItems((prev) => prev.filter((i) => i.id !== id));

      addToast({
        type: 'warning',
        title: `Deleted "${itemToDelete.name || 'Unnamed Material'}"`,
        description: 'Need it back?',
        actionText: 'Undo Delete',
        onAction: () => {
          setItems((prev) => {
            const restored = [...prev];
            restored.splice(index, 0, itemToDelete);
            return restored;
          });
          addToast({
            type: 'success',
            title: 'Item restored',
            duration: 2500,
          });
        },
        duration: 6000,
      });
    },
    [items, addToast]
  );

  // Duplicate row
  const handleDuplicateItem = useCallback(
    (id: string) => {
      const targetIndex = items.findIndex((i) => i.id === id);
      if (targetIndex === -1) return;
      const target = items[targetIndex];

      const duplicatedItem: InventoryItem = {
        ...target,
        id: `mat-${Date.now()}`,
        name: `${target.name} (Copy)`,
      };

      setItems((prev) => {
        const next = [...prev];
        next.splice(targetIndex + 1, 0, duplicatedItem);
        return next;
      });

      addToast({
        type: 'info',
        title: 'Row duplicated',
        description: `Created copy of "${target.name}".`,
        duration: 3000,
      });
    },
    [items, addToast]
  );

  // Export to Excel .xlsx
  const handleExportExcel = useCallback(() => {
    try {
      exportInventoryToExcel(items, 'Royal_Wunzaligu_Inventory');
      addToast({
        type: 'success',
        title: 'Excel file exported!',
        description: 'Downloaded spreadsheet with live totals & formatting.',
        duration: 4000,
      });
    } catch (err) {
      console.error('Export failed:', err);
      addToast({
        type: 'warning',
        title: 'Export error',
        description: 'Could not generate Excel spreadsheet.',
      });
    }
  }, [items, addToast]);

  // Print Stock Sheet
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Reset to default sample materials
  const handleResetSampleData = useCallback(() => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset to Default Sample Materials?',
      message:
        'This will replace the current table with the 13 official sample materials (Iron Rods, Roofing Sheets, Paints, Tools, etc.) with pre-filled GHS prices and low stock examples.',
      confirmLabel: 'Yes, Reset Ledger',
      isDestructive: false,
      onConfirm: () => {
        setItems(SAMPLE_MATERIALS);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        addToast({
          type: 'success',
          title: 'Ledger Reset',
          description: 'Restored 13 sample materials with standard GHS prices.',
        });
      },
    });
  }, [addToast]);

  // Clear all items
  const handleClearAll = useCallback(() => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear All Materials?',
      message:
        'Are you sure you want to remove all rows? This will empty the entire spreadsheet. You can re-populate by clicking Sample Data.',
      confirmLabel: 'Clear All Rows',
      isDestructive: true,
      onConfirm: () => {
        setItems([]);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        addToast({
          type: 'info',
          title: 'Spreadsheet Cleared',
          description: 'All materials have been removed.',
        });
      },
    });
  }, [addToast]);

  // Clear sales history
  const handleClearSales = useCallback(() => {
    setSales([]);
    addToast({
      type: 'info',
      title: 'Sales history cleared',
      duration: 3000,
    });
  }, [addToast]);

  // Sorting
  const handleSortChange = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    },
    [sortField]
  );

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let result = items;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.category && item.category.toLowerCase().includes(q))
      );
    }

    // Low stock filter (< 5 units)
    if (isLowStockOnly) {
      result = result.filter((item) => (Number(item.quantity) || 0) < 5);
    }

    // Sorting
    if (sortField === 'no') {
      return sortDirection === 'desc' ? [...result].reverse() : result;
    }

    return [...result].sort((a, b) => {
      let comp = 0;
      if (sortField === 'name') {
        comp = a.name.localeCompare(b.name);
      } else if (sortField === 'unitPrice') {
        comp = (Number(a.unitPrice) || 0) - (Number(b.unitPrice) || 0);
      } else if (sortField === 'quantity') {
        comp = (Number(a.quantity) || 0) - (Number(b.quantity) || 0);
      } else if (sortField === 'totalPrice') {
        const totalA = (Number(a.unitPrice) || 0) * (Number(a.quantity) || 0);
        const totalB = (Number(b.unitPrice) || 0) * (Number(b.quantity) || 0);
        comp = totalA - totalB;
      }
      return sortDirection === 'asc' ? comp : -comp;
    });
  }, [items, searchQuery, isLowStockOnly, sortField, sortDirection]);

  // Today's Sales Calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = useMemo(() => {
    return sales.filter((s) => s.timestamp.startsWith(todayStr));
  }, [sales, todayStr]);

  const todaySalesTotal = useMemo(() => {
    return todaySales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  }, [todaySales]);

  const todayUnitsSold = useMemo(() => {
    return todaySales.reduce((sum, s) => sum + (Number(s.quantitySold) || 0), 0);
  }, [todaySales]);

  // Overall statistics
  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalQuantity = items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0
    );
    const grandTotal = items.reduce(
      (sum, item) =>
        sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0),
      0
    );
    const averageItemValue = totalItems > 0 ? grandTotal / totalItems : 0;
    const lowStockCount = items.filter(
      (item) => (Number(item.quantity) || 0) < 5
    ).length;

    return {
      totalItems,
      totalQuantity,
      grandTotal,
      averageItemValue,
      lowStockCount,
    };
  }, [items]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* Top Header with Crown Logo, Live Clock and Calendar */}
      <Header lastSaved={lastSaved} itemCount={items.length} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* KPI / Stats Overview Cards with DAILY SALES CARD & LOW STOCK ALERT */}
        <StatsCards
          totalItems={stats.totalItems}
          totalQuantity={stats.totalQuantity}
          grandTotal={stats.grandTotal}
          averageItemValue={stats.averageItemValue}
          lowStockCount={stats.lowStockCount}
          todaySalesTotal={todaySalesTotal}
          todaySalesCount={todaySales.length}
          todayUnitsSold={todayUnitsSold}
          onOpenDailySales={() => setIsDailySalesModalOpen(true)}
          onFilterLowStock={() => setIsLowStockOnly((prev) => !prev)}
          isLowStockFiltered={isLowStockOnly}
        />

        {/* Toolbar with Search, Low Stock filter, Excel Export, Print */}
        <Toolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddNewMaterial={() => setIsAddModalOpen(true)}
          onExportExcel={handleExportExcel}
          onPrint={handlePrint}
          onResetSampleData={handleResetSampleData}
          onClearAll={handleClearAll}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          totalFiltered={filteredAndSortedItems.length}
          totalItems={items.length}
          lowStockCount={stats.lowStockCount}
          isLowStockOnly={isLowStockOnly}
          onToggleLowStockOnly={() => setIsLowStockOnly((prev) => !prev)}
          onOpenDailySales={() => setIsDailySalesModalOpen(true)}
        />

        {/* Excel Spreadsheet Table with Inline Editing, Red Low Stock (<5) rows, and Sell buttons */}
        <ExcelTable
          items={filteredAndSortedItems}
          allItems={items}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onDuplicateItem={handleDuplicateItem}
          onAddNewMaterial={handleAddNewEmptyRow}
          onOpenSellModal={(item) => setSelectedItemForSale(item)}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
        />

        {/* Print Only: Authorized Sign-off Box */}
        <div className="hidden print:block pt-8 text-xs text-slate-600 border-t border-slate-300 mt-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="font-bold text-slate-900">ROYAL WUN&apos;ZALIGU ENTERPRISE</p>
              <p>Inventory Audit &amp; Material Valuation Report</p>
              <p className="text-[10px] text-slate-500 mt-1">Generated: {new Date().toLocaleString()}</p>
            </div>
            <div className="text-right space-y-8">
              <div className="border-b border-slate-400 w-48 inline-block" />
              <p className="font-semibold text-slate-800">Storekeeper / Auditor Signature</p>
            </div>
          </div>
        </div>

        {/* Quick Tips & Status Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 py-3 px-2 border-t border-slate-200/80 gap-2 print:hidden">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-semibold text-slate-700">Spreadsheet Shortcuts:</span>
            <span>Arrow keys / Tab to navigate</span>
            <span>•</span>
            <span>Enter to move down</span>
            <span>•</span>
            <span className="text-red-700 font-medium">Red rows = Low Stock (&lt;5 units)</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">Click &ldquo;Sell&rdquo; to decrement stock</span>
          </div>

          <div className="text-slate-400">
            Valuation: <strong className="text-slate-700">{formatGHS(stats.grandTotal)}</strong>
          </div>
        </div>

      </main>

      {/* Sell Modal: Reduces stock and records sale */}
      <SellModal
        item={selectedItemForSale}
        isOpen={Boolean(selectedItemForSale)}
        onClose={() => setSelectedItemForSale(null)}
        onConfirmSale={handleConfirmSale}
      />

      {/* Daily Sales Modal */}
      <DailySalesModal
        isOpen={isDailySalesModalOpen}
        onClose={() => setIsDailySalesModalOpen(false)}
        sales={sales}
        onClearSales={handleClearSales}
      />

      {/* Add Material Structured Modal */}
      <AddMaterialModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddFromModal}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}
