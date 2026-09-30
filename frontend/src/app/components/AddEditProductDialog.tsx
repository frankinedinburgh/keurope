import type { Product } from '../services/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

interface AddEditProductDialogProps {
  isOpen: boolean
  editingId: string | null
  formData: Partial<Product>
  categories: string[]
  onFormChange: (data: Partial<Product>) => void
  onSave: () => void
  onClose: () => void // bundles the setShowAddForm(false) + setEditingId(null) + setFormData({}) reset
}

export default function AddEditProductDialog({
  isOpen,
  editingId,
  formData,
  categories,
  onFormChange,
  onSave,
  onClose,
}: AddEditProductDialogProps) {
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        onFormChange({ ...formData, image_url: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog
      open={isOpen || !!editingId}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              placeholder="Product title"
              value={formData.title || ''}
              onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price *</label>
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={formData.price || ''}
                onChange={(e) => onFormChange({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                value={formData.category || ''}
                onChange={(e) => onFormChange({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black cursor-pointer"
              >
                <option value="">Select a category</option>
                {categories.map(
                  (cat) =>
                    cat !== 'All' && (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    )
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              placeholder="Product description"
              value={formData.description || ''}
              onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Product Image *</label>
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
            />
            {formData.image_url && (
              <img
                src={formData.image_url}
                alt="Preview"
                className="mt-4 h-40 object-cover rounded"
              />
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={onSave}
              className="flex-1 bg-black text-white py-2 rounded hover:bg-neutral-800 font-medium"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
