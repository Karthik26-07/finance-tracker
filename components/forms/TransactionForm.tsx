'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTransactionSchema, CreateTransactionInput, updateTransactionSchema, UpdateTransactionInput } from '@/lib/validations/transactions'
import { createTransaction, updateTransaction } from '@/actions/transactions'
import { Account, Category } from '@/lib/db/schema'
import { toast } from '@/lib/store/useToast'
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'

interface TransactionFormProps {
  initialData?: Partial<CreateTransactionInput>
  transactionId?: string
  accounts: Account[]
  categories: Category[]
  onSuccess?: () => void
  isModal?: boolean
}

export function TransactionForm({ 
  initialData, 
  transactionId, 
  accounts, 
  categories, 
  onSuccess, 
  isModal 
}: TransactionFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)
  const [formData, setFormData] = useState<CreateTransactionInput | null>(null)
  
  const isEditing = !!transactionId

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CreateTransactionInput>({
    resolver: zodResolver(isEditing ? updateTransactionSchema : createTransactionSchema) as Resolver<CreateTransactionInput>,
    defaultValues: initialData || {
      type: 'expense',
      amount: 0,
      accountId: accounts[0]?.id || '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      note: '',
      tags: [],
    }
  })

  // Watch the transaction type to filter categories or show/hide fields
  const type = watch('type')

  const onSubmit = (data: CreateTransactionInput) => {
    setFormData(data)
    setShowConfirm(true)
  }

  const onConfirmAction = () => {
    if (!formData) return
    setShowConfirm(false)
    setError(null)
    startTransition(async () => {
      try {
        const result = isEditing 
          ? await updateTransaction(transactionId, formData)
          : await createTransaction(formData)
          
        if (result && 'error' in result) {
          setError(result.error)
          toast.error(result.error)
          return
        }
        
        toast.success(isEditing ? 'Transaction updated' : 'Transaction recorded successfully')
        
        if (onSuccess) {
          await onSuccess()
        } else {
          router.push('/transactions')
          router.refresh()
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'An unexpected error occurred'
        setError(msg)
        toast.error(msg)
      }
    })
  }

  const filteredCategories = categories.filter(cat => 
    type === 'transfer' ? false : (cat.type === 'both' || cat.type === type)
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-accent-danger bg-accent-danger/10 rounded-xl border border-accent-danger/20 animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      {/* Transaction Type Toggle */}
      <div className="flex bg-highlight/50 p-1 rounded-xl gap-1">
        {(['income', 'expense', 'transfer'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setValue('type', t)
              // Reset category if switching to transfer
              if (t === 'transfer') setValue('categoryId', undefined as any)
            }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all capitalize ${
              type === t 
                ? 'bg-surface text-primary shadow-sm' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* Amount Field */}
        <div>
          <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">Amount</label>
          <div className="relative shadow-sm rounded-xl">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-mono">₹</span>
            <input 
              type="number"
              step="0.01"
              {...register('amount')}
              className={`w-full pl-8 pr-4 py-4 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-2xl font-mono tabular-nums ${
                type === 'income' ? 'text-accent-success' : type === 'expense' ? 'text-accent-danger' : 'text-text-primary'
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.amount && <p className="mt-1.5 text-xs text-accent-danger font-medium ml-1">{String(errors.amount.message)}</p>}
        </div>

        {/* Account Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
              {type === 'transfer' ? 'From Account' : 'Account'}
            </label>
            <div className="relative shadow-sm rounded-xl overflow-hidden">
              <select 
                {...register('accountId')}
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
              >
                <option value="" disabled>Select account</option>
                {accounts.map(acc => (
                  <option key={acc.id || 'err'} value={acc.id || ''}>{acc.name} (₹{parseFloat(acc.balance || '0').toLocaleString()})</option>
                ))}
              </select>
            </div>
            {errors.accountId && <p className="mt-1.5 text-xs text-accent-danger font-medium ml-1">{String(errors.accountId.message)}</p>}
          </div>

          {type === 'transfer' ? (
            <div>
              <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">To Account</label>
              <div className="relative shadow-sm rounded-xl overflow-hidden">
                <select 
                  {...register('transferToAccountId')}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                >
                  <option value="" disabled>Select account</option>
                  {accounts.map(acc => (
                    <option key={acc.id || 'err'} value={acc.id || ''}>{acc.name} (₹{parseFloat(acc.balance || '0').toLocaleString()})</option>
                  ))}
                </select>
              </div>
              {errors.transferToAccountId && <p className="mt-1.5 text-xs text-accent-danger font-medium ml-1">{String(errors.transferToAccountId.message)}</p>}
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">Category</label>
              <div className="relative shadow-sm rounded-xl overflow-hidden">
                <select 
                  {...register('categoryId')}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                >
                  <option value="">No category</option>
                  {filteredCategories.map(cat => (
                    <option key={cat.id || 'err'} value={cat.id || ''}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              {errors.categoryId && <p className="mt-1.5 text-xs text-accent-danger font-medium ml-1">{String(errors.categoryId.message)}</p>}
            </div>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">Date</label>
            <input 
              type="date"
              {...register('date')}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
            />
            {errors.date && <p className="mt-1.5 text-xs text-accent-danger font-medium ml-1">{String(errors.date.message)}</p>}
          </div>
          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">Time</label>
            <input 
              type="time"
              {...register('time')}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">Note (Optional)</label>
          <textarea 
            {...register('note')}
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none shadow-sm"
            placeholder="What was this for?"
          />
        </div>
      </div>

      {/* Form Buttons */}
      <div className="pt-4 flex gap-3">
        {!isModal && (
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-3.5 border border-border-subtle rounded-xl text-text-primary hover:bg-elevated transition-colors font-semibold active:scale-95"
          >
            Cancel
          </button>
        )}
        <button 
          type="submit"
          disabled={isPending}
          className="flex-1 px-4 py-3.5 bg-linear-to-r from-primary to-primary-container text-white rounded-xl font-bold shadow-lg hover:brightness-110 disabled:opacity-70 transition-all active:scale-95"
        >
          {isPending ? 'Saving...' : (isEditing ? 'Update Transaction' : 'Record Transaction')}
        </button>
      </div>
      <ConfirmationDialog
        isOpen={showConfirm}
        title={isEditing ? "Update Transaction?" : "Record Transaction?"}
        description={
            isEditing 
            ? "Are you sure you want to update this transaction? This will adjust your account balances accordingly." 
            : "Confirm recording this transaction. Your account balances will be updated immediately."
        }
        confirmText={isEditing ? "Update" : "Confirm"}
        variant="info"
        onConfirm={onConfirmAction}
        onCancel={() => setShowConfirm(false)}
      />
    </form>
  )
}
