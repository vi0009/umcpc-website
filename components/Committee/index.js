import React, { useEffect, useState } from 'react'
import Member from './Member'

const Committee = () => {
  const [current, setCurrent] = useState(null)
  const [past, setPast] = useState([])

  useEffect(() => {
    const years = ['2025', '2024', '2023', '2022']
    async function load() {
      try {
        const res = await fetch('/profiles/2026/profiles.json')
        const data = await res.json()
        setCurrent(data)

        const pastData = await Promise.all(
          years.map(async (y) => {
            try {
              const r = await fetch(`/profiles/${y}/profiles.json`)
              if (!r.ok) return null
              const j = await r.json()
              return { year: y, content: j }
            } catch (e) {
              return null
            }
          })
        )

        setPast(pastData.filter(Boolean))
      } catch (err) {
        // keep component resilient on fetch errors
        console.error('Failed to load profiles', err)
      }
    }

    load()
  }, [])

  if (!current) return null

  return (
    <>
      <Year profilePath={current.PROFILE_PATH} committee={current.COMMITTEE} />
      {past.map(({ year, content: c }) => {
        const { PROFILE_PATH, COMMITTEE } = c
        return (
          <div key={year}>
            <h1 className="sticky top-0 z-50 page-header-font text-center pb-16">
              {year} Committee
            </h1>
            <Year profilePath={PROFILE_PATH} committee={COMMITTEE} />
          </div>
        )
      })}
    </>
  )
}

const Year = ({ profilePath, committee }) => {
  const { general, executives } = committee

  return (
    <>
      <div className="pb-16">
        <div className="sticky top-0 z-30 bg-gradient-to-b from-club-blue-900 pb-36 -mb-36" />
        <div>
          <h1 className="sticky top-10 z-40 subheader-font text-center mb-8 sm:mb-16">
            Executive Committee
          </h1>
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 justify-items-center px-12">
            {executives.map((mem) => {
              return (
                <Member
                  key={mem.id}
                  name={mem.name}
                  title={mem.title}
                  img={mem.img}
                  text={mem.text}
                  profilePath={profilePath}
                />
              )
            })}
          </div>
        </div>
        <div className="">
          <h1 className="subheader-font sticky top-10 z-50 text-center pb-16">
            General Committee
          </h1>
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 justify-items-center">
            {general.map((mem) => {
              return (
                <Member
                  key={mem.id}
                  name={mem.name}
                  title={mem.title}
                  img={mem.img}
                  text={mem.text}
                  profilePath={profilePath}
                />
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default Committee
