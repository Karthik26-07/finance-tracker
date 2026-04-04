import { auth } from '@/lib/auth'
import { getCategories } from '@/lib/db/queries/categories'
import { CategoryList } from '@/components/categories/CategoryList'
import { redirect } from 'next/navigation'

export default async function CategoriesPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  const categories = await getCategories(session.user.id)

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Asset Configuration</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display bg-linear-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
            Categories
          </h1>
          <p className="text-text-secondary text-sm font-medium opacity-70 max-w-md">
            Define your financial architecture with precision and clarity.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none mb-1">Active Nodes</span>
            <span className="text-lg font-black text-text-primary font-mono tracking-tighter">
              {categories.length.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="h-10 w-px bg-border/20 hidden sm:block" />
          <div className="flex items-center gap-2 text-[10px] font-black text-secondary bg-secondary/5 px-3 py-1.5 rounded-full border border-secondary/10 uppercase tracking-widest whitespace-nowrap">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            Ready for Audit
          </div>
        </div>
      </div>

      <CategoryList categories={categories} />
    </div>
  )
}

