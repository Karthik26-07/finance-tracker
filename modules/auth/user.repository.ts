import { BaseRepository } from '../shared/base.repository'
import { users, type User, type NewUser } from '@/lib/db/schema'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'

export class UserRepository extends BaseRepository<typeof users, User, NewUser, any> {
  constructor(database: any = db) {
    super(database, users)
  }

  withTransaction(tx: any): this {
    return new UserRepository(tx) as this
  }

  async getByEmail(email: string) {
    return this.findFirst(eq(users.email, email))
  }
}
