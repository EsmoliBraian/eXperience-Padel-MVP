import { useState } from 'react'
import { useSlidesStore } from '@/store/slidesStore'
import { uploadSlideImage } from '@/lib/storage'
import { ErrorText } from '@/components/ErrorText'
import type { HeroSlide } from '@/types'

function SlideCard({ slide }: { slide: HeroSlide }) {
  const updateSlide = useSlidesStore((s) => s.updateSlide)
  const deleteSlide = useSlidesStore((s) => s.deleteSlide)

  const [title, setTitle] = useState(slide.title)
  const [subtitle, setSubtitle] = useState(slide.subtitle)
  const [imageUrl, setImageUrl] = useState(slide.imageUrl)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dirty = title !== slide.title || subtitle !== slide.subtitle || imageUrl !== slide.imageUrl

  async function handleSave() {
    setSaving(true)
    setError(await updateSlide(slide.id, { title, subtitle, imageUrl }))
    setSaving(false)
  }

  async function handlePublishToggle() {
    setError(await updateSlide(slide.id, { published: !slide.published }))
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      setImageUrl(await uploadSlideImage(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir la imagen.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    setError(await deleteSlide(slide.id))
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            slide.published ? 'bg-success/20 text-success' : 'bg-gray-800 text-gray-400'
          }`}
        >
          {slide.published ? 'Publicado' : 'Borrador'}
        </span>
        <button
          type="button"
          onClick={handlePublishToggle}
          className="text-xs text-primary-500 hover:underline"
        >
          {slide.published ? 'Despublicar' : 'Publicar'}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-gray-400">
          Titulo
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          />
        </label>
        <label className="block text-sm text-gray-400">
          Subtitulo
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          />
        </label>
        <label className="block text-sm text-gray-400 sm:col-span-2">
          URL de imagen
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          />
        </label>
        <label className="block text-sm text-gray-400 sm:col-span-2">
          O subir imagen desde la computadora
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 w-full text-sm text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-800 file:px-3 file:py-1.5 file:text-gray-100"
          />
          {uploading && <span className="text-xs text-gray-500">Subiendo...</span>}
        </label>
      </div>

      {imageUrl && (
        <img src={imageUrl} alt="" className="mt-3 h-24 w-full rounded-lg object-cover" />
      )}

      <ErrorText error={error} />

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={handleDelete}
          className="text-xs text-danger hover:underline"
        >
          Eliminar slide
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="rounded-lg bg-primary-500 px-4 py-1.5 text-xs font-medium text-gray-950 hover:bg-primary-400 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : dirty ? 'Guardar cambios' : 'Guardado'}
        </button>
      </div>
    </div>
  )
}

export function Slides() {
  const slides = useSlidesStore((s) => s.slides)
  const addSlide = useSlidesStore((s) => s.addSlide)
  const [error, setError] = useState<string | null>(null)

  const sortedSlides = [...slides].sort((a, b) => a.order - b.order)

  async function handleAdd() {
    setError(
      await addSlide({
        imageUrl: '',
        title: 'Nuevo slide',
        subtitle: '',
        order: slides.length,
        published: false,
      }),
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-50">Slides / Hero</h1>
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-gray-950 hover:bg-primary-400"
        >
          + Nuevo slide
        </button>
      </div>

      <ErrorText error={error} />

      <div className="space-y-3">
        {sortedSlides.map((slide) => (
          <SlideCard key={slide.id} slide={slide} />
        ))}
        {slides.length === 0 && <p className="text-sm text-gray-500">No hay slides cargados.</p>}
      </div>
    </div>
  )
}
