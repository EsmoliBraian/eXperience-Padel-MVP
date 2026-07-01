import { useState } from 'react'
import { useProductsStore } from '@/store/productsStore'
import { ErrorText } from '@/components/ErrorText'
import type { Product } from '@/types'

function ProductCard({ product }: { product: Product }) {
  const updateProduct = useProductsStore((s) => s.updateProduct)
  const deleteProduct = useProductsStore((s) => s.deleteProduct)

  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description)
  const [price, setPrice] = useState(product.price)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dirty =
    name !== product.name || description !== product.description || price !== product.price

  async function handleSave() {
    setSaving(true)
    setError(await updateProduct(product.id, { name, description, price }))
    setSaving(false)
  }

  async function handleDelete() {
    setError(await deleteProduct(product.id))
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-gray-400">
          Nombre
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          />
        </label>
        <label className="block text-sm text-gray-400">
          Precio
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          />
        </label>
        <label className="block text-sm text-gray-400 sm:col-span-2">
          Descripcion
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
            rows={2}
          />
        </label>
      </div>

      <ErrorText error={error} />

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={handleDelete}
          className="text-xs text-danger hover:underline"
        >
          Eliminar
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

export function Productos() {
  const products = useProductsStore((s) => s.products)
  const addProduct = useProductsStore((s) => s.addProduct)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd() {
    setError(await addProduct({ name: 'Nuevo producto', description: '', price: 0 }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-50">Productos</h1>
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-gray-950 hover:bg-primary-400"
        >
          + Nuevo producto
        </button>
      </div>

      <ErrorText error={error} />

      <div className="space-y-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {products.length === 0 && (
          <p className="text-sm text-gray-500">No hay productos cargados.</p>
        )}
      </div>
    </div>
  )
}
