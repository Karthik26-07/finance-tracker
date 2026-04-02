'use client'

import React from 'react'
import { X, Calendar, Wallet, Check, Users, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { addGroupExpense } from '@/actions/groups'

interface ManualGroupExpenseDialogProps {
  isOpen: boolean
  onClose: () => void
  groups: any[]
  userId: string
}

export function ManualGroupExpenseDialog({ isOpen, onClose, groups, userId }: ManualGroupExpenseDialogProps) {
  const [selectedGroupId, setSelectedGroupId] = React.useState(groups[0]?.id || '')
  const [title, setTitle] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0])
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const selectedGroup = groups.find(g => g.id === selectedGroupId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGroup) return
    
    setIsSubmitting(true)

    try {
      const numMembers = selectedGroup.members?.length || 0
      if (numMembers === 0) return
      
      const share = (parseFloat(amount) / numMembers).toFixed(2)
      
      const splits = selectedGroup.members.map((m: any) => ({
        memberId: m.id,
        amountOwed: share
      }))

      const payerId = selectedGroup.members.find((m: any) => m.userId === userId)?.id || selectedGroup.members[0].id

      await addGroupExpense({
        groupId: selectedGroupId,
        title,
        totalAmount: amount,
        paidBy: payerId,
        date,
        splitType: 'equal',
        splits
      })
      
      onClose()
      setTitle('')
      setAmount('')
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-on-surface/40 backdrop-blur-md animate-in fade-in duration-300"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl border border-border/50 overflow-hidden"
          >
            <div className="p-8 border-b border-border/10 flex justify-between items-center bg-highlight/30">
              <div>
                <h3 className="text-xl font-black text-text-primary tracking-tighter leading-none mb-1.5">Universal Node Ledger</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted font-mono opacity-60">Manual Ledger Posting Entry</p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-white hover:bg-highlight text-text-muted hover:text-tertiary transition-all rounded-2xl border border-border/10 active:scale-90"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] font-mono opacity-60 px-1">Target Collective Node</label>
                <div className="relative group">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                      <Users size={16} />
                   </div>
                   <select 
                     required
                     className="w-full bg-highlight/50 border border-transparent rounded-[1.2rem] p-4 pl-12 text-sm font-black appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all outline-none"
                     value={selectedGroupId}
                     onChange={(e) => setSelectedGroupId(e.target.value)}
                   >
                     {groups.map((g) => (
                       <option key={g.id} value={g.id}>{g.name}</option>
                     ))}
                   </select>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                      <ChevronDown size={16} />
                   </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] font-mono opacity-60 px-1">Entry Title</label>
                <div className="relative group">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-40 group-focus-within:text-primary transition-all">
                      <Wallet size={16} />
                   </div>
                   <input 
                     required
                     className="w-full bg-highlight/50 border border-transparent rounded-[1.2rem] p-4 pl-12 text-sm font-black tracking-tight focus:ring-2 focus:ring-primary/20 focus:bg-surface focus:border-primary/30 transition-all outline-none" 
                     placeholder="e.g. Server Hosting Fees" 
                     type="text"
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                   />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-1 space-y-3">
                   <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] font-mono opacity-60 px-1">Amount (₹)</label>
                   <div className="relative group">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-black font-mono">₹</div>
                     <input 
                       required
                       className="w-full bg-highlight/50 border border-transparent rounded-[1.2rem] p-4 pl-10 text-xl font-black tabular-nums tracking-tighter focus:ring-2 focus:ring-primary/20 focus:bg-surface focus:border-primary/30 transition-all outline-none" 
                       placeholder="0.00" 
                       type="number"
                       step="0.01"
                       value={amount}
                       onChange={(e) => setAmount(e.target.value)}
                     />
                   </div>
                </div>
                <div className="flex-1 space-y-3">
                   <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] font-mono opacity-60 px-1">Ledger Date</label>
                   <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-40 group-focus-within:text-primary transition-all pointer-events-none" size={16} />
                      <input 
                        className="w-full bg-highlight/50 border border-transparent rounded-[1.2rem] p-4 pl-12 text-[11px] font-black uppercase tracking-widest font-mono focus:ring-2 focus:ring-primary/20 focus:bg-surface focus:border-primary/30 transition-all outline-none" 
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                   </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-linear-to-br from-primary to-primary-container text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    'Liquidating Entry...'
                  ) : (
                    <><Check size={18} strokeWidth={3} /> Post Universal Ledger Entry</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
