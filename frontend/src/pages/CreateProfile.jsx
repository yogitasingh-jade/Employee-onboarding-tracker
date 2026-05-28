import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

function CreateProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [formData, setFormData] = useState({
    employee_id: '',
    manager_id: '',
    department: '',
    joining_date: ''
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
    // Auto fill manager id if logged in as manager
    if (user?.role === 'manager') {
      setFormData(prev => ({ ...prev, manager_id: user.id }));
    }
  }, []);

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const response = await API.get('/auth/users');
      setUsers(response.data);
    } catch (err) {
      // If endpoint not available just continue
      console.log('Could not fetch users list');
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        employee_id: parseInt(formData.employee_id),
        manager_id: parseInt(formData.manager_id),
        department: formData.department,
        joining_date: formData.joining_date
      };

      const response = await API.post('/profiles/', payload);

      setSuccess('Profile created successfully!');

      // Redirect to the new profile after 1.5 seconds
      setTimeout(() => {
        navigate(`/profiles/${response.data.id}`);
      }, 1500);

    } 
    catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to create profiles.');
      } 
      else if (err.response?.status === 422) {
        setError('Please fill all fields correctly.');
      } 
      else {
        setError('Failed to create profile. Please try again.');
      }
    } 
    finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get today's date for min date on joining date
  const today = new Date().toISOString().split('T')[0];

  // Filter employees and managers from users list
  const employees = users.filter(u => u.role === 'employee');
  const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-300 hover:text-white text-sm mr-2"
          >
            Back
          </button>
          <div>
            <h1 className="font-bold text-lg leading-none">
              Create Onboarding Profile
            </h1>
            <p className="text-blue-300 text-xs">
              {user?.role === 'admin' ? 'Admin Panel' : 'Manager Panel'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-200"> {user?.name}</span>
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
          <h2 className="text-2xl font-bold text-gray-800">
            New Onboarding Profile
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Fill in the details to create a new hire's onboarding profile
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-8">

          {/* Success message */}
          {success && (
            <div className="bg-green-50 border border-green-300 text-green-700 text-sm rounded-lg px-4 py-3 mb-6">
               {success}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
               {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Employee ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Employee ID
              </label>
              <input
                type="number"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                placeholder="Enter employee user ID"
                required
                min="1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                This is the user ID of the new hire from the users table
              </p>
            </div>

            {/* Manager ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Manager ID
              </label>
              <input
                type="number"
                name="manager_id"
                value={formData.manager_id}
                onChange={handleChange}
                placeholder="Enter manager user ID"
                required
                min="1"
                disabled={user?.role === 'manager'}
                className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${user?.role === 'manager' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              {user?.role === 'manager' && (
                <p className="text-xs text-green-600 mt-1">
                  Auto-filled with your ID
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select department</option>
                <option value="Engineering">Engineering</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Design">Design</option>
                <option value="Operations">Operations</option>
                <option value="Product">Product</option>
              </select>
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                name="joining_date"
                value={formData.joining_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Summary box */}
            {formData.employee_id && formData.department && formData.joining_date && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-blue-800 mb-2">
                   Profile Summary
                </p>
                <div className="space-y-1 text-sm text-blue-700">
                  <p> Employee ID: <strong>{formData.employee_id}</strong></p>
                  <p> Manager ID: <strong>{formData.manager_id}</strong></p>
                  <p> Department: <strong>{formData.department}</strong></p>
                  <p> Joining: <strong>{formData.joining_date}</strong></p>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-semibold text-sm transition
                ${loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-700 hover:bg-blue-800'
                }`}
            >
              {loading ? ' Creating...' : 'Create Profile →'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateProfile;