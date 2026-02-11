import React, { useEffect, useMemo, useRef, useState } from 'react'

const useInView = (
  opts = { threshold: 0.15, rootMargin: '0px 0px -15% 0px' }
) => {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting)
    }, opts)

    obs.observe(el)
    return () => obs.disconnect()
  }, [opts.threshold, opts.rootMargin])

  return [ref, inView]
}

export const FadeIn = ({ children, delay = 0 }) => {
  const [ref, inView] = useInView()

  return (
    <div
      ref={ref}
      className={`
        transition-all duration-500 ease-out
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

const img_types = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg']

const SponsorCard = ({ sponsor, delay = 0 }) => {
  const [logoSrc, setLogoSrc] = useState(null)

  useEffect(() => {
    let mounted = true

    const findLogo = async () => {
      for (const ext of img_types) {
        const path = `/sponsors/logos/${sponsor.name}.${ext}`
        try {
          const res = await fetch(path, { method: 'HEAD' })
          if (res.ok && mounted) {
            setLogoSrc(path)
            return
          }
        } catch {}
      }
      if (mounted) setLogoSrc(null)
    }

    findLogo()
    return () => {
      mounted = false
    }
  }, [sponsor.name])

  const card = (
    <FadeIn delay={delay}>
      <div className="relative w-full bg-club-blue-800 rounded-xl shadow-lg overflow-hidden group cursor-pointer transition-transform transform hover:scale-105 hover:shadow-2xl border-2 border-club-blue-100">
        {logoSrc && (
          <div className="w-full h-64 bg-white flex items-center justify-center p-6">
            <img
              src={logoSrc}
              alt={sponsor.name}
              className="max-h-full max-w-full object-contain opacity-90 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        <div className="absolute bottom-0 w-full bg-club-blue-800 bg-opacity-90 text-white text-center py-3 text-base sm:text-lg font-bold px-3">
          <span className="truncate block w-full">{sponsor.name}</span>
        </div>

        <div className="absolute inset-0 bg-club-blue-800 bg-opacity-85 text-white p-4 sm:p-6 flex flex-col opacity-0 transition-opacity duration-300 group-hover:opacity-90">
          <h2 className="font-bold mb-2 text-lg sm:text-xl lg:text-2xl leading-tight">
            {sponsor.name}
          </h2>
          {sponsor.blurb && (
            <p className="mb-4 text-sm sm:text-base text-white/90 leading-snug line-clamp-6">
              {sponsor.blurb}
            </p>
          )}
        </div>
      </div>
    </FadeIn>
  )

  return sponsor.url ? (
    <a href={sponsor.url} target="_blank" rel="noreferrer" className="block">
      {card}
    </a>
  ) : (
    card
  )
}

const groupByTier = (items) => {
  const out = {}
  for (const s of items) {
    const t = s.tier || 'Sponsors'
    ;(out[t] ||= []).push(s)
  }
  return out
}

const tierOrder = ['Gold', 'Silver', 'Bronze', 'Community Partner']

const Sponsors = () => {
  const [sponsors, setSponsors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/sponsors/sponsors.json`)
        const data = await res.json()
        setSponsors(Array.isArray(data) ? data : [])
      } catch {
        setSponsors([])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const pages = useMemo(() => {
    const grouped = groupByTier(sponsors)
    const ordered = tierOrder.filter((t) => grouped[t]?.length)
    const extra = Object.keys(grouped).filter((t) => !tierOrder.includes(t))
    return [...ordered, ...extra].map((tier) => ({
      tier,
      sponsors: grouped[tier],
    }))
  }, [sponsors])

  if (loading) return <p className="mx-10 mt-10">Loading sponsors...</p>

  return (
    <div className="flex-1 px-10 pb-16">
      <FadeIn>
        <h1 className="page-header-font mb-6 h-20 header-underline">Sponsors</h1>
      </FadeIn>

      <FadeIn delay={80}>
        <div className="mb-10 bg-club-blue-800 border-2 border-club-blue-100 rounded-xl shadow-lg p-6 text-white max-w-3xl">
          <p className="text-lg font-semibold mb-2">Our supporters</p>
          <p className="text-white/80 max-w-3xl mx-auto">
            Thanks to our sponsors for helping us run events, support students,
            and grow the competitive programming community.
          </p>
          <div className="mt-4">
            <a
              href="mailto:team@umcpc.club"
              className="inline-block bg-white text-club-blue-800 font-bold px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
            >
              Become a sponsor
            </a>
          </div>
        </div>
      </FadeIn>

      {pages.length === 0 && (
        <p className="text-center text-gray-500">No sponsors yet.</p>
      )}

      {pages.map((page, tierIdx) => (
        <div key={page.tier} className="mb-12">
          <FadeIn delay={tierIdx * 60}>
            <div className="flex items-end justify-between gap-4 mb-4">
              <h2 className="text-white text-2xl font-bold">{page.tier}</h2>
              <div className="text-white/60 text-sm font-semibold">
                {page.sponsors.length} sponsor
                {page.sponsors.length === 1 ? '' : 's'}
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
            {page.sponsors.map((s, i) => (
              <div key={s.id || s.name} className="min-w-[280px]">
                <SponsorCard sponsor={s} delay={i * 60} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-6 border-t border-white/10 text-center text-gray-400">
        Want to sponsor an event or workshop? Email{' '}
        <a
          className="font-bold underline underline-offset-4"
          href="mailto:team@umcpc.club"
        >
          team@umcpc.club
        </a>
      </div>
    </div>
  )
}

export default Sponsors
