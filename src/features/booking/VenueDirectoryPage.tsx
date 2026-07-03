import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

interface VenueListing {
  slug: string
  venueName: string
  logoUrl: string | null
}

export function VenueDirectoryPage() {
  const [venues, setVenues] = useState<VenueListing[] | null>(null)

  useEffect(() => {
    supabase
      .from('settings')
      .select('slug, venue_name, logo_url')
      .not('slug', 'is', null)
      .order('venue_name')
      .then(({ data }) => {
        setVenues(
          (data ?? [])
            .filter((row): row is { slug: string; venue_name: string; logo_url: string | null } => !!row.slug)
            .map((row) => ({ slug: row.slug, venueName: row.venue_name, logoUrl: row.logo_url })),
        )
      })
  }, [])

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col p-5">
      <h1 className="mb-4 text-lg font-semibold text-gray-50">Clubes</h1>

      {venues === null && <p className="text-sm text-gray-500">Cargando...</p>}
      {venues?.length === 0 && (
        <p className="text-sm text-gray-500">Todavia no hay clubes registrados.</p>
      )}

      <div className="space-y-2">
        {venues?.map((v) => (
          <Link
            key={v.slug}
            to={`/${v.slug}`}
            className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 p-3 hover:border-primary-500"
          >
            {v.logoUrl ? (
              <img src={v.logoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-primary-500" />
            )}
            <span className="text-sm font-medium text-gray-100">{v.venueName}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
