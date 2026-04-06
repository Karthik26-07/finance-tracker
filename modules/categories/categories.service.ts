import { BaseService } from '../shared/base.service'
import { CategoryRepository } from './categories.repository'
import { TransactionRepository } from '../transactions/transactions.repository'
import { AuthError, ValidationError } from '@/lib/errors'

export class CategoryService extends BaseService {
  private categoryRepository: CategoryRepository
  private transactionRepository: TransactionRepository

  constructor() {
    super()
    this.categoryRepository = new CategoryRepository()
    this.transactionRepository = new TransactionRepository()
  }

  async createCategory(userId: string, data: any) {
    return this.categoryRepository.create({
      userId,
      ...data,
      isSystem: false,
    })
  }

  async updateCategory(id: string, userId: string, data: any) {
    const existing = await this.categoryRepository.getByIdWithUserId(id, userId)
    if (!existing || existing.isSystem) {
      throw new AuthError('NOT_FOUND', 'Category not found or cannot be modified')
    }

    return this.categoryRepository.update(id, {
      ...data,
      updatedAt: new Date()
    })
  }

  async deleteCategory(id: string, userId: string) {
    const existing = await this.categoryRepository.getByIdWithUserId(id, userId)
    if (!existing || existing.isSystem) {
      throw new AuthError('NOT_FOUND', 'Category not found or cannot be deleted')
    }

    const sub = await this.categoryRepository.findFirst({ parentId: id })
    if (sub) {
      throw new ValidationError('Cannot delete category with subcategories. Reassign or delete subcategories first.')
    }

    await this.categoryRepository.transaction(async (tx) => {
      await this.transactionRepository.withTransaction(tx).updateWhere(
        { categoryId: id },
        { categoryId: null }
      )
      await this.categoryRepository.withTransaction(tx).delete(id)
    })

    return { success: true }
  }
}
