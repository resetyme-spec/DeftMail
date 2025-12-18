import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { EmailUserService } from '@/services/email-user.service'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    await EmailUserService.deleteEmailUser(params.id, payload.tenantId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete email user' },
      { status: 400 }
    )
  }
}
