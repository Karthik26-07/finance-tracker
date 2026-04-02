'use client'

import React from 'react'
import { X, UserPlus, Mail, User, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { addMember } from '@/actions/groups'

interface InviteMemberDialogProps {
  isOpen: boolean
  onClose: () => void
  groupId: string
}

export function InviteMemberDialog({ isOpen, onClose, groupId }: InviteMemberDialogProps) {
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await addMember(groupId, { name, email })
      onClose()
      setName('')
      setEmail('')
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
            className="bg-surface w-full max-w-md rounded-[2.5rem] shadow-2xl border border-border/50 overflow-hidden"
          >
            <div className="p-8 border-b border-border/10 flex justify-between items-center bg-primary/5">
              <div>
                <h3 className="text-xl font-black text-text-primary tracking-tighter leading-none mb-1.5">Expand Collective</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted font-mono opacity-60">Add a new node to this ledger</p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-white hover:bg-highlight text-text-muted hover:text-primary transition-all rounded-2xl border border-border/10 active:scale-90"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] font-mono opacity-60 px-1">Member Name</label>
                <div className="relative group">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-40 group-focus-within:text-primary transition-all">
                      <User size={16} />
                   </div>
                   <input 
                     required
                     className="w-full bg-highlight/50 border border-transparent rounded-[1.2rem] p-4 pl-12 text-sm font-black tracking-tight focus:ring-2 focus:ring-primary/20 focus:bg-surface focus:border-primary/30 transition-all outline-none" 
                     placeholder="e.g. Sarah Connor" 
                     type="text"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                   />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] font-mono opacity-60 px-1">Email Address (Optional)</label>
                <div className="relative group">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-40 group-focus-within:text-primary transition-all">
                      <Mail size={16} />
                   </div>
                   <input 
                     className="w-full bg-highlight/50 border border-transparent rounded-[1.2rem] p-4 pl-12 text-sm font-black tracking-tight focus:ring-2 focus:ring-primary/20 focus:bg-surface focus:border-primary/30 transition-all outline-none" 
                     placeholder="sarah@resistance.org" 
                     type="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                   />
                </div>
              </div>

              <div className="p-4 bg-secondary/5 rounded-2xl border border-secondary/10 flex items-center gap-3">
                 <Shield size={14} className="text-secondary" />
                 <p className="text-[10px] font-bold text-text-secondary opacity-80 leading-relaxed">External members can be linked to app accounts later.</p>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-linear-to-br from-primary to-primary-container text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    'Registering Node...'
                  ) : (
                    <><UserPlus size={18} strokeWidth={3} /> Add to Collective</>
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
