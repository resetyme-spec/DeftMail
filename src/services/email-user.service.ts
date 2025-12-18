import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { StalwartService } from './stalwart.service'

export class EmailUserService {
  static async listEmailUsers(tenantId: string) {
    return await db.mailUser.findMany({
      where: { tenantId },
      include: {
        domain: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  static async createEmailUser(
    tenantId: string,
    domainId: string,
    username: string,
    name: string,
    password: string,
    quotaMb: number = 1024
  ) {
    // Verify domain belongs to tenant
    const domain = await db.domain.findFirst({
      where: {
        id: domainId,
        tenantId
      }
    })

    if (!domain) {
      throw new Error('Domain not found')
    }

    if (domain.status !== 'verified') {
      throw new Error('Domain must be verified before creating email users')
    }

    const email = `${username}@${domain.domain}`

    // Check if email already exists
    const existing = await db.mailUser.findFirst({
      where: { email, tenantId }
    })

    if (existing) {
      throw new Error('Email user already exists')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create email user
    const emailUser = await db.mailUser.create({
      data: {
        tenantId,
        domainId,
        email,
        displayName: name,
        passwordHash: passwordHash,
        quotaMb: quotaMb,
        status: 'active'
      },
      include: {
        domain: true
      }
    })

    // Sync with Stalwart Mail Server (non-blocking)
    try {
      await StalwartService.syncEmailUser(email, password, name, quotaMb)
    } catch (error: any) {
      console.error('Failed to sync with Stalwart:', error.message)
      // Don't fail the user creation if Stalwart is unavailable
    }

    return emailUser
  }

  static async deleteEmailUser(id: string, tenantId: string) {
    // Delete from Stalwart first
    try {
      await StalwartService.deleteAccount(emailUser.email)
    } catch (error: any) {
      console.error('Failed to delete from Stalwart:', error.message)
      // Continue with database deletion even if Stalwart fails
    }

    const emailUser = await db.mailUser.findFirst({
      where: { id, tenantId }
    })

    if (!emailUser) {
      throw new Error('Email user not found')
    }

    await db.mailUser.delete({
      where: { id }
    })

    return { success: true }
  }

  static async updatePassword(id: string, tenantId: string, newPassword: string) {
    const emailUser = await db.mailUser.findFirst({
      where: { id, tenantId }
    })

    if (!emailUser) {
      throw new Error('Email user not found')
    }
// Update password in Stalwart
    try {
      await StalwartService.updatePassword(emailUser.email, newPassword)
    } catch (error: any) {
      console.error('Failed to update password in Stalwart:', error.message)
    }

    
    const passwordHash = await bcrypt.hash(newPassword, 12)

    await db.mailUser.update({
      where: { id },
      data: { passwordHash: passwordHash }
    })

    return { success: true }
  }
}
