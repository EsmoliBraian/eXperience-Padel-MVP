import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'
import type { HeroSlide } from '@/types'

interface SlideRow {
  id: string
  image_url: string
  title: string
  subtitle: string
  order: number
  published: boolean
}

function fromRow(row: SlideRow): HeroSlide {
  return {
    id: row.id,
    imageUrl: row.image_url,
    title: row.title,
    subtitle: row.subtitle,
    order: row.order,
    published: row.published,
  }
}

interface SlidesState {
  slides: HeroSlide[]
  loading: boolean
  fetchSlides: () => Promise<void>
  addSlide: (slide: Omit<HeroSlide, 'id'>) => Promise<void>
  updateSlide: (id: string, patch: Partial<Omit<HeroSlide, 'id'>>) => Promise<void>
  deleteSlide: (id: string) => Promise<void>
}

export const useSlidesStore = create<SlidesState>()((set, get) => ({
  slides: [],
  loading: false,
  fetchSlides: async () => {
    set({ loading: true })
    const { data, error } = await supabase.from('hero_slides').select('*').order('order')
    if (!error && data) set({ slides: data.map(fromRow) })
    set({ loading: false })
  },
  addSlide: async (slide) => {
    const { data, error } = await supabase
      .from('hero_slides')
      .insert({
        image_url: slide.imageUrl,
        title: slide.title,
        subtitle: slide.subtitle,
        order: slide.order,
        published: slide.published,
      })
      .select()
      .single()
    if (!error && data) set({ slides: [...get().slides, fromRow(data)] })
  },
  updateSlide: async (id, patch) => {
    const row: Partial<SlideRow> = {}
    if (patch.imageUrl !== undefined) row.image_url = patch.imageUrl
    if (patch.title !== undefined) row.title = patch.title
    if (patch.subtitle !== undefined) row.subtitle = patch.subtitle
    if (patch.order !== undefined) row.order = patch.order
    if (patch.published !== undefined) row.published = patch.published

    const { error } = await supabase.from('hero_slides').update(row).eq('id', id)
    if (!error) {
      set({ slides: get().slides.map((s) => (s.id === id ? { ...s, ...patch } : s)) })
    }
  },
  deleteSlide: async (id) => {
    const { error } = await supabase.from('hero_slides').delete().eq('id', id)
    if (!error) set({ slides: get().slides.filter((s) => s.id !== id) })
  },
}))
