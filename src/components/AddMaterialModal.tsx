import React, { useState } from 'react';
import { X, Plus, Package } from 'lucide-react';
import { InventoryItem } from '../types.ts';

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<InventoryItem, 'id'>) => void;
}

const COMMON_CATEGORIES = [
  'Structural & Steel',
  'Roofing',
  'Fasteners',
  'Paints & Finishes',
  'Furnishings',
  'Flooring',
  'Tools & Hardware',
  'Security & Hardware',
  'Carpentry & Wood',
  'Decor & Interior',
  'Electrical & Plumbing',
  'Cement & Aggregates',
];

const COMMON_UNITS = ['Pcs', 'Lengths', 'Sheets', 'Bags', 'Buckets', 'Gallons', 'Rolls', 'Yards', 'Boxes', 'Pairs'];

export const AddMaterialModal: React.FC<AddMaterialModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [category, setCategory] = useState('Tools & Hardware');
  const [unit, setUnit] = useState('Pcs');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      unitPrice: typeof unitPrice === 'number' ? Math.max(0, unitPrice) : 0,
      quantity: typeof quantity === 'number' ? Math.max(0, quantity) : 0,
      category,
      unit,
    });

    setName('');
    setUnitPrice('');
    setQuantity('');
    onClose();
  };

  const calculatedTotal = (Number(unitPrice) || 0) * (Number(quantity) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#FF6B00] text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Add New Inventory Material</h3>
              <p className="text-xs text-slate-300">Royal Wun&apos;zaligu Enterprise Ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Material Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Material Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 16mm High Tensile Iron Rod"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/30 outline-none text-sm font-medium text-slate-900"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/30 outline-none text-sm text-slate-800 bg-white"
              >
                {COMMON_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Stock Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/30 outline-none text-sm text-slate-800 bg-white"
              >
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Unit Price & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Unit Price (GHS) *
              </label>
              <div className="relative">
                <span className="absolute left-3 inset-y-0 flex items-center text-xs font-semibold text-slate-400">
                  GH₵
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="0.00"
                  className="w-full pl-11 pr-3 py-2.5 rounded-lg border border-slate-300 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/30 outline-none text-sm font-mono text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                step="1"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/30 outline-none text-sm font-mono text-slate-900"
              />
            </div>
          </div>

          {/* Real-time calculated preview box */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900">
              Auto Calculated Row Total:
            </span>
            <span className="text-base font-extrabold text-[#0F172A] font-mono">
              GHS {calculatedTotal.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#FF6B00] to-amber-600 hover:from-[#ea6200] hover:to-amber-700 rounded-lg shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add to Spreadsheet
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
