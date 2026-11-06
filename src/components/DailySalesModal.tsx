import React, { useState } from 'react';
import { ShoppingBag, X, Calendar, Download, Trash2, User, Coins } from 'lucide-react';
import { SaleRecord } from '../types.ts';
import { formatGHS } from '../utils/formatters.ts';
import * as XLSX from 'xlsx';

interface DailySalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sales: SaleRecord[];
  onClearSales: () => void;
}

export const DailySalesModal: React.FC<DailySalesModalProps> = ({
  isOpen,
  onClose,
  sales,
  onClearSales,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  if (!isOpen) return null;

  // Filter sales by selected date
  const filteredSales = sales.filter((s) => s.timestamp.startsWith(selectedDate));

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalUnits = filteredSales.reduce((sum, s) => sum + s.quantitySold, 0);

  // Export Daily Sales to Excel
  const handleExportDailySales = () => {
    const rows: (string | number)[][] = [
      ["ROYAL WUN'ZALIGU ENTERPRISE"],
      ['DAILY SALES AUDIT REPORT'],
      [`Date: ${selectedDate} | Total Revenue: GHS ${totalRevenue.toFixed(2)}`],
      [],
      ['Time', 'Material Name', 'Customer / Reference', 'Quantity Sold', 'Unit Price (GHS)', 'Total (GHS)'],
    ];

    filteredSales.forEach((sale) => {
      const time = new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      rows.push([
        time,
        sale.itemName,
        sale.customerName || 'Cash Customer',
        sale.quantitySold,
        sale.unitPrice,
        sale.totalAmount,
      ]);
    });

    rows.push([]);
    rows.push(['TOTALS', '', '', totalUnits, '', totalRevenue]);

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 30 },
      { wch: 20 },
      { wch: 14 },
      { wch: 16 },
      { wch: 18 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DailySales');
    XLSX.writeFile(workbook, `Royal_Wunzaligu_Daily_Sales_${selectedDate}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 print:hidden">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500 text-white">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Daily Sales Ledger &amp; Cash Register</h3>
              <p className="text-xs text-slate-300">Royal Wun&apos;zaligu Enterprise • Real-Time Sales Audit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Control Bar & Date Selector */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#FF6B00]" />
            <span className="text-xs font-bold text-slate-700">Filter Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] outline-none"
            />
            {selectedDate !== new Date().toISOString().split('T')[0] && (
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded hover:bg-amber-100"
              >
                Today
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportDailySales}
              disabled={filteredSales.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Sales (.xlsx)</span>
            </button>
            {sales.length > 0 && (
              <button
                onClick={onClearSales}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Clear all sales history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Daily Summary Cards */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-100/60 border-b border-slate-200 shrink-0">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Revenue
            </span>
            <span className="text-lg font-extrabold text-emerald-800 font-mono">
              {formatGHS(totalRevenue)}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Transactions
            </span>
            <span className="text-lg font-extrabold text-[#0F172A] font-mono">
              {filteredSales.length} <span className="text-xs font-normal text-slate-500">Sales</span>
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Units Sold
            </span>
            <span className="text-lg font-extrabold text-[#FF6B00] font-mono">
              {totalUnits} <span className="text-xs font-normal text-slate-500">Units</span>
            </span>
          </div>
        </div>

        {/* Transactions Table Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredSales.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-600">
                No sales recorded for {selectedDate}.
              </p>
              <p className="text-xs text-slate-400">
                Click the green &ldquo;Sell&rdquo; button in any table row to record a transaction.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {filteredSales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 mt-0.5">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{sale.itemName}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-mono text-slate-600">
                          {new Date(sale.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>•</span>
                        <span>
                          {sale.quantitySold} units @ {formatGHS(sale.unitPrice, false)}
                        </span>
                        {sale.customerName && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                              <User className="w-3 h-3 text-slate-400" />
                              {sale.customerName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-base text-emerald-800 block">
                      +{formatGHS(sale.totalAmount)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase">
                      Confirmed Sale
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Synced with inventory stock</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
