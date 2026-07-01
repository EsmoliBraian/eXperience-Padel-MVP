import { useSlidesStore } from '@/store/slidesStore'

export function Slides() {
  const slides = useSlidesStore((s) => s.slides)
  const addSlide = useSlidesStore((s) => s.addSlide)
  const updateSlide = useSlidesStore((s) => s.updateSlide)
  const deleteSlide = useSlidesStore((s) => s.deleteSlide)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-50">Slides / Hero</h1>
        <button
          type="button"
          onClick={() =>
            addSlide({ imageUrl: '', title: 'Nuevo slide', subtitle: '', order: slides.length })
          }
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-gray-950 hover:bg-primary-400"
        >
          + Nuevo slide
        </button>
      </div>

      <div className="space-y-3">
        {slides
          .sort((a, b) => a.order - b.order)
          .map((slide) => (
            <div key={slide.id} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm text-gray-400">
                  Titulo
                  <input
                    value={slide.title}
                    onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
                  />
                </label>
                <label className="block text-sm text-gray-400">
                  Subtitulo
                  <input
                    value={slide.subtitle}
                    onChange={(e) => updateSlide(slide.id, { subtitle: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
                  />
                </label>
                <label className="block text-sm text-gray-400 sm:col-span-2">
                  URL de imagen
                  <input
                    value={slide.imageUrl}
                    onChange={(e) => updateSlide(slide.id, { imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => deleteSlide(slide.id)}
                className="mt-3 text-xs text-danger hover:underline"
              >
                Eliminar slide
              </button>
            </div>
          ))}
        {slides.length === 0 && <p className="text-sm text-gray-500">No hay slides cargados.</p>}
      </div>
    </div>
  )
}
