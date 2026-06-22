import { useState } from 'react';
import { Lock, AlertTriangle, ArrowRight } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import AuthLayout from '../components/layouts/AuthLayout';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';
import { LoadingSpinner } from '../components/states/LoadingState';
import { validateChangePasswordForm } from '../utils/validationUtils';

/**
 * Change Password Page
 * For authenticated users to change their password
 */
const ChangePassword = () => {
  const { changePasswordFunc, isLoading, error: authError, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthLayout title="Unauthorized" subtitle="Please login to continue">
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">You need to be logged in to change your password.</p>
          <a
            href="/login"
            className="inline-block bg-teal text-white px-6 py-2 rounded-lg hover:bg-teal/90"
          >
            Go to Login
          </a>
        </div>
      </AuthLayout>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    // Validate form
    const newErrors = validateChangePasswordForm(
      formData.oldPassword,
      formData.newPassword,
      formData.confirmPassword
    );

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Change password
    const result = await changePasswordFunc(
      formData.oldPassword,
      formData.newPassword
    );

    if (result.success) {
      setSuccessMessage('Password changed successfully!');
      // Reset form
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setErrors({});
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } else if (result.error) {
      setErrors({ submit: result.error });
    }
  };

  return (
    <AuthLayout
      title="Change Password"
      subtitle="Update your account password"
      footer={
        <p className="text-center text-sm text-gray-600">
          Need help? <a href="/support" className="text-teal hover:underline">Contact support</a>
        </p>
      }
    >
      {/* Error Messages */}
      {authError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{authError}</p>
        </div>
      )}

      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type={showOldPassword ? 'text' : 'password'}
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal transition-colors ${
                errors.oldPassword
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showOldPassword ? '👁' : '👁‍🗨'}
            </button>
          </div>
          {errors.oldPassword && (
            <p className="mt-2 text-sm text-red-600">{errors.oldPassword}</p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-5" />

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type={showNewPassword ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal transition-colors ${
                errors.newPassword
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? '👁' : '👁‍🗨'}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
          )}
        </div>

        {/* Password Strength Meter */}
        {formData.newPassword && (
          <PasswordStrengthMeter
            password={formData.newPassword}
            showRequirements={true}
          />
        )}

        {/* Confirm New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal transition-colors ${
                errors.confirmPassword
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? '👁' : '👁‍🗨'}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-teal text-white py-3 px-4 rounded-lg hover:bg-teal/90 active:bg-teal/95 transition-all duration-200 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-6"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" inline />
              <span>Changing Password...</span>
            </>
          ) : (
            <>
              Change Password
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
        <p className="font-semibold mb-2">Security Tips:</p>
        <ul className="text-xs space-y-1 ml-2">
          <li>✓ Choose a strong, unique password</li>
          <li>✓ Don't reuse old passwords</li>
          <li>✓ Don't share your password with anyone</li>
          <li>✓ Change password regularly for security</li>
        </ul>
      </div>
    </AuthLayout>
  );
};

export default ChangePassword;
