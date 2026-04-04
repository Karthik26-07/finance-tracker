import React from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getDashboardData } from '@/lib/db/queries/dashboard'
import { SummaryStats } from '@/components/dashboard/SummaryStats'
import { PageHeader } from '@/components/ui/PageHeader'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { TransactionItem } from '@/components/transactions/TransactionItem'
import { ArrowRight, History, BarChart3, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const userId = session.user.id
  const data = await getDashboardData(userId)

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <PageHeader 
        title={`Welcome back, ${session.user.name?.split(' ')[0] || 'Explorer'}`}
        subtitle="Dashboard / Your financial summary"
      >
        <Link href="/reports">
          <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-surface border border-border/60 rounded-2xl text-xs font-bold text-text-primary hover:bg-highlight transition-all active:scale-95 shadow-sm">
            <BarChart3 size={14} className="text-primary" />
            View Detailed Reports
          </button>
        </Link>
        <Link href="/transactions/new">
          <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-linear-to-br from-primary to-primary-container text-white rounded-2xl text-xs font-bold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95">
            + Add Record
          </button>
        </Link>
      </PageHeader>

      {/* Main Stats Summary Cards */}
      <SummaryStats data={data.summary} />

      {/* Charts Section */}
      <DashboardCharts 
        dailySpending={data.dailySpending} 
        categorySpending={data.categorySpending} 
      />

      {/* Data Deep Dive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
         {/* Category Rankings */}
         <div className="lg:col-span-2 p-5 sm:p-8 bg-surface border border-border/50 rounded-[2.5rem] shadow-ambient">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary">
                  <TrendingUp size={18} />
                </div>
                <h3 className="text-lg font-black tracking-tight text-text-primary">Top Expenses</h3>
              </div>
            </div>
            
            <div className="space-y-5">
               {data.categorySpending.slice(0, 5).map((category, i) => (
                 <div key={i} className="group flex items-center justify-between p-2 rounded-2xl hover:bg-highlight/50 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-11 h-11 bg-surface border border-border/50 rounded-xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
                          {category.categoryIcon || '📁'}
                       </div>
                       <div>
                          <p className="font-bold text-sm text-text-primary">{category.categoryName || 'Uncategorized'}</p>
                          <div className="w-32 h-1.5 bg-highlight rounded-full mt-1.5 overflow-hidden">
                             <div 
                                className="h-full bg-secondary rounded-full" 
                                style={{ 
                                   width: `${(category.total / (data.summary.monthlyExpense || 1)) * 100}%`,
                                   backgroundColor: category.categoryColor || '#10B981'
                                }} 
                             />
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-sm text-text-primary leading-tight">₹{parseFloat(category.total.toString()).toLocaleString()}</p>
                       <p className="text-[10px] font-bold text-text-muted mt-0.5 font-mono">
                          {((category.total / (data.summary.monthlyExpense || 1)) * 100).toFixed(1)}%
                       </p>
                    </div>
                 </div>
               ))}
               {data.categorySpending.length === 0 && (
                 <div className="text-center py-12 opacity-50">
                    <p className="text-sm font-bold text-text-muted uppercase tracking-widest">No expenses yet this month</p>
                 </div>
               )}
            </div>
         </div>

         {/* Recent Ledger History */}
         <div className="lg:col-span-3 p-5 sm:p-8 bg-surface border border-border/50 rounded-[2.5rem] shadow-ambient">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-4 mb-8">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                    <History size={18} />
                  </div>
                  <h3 className="text-lg font-black tracking-tight text-text-primary">Recent History</h3>
               </div>
               <Link href="/transactions" className="group flex items-center gap-2 text-[10px] sm:text-xs font-bold text-primary hover:opacity-80 transition-opacity w-fit">
                  View Ledger <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>

            <div className="space-y-2">
               {data.recentTransactions.map((tx: any) => (
                 <div key={tx.id} className="transform hover:scale-[1.01] transition-transform">
                   <TransactionItem transaction={tx} />
                 </div>
               ))}
               {data.recentTransactions.length === 0 && (
                 <div className="text-center py-12 opacity-50">
                    <p className="text-sm font-bold text-text-muted uppercase tracking-widest">No activities recorded</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  )
}
