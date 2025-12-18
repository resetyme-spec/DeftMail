import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m'

export interface JWTPayload {
  sub: string // user id
  tenantId: string
  email: string
  role: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY })
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

export function generateRefreshToken(): string {
  return jwt.sign({ type: 'refresh' }, JWT_SECRET, { 
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' 
  })
}
