import { auth } from '@/lib/auth'
import { getCategories } from '@/lib/db/queries/categories'
import { CategoryList } from '@/components/categories/CategoryList'
import { PageHeader } from '@/components/ui/PageHeader'
import { redirect } from 'next/navigation'

export default async function CategoriesPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  const categories = await getCategories(session.user.id)

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="Categories"
        subtitle="Define your financial architecture with precision and clarity"
      >
        <div className="flex items-center gap-4 bg-surface/50 p-2 rounded-2xl border border-border/40 shadow-sm transition-all hover:bg-highlight/40">
          <div className="hidden sm:flex flex-col items-end px-2">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none mb-1">Active Nodes</span>
            <span className="text-lg font-black text-text-primary font-mono tracking-tighter">
              {categories.length.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="h-10 w-px bg-border/20 hidden sm:block" />
          <div className="flex items-center gap-2 text-[10px] font-black text-secondary bg-secondary/5 px-4 py-2 rounded-xl border border-secondary/10 uppercase tracking-widest whitespace-nowrap shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            Ready for Audit
          </div>
        </div>
      </PageHeader>

      <CategoryList categories={categories} />
    </div>
  )
}

