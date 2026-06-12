import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, AlertCircle } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { LoadingSpinner } from '../components/states/LoadingState';
import { ErrorAlert } from '../components/states/ErrorState';

const Login = () => {
  const navigate = useNavigate();
  const { sendOTPEmail, isLoading, error, otpSent } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
    }
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
          {error && (
            <ErrorAlert message={error} dismissible={false} />
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSendOTP} className="space-y-6">
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
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" inline />
                  <span>Sending OTP...</span>
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </form>

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
