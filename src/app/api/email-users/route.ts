import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { EmailUserService } from '@/services/email-user.service'

export async function GET(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    const emailUsers = await EmailUserService.listEmailUsers(payload.tenantId)

    return NextResponse.json({ emailUsers })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch email users' },
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

    const { domainId, username, name, password, quotaMb } = body

    if (!domainId || !username || !name || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const emailUser = await EmailUserService.createEmailUser(
      payload.tenantId,
      domainId,
      username,
      name,
      password,
      parseInt(quotaMb) || 1024
    )

    return NextResponse.json(emailUser, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create email user' },
      { status: 400 }
    )
  }
}
