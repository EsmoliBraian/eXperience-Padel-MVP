import { useProductsStore } from '@/store/productsStore'
import { formatCurrency } from '@/lib/format'

export function Productos() {
  const products = useProductsStore((s) => s.products)
  const addProduct = useProductsStore((s) => s.addProduct)
  const updateProduct = useProductsStore((s) => s.updateProduct)
  const deleteProduct = useProductsStore((s) => s.deleteProduct)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-50">Productos</h1>
        <button
          type="button"
          onClick={() => addProduct({ name: 'Nuevo producto', price: 0 })}
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-gray-950 hover:bg-primary-400"
        >
          + Nuevo producto
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-500">
              <th className="p-3">Nombre</th>
              <th className="p-3">Precio</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-800 last:border-0">
                <td className="p-3">
                  <input
                    value={p.name}
                    onChange={(e) => updateProduct(p.id, { name: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-gray-100"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    value={p.price}
                    onChange={(e) => updateProduct(p.id, { price: Number(e.target.value) })}
                    className="w-28 rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-gray-100"
                  />
                  <span className="ml-2 text-xs text-gray-500">{formatCurrency(p.price)}</span>
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => deleteProduct(p.id)}
                    className="text-xs text-danger hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  No hay productos cargados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
