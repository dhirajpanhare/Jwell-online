import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Smartphone, Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import AuthLayout from '../components/layouts/AuthLayout';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';
import MobileNumberInput from '../components/auth/MobileNumberInput';
import { LoadingSpinner } from '../components/states/LoadingState';
import {
  validateRegistrationForm,
  validatePassword,
} from '../utils/validationUtils';

const Register = () => {
  const navigate = useNavigate();
  const { registerNewUser, isLoading, error: authError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setSuccessMessage('');
  };

  const handleMobileChange = (e, cleanValue, formatted) => {
    setFormData((prev) => ({
      ...prev,
      phoneNumber: cleanValue, // Store clean value
    }));

    // Clear error
    if (errors.phoneNumber) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.phoneNumber;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    // Validate form
    const newErrors = validateRegistrationForm(formData);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Register user
    const result = await registerNewUser(
      formData.email,
      formData.password,
      formData.phoneNumber,
      formData.firstName,
      formData.lastName
    );

    if (result.success) {
      setSuccessMessage('Account created successfully! Redirecting to home...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else if (result.error) {
      setErrors({ submit: result.error });
    }
  };

  const passwordIsStrong = validatePassword(formData.password);

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join MysticJewel for exclusive offers"
      footer={
        <p className="text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-teal font-semibold hover:underline">
            Sign in here
          </Link>
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
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal transition-colors ${
                errors.email
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="John"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal transition-colors ${
                errors.firstName
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
              disabled={isLoading}
            />
          </div>
          {errors.firstName && (
            <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Doe"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal transition-colors ${
                errors.lastName
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
              disabled={isLoading}
            />
          </div>
          {errors.lastName && (
            <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>

        {/* Mobile Number */}
        <MobileNumberInput
          value={
            formData.phoneNumber
              ? formData.phoneNumber
                  .replace(/\D/g, '')
                  .replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')
              : ''
          }
          onChange={handleMobileChange}
          error={errors.phoneNumber}
          disabled={isLoading}
        />

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal transition-colors ${
                errors.password
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? '👁' : '👁‍🗨'}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Password Strength Meter */}
        {formData.password && (
          <PasswordStrengthMeter password={formData.password} showRequirements={true} />
        )}

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal transition-colors ${
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
          disabled={isLoading || !passwordIsStrong}
          className="w-full bg-gradient-to-r from-teal to-teal/90 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg active:scale-95 transition-all duration-200 text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 min-h-[48px]"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" inline />
              <span className="text-white font-semibold whitespace-nowrap">Creating Account...</span>
            </>
          ) : (
            <>
              <span className="text-white font-bold whitespace-nowrap">Create Account</span>
              <ArrowRight className="w-5 h-5 text-white flex-shrink-0" />
            </>
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
        <p className="font-semibold mb-2">Security Note:</p>
        <ul className="text-xs space-y-1 ml-2">
          <li>✓ Your password is securely encrypted</li>
          <li>✓ You'll verify your email with an OTP</li>
          <li>✓ Never share your password with anyone</li>
        </ul>
      </div>
    </AuthLayout>
  );
};

export default Register;
