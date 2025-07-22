import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  // Получаем IP пользователя
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : req.ip || ''

  // Формируем URL для ip-api.com (можно заменить на другой сервис при необходимости)
  const url = `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,query`

  try {
    const geoRes = await fetch(url)
    const data = await geoRes.json()
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to fetch geo info' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
} 