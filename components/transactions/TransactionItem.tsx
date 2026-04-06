'use client'

import React, { useTransition, useState } from 'react'
import { Transaction, Account, Category } from '@/lib/db/schema'
import { format } from 'date-fns'
import { Edit2, Trash2 } from 'lucide-react'
import { deleteTransaction } from '@/modules/transactions/transactions.action'
import Link from 'next/link'
import { ConfirmationDialog } from '../ui/ConfirmationDialog'

interface TransactionItemProps {
  transaction: Transaction & {
    account: Account | null
    category: Category | null
  }
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const [isPending, startTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const isIncome = transaction.type === 'income'
  const isExpense = transaction.type === 'expense'
  const isTransfer = transaction.type === 'transfer'

  const amountColor = isIncome 
    ? 'text-secondary' 
    : isExpense 
      ? 'text-tertiary' 
      : 'text-text-primary'

  const amountPrefix = isIncome ? '+' : isExpense ? '-' : ''

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const onConfirmDelete = async () => {
    setShowDeleteConfirm(false)
    startTransition(async () => {
      await deleteTransaction(transaction.id)
    })
  }

  return (
    <div className={`group flex items-center justify-between p-2.5 sm:p-3.5 bg-surface hover:bg-elevated transition-colors rounded-2xl border border-transparent hover:border-border-subtle ${isPending ? 'opacity-50 grayscale' : 'opacity-100'}`}>
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Category Icon */}
        <div 
          className={`w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl sm:rounded-2xl text-base sm:text-lg shrink-0 ${
            isIncome ? 'bg-secondary/10 text-secondary' : isExpense ? 'bg-tertiary/10 text-tertiary' : 'bg-primary/10 text-primary'
          }`}
          style={transaction.category?.color ? { borderLeft: `4px solid ${transaction.category.color}` } : undefined}
        >
          {transaction.category?.icon || (isTransfer ? '⇄' : isIncome ? '↓' : '↑')}
        </div>

        {/* Transaction Info */}
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-sm sm:text-base text-text-primary truncate">
            {transaction.note || transaction.category?.name || (isTransfer ? 'Transfer' : 'Other')}
          </h4>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-text-secondary/70 mt-0.5 sm:mt-1 overflow-hidden">
            <span className="truncate max-w-20 sm:max-w-none">{transaction.account?.name}</span>
            <span className="opacity-40">•</span>
            <span className="shrink-0">{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
            {transaction.location && (
              <>
                <span className="opacity-40">•</span>
                <span className="truncate">{transaction.location}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 shrink-0 pl-3">
        {/* Amount and Tags */}
        <div className="text-right">
          <div className={`text-sm sm:text-base font-mono font-black tabular-nums ${amountColor}`}>
            {amountPrefix}₹{parseFloat(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {transaction.tags && transaction.tags.length > 0 && (
            <div className="hidden sm:flex gap-1 mt-1 justify-end">
              {transaction.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-highlight rounded text-[10px] text-text-secondary">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-0.5 sm:gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <Link href={`/transactions/${transaction.id}/edit`}>
            <button className="p-1.5 sm:p-2 text-text-secondary/60 hover:text-primary hover:bg-white rounded-xl transition-colors">
              <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </Link>
          <button 
            onClick={handleDelete}
            disabled={isPending}
            className="p-1.5 sm:p-2 text-text-secondary/60 hover:text-tertiary hover:bg-white rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      <ConfirmationDialog 
        isOpen={showDeleteConfirm}
        title="Delete Transaction?"
        description="Are you sure you want to delete this transaction? This action will restore the account balance and cannot be undone."
        confirmText="Delete Transaction"
        onConfirm={onConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        variant="danger"
      />
    </div>
  )
}
