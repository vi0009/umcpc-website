import { Buffer } from 'buffer'

export default async function handler(req, res) {
  const src = req.query.src || req.query.url
  if (!src) return res.status(400).send('missing src')

  const url = Array.isArray(src) ? src[0] : src

  try {
    // basic host allowlist to avoid open proxy abuse
    const parsed = new URL(url)
    const host = parsed.hostname
    const allowed =
      host.includes('notion') ||
      host.includes('amazonaws') ||
      host.includes('cdn')
    if (!allowed) return res.status(400).send('url not allowed')

    const headers = {}
    // include Notion auth only when fetching Notion-owned hosts
    if (process.env.NOTION_SECRET && host.includes('notion')) {
      headers['Authorization'] = `Bearer ${process.env.NOTION_SECRET}`
    }

    console.log('[image-proxy] fetching', url)
    const fetchRes = await fetch(url, { headers })
    console.log('[image-proxy] fetched status', fetchRes.status)
    if (!fetchRes.ok) {
      return res.status(fetchRes.status).end()
    }

    const contentType =
      fetchRes.headers.get('content-type') || 'application/octet-stream'
    const arrayBuffer = await fetchRes.arrayBuffer()
    const buf = Buffer.from(arrayBuffer)

    res.setHeader('Content-Type', contentType)
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=86400, stale-while-revalidate=3600'
    )
    res.status(200).send(buf)
  } catch (err) {
    console.error('image-proxy error', err)
    res.status(500).end()
  }
}
