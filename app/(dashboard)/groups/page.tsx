import React, { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getGroups, getGroupDetails, getGroupDebts, getGroupTransactions } from '@/lib/db/queries/groups'
import { GroupList, GroupDetail, GroupActions } from '@/components/groups'
import { Group, GroupDebts, GroupTransaction } from '@/types/groups'

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
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-2 h-16 bg-primary rounded-full hidden md:block shadow-sm shadow-primary/20" />
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-text-primary font-display mb-1 flex items-center gap-4">
               Group Expenses
            </h1>
            <p className="text-[10px] text-text-secondary font-black opacity-80 uppercase tracking-[0.2em] font-mono leading-none">High-fidelity collective expenditure tracking</p>
          </div>
        </div>
        
        <GroupActions groups={groups as any} userId={userId} />
      </div>

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
