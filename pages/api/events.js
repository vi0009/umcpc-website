import fs from 'fs/promises'
import path from 'path'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_SECRET,
})

const dataSourceId = process.env.NOTION_EVENTS_DATA_SOURCE_ID

async function readLocalEvents() {
  const filePath = path.join(process.cwd(), 'public', 'events', 'events.json')

  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

async function normalizeLocalEventImages(events) {
  if (!Array.isArray(events)) return events

  const exts = ['.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg']
  const slugify = (s = '') =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  const tryFileExists = async (fileName) => {
    const filePath = path.join(
      process.cwd(),
      'public',
      'events',
      'images',
      fileName
    )
    try {
      await fs.access(filePath)
      return true
    } catch (e) {
      return false
    }
  }

  const normalized = []
  const defaultPath = '/events/images/default.jpeg'

  for (const ev of events) {
    const out = { ...ev }

    const candidates = []
    if (out.image) {
      const base = out.image.split('/').pop()
      if (base) candidates.push(base)
    }

    if (out.name) candidates.push(`${slugify(out.name)}`)

    let resolved = ''
    for (const cand of candidates) {
      if (await tryFileExists(cand)) {
        resolved = `/events/images/${cand}`
        break
      }

      for (const ext of exts) {
        if (await tryFileExists(`${cand}${ext}`)) {
          resolved = `/events/images/${cand}${ext}`
          break
        }
      }
      if (resolved) break
    }

    // fallback to default.jpeg
    out.image = resolved || defaultPath

    normalized.push(out)
  }

  return normalized
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
    })
  }

  if (!process.env.NOTION_SECRET || !dataSourceId) {
    console.warn(
      'Notion environment variables are not configured. Using local events.'
    )

    try {
      const events = await readLocalEvents()
      const normalized = await normalizeLocalEventImages(events)
      return res.status(200).json(normalized)
    } catch (error) {
      console.error('Local events fallback failed:', error)

      return res.status(500).json({
        error: 'Events are not configured',
      })
    }
  }

  try {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
    })

    const results = Array.isArray(response.results) ? response.results : []
    const events = results.map((page) => {
      const {
        Name,
        Location,
        Date: DateProp,
        Description,
        Link,
        Image,
        Time,
      } = page.properties

      let imageUrl = '/events/images/default.jpeg'
      if (Image && Array.isArray(Image.files) && Image.files.length > 0) {
        const f = Image.files[0]
        if (f && f.file && f.file.url) {
          // route Notion-uploaded file URLs through our server proxy so browser
          // can load them without requiring Notion auth or CORS issues.
          imageUrl = `/api/image-proxy?src=${encodeURIComponent(f.file.url)}`
        }
      }

      return {
        id: page.id,

        name:
          Name?.title?.map((item) => item.plain_text).join('') ||
          'Untitled Event',

        location:
          Location?.rich_text?.map((item) => item.plain_text).join('') || '',

        date: DateProp?.date?.start || null,

        time:
          Time?.rich_text?.map((t) => t.plain_text).join('') ||
          Time?.title?.map((t) => t.plain_text).join('') ||
          null,

        description:
          Description?.rich_text?.map((item) => item.plain_text).join('') || '',

        link: Link?.url || null,

        image: imageUrl,
      }
    })
    return res.status(200).json(events)
  } catch (error) {
    console.error('Notion API error:', error)

    try {
      const events = await readLocalEvents()
      const normalized = await normalizeLocalEventImages(events)

      console.log(
        `Notion failed. Using local events.json (${normalized.length} events).`
      )

      return res.status(200).json(normalized)
    } catch (fallbackError) {
      console.error('Local events fallback failed:', fallbackError)

      return res.status(500).json({
        error: 'Failed to fetch events',
      })
    }
  }
}
