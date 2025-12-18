import { NextResponse } from 'next/server'
import { AuthService } from '@/services/auth.service'
import { signupSchema } from '@/lib/validations/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = signupSchema.parse(body)

    // Create user and tenant
    const result = await AuthService.signup(validatedData)

    // Set cookie
    const response = NextResponse.json(
      { success: true, user: result.user },
      { status: 201 }
    )

    response.cookies.set('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
    })

    return response
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 400 }
    )
  }
}
