import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HeroSlide } from '@/types'
import { generateId } from '@/lib/format'

interface SlidesState {
  slides: HeroSlide[]
  addSlide: (slide: Omit<HeroSlide, 'id'>) => void
  updateSlide: (id: string, patch: Partial<Omit<HeroSlide, 'id'>>) => void
  deleteSlide: (id: string) => void
}

const initialSlides: HeroSlide[] = [
  {
    id: generateId(),
    imageUrl: '',
    title: 'Tu mejor partido empieza acá',
    subtitle: 'Reservá tu turno fácil y rápido',
    order: 0,
  },
]

export const useSlidesStore = create<SlidesState>()(
  persist(
    (set) => ({
      slides: initialSlides,
      addSlide: (slide) =>
        set((state) => ({ slides: [...state.slides, { ...slide, id: generateId() }] })),
      updateSlide: (id, patch) =>
        set((state) => ({
          slides: state.slides.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),
      deleteSlide: (id) =>
        set((state) => ({ slides: state.slides.filter((s) => s.id !== id) })),
    }),
    { name: 'padel-slides' },
  ),
)
