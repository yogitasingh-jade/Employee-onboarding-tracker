import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
    adminPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdminPrompt, setShowAdminPrompt] = useState(true);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      // Register the user
      await API.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'admin',
        admin_password: formData.adminPassword
      });

      // Auto login after register
      const loginResponse = await API.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      const { access_token, role } = loginResponse.data;

      // Get user info
      const userResponse = await API.get('/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      // Save to context
      login(userResponse.data, access_token);

      // Redirect based on role
      if (role === 'admin') navigate('/admin');
      else if (role === 'manager') navigate('/manager');
      else navigate('/employee');

    } catch (err) {
      if (err.response?.status === 400) {
        setError('Email already registered. Try logging in.');
      } else if (err.response?.status === 403) {
        setError('Invalid admin registration password.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } 
    
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-900">
            Create Admin Account
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Public registration is only available for admins
          </p>
        </div>

        {showAdminPrompt && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Admin Registration
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                You can only register as admin. If you want to register as admin, put the password.
              </p>
              <input
                type="password"
                name="adminPassword"
                value={formData.adminPassword}
                onChange={handleChange}
                placeholder="Admin registration password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.adminPassword) {
                      setError('Please enter the admin registration password.');
                      return;
                    }
                    setError('');
                    setShowAdminPrompt(false);
                  }}
                  className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error box */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="write your name here"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Role
            </label>
            <input
              type="text"
              value="Admin"
              disabled
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 characters"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Password match */}
          {formData.confirmPassword && (
            <p className={`text-xs font-medium ${
              formData.password === formData.confirmPassword
                ? 'text-green-600'
                : 'text-red-500'
            }`}>
              {formData.password === formData.confirmPassword
                ? 'Passwords match'
                : 'Passwords do not match'
              }
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold text-sm transition-colors duration-200
              ${loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-700 hover:bg-blue-800 cursor-pointer'
              }`}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

        </form>

        {/* Login link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-700 font-semibold hover:underline"
          >
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;
