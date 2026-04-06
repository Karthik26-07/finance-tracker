'use client'

import React, { useActionState, startTransition } from 'react'
import { X, Users, Layout, Hash } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createGroup } from '@/modules/groups/groups.action'
import { useRouter } from 'next/navigation'
import { ActionResponse } from '@/lib/errors'
import { toast } from '@/lib/store/useToast'

interface CreateGroupDialogProps {
  isOpen: boolean
  onClose: () => void
}

const COLORS = [
  '#4F8EF7', // Blue
  '#F87171', // Red
  '#34D399', // Green
  '#FBBF24', // Yellow
  '#A78BFA', // Purple
  '#EC4899', // Pink
]

export function CreateGroupDialog({ isOpen, onClose }: CreateGroupDialogProps) {
  const router = useRouter()
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [selectedColor, setSelectedColor] = React.useState(COLORS[0])

  // Modern React 19 approach
  const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
    async (prevState, formData) => {
      const result = await createGroup(formData)
      
      if (result && 'id' in result) {
        toast.success('Collective initialized successfully')
        onClose()
        setName('')
        setDescription('')
        router.push(`/groups?groupId=${result.id}`)
        return null
      }
      
      return result as ActionResponse
    },
    null
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    formData.append('color', selectedColor)
    formData.append('icon', 'users') // Default icon

    startTransition(() => {
      formAction(formData)
    })
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
            className="bg-surface w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-border/50 overflow-hidden"
          >
            <div className="p-8 border-b border-border/10 flex justify-between items-center bg-highlight/30">
              <div>
                <h3 className="text-xl font-black text-text-primary tracking-tighter leading-none mb-1.5">Initialize Collective Node</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted font-mono opacity-60">Create a shared financial flow</p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-white hover:bg-highlight text-text-muted hover:text-tertiary transition-all rounded-2xl border border-border/10 active:scale-90"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              {state && "error" in state && (
                <div className="p-4 text-xs font-bold text-accent-danger bg-accent-danger/10 rounded-2xl border border-accent-danger/20 animate-in fade-in slide-in-from-top-1">
                  {state.error}
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] font-mono opacity-60 px-1">Collective Name</label>
                <div className="relative group">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all font-mono">
                      <Users size={16} />
                   </div>
                   <input 
                     required
                     className="w-full bg-highlight/50 border border-transparent rounded-[1.2rem] p-4 pl-12 text-sm font-black tracking-tight focus:ring-2 focus:ring-primary/20 focus:bg-surface focus:border-primary/30 transition-all outline-none" 
                     placeholder="e.g. Europe Trip 2026" 
                     type="text"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     disabled={isPending}
                   />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] font-mono opacity-60 px-1">Description (Optional)</label>
                <div className="relative group">
                   <div className="absolute left-4 top-4 text-text-muted opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all font-mono">
                      <Layout size={16} />
                   </div>
                   <textarea 
                     className="w-full bg-highlight/50 border border-transparent rounded-[1.2rem] p-4 pl-12 text-sm font-medium tracking-tight focus:ring-2 focus:ring-primary/20 focus:bg-surface focus:border-primary/30 transition-all outline-none min-h-25 resize-none" 
                     placeholder="What is this collective for?" 
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                     disabled={isPending}
                   />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] font-mono opacity-60 px-1">Node Identity Color</label>
                <div className="flex items-center gap-4">
                  <div className="flex flex-wrap gap-3">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-xl transition-all relative flex items-center justify-center shadow-sm hover:scale-110 active:scale-95`}
                        style={{ backgroundColor: color }}
                        disabled={isPending}
                      >
                        {selectedColor === color && (
                          <div className="w-2 h-2 bg-white rounded-full shadow-sm animate-in zoom-in duration-300" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-linear-to-br from-primary to-primary-container text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isPending ? (
                    'Synchronizing Node...'
                  ) : (
                    <><Hash size={18} strokeWidth={3} /> Initialize Collective</>
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
