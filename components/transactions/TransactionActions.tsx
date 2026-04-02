'use client'

import React, { useState } from 'react'
import { Plus, FileUp, Download } from 'lucide-react'
import Link from 'next/link'
import { CSVImportDialog } from './CSVImportDialog'
import { Account } from '@/lib/db/schema'

interface TransactionActionsProps {
  accounts: Account[]
}

export function TransactionActions({ accounts }: TransactionActionsProps) {
  const [isImportOpen, setIsImportOpen] = useState(false)

  return (
    <div className="flex gap-3">
      <button 
        onClick={() => setIsImportOpen(true)}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-border-subtle rounded-2xl font-bold text-sm text-text-primary hover:bg-highlight hover:border-primary/30 transition-all shadow-sm active:scale-95"
      >
        <FileUp className="w-4 h-4 text-primary" />
        <span>Import CSV</span>
      </button>

      <Link href="/transactions/new">
        <div className="flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-br from-primary to-primary-container text-white rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-primary/30 transition-all cursor-pointer active:scale-95 group">
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          <span>Add Record</span>
        </div>
      </Link>

      <CSVImportDialog 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        accounts={accounts} 
      />
    </div>
  )
}
