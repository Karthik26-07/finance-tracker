import { BaseRepository } from '../shared/base.repository'
import { groupSplits } from '@/lib/db/schema/groups'
import { db } from '@/lib/db'
import { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export type GroupSplit = InferSelectModel<typeof groupSplits>
export type NewGroupSplit = InferInsertModel<typeof groupSplits>

export class GroupSplitRepository extends BaseRepository<typeof groupSplits, GroupSplit, NewGroupSplit, any> {
  constructor(database: any = db) {
    super(database, groupSplits)
  }

  withTransaction(tx: any): this {
    return new GroupSplitRepository(tx) as this
  }
}
