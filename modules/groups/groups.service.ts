import { BaseService } from '../shared/base.service'
import { GroupRepository } from './groups.repository'
import { GroupMemberRepository } from './members.repository'
import { GroupTransactionRepository } from './transactions.repository'
import { GroupSplitRepository } from './splits.repository'
import { and, eq } from 'drizzle-orm'

export class GroupService extends BaseService {
  private groupRepository: GroupRepository
  private memberRepository: GroupMemberRepository
  private transactionRepository: GroupTransactionRepository
  private splitRepository: GroupSplitRepository

  constructor() {
    super()
    this.groupRepository = new GroupRepository()
    this.memberRepository = new GroupMemberRepository()
    this.transactionRepository = new GroupTransactionRepository()
    this.splitRepository = new GroupSplitRepository()
  }

  async createGroup(userId: string, data: any, sessionUser: { name?: string | null, email?: string | null }) {
      let createdGroup: any

      await this.groupRepository.transaction(async (tx) => {
        createdGroup = await this.groupRepository.withTransaction(tx).create({
          ...data,
          createdBy: userId,
        })

        await this.memberRepository.withTransaction(tx).create({
          groupId: createdGroup.id,
          userId: userId,
          name: sessionUser.name || "Owner",
          email: sessionUser.email || null,
          role: "admin",
        })
      })

      return createdGroup
  }

  async addGroupExpense(data: any) {
      let createdTx: any

      await this.groupRepository.transaction(async (tx) => {
        createdTx = await this.transactionRepository.withTransaction(tx).create({
          groupId: data.groupId,
          title: data.title,
          totalAmount: data.totalAmount,
          paidBy: data.paidBy,
          date: data.date,
          note: data.note || null,
          splitType: data.splitType,
        })

        await this.splitRepository.withTransaction(tx).createMany(
          data.splits.map((s: any) => ({
            groupTransactionId: createdTx.id,
            memberId: s.memberId,
            amountOwed: s.amountOwed,
          }))
        )
      })

      return createdTx
  }

  async addMember(groupId: string, data: { name: string, email?: string, userId?: string }) {
      return this.memberRepository.create({
        groupId,
        name: data.name,
        email: data.email || null,
        userId: data.userId || null,
        role: "member",
      })
  }

  async settleDebt(fromMemberId: string) {
      await this.splitRepository.updateWhere(
        and(
          eq(this.splitRepository.getTable().memberId, fromMemberId),
          eq(this.splitRepository.getTable().isSettled, false)
        ),
        { isSettled: true, settledAt: new Date() }
      )
      return { success: true }
  }
}
