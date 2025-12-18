import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { generateToken, type JWTPayload } from '@/lib/jwt'
import type { SignupInput } from '@/lib/validations/auth'

export class AuthService {
  static async signup(data: SignupInput) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new Error('Email already registered')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12)

    // Create tenant and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          companyName: data.companyName,
          ownerEmail: data.email,
          ownerName: data.name,
          plan: 'starter',
          status: 'active',
        },
      })

      // Create user
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: data.email,
          name: data.name,
          passwordHash,
          role: 'owner',
          emailVerified: true, // Auto-verify for MVP
        },
      })

      return { tenant, user }
    })

    // Generate JWT
    const payload: JWTPayload = {
      sub: result.user.id,
      tenantId: result.tenant.id,
      email: result.user.email,
      role: result.user.role,
    }

    const token = generateToken(payload)

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        tenantId: result.tenant.id,
      },
      token,
    }
  }

  static async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tenant: true,
      },
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash)

    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    // Check tenant status
    if (user.tenant.status !== 'active') {
      throw new Error('Account is suspended')
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Generate JWT
    const payload: JWTPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    }

    const token = generateToken(payload)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
      },
      token,
    }
  }
}
