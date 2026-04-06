'use client'

import React, { useState, useTransition } from 'react'
import { Transaction, Account, Category } from '@/lib/db/schema'
import { TransactionItem } from './TransactionItem'
import { Trash2, CheckSquare, Square, X } from 'lucide-react'
import { bulkDeleteTransactions } from '@/modules/transactions/transactions.action'
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
        <div className="sticky top-4 z-50 flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-primary text-white rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => setSelectedIds([])} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
            <span className="font-black text-sm sm:text-base tracking-tight">{selectedIds.length} Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleBulkDelete}
              disabled={isPending}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs sm:text-sm font-black transition-all active:scale-95 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Ledger Items</span>
            </button>
          </div>
        </div>
      )}

      {/* Header with Selection Toggle */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-4 px-2 py-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSelectAll} 
            className="p-1.5 text-text-secondary hover:text-primary transition-all active:scale-90"
            title="Toggle All"
          >
            {selectedIds.length === transactions.length && transactions.length > 0 ? (
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm ring-1 ring-primary/20">
                 <CheckSquare className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-6 h-6 bg-surface border border-border/60 rounded-lg flex items-center justify-center text-text-muted hover:border-primary/50 transition-colors">
                 <Square className="w-4 h-4" />
              </div>
            )}
          </button>
          <div className="flex flex-col">
            <h3 className="text-xl font-black font-display tracking-tighter text-text-primary leading-none">Ledger History</h3>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1 opacity-60">Financial Audit Logs</span>
          </div>
        </div>
        <span className="w-fit text-[10px] font-black font-mono text-text-muted bg-highlight/50 px-4 py-1.5 rounded-full border border-border/5 text-center">
          {transactions.length} RECORDS_SYNCED
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
            <div key={tx.id} className="flex gap-2 sm:gap-3 items-center group/row">
              <button 
                onClick={() => toggleSelect(tx.id)}
                className={`p-1.5 sm:p-2 rounded-xl transition-all grow-0 shrink-0 ${
                  selectedIds.includes(tx.id) 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-surface border border-border-subtle text-text-muted opacity-100 sm:opacity-0 sm:group-hover/row:opacity-100 hover:border-primary/30 transition-all active:scale-90'
                }`}
              >
                {selectedIds.includes(tx.id) ? (
                  <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </button>
              <div className="flex-1 min-w-0">
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
