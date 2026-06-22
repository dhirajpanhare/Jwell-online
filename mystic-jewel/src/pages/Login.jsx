import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useAuthContext } from '../context/AuthContext';
import AuthLayout from '../components/layouts/AuthLayout';
import { LoadingSpinner } from '../components/states/LoadingState';
import { validateLoginForm } from '../utils/validationUtils';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading: authLoading, error: authError } = useAuth();
  const { user: contextUser, isLoading: contextLoading } = useAuthContext();

  const [formData, setFormData] = useState({
    emailOrMobile: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [accountLockedMessage, setAccountLockedMessage] = useState('');
  const [loginAttempted, setLoginAttempted] = useState(false);

  // When context user is updated after login, redirect accordingly
  useEffect(() => {
    if (loginAttempted && contextUser) {
      // User logged in successfully - redirect based on role
      const redirectPath = contextUser.role === 'admin' ? '/admin/dashboard' : '/';
      navigate(redirectPath, { replace: true });
    }
  }, [contextUser, loginAttempted, navigate]);

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

    setAccountLockedMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAccountLockedMessage('');
    setErrors({});
    setLoginAttempted(false);

    // Validate form
    const newErrors = validateLoginForm(
      formData.emailOrMobile,
      formData.password
    );

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Login
      const result = await login(formData.emailOrMobile, formData.password);

      if (result.success) {
        // Mark login attempt - useEffect will handle redirect when context updates
        setLoginAttempted(true);
      } else if (result.error) {
        if (result.error.includes('locked')) {
          setAccountLockedMessage(result.error);
        } else if (result.error.includes('verify your email')) {
          setErrors({ submit: 'Please verify your email before logging in' });
        } else {
          setErrors({ submit: result.error });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Welcome back to MysticJewel"
      footer={
        <p className="text-center text-gray-600 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal font-semibold hover:underline">
            Create one here
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

      {accountLockedMessage && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-700 text-sm font-semibold">
              Account Locked
            </p>
            <p className="text-yellow-700 text-sm mt-1">{accountLockedMessage}</p>
            <p className="text-yellow-600 text-xs mt-2">
              Please try again after the lockout period or reset your password.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email or Mobile */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email or Mobile <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="emailOrMobile"
              value={formData.emailOrMobile}
              onChange={handleInputChange}
              placeholder="email@example.com or 9876543210"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal transition-colors ${
                errors.emailOrMobile
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
              disabled={authLoading}
            />
          </div>
          {errors.emailOrMobile && (
            <p className="mt-2 text-sm text-red-600">{errors.emailOrMobile}</p>
          )}
        </div>

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
              className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal transition-colors ${
                errors.password
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
              disabled={authLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-black hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? '👁' : '👁‍🗨'}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-teal hover:underline font-medium"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={authLoading}
          className="w-full bg-gradient-to-r from-teal to-teal/90 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg active:scale-95 transition-all duration-200 text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 min-h-[48px]"
        >
          {authLoading ? (
            <>
              <LoadingSpinner size="sm" inline />
              <span className="text-white font-semibold whitespace-nowrap">Signing in...</span>
            </>
          ) : (
            <>
              <span className="text-white font-bold whitespace-nowrap">Sign In</span>
              <ArrowRight className="w-5 h-5 text-white flex-shrink-0" />
            </>
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
        <p className="font-semibold mb-2">Security Reminders:</p>
        <ul className="text-xs space-y-1 ml-2">
          <li>✓ Never share your password</li>
          <li>✓ Always verify the URL before login</li>
          <li>✓ Your account will lock after 5 failed attempts</li>
        </ul>
      </div>
    </AuthLayout>
  );
};

export default Login;
