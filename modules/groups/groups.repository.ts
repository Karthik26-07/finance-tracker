import { BaseRepository } from '../shared/base.repository'
import { groups } from '@/lib/db/schema/groups'
import { db } from '@/lib/db'
import { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export type Group = InferSelectModel<typeof groups>
export type NewGroup = InferInsertModel<typeof groups>

export class GroupRepository extends BaseRepository<typeof groups, Group, NewGroup, any> {
  constructor(database: any = db) {
    super(database, groups)
  }

  withTransaction(tx: any): this {
    return new GroupRepository(tx) as this
  }
}
