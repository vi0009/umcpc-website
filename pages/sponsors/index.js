import React from 'react'

const sponsors = [
  {
    tier: 'Principal Sponsor',
    items: [
      {
        name: 'Sponsor Name',
        url: 'https://example.com',
        blurb:
          'Short one-liner about what they do / why they support the club.',
      },
    ],
  },
  {
    tier: 'Gold Sponsors',
    items: [
      {
        name: 'Sponsor Name',
        url: 'https://example.com',
        blurb: 'Short one-liner.',
      },
      {
        name: 'Sponsor Name',
        url: 'https://example.com',
        blurb: 'Short one-liner.',
      },
    ],
  },
  {
    tier: 'Community Partners',
    items: [
      {
        name: 'Sponsor Name',
        url: 'https://example.com',
        blurb: 'Short one-liner.',
      },
      {
        name: 'Sponsor Name',
        url: 'https://example.com',
        blurb: 'Short one-liner.',
      },
      {
        name: 'Sponsor Name',
        url: 'https://example.com',
        blurb: 'Short one-liner.',
      },
    ],
  },
]

function SponsorCard({ name, url, blurb }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      style={{
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div
        style={{
          border: '1px solid rgba(11,15,23,0.10)',
          borderRadius: 18,
          padding: 18,
          background: 'rgba(11,15,23,0.02)',
          boxShadow: '0 10px 30px rgba(11,15,23,0.08)',
          transition: 'transform 120ms ease, box-shadow 120ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 16px 40px rgba(11,15,23,0.10)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0px)'
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(11,15,23,0.08)'
        }}
      >
        <div style={{ fontWeight: 800, letterSpacing: '-0.01em' }}>{name}</div>
        {blurb && (
          <div
            style={{ marginTop: 8, color: 'rgba(11,15,23,0.68)', fontSize: 14 }}
          >
            {blurb}
          </div>
        )}
        <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700 }}>
          Visit website →
        </div>
      </div>
    </a>
  )
}

export default function SponsorsPage() {
  return (
    <div style={{ background: '#fff', color: '#0b0f17', minHeight: '100vh' }}>
      <div
        style={{ maxWidth: 1100, margin: '0 auto', padding: '26px 18px 70px' }}
      >
        {/* Hero */}
        <section
          style={{
            border: '1px solid rgba(11,15,23,0.10)',
            borderRadius: 18,
            overflow: 'hidden',
            background:
              'linear-gradient(135deg, rgba(11,15,23,0.06), rgba(11,15,23,0.01))',
            boxShadow: '0 12px 34px rgba(11,15,23,0.08)',
          }}
        >
          <div style={{ padding: 'clamp(18px, 3vw, 34px)' }}>
            <div
              style={{
                fontSize: 14,
                color: 'rgba(11,15,23,0.68)',
                marginBottom: 10,
              }}
            >
              Our supporters
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(34px, 5vw, 62px)',
                lineHeight: 1.02,
                letterSpacing: '-0.03em',
              }}
            >
              Sponsors
            </h1>
            <p
              style={{
                marginTop: 14,
                maxWidth: 720,
                color: 'rgba(11,15,23,0.68)',
              }}
            >
              Thanks to our sponsors for helping us run events, support
              students, and build a stronger competitive programming community.
            </p>

            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                marginTop: 18,
              }}
            >
              <a
                href="mailto:team@umcpc.club"
                className="btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '11px 14px',
                  borderRadius: 12,
                  border: '1px solid rgba(11,15,23,0.10)',
                  background: '#fff',
                  fontWeight: 800,
                  fontSize: 14,
                  boxShadow: '0 8px 22px rgba(11,15,23,0.08)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                Become a sponsor
              </a>
              <a
                href="#tiers"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '11px 14px',
                  borderRadius: 12,
                  border: '1px solid rgba(11,15,23,0.10)',
                  background: 'transparent',
                  fontWeight: 800,
                  fontSize: 14,
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                View tiers ↓
              </a>
            </div>
          </div>
        </section>

        {/* Sponsor tiers */}
        <section id="tiers" style={{ marginTop: 26 }}>
          {sponsors.map((group) => (
            <div key={group.tier} style={{ marginTop: 22 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap',
                  marginBottom: 12,
                }}
              >
                <h2
                  style={{ margin: 0, fontSize: 18, letterSpacing: '-0.01em' }}
                >
                  {group.tier}
                </h2>
                <div style={{ fontSize: 13, color: 'rgba(11,15,23,0.55)' }}>
                  {group.items.length} supporter
                  {group.items.length === 1 ? '' : 's'}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 14,
                }}
              >
                {group.items.map((s) => (
                  <SponsorCard key={s.name} {...s} />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Footer note */}
        <footer
          style={{
            marginTop: 34,
            paddingTop: 18,
            borderTop: '1px solid rgba(11,15,23,0.08)',
            color: 'rgba(11,15,23,0.68)',
            fontSize: 13,
          }}
        >
          Want your logo here? Email{' '}
          <a href="mailto:team@umcpc.club" style={{ fontWeight: 700 }}>
            team@umcpc.club
          </a>
          .
        </footer>
      </div>
    </div>
  )
}
