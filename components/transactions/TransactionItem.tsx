'use client'

import React, { useTransition, useState } from 'react'
import { Transaction, Account, Category } from '@/lib/db/schema'
import { format } from 'date-fns'
import { Edit2, Trash2 } from 'lucide-react'
import { deleteTransaction } from '@/actions/transactions'
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
    <div className={`group flex items-center justify-between p-4 bg-surface hover:bg-elevated transition-colors rounded-2xl border border-transparent hover:border-border-subtle ${isPending ? 'opacity-50 grayscale' : 'opacity-100'}`}>
      <div className="flex items-center gap-4">
        {/* Category Icon */}
        <div 
          className={`w-12 h-12 flex items-center justify-center rounded-2xl text-xl shrink-0 ${
            isIncome ? 'bg-secondary/10 text-secondary' : isExpense ? 'bg-tertiary/10 text-tertiary' : 'bg-primary/10 text-primary'
          }`}
          style={transaction.category?.color ? { borderLeft: `4px solid ${transaction.category.color}` } : undefined}
        >
          {transaction.category?.icon || (isTransfer ? '⇄' : isIncome ? '↓' : '↑')}
        </div>

        {/* Transaction Info */}
        <div className="min-w-0">
          <h4 className="font-semibold text-text-primary truncate">
            {transaction.note || transaction.category?.name || (isTransfer ? 'Transfer' : 'Other')}
          </h4>
          <div className="flex items-center gap-2 text-xs text-text-muted mt-1 whitespace-nowrap overflow-hidden">
            <span className="truncate">{transaction.account?.name}</span>
            <span>•</span>
            <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
            {transaction.location && (
              <>
                <span>•</span>
                <span className="truncate">{transaction.location}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {/* Amount and Tags */}
        <div className="text-right">
          <div className={`text-base font-mono font-black tabular-nums ${amountColor}`}>
            {amountPrefix}₹{parseFloat(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {transaction.tags && transaction.tags.length > 0 && (
            <div className="flex gap-1 mt-1 justify-end">
              {transaction.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-highlight rounded text-[10px] text-text-secondary">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons (Visible on hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/transactions/${transaction.id}/edit`}>
            <button className="p-2 text-text-secondary hover:text-primary hover:bg-white rounded-xl transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
          </Link>
          <button 
            onClick={handleDelete}
            disabled={isPending}
            className="p-1.5 text-text-secondary hover:text-tertiary hover:bg-white rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
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
