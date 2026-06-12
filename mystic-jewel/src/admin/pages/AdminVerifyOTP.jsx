import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorAlert } from '../components/ui/ErrorAlert';

export const AdminVerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTPCode, isLoading, error, sendOTPEmail } = useAdminAuth();

  const email = location.state?.email;
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    if (!email) navigate('/admin/login');
  }, [email, navigate]);

  useEffect(() => {
    let interval;
    if (!canResend && resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer, canResend]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpError('Please enter a 6-digit OTP');
      return;
    }

    const result = await verifyOTPCode(email, otp);
    if (result.success) {
      navigate('/admin/dashboard');
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setResendTimer(60);
    await sendOTPEmail(email);
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        <button
          onClick={() => navigate('/admin/login')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</h1>
          <p className="text-gray-600">We sent an OTP to {email}</p>
        </div>

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Enter 6-digit OTP
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(value);
                setOtpError('');
              }}
              placeholder="000000"
              maxLength="6"
              className={`w-full px-4 py-2 text-center text-2xl tracking-widest border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                otpError ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {otpError && (
              <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {otpError}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="text-center mt-6">
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Resend OTP
            </button>
          ) : (
            <p className="text-gray-600 text-sm">
              Resend OTP in <span className="font-semibold text-blue-600">{resendTimer}s</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVerifyOTP;
