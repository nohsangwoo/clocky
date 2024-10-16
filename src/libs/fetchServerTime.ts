export function normalizeUrl(input: string): string {
  let url = input.trim().toLowerCase()

  // http:// 또는 https:// 프로토콜이 없는 경우 https://를 추가
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  // URL 끝에 슬래시가 없는 경우 추가
  if (!url.endsWith('/')) {
    url += '/'
  }

  try {
    // URL 객체를 생성하여 유효성 검사
    new URL(url)
    return url
  } catch (error) {
    throw new Error('유효하지 않은 URL입니다.')
  }
}

export async function fetchServerTime(
  url: string,
): Promise<{ [key: string]: string }> {
  const basicUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://clocky.ludgi.ai'
      : 'http://localhost:3000'

  //   const normalizedUrl = normalizeUrl(url)
  const clientRequestTime = new Date().toISOString()

  console.log('url', url)

  const response = await fetch(
    `${basicUrl}/servertime?url=${url}&clientTime=${encodeURIComponent(
      clientRequestTime,
    )}`,
  )
  //   const response = await fetch(
  //     `${basicUrl}/servertime?url=${encodeURIComponent(
  //         url,
  //     )}&clientTime=${encodeURIComponent(clientRequestTime)}`,
  //   )
  if (!response.ok) {
    throw new Error('서버 시간 조회 실패')
  }
  const data = await response.json()

  // 시간 보정 로직
  const clientResponseTime = new Date().toISOString()
  const roundTripTime =
    new Date(clientResponseTime).getTime() -
    new Date(clientRequestTime).getTime()
  const serverTimeOffset =
    new Date(data.responseTime).getTime() -
    new Date(clientRequestTime).getTime() -
    roundTripTime / 2

  const correctedServerTime = new Date(
    new Date(data[Object.keys(data)[0]]).getTime() + serverTimeOffset,
  )

  return { [Object.keys(data)[0]]: correctedServerTime.toISOString() }
}
