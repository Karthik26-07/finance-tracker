'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transferSchema, TransferInput } from '@/lib/validations/accounts'
import { transferFunds } from '@/actions/accounts'
import { Account } from '@/types'
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'

interface TransferFormProps {
  accounts: Account[]
  onSuccess?: () => void
}

export function TransferForm({ accounts, onSuccess }: TransferFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)
  const [formData, setFormData] = useState<TransferInput | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<TransferInput>({
    resolver: zodResolver(transferSchema) as Resolver<TransferInput>,
    defaultValues: {
      date: new Date().toISOString().split('T')[0]
    }
  })

  // Exclude inactive accounts if necessary, here we assume accounts prop is already filtered
  
  const onSubmit = (data: TransferInput) => {
    setFormData(data)
    setShowConfirm(true)
  }

  const onConfirmAction = () => {
    if (!formData) return
    setShowConfirm(false)
    setError(null)
    startTransition(async () => {
      try {
        const result = await transferFunds(formData)
        if (result && 'error' in result) {
          setError(result.error)
          return
        }
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/accounts')
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-accent-danger bg-accent-danger/10 rounded-xl border border-accent-danger/20">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
           <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">From Account</label>
           <select 
             {...register('fromAccountId')}
             className="w-full px-4 py-3 rounded-xl border border-border/60 bg-surface/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-sm font-medium text-text-primary appearance-none cursor-pointer"
           >
             <option value="">Select source account</option>
             {accounts.map(a => (
               <option key={`from-${a.id}`} value={a.id}>{a.name} (₹{a.balance})</option>
             ))}
           </select>
           {errors.fromAccountId && <p className="mt-1.5 text-xs text-accent-danger font-medium ml-1">{String(errors.fromAccountId.message)}</p>}
        </div>

        <div>
           <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">To Account</label>
           <select 
             {...register('toAccountId')}
             className="w-full px-4 py-3 rounded-xl border border-border/60 bg-surface/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-sm font-medium text-text-primary appearance-none cursor-pointer"
           >
             <option value="">Select destination account</option>
             {accounts.map(a => (
               <option key={`to-${a.id}`} value={a.id}>{a.name}</option>
             ))}
           </select>
           {errors.toAccountId && <p className="mt-1.5 text-xs text-accent-danger font-medium ml-1">{String(errors.toAccountId.message)}</p>}
        </div>

        <div>
          <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">Amount</label>
          <div className="relative shadow-sm rounded-xl overflow-hidden group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-mono group-focus-within:text-primary transition-colors">
              ₹
            </span>
            <input 
              type="number"
              step="0.01"
              {...register('amount')}
              className="w-full pl-9 pr-4 py-4 rounded-xl border border-border/60 bg-surface/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all tabular-nums text-2xl font-black text-text-primary placeholder:text-text-muted/30"
              placeholder="0.00"
            />
          </div>
          {errors.amount && <p className="mt-1.5 text-xs text-accent-danger font-medium ml-1">{String(errors.amount.message)}</p>}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">Date</label>
            <input 
              type="date"
              {...register('date')}
              className="w-full px-4 py-3 rounded-xl border border-border/60 bg-surface/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-sm font-medium text-text-primary"
            />
            {errors.date && <p className="mt-1.5 text-xs text-accent-danger font-medium ml-1">{String(errors.date.message)}</p>}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">Note (Optional)</label>
          <input 
            type="text"
            {...register('note')}
            className="w-full px-4 py-3 rounded-xl border border-border/60 bg-surface/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-sm font-medium text-text-primary placeholder:text-text-muted/40"
            placeholder="e.g. Monthly savings transfer"
          />
          {errors.note && <p className="mt-1.5 text-xs text-accent-danger font-medium ml-1">{String(errors.note.message)}</p>}
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          type="submit"
          disabled={isPending}
          className="w-full px-4 py-4 bg-linear-to-r from-primary to-primary-container text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-70 transition-opacity text-lg"
        >
          {isPending ? 'Processing...' : 'Transfer Funds'}
        </button>
      </div>
      <ConfirmationDialog
        isOpen={showConfirm}
        title="Transfer Funds?"
        description="Are you sure you want to transfer these funds? This will update both account balances immediately."
        confirmText="Transfer"
        variant="info"
        onConfirm={onConfirmAction}
        onCancel={() => setShowConfirm(false)}
      />
    </form>
  )
}
