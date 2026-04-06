import { BaseService } from '../shared/base.service'
import { UserRepository } from './user.repository'
import bcrypt from 'bcryptjs'
import { AuthError } from '@/lib/errors'
import { logger } from '@/lib/logger'

export class AuthService extends BaseService {
  private userRepository: UserRepository

  constructor() {
    super()
    this.userRepository = new UserRepository()
  }

  async registerUser(data: { name: string, email: string, safePassword: string }) {
    const existing = await this.userRepository.getByEmail(data.email)
    if (existing) {
      await logger.security('REGISTER_ATTEMPT_DUPLICATE_EMAIL', { email: data.email }, 'warn')
      throw new AuthError('EMAIL_EXISTS', 'An account with this email already exists')
    }

    const passwordHash = await bcrypt.hash(data.safePassword, 12)
    return this.userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
    })
  }

  async updateProfile(userId: string, data: { name: string, currency?: string, timezone?: string }) {
    return this.userRepository.update(userId, {
      ...data,
      updatedAt: new Date(),
    })
  }

  async changePassword(userId: string, data: { oldPassword: string, newPassword: string }) {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new AuthError('USER_NOT_FOUND', 'User account not found')
    }

    const isValid = await bcrypt.compare(data.oldPassword, user.passwordHash)
    if (!isValid) {
      throw new AuthError('INVALID_PASSWORD', 'Current password is incorrect')
    }

    const newPasswordHash = await bcrypt.hash(data.newPassword, 12)
    return this.userRepository.update(userId, {
      passwordHash: newPasswordHash,
      updatedAt: new Date(),
    })
  }

  async deleteAccount(userId: string) {
    return this.userRepository.delete(userId)
  }
}