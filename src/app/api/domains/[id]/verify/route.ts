import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { DomainService } from '@/services/domain.service'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    const result = await DomainService.verifyDomain(id, payload.tenantId)

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to verify domain' },
      { status: 400 }
    )
  }
}
