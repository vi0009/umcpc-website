import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_SECRET })
const eventsDatabaseId =
  process.env.NOTION_EVENTS_DATABASE_ID || process.env.NOTION_DATABASE_ID
const resourcesDatabaseId = process.env.NOTION_RESOURCES_DATABASE_ID

function textContent(property) {
  return (
    property?.rich_text?.[0]?.plain_text ||
    property?.title?.[0]?.plain_text ||
    ''
  )
}

function checkboxValue(property) {
  if (typeof property?.checkbox === 'boolean') return property.checkbox
  return true
}

function getImageUrl(property) {
  if (!property?.files?.length) return null
  const file = property.files[0]
  return file.external?.url || file.file?.url || null
}

function mapEvent(page) {
  const { Name, Description, Date, Time, Location, Image, Enabled } =
    page.properties
  return {
    id: page.id,
    name: Name?.title?.[0]?.plain_text || 'Untitled Event',
    description: Description?.rich_text?.[0]?.plain_text || '',
    date: Date?.date?.start || '',
    time: Time?.rich_text?.[0]?.plain_text || '',
    location: Location?.rich_text?.[0]?.plain_text || '',
    image: getImageUrl(Image),
    enabled: checkboxValue(Enabled),
  }
}

function mapResource(page) {
  const { Title, Description, Link, Image, Enabled } = page.properties
  return {
    id: page.id,
    title: Title?.title?.[0]?.plain_text || 'Untitled Resource',
    description: Description?.rich_text?.[0]?.plain_text || '',
    link: Link?.url || '',
    image: getImageUrl(Image),
    enabled: checkboxValue(Enabled),
  }
}

function notionText(value) {
  return [{ text: { content: value || '' } }]
}

function notionFile(url) {
  return url ? [{ name: 'image', external: { url } }] : []
}

function eventProperties(event) {
  return {
    Name: { title: notionText(event.name || '') },
    Description: { rich_text: notionText(event.description || '') },
    Date: { date: event.date ? { start: event.date } : null },
    Time: { rich_text: notionText(event.time || '') },
    Location: { rich_text: notionText(event.location || '') },
    Image: { files: notionFile(event.image) },
    Enabled: { checkbox: event.enabled !== false },
  }
}

function resourceProperties(resource) {
  return {
    Title: { title: notionText(resource.title || '') },
    Description: { rich_text: notionText(resource.description || '') },
    Link: resource.link ? { url: resource.link } : { url: '' },
    Image: { files: notionFile(resource.image) },
    Enabled: { checkbox: resource.enabled !== false },
  }
}

export async function getEventsFromNotion() {
  if (!eventsDatabaseId) {
    throw new Error(
      'NOTION_EVENTS_DATABASE_ID or NOTION_DATABASE_ID is not configured'
    )
  }

  const response = await notion.databases.query({
    database_id: eventsDatabaseId,
    sorts: [{ property: 'Date', direction: 'ascending' }],
  })

  const results = Array.isArray(response.results) ? response.results : []
  return results.map(mapEvent)
}

export async function createEventInNotion(event) {
  if (!eventsDatabaseId) {
    throw new Error(
      'NOTION_EVENTS_DATABASE_ID or NOTION_DATABASE_ID is not configured'
    )
  }

  const properties = eventProperties(event)
  return notion.pages.create({
    parent: { database_id: eventsDatabaseId },
    properties,
  })
}

export async function updateEventInNotion(event) {
  if (!event.id) {
    throw new Error('Event ID is required for update')
  }

  const properties = eventProperties(event)
  return notion.pages.update({
    page_id: event.id,
    properties,
  })
}

export async function archivePageInNotion(pageId) {
  return notion.pages.update({ page_id: pageId, archived: true })
}

export async function getResourcesFromNotion() {
  if (!resourcesDatabaseId) {
    throw new Error('NOTION_RESOURCES_DATABASE_ID is not configured')
  }

  const response = await notion.databases.query({
    database_id: resourcesDatabaseId,
    sorts: [{ property: 'Title', direction: 'ascending' }],
  })

  const results = Array.isArray(response.results) ? response.results : []
  return results.map(mapResource)
}

export async function createResourceInNotion(resource) {
  if (!resourcesDatabaseId) {
    throw new Error('NOTION_RESOURCES_DATABASE_ID is not configured')
  }

  const properties = resourceProperties(resource)
  return notion.pages.create({
    parent: { database_id: resourcesDatabaseId },
    properties,
  })
}

export async function updateResourceInNotion(resource) {
  if (!resource.id) {
    throw new Error('Resource ID is required for update')
  }

  const properties = resourceProperties(resource)
  return notion.pages.update({
    page_id: resource.id,
    properties,
  })
}
