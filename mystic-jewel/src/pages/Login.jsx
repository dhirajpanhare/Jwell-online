import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, AlertCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { LoadingSpinner } from '../components/states/LoadingState';
import { ErrorAlert } from '../components/states/ErrorState';

const Login = () => {
  const navigate = useNavigate();
  const { sendOTPEmail, isLoading, error, otpSent } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setEmailError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    const result = await sendOTPEmail(email);
    if (result.success) {
      setSuccessMessage('OTP sent successfully! Check your email.');
      setTimeout(() => {
        navigate('/verify-otp', { state: { email } });
      }, 1500);
    } else if (result.error && result.error.includes('Network')) {
      // Auto-enable demo mode on network error
      setDemoMode(true);
    }
  };

  const handleDemoLogin = (e) => {
    e.preventDefault();
    setEmailError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setSuccessMessage('Demo mode: OTP sent successfully! Proceeding to verification...');
    setTimeout(() => {
      navigate('/verify-otp', { state: { email, demoMode: true } });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-offwhite to-blush/10 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MysticJewel</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Error Alert */}
          {error && !demoMode && (
            <ErrorAlert message={error} dismissible={false} />
          )}

          {/* Demo Mode Alert */}
          {demoMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-900 font-semibold">Demo Mode Active</p>
                <p className="text-blue-800 text-sm mt-1">Backend not running. Using demo verification.</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={demoMode ? handleDemoLogin : handleSendOTP} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal ${
                    emailError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading || otpSent}
                />
              </div>
              {emailError && (
                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {emailError}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || otpSent}
              className="w-full bg-teal text-white py-3 px-4 rounded-lg hover:bg-teal/90 active:bg-teal/95 transition-all duration-200 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" inline />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  Send OTP
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Create Account Link */}
          <p className="text-center text-gray-600 text-sm mb-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal font-semibold hover:underline">
              Create one here
            </Link>
          </p>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Demo:</strong> Enter any email address and you'll receive an OTP on the next page (for testing).
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-600 mt-6">
            We'll send you an OTP via email to verify your identity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
