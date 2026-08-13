import fs from 'fs/promises'
import path from 'path'
import { getResourcesFromNotion } from '../../lib/notion'

async function readLocalResources() {
  const filePath = path.join(
    process.cwd(),
    'public',
    'resources',
    'resources.json'
  )
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.NOTION_SECRET || !process.env.NOTION_RESOURCES_DATABASE_ID) {
    try {
      const resources = await readLocalResources()
      return res.status(200).json(resources)
    } catch (error) {
      console.error('Local resources fallback failed:', error)
      return res.status(500).json({ error: 'Resources are not configured' })
    }
  }

  try {
    const resources = await getResourcesFromNotion()
    return res.status(200).json(resources)
  } catch (error) {
    console.error('Failed to fetch resources:', error)

    try {
      const resources = await readLocalResources()
      return res.status(200).json(resources)
    } catch (fallbackError) {
      console.error('Fallback to local resources failed:', fallbackError)
      return res.status(500).json({ error: 'Failed to fetch resources' })
    }
  }
}
