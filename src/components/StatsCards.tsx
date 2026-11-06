import React from 'react';
import { Coins, PackageCheck, Layers, ShoppingBag, AlertTriangle, ArrowRight } from 'lucide-react';
import { formatGHS, formatQuantity } from '../utils/formatters.ts';

interface StatsCardsProps {
  totalItems: number;
  totalQuantity: number;
  grandTotal: number;
  averageItemValue: number;
  lowStockCount: number;
  todaySalesTotal: number;
  todaySalesCount: number;
  todayUnitsSold: number;
  onOpenDailySales: () => void;
  onFilterLowStock: () => void;
  isLowStockFiltered: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalItems,
  totalQuantity,
  grandTotal,
  lowStockCount,
  todaySalesTotal,
  todaySalesCount,
  todayUnitsSold,
  onOpenDailySales,
  onFilterLowStock,
  isLowStockFiltered,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
      
      {/* 1. Grand Total Value Card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-5 text-white shadow-md border border-slate-700">
        <div className="absolute -right-3 -top-3 w-24 h-24 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-amber-400">
            Grand Total Valuation
          </span>
          <div className="p-2 rounded-lg bg-amber-400/20 text-amber-300">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-baseline gap-1">
            <span className="text-amber-400 text-lg font-bold">GHS</span>
            <span>{formatGHS(grandTotal, false)}</span>
          </div>
          <p className="mt-1 text-xs text-slate-300">
            Current inventory value in stock
          </p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-700/80 flex items-center justify-between text-xs text-amber-300/90 font-medium">
          <span>Auto-Sum Formula</span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Σ(Price × Qty)
          </span>
        </div>
      </div>

      {/* 2. DAILY SALES CARD (Requested Feature) */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 p-5 text-white shadow-md border border-emerald-700 group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-emerald-300">
            Daily Sales (Today)
          </span>
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-baseline gap-1">
            <span className="text-emerald-300 text-lg font-bold">GHS</span>
            <span>{formatGHS(todaySalesTotal, false)}</span>
          </div>
          <p className="mt-1 text-xs text-emerald-100 flex items-center gap-2">
            <span><strong>{todaySalesCount}</strong> sales recorded</span>
            <span>•</span>
            <span><strong>{todayUnitsSold}</strong> units</span>
          </p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-emerald-700/80 flex items-center justify-between text-xs">
          <button
            onClick={onOpenDailySales}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-200 hover:text-white transition-colors cursor-pointer group-hover:underline"
          >
            <span>View Sales Ledger</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
          <span className="text-[11px] font-mono text-emerald-300/80">Cash Register</span>
        </div>
      </div>

      {/* 3. LOW STOCK ALERT CARD (< 5 Units) */}
      <div
        className={`rounded-xl p-5 shadow-sm border transition-all ${
          lowStockCount > 0
            ? 'bg-red-50/70 border-red-200 text-red-950'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-semibold tracking-wider uppercase ${
              lowStockCount > 0 ? 'text-red-700 font-bold' : 'text-slate-500'
            }`}
          >
            Low Stock Alert (&lt;5)
          </span>
          <div
            className={`p-2 rounded-lg ${
              lowStockCount > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div
            className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              lowStockCount > 0 ? 'text-red-700' : 'text-slate-900'
            }`}
          >
            {lowStockCount}
            <span className="text-sm font-medium text-slate-500 ml-1.5">Items</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {lowStockCount > 0
              ? 'Highlighted in red rows for replenishment'
              : 'All inventory items are well-stocked'}
          </p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
          <button
            onClick={onFilterLowStock}
            className={`font-semibold cursor-pointer transition-colors ${
              isLowStockFiltered
                ? 'text-red-700 underline font-bold'
                : lowStockCount > 0
                ? 'text-red-600 hover:text-red-800 underline'
                : 'text-slate-400'
            }`}
          >
            {isLowStockFiltered ? 'Show All Items' : 'Filter Low Stock Rows'}
          </button>
          <span className="text-[10px] uppercase font-bold text-slate-400">Threshold: 5</span>
        </div>
      </div>

      {/* 4. Total Stock Quantity & Catalog */}
      <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
            Total Stock Volume
          </span>
          <div className="p-2 rounded-lg bg-orange-50 text-[#FF6B00]">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            {formatQuantity(totalQuantity)}
            <span className="text-sm font-medium text-slate-500 ml-1.5">Units</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Across {totalItems} distinct material items
          </p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Catalog Variety</span>
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            {totalItems} Products
          </span>
        </div>
      </div>

    </div>
  );
};
