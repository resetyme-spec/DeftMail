import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { DomainService } from '@/services/domain.service'
import { createDomainSchema } from '@/lib/validations/domain'

export async function GET(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    const domains = await DomainService.listDomains(payload.tenantId)

    return NextResponse.json({ domains })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch domains' },
      { status: 400 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    const body = await request.json()

    // Validate and sanitize domain
    const validatedData = createDomainSchema.parse(body)

    const result = await DomainService.createDomain(payload.tenantId, validatedData.domain)

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create domain' },
      { status: 400 }
    )
  }
}
