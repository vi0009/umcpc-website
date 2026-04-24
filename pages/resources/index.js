import React, { useState, useEffect } from 'react'

const ResourceCard = ({ resource }) => (
  <div className="relative w-full min-w-[280px] max-w-[380px] flex-1 h-56 sm:h-64 md:h-72 bg-club-blue-800 rounded-xl shadow-lg overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-2xl border-2 border-club-blue-100">
    
    {resource.image && (
      <img
        src={resource.image}
        alt={resource.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
    )}

    <div className="absolute bottom-0 w-full bg-club-blue-900/90 text-white text-center py-3 text-sm sm:text-base md:text-lg font-bold z-10">
      {resource.title}
    </div>

    <div className="absolute inset-0 bg-club-blue-900/90 text-white p-4 sm:p-6 flex flex-col justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-20">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
        {resource.title}
      </h2>

      <p className="mb-3 text-xs sm:text-sm md:text-base">
        {resource.description}
      </p>

      {resource.link && (
        <a
          href={resource.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-blue-300 underline text-sm sm:text-base"
        >
          🔗 Open Resource →
        </a>
      )}
    </div>
  </div>
)

const Resources = () => {
  const [resources, setResources] = useState([])
  const [fadeIn, setFadeIn] = useState(false)

   useEffect(() => {
    const loadResources = async () => 
      try {
        const res = await fetch('/resources/resources.json') 
        if (!res.ok) throw new Error('Failed to fetch resources')

        const data = await res.json()

        if (Array.isArray(data)) {
          setResources(data)
        } else {
          setResources([])
        }
      } catch (error) {
        console.error('Error loading resources:', error)
        setResources([]) 
      } finally {
        setFadeIn(true)
      }
    }

    loadResources()
  }, [])

  return (
    <div className={`h-screen flex-1 flex overflow-hidden fade-in ${fadeIn ? 'show' : ''}`}>
      <div className="flex-1 overflow-y-scroll px-10">
        
        <h1 className="page-header-font mb-6 h-20 header-underline">
          Resources
        </h1>

        <div className="flex flex-wrap gap-6 mb-10 items-start">
          {resources.length > 0 ? (
            resources.map((resource, index) => (
              <ResourceCard
                key={resource.id || resource.title || index}
                resource={resource}
              />
            ))
          ) : (
            <p className="w-full bg-club-blue-800 bg-opacity-90 text-white text-center py-3 text-lg font-bold">
              No resources available.
            </p>
          )}
        </div>

      </div>
    </div>
  )
}

export default Resources
