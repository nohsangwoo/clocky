import { NextRequest, NextResponse } from 'next/server'

async function fetchExternalServerTime(url: string): Promise<string> {

    console.log('url', url)
  const response = await fetch(url)
  const date = new Date(response.headers.get('date') || '')
  return date.toISOString()
}

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url')
    const clientRequestTime = request.nextUrl.searchParams.get('clientTime')
    if (!url) {
      return NextResponse.json(
        { error: 'URL 파라미터가 필요합니다.' },
        { status: 400 },
      )
    }

    const serverTime = await fetchExternalServerTime(url)
    const responseTime = new Date().toISOString()

    return NextResponse.json({
      [new URL(url).hostname]: serverTime,
      clientRequestTime,
      responseTime,
    })

  } catch (error) {
    console.error('서버 시간 조회 중 오류 발생:', error)
    return NextResponse.json({ error: '서버 시간 조회 실패' }, { status: 500 })
  }
}
