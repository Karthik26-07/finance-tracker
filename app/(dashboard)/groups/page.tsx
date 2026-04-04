import React, { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getGroups, getGroupDetails, getGroupDebts, getGroupTransactions } from '@/lib/db/queries/groups'
import { GroupList, GroupDetail, GroupActions } from '@/components/groups'
import { Group, GroupDebts, GroupTransaction } from '@/types/groups'
import { PageHeader } from '@/components/ui/PageHeader'
import { Users } from 'lucide-react'

interface GroupsPageProps {
  searchParams: Promise<{
    groupId?: string
  }>
}

export default async function GroupsPage({ searchParams }: GroupsPageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const userId = session.user.id
  const params = await searchParams
  const activeGroupId = params.groupId

  const groups = await getGroups(userId) as any
  
  let activeGroup: Group | null = null
  let debts: GroupDebts = { members: {}, debts: [] }
  let transactions: GroupTransaction[] = []

  if (activeGroupId) {
    activeGroup = await getGroupDetails(activeGroupId, userId) as any
    if (activeGroup) {
      debts = await getGroupDebts(activeGroupId) as any
      transactions = await getGroupTransactions(activeGroupId) as any
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="Shared Entities"
        subtitle="Manage group expenses, splits, and recursive debt tracking"
      >
        <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-linear-to-br from-primary to-primary-container text-white rounded-2xl text-xs font-bold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95">
          <Users size={14} />
          Create New Group
        </button>
      </PageHeader>
      
      <div className="grid grid-cols-12 gap-10">
        <GroupList groups={groups as any} />
        
        <Suspense fallback={
          <div className="col-span-12 lg:col-span-8 h-150 bg-highlight/10 rounded-[3rem] animate-pulse" />
        }>
          <GroupDetail 
            group={activeGroup as any} 
            debts={debts as any} 
            userId={userId} 
            transactions={transactions as any} 
          />
        </Suspense>
      </div>
    </div>
  )
}
