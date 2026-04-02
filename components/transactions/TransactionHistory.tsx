'use client'

import React, { useState, useTransition } from 'react'
import { Transaction, Account, Category } from '@/lib/db/schema'
import { TransactionItem } from './TransactionItem'
import { Trash2, CheckSquare, Square, X } from 'lucide-react'
import { bulkDeleteTransactions } from '@/actions/transactions'
import { ConfirmationDialog } from '../ui/ConfirmationDialog'

interface TransactionHistoryProps {
  transactions: (Transaction & {
    account: Account | null
    category: Category | null
  })[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(transactions.map(t => t.id))
    }
  }

  const handleBulkDelete = () => {
    setShowBulkDeleteConfirm(true)
  }

  const onConfirmBulkDelete = () => {
    setShowBulkDeleteConfirm(false)
    startTransition(async () => {
      await bulkDeleteTransactions({ ids: selectedIds })
      setSelectedIds([])
    })
  }

  return (
    <div className="space-y-4">
      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-10 flex items-center justify-between p-4 bg-primary text-white rounded-2xl shadow-xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedIds([])} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
            <span className="font-bold">{selectedIds.length} selected</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleBulkDelete}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Header with Selection Toggle */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSelectAll} 
            className="p-1 text-text-secondary hover:text-primary transition-colors"
          >
            {selectedIds.length === transactions.length && transactions.length > 0 ? (
              <CheckSquare className="w-5 h-5 text-primary" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
          <h3 className="text-xl font-bold font-display">Transaction History</h3>
        </div>
        <span className="text-xs font-mono font-medium text-text-muted bg-highlight px-3 py-1 rounded-full">
          {transactions.length} Records
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="p-20 text-center bg-surface rounded-[40px] border border-dashed border-border flex flex-col items-center">
          <div className="p-6 bg-highlight rounded-[30px] mb-6">
            <Trash2 className="w-10 h-10 text-text-muted" />
          </div>
          <p className="text-xl font-bold text-text-primary">No transactions found</p>
          <p className="text-text-secondary mt-2 max-w-sm mx-auto">Try adjusting your filters or record your first transaction.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map(tx => (
            <div key={tx.id} className="flex gap-3 items-center group/row">
              <button 
                onClick={() => toggleSelect(tx.id)}
                className={`p-1.5 rounded-xl transition-all ${
                  selectedIds.includes(tx.id) 
                    ? 'bg-primary text-white' 
                    : 'bg-surface border border-border-subtle text-text-muted opacity-0 group-hover/row:opacity-100'
                }`}
              >
                {selectedIds.includes(tx.id) ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
              <div className="flex-1">
                <TransactionItem transaction={tx} />
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationDialog 
        isOpen={showBulkDeleteConfirm}
        title={`Delete ${selectedIds.length} Transactions?`}
        description={`Are you sure you want to delete the selected ${selectedIds.length} transactions? This will permanently remove them and restore account balances.`}
        confirmText="Confirm Bulk Delete"
        onConfirm={onConfirmBulkDelete}
        onCancel={() => setShowBulkDeleteConfirm(false)}
        variant="danger"
      />
    </div>
  )
}
