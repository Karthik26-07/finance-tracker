import React from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getReportsData } from '@/lib/db/queries/reports'
import { MonthlyFlowChart, CategoryBreakdownReport, CashFlowTrendChart } from '@/components/reports/ReportCharts'
import { OverallStatsSummary } from '@/components/reports/OverallStatsSummary'
import { SpendingListReport, TaxPrepReport } from '@/components/reports/SpecializedReports'
import { 
  BarChart3 as BarChartIcon, 
  Download as DownloadIcon, 
  Filter as FilterIcon, 
  LayoutGrid as LayoutGridIcon, 
  List as ListIcon,
  ShieldCheck as ShieldCheckIcon
} from 'lucide-react'
import Link from 'next/link'

interface ReportsPageProps {
  searchParams: Promise<{
    from?: string
    to?: string
    tab?: string
  }>
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const userId = session.user.id
  const params = await searchParams
  const activeTab = params.tab || 'overview'
  const data = await getReportsData(userId, params.from, params.to)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGridIcon },
    { id: 'cashflow', label: 'Cash Flow', icon: BarChartIcon },
    { id: 'spending', label: 'Spending List', icon: ListIcon },
    { id: 'tax', label: 'Tax Prep', icon: ShieldCheckIcon },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-2 h-16 bg-primary rounded-full hidden md:block shadow-sm shadow-primary/20" />
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-text-primary font-display mb-1 flex items-center gap-4">
               {tabs.find(t => t.id === activeTab)?.label} Report
            </h1>
            <p className="text-text-secondary text-sm font-medium opacity-80 uppercase tracking-widest font-mono">Insight-driven financial engineering</p>
          </div>
        </div>
        
        <div className="flex gap-3">
           <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-surface border border-border/60 rounded-2xl text-xs font-bold text-text-primary hover:bg-highlight transition-all active:scale-95 shadow-sm">
              <DownloadIcon size={14} className="text-primary" />
              Download PDF
           </button>
           <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-linear-to-br from-primary to-primary-container text-white rounded-2xl text-xs font-bold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95">
              <FilterIcon size={14} />
              Customize Range
           </button>
        </div>
      </div>

      {/* Optimized Nav Tabs */}
      <div className="flex items-center gap-2 bg-highlight/30 p-1.5 rounded-2xl w-fit border border-border/40">
         {tabs.map((tab) => (
           <Link 
             key={tab.id}
             href={`/reports?tab=${tab.id}${params.from ? `&from=${params.from}` : ''}${params.to ? `&to=${params.to}` : ''}`}
             className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-[1.1rem] relative ${activeTab === tab.id ? 'bg-white text-primary shadow-sm ring-1 ring-border/5' : 'text-text-muted hover:text-text-secondary'}`}
           >
              <tab.icon size={13} />
              {tab.label}
           </Link>
         ))}
      </div>

      {/* Conditional Rendering based on Active Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <OverallStatsSummary stats={data.stats} />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
             <div className="lg:col-span-3">
                <MonthlyFlowChart data={data.monthlyFlow} />
             </div>
             <div className="lg:col-span-2">
                <CategoryBreakdownReport data={data.categoryBreakdown} />
             </div>
          </div>
        </div>
      )}

      {activeTab === 'cashflow' && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <div className="grid grid-cols-1 gap-8">
              <CashFlowTrendChart data={data.monthlyFlow} />
           </div>
           {/* Insight Section for Cash Flow */}
           <div className="bg-primary/5 border border-primary/20 rounded-[3rem] p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <BarChartIcon size={200} className="rotate-12" />
              </div>
              <div className="max-w-2xl relative z-10">
                 <h3 className="text-xl font-black text-text-primary mb-4 tracking-tight">Liquidity Strategy</h3>
                 <p className="text-text-secondary leading-relaxed font-medium font-display">
                    Your retention rate is <span className="text-primary font-black">{((data.stats.net / (data.stats.totalIncome || 1)) * 100).toFixed(1)}%</span>. 
                    This indicates the portion of your income being successfully converted into net worth. 
                    Maintaining a retention rate above 20% is considered optimal for long-term wealth stability.
                 </p>
                 <div className="mt-8 flex gap-4">
                    <div className="px-5 py-2.5 bg-white rounded-xl text-[10px] font-black uppercase text-secondary shadow-sm ring-1 ring-secondary/10">Target: 25.0%</div>
                    <div className="px-5 py-2.5 bg-white rounded-xl text-[10px] font-black uppercase text-text-muted shadow-sm ring-1 ring-border/10">Cycle: Monthly Audit</div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'spending' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <SpendingListReport transactions={data.topSpending} />
        </div>
      )}

      {activeTab === 'tax' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <TaxPrepReport taxSummaries={data.taxSummaries} stats={data.stats} />
        </div>
      )}
    </div>
  )
}
