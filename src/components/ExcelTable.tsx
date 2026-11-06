import React, { useRef, useState, useEffect } from 'react';
import {
  Trash2,
  Copy,
  Plus,
  Calculator,
  ArrowUpDown,
  ShoppingBag,
  AlertTriangle,
  FunctionSquare,
} from 'lucide-react';
import { InventoryItem, SortField, SortDirection, ActiveCell } from '../types.ts';
import { formatGHS, formatQuantity } from '../utils/formatters.ts';

interface ExcelTableProps {
  items: InventoryItem[];
  allItems: InventoryItem[];
  onUpdateItem: (
    id: string,
    field: 'name' | 'unitPrice' | 'quantity' | 'category' | 'unit',
    value: string | number
  ) => void;
  onDeleteItem: (id: string) => void;
  onDuplicateItem: (id: string) => void;
  onAddNewMaterial: () => void;
  onOpenSellModal: (item: InventoryItem) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
}

const COLUMNS: ('name' | 'unitPrice' | 'quantity' | 'totalPrice')[] = [
  'name',
  'unitPrice',
  'quantity',
  'totalPrice',
];

const COL_LETTERS: Record<'name' | 'unitPrice' | 'quantity' | 'totalPrice', string> = {
  name: 'B',
  unitPrice: 'C',
  quantity: 'D',
  totalPrice: 'E',
};

export const ExcelTable: React.FC<ExcelTableProps> = ({
  items,
  allItems,
  onUpdateItem,
  onDeleteItem,
  onDuplicateItem,
  onAddNewMaterial,
  onOpenSellModal,
  sortField,
  sortDirection,
  onSortChange,
}) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [activeCell, setActiveCell] = useState<ActiveCell>({
    rowIndex: 0,
    colKey: 'name',
  });

  // Calculate grand totals across all active items
  const grandTotalQuantity = allItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );
  const grandTotalPrice = allItems.reduce(
    (sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0),
    0
  );

  // Filtered view totals
  const filteredTotalQuantity = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );
  const filteredTotalPrice = items.reduce(
    (sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0),
    0
  );

  const isFiltered = items.length !== allItems.length;

  // Active cell item and value
  const activeItem = items[activeCell.rowIndex] || items[0];
  const activeColLetter = COL_LETTERS[activeCell.colKey] || 'B';
  const activeCellCoord = `${activeColLetter}${activeCell.rowIndex + 1}`;

  // Formula bar displayed value
  const getFormulaBarValue = (): string => {
    if (!activeItem) return '';
    if (activeCell.colKey === 'name') return activeItem.name || '';
    if (activeCell.colKey === 'unitPrice') return String(activeItem.unitPrice ?? '');
    if (activeCell.colKey === 'quantity') return String(activeItem.quantity ?? '');
    if (activeCell.colKey === 'totalPrice') {
      const rowNum = activeCell.rowIndex + 1;
      return `=C${rowNum}*D${rowNum} [GHS ${((activeItem.unitPrice || 0) * (activeItem.quantity || 0)).toFixed(2)}]`;
    }
    return '';
  };

  // Keyboard navigation handler across spreadsheet cells
  const handleKeyDown = (
    e: React.KeyboardEvent,
    rowIndex: number,
    colKey: 'name' | 'unitPrice' | 'quantity' | 'totalPrice'
  ) => {
    const colIndex = COLUMNS.indexOf(colKey);

    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      if (rowIndex < items.length - 1) {
        setActiveCell({ rowIndex: rowIndex + 1, colKey });
        focusCell(rowIndex + 1, colKey);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowIndex > 0) {
        setActiveCell({ rowIndex: rowIndex - 1, colKey });
        focusCell(rowIndex - 1, colKey);
      }
    } else if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (colIndex > 0) {
          e.preventDefault();
          const prevCol = COLUMNS[colIndex - 1];
          setActiveCell({ rowIndex, colKey: prevCol });
          focusCell(rowIndex, prevCol);
        }
      } else {
        if (colIndex < COLUMNS.length - 2) { // Skip auto total price and actions
          e.preventDefault();
          const nextCol = COLUMNS[colIndex + 1];
          setActiveCell({ rowIndex, colKey: nextCol });
          focusCell(rowIndex, nextCol);
        }
      }
    }
  };

  const focusCell = (rIdx: number, col: string) => {
    const el = document.getElementById(`cell-${rIdx}-${col}`);
    if (el) {
      el.focus();
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden">
      
      {/* Excel Ribbon & Sheet Status */}
      <div className="bg-[#0F172A] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-700 print:hidden">
        <div className="flex items-center gap-2">
          <span className="font-mono bg-emerald-700 text-white font-bold px-2 py-0.5 rounded text-[11px] tracking-wider uppercase">
            Sheet1: Inventory_Ledger
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Active formula: <code className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded font-mono text-[11px]">fx = Unit Price (C) * Quantity (D)</code>
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-300">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <strong className="text-white">{allItems.length}</strong> Rows
          </span>
          <span>•</span>
          <span>
            Grand Sum: <strong className="text-amber-400 font-bold">{formatGHS(grandTotalPrice)}</strong>
          </span>
        </div>
      </div>

      {/* EXCEL FORMULA BAR (Requested: Inline Excel Editing) */}
      <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 flex items-center gap-3 text-xs print:hidden">
        {/* Active Cell Reference Namebox */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded px-2.5 py-1 font-mono font-bold text-slate-800 shadow-2xs min-w-[55px] justify-center">
          <span className="text-[#FF6B00]">📍</span>
          <span>{activeCellCoord}</span>
        </div>

        {/* fx symbol */}
        <div className="flex items-center gap-1 text-slate-500 font-mono font-bold select-none">
          <FunctionSquare className="w-4 h-4 text-emerald-700" />
          <span className="italic">fx</span>
        </div>

        {/* Formula / Value Input Box */}
        <div className="flex-1">
          <input
            type="text"
            readOnly={activeCell.colKey === 'totalPrice'}
            value={getFormulaBarValue()}
            onChange={(e) => {
              if (!activeItem || activeCell.colKey === 'totalPrice') return;
              const val = e.target.value;
              if (activeCell.colKey === 'name') {
                onUpdateItem(activeItem.id, 'name', val);
              } else if (activeCell.colKey === 'unitPrice') {
                onUpdateItem(activeItem.id, 'unitPrice', parseFloat(val) || 0);
              } else if (activeCell.colKey === 'quantity') {
                onUpdateItem(activeItem.id, 'quantity', parseInt(val, 10) || 0);
              }
            }}
            placeholder="Click any cell or edit formula value here..."
            className={`w-full px-3 py-1 bg-white border rounded font-mono text-xs text-slate-900 outline-none transition-all ${
              activeCell.colKey === 'totalPrice'
                ? 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed'
                : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500'
            }`}
          />
        </div>
      </div>

      {/* Main Spreadsheet Container */}
      <div
        ref={tableContainerRef}
        className="overflow-x-auto max-h-[680px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
      >
        <table className="w-full border-collapse text-left text-sm select-text">
          
          {/* Excel Column Letters Reference Bar (A, B, C, D, E, F) */}
          <thead className="print:hidden">
            <tr className="bg-slate-200/90 text-slate-600 font-mono text-[11px] font-semibold border-b border-slate-300">
              <th className="w-14 py-1 px-3 text-center border-r border-slate-300 bg-slate-300/80">#</th>
              <th className="w-14 py-1 px-2 text-center border-r border-slate-300">A</th>
              <th className="min-w-[240px] py-1 px-3 text-center border-r border-slate-300">B</th>
              <th className="w-44 py-1 px-3 text-center border-r border-slate-300">C</th>
              <th className="w-48 py-1 px-3 text-center border-r border-slate-300">D</th>
              <th className="w-48 py-1 px-3 text-center border-r border-slate-300">E</th>
              <th className="w-44 py-1 px-2 text-center">F</th>
            </tr>
          </thead>

          {/* Sticky Excel Headers */}
          <thead className="sticky top-0 z-20 bg-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            <tr className="text-[#0F172A] font-bold border-b-2 border-slate-400 text-xs uppercase tracking-wider">
              
              {/* Row Selector / No. */}
              <th
                onClick={() => onSortChange('no')}
                className="w-14 py-3 px-3 text-center border-r border-slate-300 bg-slate-200/80 hover:bg-slate-300 cursor-pointer select-none transition-colors"
                title="Sort by Row Number"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>No</span>
                  {sortField === 'no' && (
                    <span className="text-amber-600 font-extrabold">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>

              {/* Material Name Column */}
              <th
                onClick={() => onSortChange('name')}
                className="py-3 px-4 border-r border-slate-300 hover:bg-slate-200 cursor-pointer select-none transition-colors"
                title="Sort by Material Name"
              >
                <div className="flex items-center justify-between gap-1">
                  <span>Material Name</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>

              {/* Unit Price (GHS) Column */}
              <th
                onClick={() => onSortChange('unitPrice')}
                className="w-44 py-3 px-4 text-right border-r border-slate-300 hover:bg-slate-200 cursor-pointer select-none transition-colors"
                title="Sort by Unit Price"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Unit Price GHS</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>

              {/* Quantity Column */}
              <th
                onClick={() => onSortChange('quantity')}
                className="w-48 py-3 px-4 text-right border-r border-slate-300 hover:bg-slate-200 cursor-pointer select-none transition-colors"
                title="Sort by Quantity"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Quantity</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>

              {/* Total Price GHS (auto) Column */}
              <th
                onClick={() => onSortChange('totalPrice')}
                className="w-48 py-3 px-4 text-right border-r border-slate-300 bg-amber-50/80 hover:bg-amber-100 text-[#0F172A] cursor-pointer select-none transition-colors"
                title="Sort by Total Price"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Total Price GHS (auto)</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>

              {/* Actions Column (with Sell Button) */}
              <th className="w-44 py-3 px-3 text-center text-slate-700 print:hidden">
                Actions / Sell
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200 bg-white font-normal">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center bg-slate-50">
                  <div className="max-w-sm mx-auto text-center space-y-3">
                    <p className="text-slate-500 font-medium text-base">
                      No materials found matching your search.
                    </p>
                    <button
                      onClick={onAddNewMaterial}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm font-semibold hover:bg-[#e05e00] transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add This Material
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const unitPrice = Number(item.unitPrice) || 0;
                const quantity = Number(item.quantity) || 0;
                const totalPrice = Math.round(unitPrice * quantity * 100) / 100;
                const isEven = index % 2 === 0;

                // LOW STOCK CHECK: MAKE ROWS RED WHEN LOW STOCK < 5
                const isLowStock = quantity < 5;
                const isOutOfStock = quantity === 0;

                const isCurrentRowActive = activeCell.rowIndex === index;

                return (
                  <tr
                    key={item.id}
                    className={`group transition-colors border-b ${
                      isLowStock
                        ? 'bg-red-50/85 hover:bg-red-100/90 border-red-300 text-red-950 font-medium'
                        : isEven
                        ? 'bg-white hover:bg-amber-50/60 border-slate-200'
                        : 'bg-slate-50/70 hover:bg-amber-50/60 border-slate-200'
                    }`}
                  >
                    {/* Column No. */}
                    <td
                      className={`py-2 px-3 text-center font-mono text-xs font-semibold border-r select-none ${
                        isLowStock
                          ? 'border-red-300 bg-red-100/80 text-red-800'
                          : 'border-slate-300 bg-slate-100/50 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {isLowStock && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"
                            title="Low Stock Alert"
                          />
                        )}
                        <span>{index + 1}</span>
                      </div>
                    </td>

                    {/* Column: Material Name (Inline Excel editable) */}
                    <td
                      onClick={() => setActiveCell({ rowIndex: index, colKey: 'name' })}
                      className={`py-1.5 px-3 border-r relative ${
                        isLowStock ? 'border-red-300' : 'border-slate-300'
                      } ${
                        isCurrentRowActive && activeCell.colKey === 'name'
                          ? 'ring-2 ring-emerald-600 bg-white z-10'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          id={`cell-${index}-name`}
                          type="text"
                          value={item.name}
                          onFocus={() => setActiveCell({ rowIndex: index, colKey: 'name' })}
                          onKeyDown={(e) => handleKeyDown(e, index, 'name')}
                          onChange={(e) => onUpdateItem(item.id, 'name', e.target.value)}
                          placeholder="e.g. 11mm Iron Rod"
                          className="w-full px-2 py-1.5 text-slate-900 font-medium bg-transparent rounded border border-transparent hover:border-slate-300 focus:border-emerald-600 outline-none text-sm"
                        />
                        {item.category && (
                          <span className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] font-medium text-slate-500 bg-slate-200/60 rounded">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column: Unit Price (GHS) (Inline Excel editable) */}
                    <td
                      onClick={() => setActiveCell({ rowIndex: index, colKey: 'unitPrice' })}
                      className={`py-1.5 px-3 border-r text-right relative ${
                        isLowStock ? 'border-red-300' : 'border-slate-300'
                      } ${
                        isCurrentRowActive && activeCell.colKey === 'unitPrice'
                          ? 'ring-2 ring-emerald-600 bg-white z-10'
                          : ''
                      }`}
                    >
                      <div className="relative flex items-center justify-end">
                        <span className="absolute left-2 text-[11px] font-semibold text-slate-400 pointer-events-none select-none">
                          GH₵
                        </span>
                        <input
                          id={`cell-${index}-unitPrice`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice === 0 ? '' : item.unitPrice}
                          onFocus={() => setActiveCell({ rowIndex: index, colKey: 'unitPrice' })}
                          onKeyDown={(e) => handleKeyDown(e, index, 'unitPrice')}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            onUpdateItem(item.id, 'unitPrice', isNaN(val) ? 0 : Math.max(0, val));
                          }}
                          placeholder="0.00"
                          className="w-full pl-9 pr-2 py-1.5 text-right font-mono font-medium text-slate-900 bg-transparent rounded border border-transparent hover:border-slate-300 focus:border-emerald-600 outline-none text-sm"
                        />
                      </div>
                    </td>

                    {/* Column: Quantity (with LOW STOCK < 5 warning badge & Inline editable) */}
                    <td
                      onClick={() => setActiveCell({ rowIndex: index, colKey: 'quantity' })}
                      className={`py-1.5 px-3 border-r text-right relative ${
                        isLowStock ? 'border-red-300 bg-red-100/50' : 'border-slate-300'
                      } ${
                        isCurrentRowActive && activeCell.colKey === 'quantity'
                          ? 'ring-2 ring-emerald-600 bg-white z-10'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Low stock badge */}
                        {isOutOfStock ? (
                          <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase rounded bg-red-600 text-white shadow-2xs">
                            OUT (0)
                          </span>
                        ) : isLowStock ? (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-red-200 text-red-900 border border-red-300"
                            title="Stock is below 5 units threshold"
                          >
                            <AlertTriangle className="w-3 h-3 text-red-700" />
                            LOW ({quantity})
                          </span>
                        ) : null}

                        <input
                          id={`cell-${index}-quantity`}
                          type="number"
                          step="1"
                          min="0"
                          value={item.quantity === 0 ? '' : item.quantity}
                          onFocus={() => setActiveCell({ rowIndex: index, colKey: 'quantity' })}
                          onKeyDown={(e) => handleKeyDown(e, index, 'quantity')}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            onUpdateItem(item.id, 'quantity', isNaN(val) ? 0 : Math.max(0, val));
                          }}
                          placeholder="0"
                          className={`w-20 px-2 py-1.5 text-right font-mono font-bold rounded border border-transparent hover:border-slate-300 focus:border-emerald-600 outline-none text-sm ${
                            isLowStock ? 'text-red-900 font-extrabold' : 'text-slate-900'
                          }`}
                        />

                        {item.unit && (
                          <span className="text-[11px] font-medium text-slate-400 w-10 text-left truncate print:inline">
                            {item.unit}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column: Total Price GHS (auto computed) */}
                    <td
                      onClick={() => setActiveCell({ rowIndex: index, colKey: 'totalPrice' })}
                      className={`py-2 px-4 border-r text-right relative transition-colors ${
                        isLowStock ? 'border-red-300 bg-red-100/30' : 'border-slate-300 bg-amber-50/40 group-hover:bg-amber-100/50'
                      } ${
                        isCurrentRowActive && activeCell.colKey === 'totalPrice'
                          ? 'ring-2 ring-emerald-600 bg-white z-10'
                          : ''
                      }`}
                    >
                      <div className="flex flex-col items-end">
                        <span className="font-mono font-bold text-sm text-[#0F172A] tracking-tight">
                          {formatGHS(totalPrice)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                          {formatQuantity(quantity)} × {formatGHS(unitPrice, false)}
                        </span>
                      </div>
                    </td>

                    {/* Column: Actions + SELL BUTTON (Requested Feature) */}
                    <td className="py-1.5 px-3 text-center print:hidden">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Primary SELL BUTTON */}
                        <button
                          onClick={() => onOpenSellModal(item)}
                          disabled={isOutOfStock}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all transform active:scale-95 cursor-pointer shadow-xs ${
                            isOutOfStock
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow'
                          }`}
                          title={isOutOfStock ? 'Cannot sell: 0 in stock' : `Sell units of ${item.name}`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{isOutOfStock ? 'Sold Out' : 'Sell'}</span>
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={() => onDuplicateItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded transition-colors"
                          title="Duplicate row"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete material"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>

          {/* Sticky Excel GRAND TOTAL Row */}
          <tfoot className="sticky bottom-0 z-20 bg-[#0F172A] text-white shadow-[0_-2px_6px_rgba(0,0,0,0.15)] font-bold">
            <tr className="border-t-2 border-amber-500">
              
              {/* Grand Total Label */}
              <td
                colSpan={2}
                className="py-3.5 px-4 text-left border-r border-slate-700 font-extrabold text-sm sm:text-base tracking-wide text-amber-400"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] animate-pulse" />
                  <span>GRAND TOTAL</span>
                  <span className="text-xs font-normal text-slate-300 hidden md:inline">
                    (SUM OF ALL MATERIAL TOTALS)
                  </span>
                  {isFiltered && (
                    <span className="ml-2 text-[11px] font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                      Filtered: {items.length} of {allItems.length}
                    </span>
                  )}
                </div>
              </td>

              {/* Spacer */}
              <td className="py-3.5 px-4 text-right border-r border-slate-700 text-xs font-medium text-slate-400">
                <span className="hidden sm:inline">Total Stock</span>
              </td>

              {/* Grand Total Quantity */}
              <td className="py-3.5 px-4 text-right border-r border-slate-700 font-mono text-sm text-white">
                <div className="flex flex-col items-end">
                  <span className="text-amber-300">
                    {formatQuantity(isFiltered ? filteredTotalQuantity : grandTotalQuantity)}
                  </span>
                  <span className="text-[10px] font-normal text-slate-400">Total Units</span>
                </div>
              </td>

              {/* GRAND TOTAL PRICE (AUTO SUM) */}
              <td className="py-3.5 px-4 text-right border-r border-slate-700 bg-[#1E293B]">
                <div className="flex flex-col items-end">
                  <span className="font-mono text-base sm:text-lg font-extrabold text-amber-400 tracking-tight">
                    {formatGHS(isFiltered ? filteredTotalPrice : grandTotalPrice)}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    Auto calculated live
                  </span>
                </div>
              </td>

              {/* Blank for Actions */}
              <td className="py-3.5 px-2 text-center text-xs text-slate-500 print:hidden">
                ✓
              </td>
            </tr>
          </tfoot>

        </table>
      </div>

      {/* Excel Table Bottom Action Toolbar */}
      <div className="bg-slate-100 border-t border-slate-300 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 print:hidden">
        <button
          onClick={onAddNewMaterial}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md font-bold text-white bg-[#0F172A] hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>+ Add Another Material Row</span>
        </button>

        <div className="flex items-center gap-4 text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Red rows = Low Stock (&lt; 5 units)
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Click &ldquo;Sell&rdquo; to decrement stock
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden md:inline text-slate-600">
            Use Arrow keys &amp; Enter to navigate cells
          </span>
        </div>
      </div>

    </div>
  );
};
