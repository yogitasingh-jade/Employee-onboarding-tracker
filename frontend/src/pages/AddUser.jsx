import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

function AddUser() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await API.post('/auth/users', {
        name: formData.name,
        email: formData.email.toLowerCase(),
        password: formData.password,
        role: formData.role
      });

      setSuccess('User created successfully. They can now login with this email and password.');
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee'
      });
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Email already registered.');
      } else if (err.response?.status === 403) {
        setError('Only admins can add users.');
      } else {
        setError('Failed to create user. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-300 hover:text-white text-sm mr-2"
          >
            Back
          </button>
          <div>
            <h1 className="font-bold text-lg leading-none">Add User</h1>
            <p className="text-blue-300 text-xs">Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-200">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Create User Login</h2>
          <p className="text-gray-500 text-sm mt-1">
            Set the email, password, and role this user will use to login.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-8">
          {success && (
            <div className="bg-green-50 border border-green-300 text-green-700 text-sm rounded-lg px-4 py-3 mb-6">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Employee or manager name"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@company.com"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Set login password"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-semibold text-sm transition ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddUser;
