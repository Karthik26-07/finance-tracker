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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tighter font-display">Categories</h1>
          <p className="text-text-secondary text-sm font-medium opacity-80 uppercase tracking-widest font-mono mt-1 max-w-lg">Structure your financial ontology</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted bg-surface px-4 py-2 rounded-2xl border border-border">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>{categories.length} Categories Active</span>
        </div>
      </div>

      <CategoryList categories={categories} />
    </div>
  )
}
