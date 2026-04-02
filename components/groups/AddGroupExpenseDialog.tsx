'use client'

import React from 'react'
import { X, Calendar, Wallet, Check, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { addGroupExpense } from '@/actions/groups'
import { Group, GroupMember } from '@/types/groups'

interface AddGroupExpenseDialogProps {
  isOpen: boolean
  onClose: () => void
  group: Group
  userId: string
}

export function AddGroupExpenseDialog({ isOpen, onClose, group, userId }: AddGroupExpenseDialogProps) {
  const [title, setTitle] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [splitType, setSplitType] = React.useState<'equal' | 'exact' | 'shares'>('equal')
  const [memberShares, setMemberShares] = React.useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!group?.members?.length) return
    
    setIsSubmitting(true)

    try {
      const total = parseFloat(amount)
      let splits = []

      if (splitType === 'equal') {
        const share = (total / group.members.length).toFixed(2)
        splits = group.members.map((m: GroupMember) => ({
          memberId: m.id,
          amountOwed: share
        }))
      } else if (splitType === 'exact') {
        splits = group.members.map((m: GroupMember) => ({
          memberId: m.id,
          amountOwed: memberShares[m.id] || '0'
        }))
      } else {
        // Shares logic
        const totalShares = group.members.reduce((acc: number, m: GroupMember) => acc + parseInt(memberShares[m.id] || '1'), 0)
        splits = group.members.map((m: GroupMember) => ({
          memberId: m.id,
          amountOwed: ((total * parseInt(memberShares[m.id] || '1')) / totalShares).toFixed(2)
        }))
      }

      const payerId = group.members.find((m: GroupMember) => m.userId === userId)?.id || group.members[0].id

      await addGroupExpense({
        groupId: group.id,
        title,
        totalAmount: amount,
        paidBy: payerId,
        date,
        splitType,
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

  if (!group) return null

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
            className="bg-surface w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-border/50 overflow-hidden"
          >
            <div className="p-8 border-b border-border/10 flex justify-between items-center bg-highlight/30">
              <div>
                <h3 className="text-xl font-black text-text-primary tracking-tighter leading-none mb-1.5">Post Group Expense</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted font-mono opacity-60">Record to {group.name} Ledger</p>
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
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] font-mono opacity-60 px-1">Description of Expenditure</label>
                <div className="relative group">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all font-mono">
                      <Wallet size={16} />
                   </div>
                   <input 
                     required
                     className="w-full bg-highlight/50 border border-transparent rounded-[1.2rem] p-4 pl-12 text-sm font-black tracking-tight focus:ring-2 focus:ring-primary/20 focus:bg-surface focus:border-primary/30 transition-all outline-none" 
                     placeholder="e.g. Seafood Dinner at Brittos" 
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
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all font-black font-mono">₹</div>
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
                   <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] font-mono opacity-60 px-1">Transaction Date</label>
                   <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all pointer-events-none" size={16} />
                      <input 
                        className="w-full bg-highlight/50 border border-transparent rounded-[1.2rem] p-4 pl-12 text-[11px] font-black uppercase tracking-widest font-mono focus:ring-2 focus:ring-primary/20 focus:bg-surface focus:border-primary/30 transition-all outline-none" 
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] font-mono opacity-60 px-1">Distribution Vector</label>
                <div className="grid grid-cols-3 gap-3">
                   <button 
                     type="button" 
                     onClick={() => setSplitType('equal')}
                     className={`py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${splitType === 'equal' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-highlight/50 text-text-muted hover:bg-highlight'}`}
                   >
                     Equally
                   </button>
                   <button 
                     type="button" 
                     onClick={() => setSplitType('shares')}
                     className={`py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${splitType === 'shares' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-highlight/50 text-text-muted hover:bg-highlight'}`}
                   >
                     Shares
                   </button>
                   <button 
                     type="button" 
                     onClick={() => setSplitType('exact')}
                     className={`py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${splitType === 'exact' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-highlight/50 text-text-muted hover:bg-highlight'}`}
                   >
                     Exact
                   </button>
                </div>
                
                {splitType !== 'equal' && (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {group.members.map((m: GroupMember) => (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-highlight/30 rounded-xl border border-border/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary truncate max-w-30">{m.name}</span>
                        <input 
                          type="number"
                          placeholder={splitType === 'shares' ? "1 Share" : "₹0.00"}
                          value={memberShares[m.id] || ''}
                          onChange={(e) => setMemberShares({...memberShares, [m.id]: e.target.value})}
                          className="bg-surface border border-border/20 rounded-lg py-1.5 px-3 text-[11px] font-black w-24 focus:outline-none focus:ring-2 focus:ring-primary/20 text-right"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
                   <AlertCircle size={14} className="text-primary" />
                   <p className="text-[10px] font-bold text-text-secondary opacity-80 leading-relaxed">Cost will be distributed among <span className="text-primary font-black">{group.members?.length || 0} members</span>.</p>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-linear-to-br from-primary to-primary-container text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    'Liquidating Flow...'
                  ) : (
                    <><Check size={18} strokeWidth={3} /> Post Expense to Nodes</>
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
