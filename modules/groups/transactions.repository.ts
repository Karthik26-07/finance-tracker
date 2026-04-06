import { BaseRepository } from '../shared/base.repository'
import { groupTransactions } from '@/lib/db/schema/groups'
import { db } from '@/lib/db'
import { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export type GroupTransaction = InferSelectModel<typeof groupTransactions>
export type NewGroupTransaction = InferInsertModel<typeof groupTransactions>

export class GroupTransactionRepository extends BaseRepository<typeof groupTransactions, GroupTransaction, NewGroupTransaction, any> {
  constructor(database: any = db) {
    super(database, groupTransactions)
  }

  withTransaction(tx: any): this {
    return new GroupTransactionRepository(tx) as this
  }
}
