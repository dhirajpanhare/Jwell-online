import { useState, useEffect } from 'react';
import { Edit2, Trash2, Search, X, Plus } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import toast from 'react-hot-toast';
import { adminCouponApi } from '../../api/dynamicApiService';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    maxUses: 0,
    validFromDate: '',
    validToDate: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminCouponApi.getList();
      setCoupons(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      toast.error('Failed to load coupons');
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.code?.trim()) errors.code = 'Coupon code is required';
    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) errors.discountValue = 'Discount value must be > 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      maxUses: 0,
      validFromDate: '',
      validToDate: '',
      isActive: true,
    });
    setFormErrors({});
    setEditingCoupon(null);
  };

  const handleAddCoupon = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.CouponCode || coupon.code || '',
      discountType: coupon.DiscountType || coupon.discountType || 'percentage',
      discountValue: coupon.DiscountValue || coupon.discountValue || 0,
      maxUses: coupon.MaxUses || coupon.maxUses || 0,
      validFromDate: coupon.ValidFromDate || coupon.validFromDate || '',
      validToDate: coupon.ValidToDate || coupon.validToDate || '',
      isActive: coupon.IsActive !== undefined ? coupon.IsActive : true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      if (editingCoupon) {
        await adminCouponApi.update(editingCoupon.CouponId || editingCoupon.id, formData);
        toast.success('Coupon updated successfully');
      } else {
        await adminCouponApi.create(formData);
        toast.success('Coupon created successfully');
      }
      setShowModal(false);
      await loadCoupons();
    } catch (error) {
      toast.error(error.message || 'Failed to save coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await adminCouponApi.delete(couponId);
      toast.success('Coupon deleted successfully');
      await loadCoupons();
    } catch (error) {
      toast.error(error.message || 'Failed to delete coupon');
    }
  };

  const filteredCoupons = coupons.filter(coupon =>
    (coupon.CouponCode || coupon.code || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const displayCoupons = filteredCoupons.slice(0, itemsPerPage);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Coupons</h1>
          <button
            onClick={handleAddCoupon}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            <Plus className="w-5 h-5" />
            Add Coupon
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by coupon code..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : displayCoupons.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Code</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Discount</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Max Uses</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Valid Period</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Status</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {displayCoupons.map((coupon) => (
                    <tr key={coupon.CouponId || coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-bold font-mono">
                        {coupon.CouponCode || coupon.code}
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                        {coupon.DiscountType === 'percentage' || coupon.discountType === 'percentage' ? '%' : '₹'}
                        {coupon.DiscountValue || coupon.discountValue}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {coupon.MaxUses || coupon.maxUses || 'Unlimited'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs">
                        {coupon.ValidFromDate && coupon.ValidToDate
                          ? `${new Date(coupon.ValidFromDate).toLocaleDateString()} - ${new Date(coupon.ValidToDate).toLocaleDateString()}`
                          : 'Not set'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          (coupon.IsActive !== undefined ? coupon.IsActive : coupon.isActive)
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {(coupon.IsActive !== undefined ? coupon.IsActive : coupon.isActive) ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditCoupon(coupon)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon.CouponId || coupon.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No coupons found</p>
              <button
                onClick={handleAddCoupon}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                Create First Coupon
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingCoupon ? 'Edit Coupon' : 'Add Coupon'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Code <span className="text-red-500">*</span></label>
                <input type="text" name="code" value={formData.code} onChange={handleInputChange} placeholder="e.g., WELCOME50"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono uppercase focus:outline-none focus:border-blue-500" />
                {formErrors.code && <p className="text-red-500 text-xs mt-1">{formErrors.code}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Discount Type</label>
                <select name="discountType" value={formData.discountType} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Discount Value <span className="text-red-500">*</span></label>
                <input type="number" name="discountValue" value={formData.discountValue} onChange={handleInputChange} placeholder="0" min="0" step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                {formErrors.discountValue && <p className="text-red-500 text-xs mt-1">{formErrors.discountValue}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Maximum Uses (0 = Unlimited)</label>
                <input type="number" name="maxUses" value={formData.maxUses} onChange={handleInputChange} placeholder="0" min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Valid From</label>
                <input type="date" name="validFromDate" value={formData.validFromDate} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Valid To</label>
                <input type="date" name="validToDate" value={formData.validToDate} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
              </div>

              <div className="flex items-center">
                <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-900 dark:text-white">Active</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setShowModal(false)} disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : editingCoupon ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Coupons;
