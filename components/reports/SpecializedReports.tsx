import React from 'react'
import { format } from 'date-fns'
import { 
  Calendar, Receipt, ShieldCheck, FileCheck, Info
} from 'lucide-react'

interface SpendingTransaction {
  id: string;
  description: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
  date: string | Date;
  amount: number | string;
}

export function SpendingListReport({ transactions }: { transactions: SpendingTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-surface border border-dashed border-border/40 rounded-[3rem] opacity-70">
         <Receipt size={40} className="text-text-muted mb-4" />
         <p className="text-xs font-bold uppercase tracking-widest text-text-muted">No high-value spending data available</p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border/10 rounded-[3rem] shadow-ambient overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-10 border-b border-border/40 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-1.5 h-10 bg-primary rounded-full shadow-sm shadow-primary/20" />
            <div>
               <h3 className="text-2xl font-black text-text-primary tracking-tight">Audit Trail</h3>
               <p className="text-xs text-text-muted mt-1 uppercase font-bold tracking-widest opacity-60">High-Velocity Outflows Portfolio</p>
            </div>
         </div>
         <div className="hidden md:flex gap-4">
            <div className="px-5 py-3 bg-highlight/50 rounded-2xl border border-border/40 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
               Volume: {transactions.length} items
            </div>
         </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-highlight/40 border-b border-border/20">
            <tr>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Transaction Context</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Categorization</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Date</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted text-right">Value (INR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {transactions.map((t) => (
              <tr key={t.id} className="group hover:bg-highlight/30 transition-all">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface border border-border/40 flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-all">
                       {t.categoryIcon || '📦'}
                    </div>
                    <div>
                      <p className="text-sm font-black text-text-primary mb-0.5">{t.description || 'N/A Note'}</p>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-60">System Entry Code: #{t.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className="px-4 py-2 bg-white/50 border border-border/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted inline-flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.categoryColor || '#CBD5E1' }} />
                    {t.categoryName}
                  </span>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-text-secondary tabular-nums opacity-80">
                     <Calendar size={12} className="text-primary" />
                     {format(new Date(t.date), 'MMM dd, yyyy')}
                  </div>
                </td>
                <td className="px-10 py-6 text-right font-display text-lg font-black text-text-primary tabular-nums tracking-tighter">
                   ₹{t.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-10 bg-highlight/30 border-t border-border/30 flex items-center justify-between">
         <p className="text-[11px] font-bold text-text-muted italic opacity-60">* This list only includes the highest value transactions for the current viewing cycle.</p>
         <button className="px-6 py-3 bg-white border border-border/40 rounded-2xl text-[11px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95">
            Export Audit Payload
         </button>
      </div>
    </div>
  )
}

interface TaxSummary {
  categoryName: string;
  total: number | string;
  count: number;
}

interface ReportStats {
  totalIncome: number | string;
  totalExpense: number | string;
  net: number | string;
}

export function TaxPrepReport({ taxSummaries, stats }: { taxSummaries: TaxSummary[], stats: ReportStats }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
       <div className="lg:col-span-2 space-y-10">
          <div className="bg-surface border border-border/10 rounded-[3rem] shadow-ambient overflow-hidden">
             <div className="p-10 border-b border-border/40 flex items-center gap-4">
                <div className="w-1.5 h-10 bg-secondary rounded-full shadow-sm shadow-secondary/20" />
                <div>
                   <h3 className="text-2xl font-black text-text-primary tracking-tight">Tax Identification Ledger</h3>
                   <p className="text-xs text-text-muted mt-1 uppercase font-bold tracking-widest opacity-60">Categorical Summary for Fiscal Reporting</p>
                </div>
             </div>
             <div className="p-10 space-y-4">
                {taxSummaries.map((cat, i) => (
                   <div key={i} className="group p-6 bg-highlight/30 rounded-3xl border border-border/10 hover:border-secondary/40 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-6">
                         <div className="w-12 h-12 bg-white rounded-2xl border border-border/20 flex flex-col items-center justify-center text-secondary shadow-sm">
                            <span className="text-[10px] font-black opacity-40 uppercase">Tax</span>
                            <FileCheck size={18} className="mt-0.5" />
                         </div>
                         <div>
                            <h4 className="text-lg font-black text-text-primary tracking-tight">{cat.categoryName}</h4>
                            <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest opacity-60">Volume: {cat.count} Operations tracked</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-black text-text-primary tabular-nums tracking-tighter">₹{cat.total.toLocaleString()}</p>
                         <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mt-1">Ready for Audit</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       </div>

       <div className="space-y-10">
          {/* Tax Preparation Status Card */}
          <div className="bg-linear-to-br from-secondary to-secondary-container p-10 rounded-[3rem] text-white shadow-xl shadow-secondary/20 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                <ShieldCheck size={200} />
             </div>
             <div className="relative z-10">
                <h3 className="text-2xl font-black mb-6 tracking-tight">Compliance Status</h3>
                <div className="space-y-8">
                   <div className="pb-8 border-b border-white/20">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Adjusted Gross Value</p>
                      <p className="text-4xl font-black tracking-tighter tabular-nums">₹{parseFloat(stats.totalIncome.toString()).toLocaleString()}</p>
                   </div>
                   <div className="pb-8 border-b border-white/20">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Verified Deductibles</p>
                      <p className="text-4xl font-black tracking-tighter tabular-nums">₹{parseFloat(stats.totalExpense.toString()).toLocaleString()}</p>
                   </div>
                   <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Net Taxable Index</p>
                      <p className="text-5xl font-black tracking-tighter tabular-nums text-secondary-container">₹{Math.max(0, parseFloat(stats.net.toString())).toLocaleString()}</p>
                   </div>
                </div>
                <button className="mt-12 w-full py-5 bg-white text-secondary font-black uppercase tracking-widest text-xs rounded-2.5xl hover:shadow-2xl transition-all active:scale-95">
                   Finalize Fiscal Cycle
                </button>
             </div>
          </div>

          <div className="bg-surface border border-border/10 rounded-[3rem] p-10 shadow-ambient relative overflow-hidden group">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                   <Info size={24} />
                </div>
                <h4 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] font-mono">Auditor Notes</h4>
             </div>
             <div className="space-y-4">
                <p className="text-sm font-medium text-text-secondary leading-relaxed">
                   Based on your spending in <span className="text-text-primary font-black">Professional Services</span> and <span className="text-text-primary font-black">Equipment</span>, we have flagged {taxSummaries.length} categories as potentially tax-deductible for your region. 
                </p>
                <div className="p-5 bg-highlight/40 rounded-2xl border border-border/20 text-[11px] font-bold text-text-muted italic opacity-80">
                   "Financial compliance requires consistent categorization. Ensure all receipts are digitized within the system for maximum deduction efficiency."
                </div>
             </div>
          </div>
       </div>
    </div>
  )
}
