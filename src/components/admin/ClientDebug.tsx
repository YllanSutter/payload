'use client'
import React, { JSX, useEffect, useState } from 'react'

export default function ClientDebug(): JSX.Element {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log('Admin client debug: script mounted, location=', window.location.href)

    // Try a quick fetch to the app root to detect network/server errors
    fetch('/')
      .then(async (res) => {
        console.log('Admin client debug: GET / ->', res.status)
        try {
          const txt = await res.text()
          console.log('Admin client debug: / response length=', txt.length)
        } catch (e) {
          console.log('Admin client debug: error reading / response', e)
        }
      })
      .catch((err) => {
        console.error('Admin client debug: fetch / failed', err)
      })
  }, [])

  if (!mounted)
    return (
      <div
        style={{
          position: 'fixed',
          right: 8,
          bottom: 8,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          padding: '6px 8px',
          borderRadius: 4,
          fontSize: 12,
        }}
      >
        admin debug...
      </div>
    )

  return (
    <div
      style={{
        position: 'fixed',
        right: 8,
        bottom: 8,
        zIndex: 9999,
        background: 'rgba(0,128,0,0.6)',
        color: '#fff',
        padding: '6px 8px',
        borderRadius: 4,
        fontSize: 12,
      }}
    >
      admin debug loaded
    </div>
  )
}
