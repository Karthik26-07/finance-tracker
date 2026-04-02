'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transferSchema, TransferInput } from '@/lib/validations/accounts'
import { transferFunds } from '@/actions/accounts'
import { Account } from '@/types'

interface TransferFormProps {
  accounts: Account[]
  onSuccess?: () => void
}

export function TransferForm({ accounts, onSuccess }: TransferFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors } } = useForm<TransferInput>({
    resolver: zodResolver(transferSchema) as Resolver<TransferInput>,
    defaultValues: {
      date: new Date().toISOString().split('T')[0]
    }
  })

  // Exclude inactive accounts if necessary, here we assume accounts prop is already filtered
  
  const onSubmit = (data: TransferInput) => {
    setError(null)
    startTransition(async () => {
      try {
        const result = await transferFunds(data)
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
           <label className="block text-sm font-medium text-text-secondary mb-1">From Account</label>
           <select 
             {...register('fromAccountId')}
             className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
           >
             <option value="">Select source account</option>
             {accounts.map(a => (
               <option key={`from-${a.id}`} value={a.id}>{a.name} (₹{a.balance})</option>
             ))}
           </select>
           {errors.fromAccountId && <p className="mt-1 text-sm text-accent-danger">{String(errors.fromAccountId.message)}</p>}
        </div>

        <div>
           <label className="block text-sm font-medium text-text-secondary mb-1">To Account</label>
           <select 
             {...register('toAccountId')}
             className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
           >
             <option value="">Select destination account</option>
             {accounts.map(a => (
               <option key={`to-${a.id}`} value={a.id}>{a.name}</option>
             ))}
           </select>
           {errors.toAccountId && <p className="mt-1 text-sm text-accent-danger">{String(errors.toAccountId.message)}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Amount</label>
          <input 
            type="number"
            step="0.01"
            {...register('amount')}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all tabular-nums text-2xl font-semibold"
            placeholder="0.00"
          />
          {errors.amount && <p className="mt-1 text-sm text-accent-danger">{String(errors.amount.message)}</p>}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
             <label className="block text-sm font-medium text-text-secondary mb-1">Date</label>
            <input 
              type="date"
              {...register('date')}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {errors.date && <p className="mt-1 text-sm text-accent-danger">{String(errors.date.message)}</p>}
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-text-secondary mb-1">Note (Optional)</label>
          <input 
            type="text"
            {...register('note')}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="e.g. Monthly savings transfer"
          />
          {errors.note && <p className="mt-1 text-sm text-accent-danger">{String(errors.note.message)}</p>}
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
    </form>
  )
}
