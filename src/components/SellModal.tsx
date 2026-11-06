import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, AlertTriangle, Check, User } from 'lucide-react';
import { InventoryItem } from '../types.ts';
import { formatGHS } from '../utils/formatters.ts';

interface SellModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSale: (
    item: InventoryItem,
    quantitySold: number,
    unitPrice: number,
    customerName?: string
  ) => void;
}

export const SellModal: React.FC<SellModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirmSale,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (item) {
      setQuantity(item.quantity > 0 ? 1 : 0);
      setCustomPrice(item.unitPrice || 0);
      setCustomerName('');
      setError('');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const currentStock = Number(item.quantity) || 0;
  const isOutOfStock = currentStock <= 0;
  const isLowStock = currentStock > 0 && currentStock < 5;

  const totalSaleAmount = quantity * (customPrice || 0);

  const handleQuickQuantity = (qty: number) => {
    if (qty > currentStock) {
      setQuantity(currentStock);
      setError(`Maximum available stock is ${currentStock} ${item.unit || 'units'}`);
    } else {
      setQuantity(Math.max(1, qty));
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOutOfStock) {
      setError('Cannot sell: this item is completely out of stock!');
      return;
    }
    if (quantity <= 0) {
      setError('Please specify at least 1 unit to sell.');
      return;
    }
    if (quantity > currentStock) {
      setError(`Cannot sell ${quantity} units. Only ${currentStock} in stock!`);
      return;
    }

    onConfirmSale(item, quantity, customPrice, customerName.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-150 print:hidden">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-[#0F172A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Record Material Sale</h3>
              <p className="text-xs text-emerald-200/90">Instant Stock Reduction &amp; Daily Sales Ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Item Summary Box */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Material
                </span>
                <h4 className="font-bold text-base text-[#0F172A]">
                  {item.name || 'Unnamed Material'}
                </h4>
                {item.category && (
                  <span className="text-xs text-slate-500">{item.category}</span>
                )}
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Available Stock
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-mono text-sm font-bold px-2 py-0.5 rounded ${
                    isOutOfStock
                      ? 'bg-red-100 text-red-700'
                      : isLowStock
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {currentStock} {item.unit || 'units'}
                </span>
              </div>
            </div>

            {/* Warning if low stock */}
            {isLowStock && (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Low stock warning! Only {currentStock} remaining in store.
                </span>
              </div>
            )}

            {isOutOfStock && (
              <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>Out of stock! Please restock before recording a sale.</span>
              </div>
            )}
          </div>

          {/* Quantity to sell */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Quantity to Sell ({item.unit || 'Units'}) *
              </label>
              <span className="text-xs text-slate-500 font-medium">
                Remaining after sale: <strong className="text-slate-800 font-mono">{Math.max(0, currentStock - quantity)}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={quantity <= 1 || isOutOfStock}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 disabled:opacity-40 transition-colors flex items-center justify-center cursor-pointer text-lg"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={currentStock}
                disabled={isOutOfStock}
                value={quantity === 0 ? '' : quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (isNaN(val)) {
                    setQuantity(0);
                  } else {
                    if (val > currentStock) {
                      setQuantity(currentStock);
                      setError(`Only ${currentStock} available in stock.`);
                    } else {
                      setQuantity(val);
                      setError('');
                    }
                  }
                }}
                className="flex-1 text-center py-2 px-3 font-mono text-lg font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              <button
                type="button"
                disabled={quantity >= currentStock || isOutOfStock}
                onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 disabled:opacity-40 transition-colors flex items-center justify-center cursor-pointer text-lg"
              >
                +
              </button>
            </div>

            {/* Quick preset buttons */}
            {!isOutOfStock && currentStock > 1 && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Quick:</span>
                {[1, 2, 5, 10].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={preset > currentStock}
                    onClick={() => handleQuickQuantity(preset)}
                    className="px-2 py-0.5 text-xs rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 font-semibold text-slate-600 disabled:opacity-30 cursor-pointer"
                  >
                    +{preset}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleQuickQuantity(currentStock)}
                  className="px-2 py-0.5 text-xs rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold cursor-pointer"
                >
                  All ({currentStock})
                </button>
              </div>
            )}
          </div>

          {/* Unit Price (GHS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Selling Price (GHS)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 inset-y-0 flex items-center text-xs font-semibold text-slate-400 select-none">
                  GH₵
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customPrice === 0 ? '' : customPrice}
                  onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Customer / Reference
              </label>
              <div className="relative">
                <span className="absolute left-2.5 inset-y-0 flex items-center text-slate-400">
                  <User className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="e.g., Cash Sale / Kofi"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Live Total Sale Amount Preview */}
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                Total Revenue
              </span>
              <span className="text-[11px] text-emerald-600 font-mono">
                {quantity} {item.unit || 'units'} × {formatGHS(customPrice, false)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-emerald-900 font-mono">
                {formatGHS(totalSaleAmount)}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isOutOfStock || quantity <= 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Confirm &amp; Reduce Stock</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
