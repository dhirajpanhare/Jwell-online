import { useNavigate } from 'react-router-dom';
import { LogOut, Mail, User, Phone, MapPin } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your profile</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-teal text-white px-6 py-2 rounded-lg hover:bg-teal/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal to-maroon h-32"></div>

            {/* Profile Content */}
            <div className="px-8 pb-8">
              {/* Avatar and Name */}
              <div className="text-center -mt-16 mb-8">
                <div className="w-32 h-32 mx-auto bg-white rounded-full border-4 border-offwhite flex items-center justify-center shadow-lg mb-4">
                  <User className="w-16 h-16 text-teal" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{user.name || user.email}</h1>
                <p className="text-gray-600 mt-2">{user.email}</p>
              </div>

              {/* User Information */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Email */}
                <div className="bg-offwhite rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-teal" />
                    <h3 className="font-semibold text-gray-900">Email</h3>
                  </div>
                  <p className="text-gray-700 ml-8">{user.email}</p>
                </div>

                {/* Phone (if available) */}
                {user.phone && (
                  <div className="bg-offwhite rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Phone className="w-5 h-5 text-teal" />
                      <h3 className="font-semibold text-gray-900">Phone</h3>
                    </div>
                    <p className="text-gray-700 ml-8">{user.phone}</p>
                  </div>
                )}

                {/* Address (if available) */}
                {user.address && (
                  <div className="bg-offwhite rounded-lg p-4 md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-5 h-5 text-teal" />
                      <h3 className="font-semibold text-gray-900">Address</h3>
                    </div>
                    <p className="text-gray-700 ml-8">{user.address}</p>
                  </div>
                )}
              </div>

              {/* Member Since */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <p className="text-blue-900">
                  Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/products')}
                  className="flex-1 bg-teal text-white py-3 rounded-lg hover:bg-teal/90 transition-colors font-semibold"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-maroon text-white py-3 rounded-lg hover:bg-maroon/90 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
