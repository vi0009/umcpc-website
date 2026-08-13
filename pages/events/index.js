import React, { useState, useEffect } from 'react'

const filterEvents = (events, upcoming = true) => {
  if (!Array.isArray(events)) return []

  const now = new Date()

  const parseEventEnd = (dateStr) => {
    if (!dateStr) return null

    // If Notion returns a date-only string like '2025-03-27', treat it
    // as the end of that local day so the event is considered "upcoming"
    // for the whole day.
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-').map(Number)
      return new Date(y, m - 1, d, 23, 59, 59, 999)
    }

    const dt = new Date(dateStr)
    if (isNaN(dt)) return null
    return dt
  }

  return events.filter((event) => {
    if (!event.date) return false

    const eventEnd = parseEventEnd(event.date)
    if (!eventEnd) return false

    const isPast = eventEnd < now
    return upcoming ? !isPast : isPast
  })
}

const EventCard = ({ event }) => (
  <div className="relative w-full sm:w-[280px] flex-none h-56 sm:h-64 md:h-72 bg-club-blue-800 rounded-xl shadow-lg overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-2xl border-2 border-club-blue-100">
    {event.image && (
      <img
        src={event.image.startsWith('/') ? event.image : `/${event.image}`}
        alt={event.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
    )}

    <div className="absolute bottom-0 w-full bg-club-blue-900/90 text-white text-center py-3 text-sm sm:text-base md:text-lg font-bold z-10">
      {event.name}
    </div>

    <div className="absolute inset-0 bg-club-blue-900/90 text-white p-4 sm:p-6 flex flex-col justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-20">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
        {event.name}
      </h2>

      <p className="mb-3 text-xs sm:text-sm md:text-base">
        {event.description}
      </p>

      <div className="flex flex-col gap-1 text-xs sm:text-sm font-small">
        <p>🗓️ {event.date ? new Date(event.date).toDateString() : 'TBA'}</p>
        <p>⏰ {event.time || 'TBA'}</p>
        <p>📍 {event.location || 'TBA'}</p>
      </div>
    </div>
  </div>
)

const Events = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [fadeIn, setFadeIn] = useState(false)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await fetch('/api/events')

        if (!res.ok) throw new Error('API fetch failed')

        const data = await res.json()

        if (Array.isArray(data) && data.length > 0) {
          setEvents(data)
        } else {
          throw new Error('API returned empty or invalid data')
        }
      } catch (error) {
        console.warn('Falling back to local events:', error)

        try {
          const res = await fetch('/events/events.json')
          const data = await res.json()

          if (Array.isArray(data)) {
            setEvents(data)
          } else {
            setEvents([])
          }
        } catch (localError) {
          console.error('Failed to fetch local events:', localError)
          setEvents([])
        }
      } finally {
        setFadeIn(true)
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  if (loading) return <p className="mx-10 mt-10">Loading events...</p>

  const upcomingEvents = filterEvents(events, true)
  const pastEvents = filterEvents(events, false)

  return (
    <div className={`flex-1 flex min-h-screen fade-in ${fadeIn ? 'show' : ''}`}>
      <div className="flex-1 h-full overflow-y-auto px-10">
        <h1 className="page-header-font mb-6 h-20 header-underline">
          Upcoming Events
        </h1>
        <div className="flex flex-wrap gap-6 mb-10 items-start">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, index) => (
              <EventCard key={event.id || event.name || index} event={event} />
            ))
          ) : (
            <p className="w-full bg-club-blue-800 bg-opacity-90 text-white text-center py-3 text-lg font-bold">
              No upcoming events.
            </p>
          )}
        </div>

        <h1 className="page-header-font mb-6 h-20 header-underline">
          Past Events
        </h1>
        <div className="flex flex-wrap gap-6 mb-10 items-start">
          {pastEvents.length > 0 ? (
            pastEvents.map((event, index) => (
              <EventCard key={event.id || event.name || index} event={event} />
            ))
          ) : (
            <p className="w-full bg-club-blue-800 bg-opacity-90 text-white text-center py-3 text-lg font-bold">
              No past events.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Events
