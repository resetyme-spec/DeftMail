import { NextResponse } from 'next/server'
import { StalwartService } from '@/services/stalwart.service'

export async function GET() {
  try {
    const health = await StalwartService.healthCheck()
    return NextResponse.json(health)
  } catch (error: any) {
    return NextResponse.json(
      { available: false, error: error.message },
      { status: 503 }
    )
  }
}
