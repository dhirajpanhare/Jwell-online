import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import DataTable from '../components/tables/DataTable';
import Modal from '../components/modals/Modal';
import ConfirmDialog from '../components/modals/ConfirmDialog';
import FormField from '../components/forms/FormField';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/productService';
import { getCategories } from '../services/categoryService';
import toast from 'react-hot-toast';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    description: '',
    price: '',
    salePrice: '',
    stock: '',
    material: '',
    weight: '',
    status: 'active',
    featured: false,
    bestSeller: false,
    images: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.sku.trim()) errors.sku = 'SKU is required';
    if (!formData.categoryId) errors.categoryId = 'Category is required';
    if (!formData.price) errors.price = 'Price is required';
    if (!formData.stock) errors.stock = 'Stock quantity is required';
    if (formData.salePrice && parseFloat(formData.salePrice) > parseFloat(formData.price)) {
      errors.salePrice = 'Sale price cannot be greater than regular price';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle add product
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      sku: '',
      categoryId: '',
      description: '',
      price: '',
      salePrice: '',
      stock: '',
      material: '',
      weight: '',
      status: 'active',
      featured: false,
      bestSeller: false,
      images: '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      categoryId: product.categoryId || '',
      description: product.description || '',
      price: product.price || '',
      salePrice: product.salePrice || '',
      stock: product.stock || '',
      material: product.material || '',
      weight: product.weight || '',
      status: product.status || 'active',
      featured: product.featured || false,
      bestSeller: product.bestSeller || false,
      images: product.images?.join(',') || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Handle submit form
  const handleSubmitForm = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, formData);
        toast.success('Product updated successfully');
      } else {
        await createProduct(formData);
        toast.success('Product created successfully');
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete product
  const handleDeleteProduct = (product) => {
    setDeleteTarget(product);
    setShowDeleteConfirm(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    try {
      await deleteProduct(deleteTarget.id);
      toast.success('Product deleted successfully');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns
  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'sku', label: 'SKU' },
    {
      key: 'categoryId',
      label: 'Category',
      render: (categoryId) => {
        const category = categories.find((c) => c.id === categoryId);
        return category?.name || 'N/A';
      },
    },
    {
      key: 'price',
      label: 'Price',
      render: (price) => `₹${price}`,
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (stock) => (
        <span className={stock > 10 ? 'text-green-600' : 'text-orange-600 font-semibold'}>
          {stock}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          status === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }`}>
          {status}
        </span>
      ),
    },
  ];

  if (loading) {
    return <AdminLayout><LoadingSpinner fullScreen /></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
          <button
            onClick={handleAddProduct}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <ErrorAlert
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredProducts}
          loading={loading}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => !isSubmitting && setShowModal(false)}
        title={selectedProduct ? 'Edit Product' : 'Add New Product'}
        size="2xl"
        footer={
          <>
            <button
              onClick={() => setShowModal(false)}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitForm}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            error={formErrors.name}
            placeholder="Enter product name"
            required
          />

          <FormField
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={handleFormChange}
            error={formErrors.sku}
            placeholder="Enter SKU"
            required
          />

          <FormField
            label="Category"
            name="categoryId"
            type="select"
            value={formData.categoryId}
            onChange={handleFormChange}
            error={formErrors.categoryId}
            options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
            required
          />

          <FormField
            label="Price (₹)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleFormChange}
            error={formErrors.price}
            placeholder="Enter price"
            required
          />

          <FormField
            label="Sale Price (₹)"
            name="salePrice"
            type="number"
            value={formData.salePrice}
            onChange={handleFormChange}
            error={formErrors.salePrice}
            placeholder="Enter sale price (optional)"
          />

          <FormField
            label="Stock Quantity"
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleFormChange}
            error={formErrors.stock}
            placeholder="Enter stock quantity"
            required
          />

          <FormField
            label="Material"
            name="material"
            value={formData.material}
            onChange={handleFormChange}
            placeholder="e.g., Gold plated, Silver"
          />

          <FormField
            label="Weight (grams)"
            name="weight"
            type="number"
            value={formData.weight}
            onChange={handleFormChange}
            placeholder="Enter weight"
          />

          <FormField
            label="Status"
            name="status"
            type="select"
            value={formData.status}
            onChange={handleFormChange}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />

          <div className="md:col-span-2 space-y-2">
            <FormField
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Enter product description"
              rows={3}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <FormField
              label="Images"
              name="images"
              type="textarea"
              value={formData.images}
              onChange={handleFormChange}
              placeholder="Enter image URLs separated by commas"
              rows={2}
            />
          </div>

          <FormField
            label="Featured"
            name="featured"
            type="checkbox"
            value={formData.featured}
            onChange={handleFormChange}
            placeholder="Mark as featured"
          />

          <FormField
            label="Best Seller"
            name="bestSeller"
            type="checkbox"
            value={formData.bestSeller}
            onChange={handleFormChange}
            placeholder="Mark as best seller"
          />
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isSubmitting}
      />
    </AdminLayout>
  );
};

export default Products;
