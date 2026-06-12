import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorAlert } from '../components/ui/ErrorAlert';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { sendOTPEmail, isLoading, error } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
      setEmailError('Please enter a valid email');
      return;
    }

    const result = await sendOTPEmail(email);
    if (result.success) {
      setSuccessMessage('OTP sent successfully!');
      setTimeout(() => {
        navigate('/admin/verify-otp', { state: { email } });
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">MysticJewel Administration</p>
        </div>

        {/* Errors */}
        {error && <ErrorAlert message={error} />}

        {/* Success */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSendOTP} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
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
                placeholder="admin@example.com"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
            </div>
            {emailError && (
              <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {emailError}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <LoadingSpinner /> : 'Send OTP'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          You will receive an OTP via email for verification
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
