export async function fetchServerTime(url: string): Promise<{ [key: string]: string }> {
  const basicUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://clocky.ludgi.ai'
      : 'http://localhost:3000'

  const response = await fetch(`${basicUrl}/servertime?url=${encodeURIComponent(url)}`)
  if (!response.ok) {
    throw new Error('서버 시간 조회 실패')
  }
  return response.json()
}
