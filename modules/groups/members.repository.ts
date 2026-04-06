import { BaseRepository } from '../shared/base.repository'
import { groupMembers } from '@/lib/db/schema/groups'
import { db } from '@/lib/db'
import { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export type GroupMember = InferSelectModel<typeof groupMembers>
export type NewGroupMember = InferInsertModel<typeof groupMembers>

export class GroupMemberRepository extends BaseRepository<typeof groupMembers, GroupMember, NewGroupMember, any> {
  constructor(database: any = db) {
    super(database, groupMembers)
  }

  withTransaction(tx: any): this {
    return new GroupMemberRepository(tx) as this
  }
}
