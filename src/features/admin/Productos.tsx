import { useMemo, useState } from 'react'
import { useProductsStore } from '@/store/productsStore'
import { useCategoriesStore } from '@/store/categoriesStore'
import { ErrorText } from '@/components/ErrorText'
import { CategoriesModal } from '@/features/admin/CategoriesModal'
import { Modal } from '@/components/Modal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { formatCurrency } from '@/lib/format'
import type { Category, Product } from '@/types'

function ProductCard({ product, categories }: { product: Product; categories: Category[] }) {
  const updateProduct = useProductsStore((s) => s.updateProduct)
  const deleteProduct = useProductsStore((s) => s.deleteProduct)

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description)
  const [categoryId, setCategoryId] = useState(product.categoryId ?? '')
  const [price, setPrice] = useState(product.price)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const dirty =
    name !== product.name ||
    description !== product.description ||
    categoryId !== (product.categoryId ?? '') ||
    price !== product.price

  const categoryName = categories.find((c) => c.id === product.categoryId)?.name

  function handleEdit() {
    setName(product.name)
    setDescription(product.description)
    setCategoryId(product.categoryId ?? '')
    setPrice(product.price)
    setError(null)
    setEditing(true)
  }

  function handleCancel() {
    setName(product.name)
    setDescription(product.description)
    setCategoryId(product.categoryId ?? '')
    setPrice(product.price)
    setError(null)
    setEditing(false)
  }

  async function handleSave() {
    setSaving(true)
    const saveError = await updateProduct(product.id, {
      name,
      description,
      categoryId: categoryId || undefined,
      price,
    })
    setSaving(false)
    setError(saveError)
    if (!saveError) setEditing(false)
  }

  async function handleDelete() {
    setConfirmingDelete(false)
    setError(await deleteProduct(product.id))
  }

  if (!editing) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-100">{product.name}</p>
              {categoryName && (
                <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                  {categoryName}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{formatCurrency(product.price)}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleEdit}
              aria-label="Editar producto"
              className="text-gray-400 hover:text-primary-500"
            >
              <i className="fa-solid fa-pen" />
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              aria-label="Eliminar producto"
              className="text-gray-400 hover:text-danger"
            >
              <i className="fa-solid fa-trash" />
            </button>
          </div>
        </div>
        <ErrorText error={error} />
        {confirmingDelete && (
          <ConfirmDialog
            title="Eliminar producto"
            message={`¿Eliminar "${product.name}"? Esta accion no se puede deshacer.`}
            confirmLabel="Eliminar"
            onConfirm={handleDelete}
            onCancel={() => setConfirmingDelete(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-gray-400">
          Nombre
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-925 px-3 py-2 text-gray-100"
          />
        </label>
        <label className="block text-sm text-gray-400">
          Precio
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-925 px-3 py-2 text-gray-100"
          />
        </label>
        <label className="block text-sm text-gray-400 sm:col-span-2">
          Categoria (opcional)
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-925 px-3 py-2 text-gray-100"
          >
            <option value="">Sin categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-gray-400 sm:col-span-2">
          Descripcion
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-925 px-3 py-2 text-gray-100"
            rows={2}
          />
        </label>
      </div>

      <ErrorText error={error} />

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          aria-label="Eliminar producto"
          className="text-gray-400 hover:text-danger"
        >
          <i className="fa-solid fa-trash" />
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-gray-700 px-4 py-1.5 text-xs text-gray-300 hover:bg-gray-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className="rounded-lg bg-primary-500 px-4 py-1.5 text-xs font-medium text-gray-950 hover:bg-primary-400 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
      {confirmingDelete && (
        <ConfirmDialog
          title="Eliminar producto"
          message={`¿Eliminar "${product.name}"? Esta accion no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={handleDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </div>
  )
}

function NuevoProductoModal({
  categories,
  onClose,
}: {
  categories: Category[]
  onClose: () => void
}) {
  const addProduct = useProductsStore((s) => s.addProduct)

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const canCreate = name.trim() !== '' && Number(price) > 0

  async function handleCreate() {
    if (!canCreate) return
    setCreating(true)
    const createError = await addProduct({
      name: name.trim(),
      description: description.trim(),
      categoryId: categoryId || undefined,
      price: Number(price),
    })
    setCreating(false)
    if (createError) {
      setError(createError)
      return
    }
    onClose()
  }

  return (
    <Modal title="Nuevo producto" onClose={onClose}>
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <label className="block text-sm text-gray-400">
          Nombre
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-925 px-3 py-2 text-gray-100"
          />
        </label>
        <label className="block text-sm text-gray-400">
          Precio
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-925 px-3 py-2 text-gray-100"
          />
        </label>
        <label className="block text-sm text-gray-400 sm:col-span-2">
          Categoria (opcional)
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-925 px-3 py-2 text-gray-100"
          >
            <option value="">Sin categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-gray-400 sm:col-span-2">
          Descripcion (opcional)
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-925 px-3 py-2 text-gray-100"
          />
        </label>
      </div>

      <ErrorText error={error} />

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={!canCreate || creating}
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-gray-950 hover:bg-primary-400 disabled:opacity-50"
        >
          {creating ? 'Creando...' : 'Crear producto'}
        </button>
      </div>
    </Modal>
  )
}

export function Productos() {
  const products = useProductsStore((s) => s.products)
  const categories = useCategoriesStore((s) => s.categories)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCategories, setShowCategories] = useState(false)
  const [showNewProduct, setShowNewProduct] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const productCountByCategory = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of products) {
      if (p.categoryId) counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1)
    }
    return counts
  }, [products])

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => !selectedCategoryId || p.categoryId === selectedCategoryId)
      .filter((p) => {
        if (!searchQuery.trim()) return true
        return p.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      })
  }, [products, searchQuery, selectedCategoryId])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-gray-50">Productos</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCategories(true)}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
          >
            Crear o editar categoria
          </button>
          <button
            type="button"
            onClick={() => setShowNewProduct(true)}
            className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-gray-950 hover:bg-primary-400"
          >
            + Nuevo producto
          </button>
        </div>
      </div>

      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Buscar producto por nombre..."
        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100"
      />

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              selectedCategoryId === null
                ? 'bg-primary-500 text-gray-950'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Todas ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategoryId((prev) => (prev === c.id ? null : c.id))}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                selectedCategoryId === c.id
                  ? 'bg-primary-500 text-gray-950'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {c.name} ({productCountByCategory.get(c.id) ?? 0})
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {filteredProducts.map((p) => (
          <ProductCard key={p.id} product={p} categories={categories} />
        ))}
        {filteredProducts.length === 0 && (
          <p className="text-sm text-gray-500">
            {products.length === 0
              ? 'No hay productos cargados.'
              : 'Ningun producto coincide con la busqueda o la categoria elegida.'}
          </p>
        )}
      </div>

      {showCategories && <CategoriesModal onClose={() => setShowCategories(false)} />}
      {showNewProduct && (
        <NuevoProductoModal categories={categories} onClose={() => setShowNewProduct(false)} />
      )}
    </div>
  )
}
