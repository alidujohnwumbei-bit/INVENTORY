import React from 'react';
import {
  Plus,
  FileSpreadsheet,
  Printer,
  Search,
  RotateCcw,
  Trash2,
  SlidersHorizontal,
  Download,
  AlertTriangle,
  ShoppingBag,
} from 'lucide-react';
import { SortField, SortDirection } from '../types.ts';

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddNewMaterial: () => void;
  onExportExcel: () => void;
  onPrint: () => void;
  onResetSampleData: () => void;
  onClearAll: () => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
  totalFiltered: number;
  totalItems: number;
  lowStockCount: number;
  isLowStockOnly: boolean;
  onToggleLowStockOnly: () => void;
  onOpenDailySales: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  searchQuery,
  onSearchChange,
  onAddNewMaterial,
  onExportExcel,
  onPrint,
  onResetSampleData,
  onClearAll,
  sortField,
  sortDirection,
  onSortChange,
  totalFiltered,
  totalItems,
  lowStockCount,
  isLowStockOnly,
  onToggleLowStockOnly,
  onOpenDailySales,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3 print:hidden">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search material name or category..."
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Center: Sorting controls & Filter Low Stock (<5) button */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Low Stock Filter Button */}
          <button
            onClick={onToggleLowStockOnly}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
              isLowStockOnly
                ? 'bg-red-600 text-white border-red-700 shadow-xs'
                : lowStockCount > 0
                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title="Filter items with stock < 5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock (&lt;5)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isLowStockOnly
                  ? 'bg-white text-red-700 font-extrabold'
                  : 'bg-red-200 text-red-900 font-bold'
              }`}
            >
              {lowStockCount}
            </span>
          </button>

          {/* Daily Sales Quick Access Button */}
          <button
            onClick={onOpenDailySales}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
            title="View today's sales transactions"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
            <span>Daily Sales</span>
          </button>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium">Sort:</span>
            <select
              value={sortField}
              onChange={(e) => onSortChange(e.target.value as SortField)}
              className="bg-transparent font-semibold text-slate-800 border-none text-xs focus:outline-none cursor-pointer"
            >
              <option value="no">No.</option>
              <option value="name">Material Name</option>
              <option value="unitPrice">Unit Price (GHS)</option>
              <option value="quantity">Quantity</option>
              <option value="totalPrice">Total Price (GHS)</option>
            </select>
            <button
              onClick={() => onSortChange(sortField)}
              className="ml-1 text-xs px-1.5 py-0.5 rounded bg-white font-bold text-slate-700 hover:bg-slate-200 border border-slate-300 cursor-pointer"
              title="Toggle Ascending / Descending"
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {(searchQuery || isLowStockOnly) && (
            <span className="text-xs text-slate-500 bg-amber-50 px-2 py-1 rounded border border-amber-200">
              Showing <strong className="text-amber-800">{totalFiltered}</strong> of {totalItems}
            </span>
          )}
        </div>

        {/* Right: Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Add New Material Button */}
          <button
            onClick={onAddNewMaterial}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-[#FF6B00] to-amber-600 hover:from-[#ea6200] hover:to-amber-700 shadow-sm transition-all transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Material</span>
          </button>

          {/* Export to Excel Button */}
          <button
            onClick={onExportExcel}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#0F172A] hover:bg-slate-800 shadow-sm transition-all transform active:scale-95 cursor-pointer"
            title="Download formatted Excel (.xlsx) file"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export to Excel</span>
            <Download className="w-3.5 h-3.5 opacity-70" />
          </button>

          {/* Print Button */}
          <button
            onClick={onPrint}
            className="inline-flex items-center justify-center p-2.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4 text-slate-600" />
          </button>

          {/* More options: Reset to Sample Data & Clear All */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <button
              onClick={onResetSampleData}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Reset to Original 13 Sample Materials"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClearAll}
              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Clear All Rows"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
