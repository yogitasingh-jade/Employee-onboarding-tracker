import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [summary, setSummary] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch data when page loads
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Get summary and all profiles at the same time
      const [summaryRes, profilesRes] = await Promise.all([
        API.get('/dashboard/summary'),
        API.get('/profiles/')
      ]);
      setSummary(summaryRes.data);
      setProfiles(profilesRes.data);
    } 
    catch (err) {
      setError('Failed to load data. Please try again.');
    } 
    finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-sm">Loading dashboard!!!</p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-blue-700 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-bold text-lg leading-none">
              Onboarding Tracker
            </h1>
            <p className="text-blue-300 text-xs">Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-200">
            {user?.name}
          </span>
          <button
            onClick={() => navigate('/create-profile')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            + New Profile
          </button>
          <button
            onClick={() => navigate('/templates')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition"
          >
             Templates
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            It's, {user?.name}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            All onboarding activity
          </p>
        </div>

        {/* cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Total profiles */}
          <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
            <div>
              <p className="text-gray-500 text-sm">Total Profiles</p>
              <p className="text-3xl font-bold text-gray-800">
                {summary?.total_active_profiles ?? 0}
              </p>
            </div>
          </div>

          {/* Average completion */}
          <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
            <div>
              <p className="text-gray-500 text-sm">Avg Completion</p>
              <p className="text-3xl font-bold text-gray-800">
                {summary?.average_completion_percentage ?? 0}%
              </p>
            </div>
          </div>

          {/* Active onboardings */}
          <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
            <div>
              <p className="text-gray-500 text-sm">Active Onboardings</p>
              <p className="text-3xl font-bold text-gray-800">
                {profiles.length}
              </p>
            </div>
          </div>

        </div>

        {/* Profiles table */}
        <div className="bg-white rounded-2xl shadow">

          {/* Table header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-lg">
              All Onboarding Profiles
            </h3>
            <span className="text-sm text-gray-400">
              {profiles.length} total
            </span>
          </div>

          {/* Empty state */}
          {profiles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 font-medium">No profiles yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Create your first onboarding profile
              </p>
              <button
                onClick={() => navigate('/create-profile')}
                className="mt-4 bg-blue-700 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-800"
              >
                + Create Profile
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-6 py-3 text-left">Employee ID</th>
                    <th className="px-6 py-3 text-left">Department</th>
                    <th className="px-6 py-3 text-left">Joining Date</th>
                    <th className="px-6 py-3 text-left">Progress</th>
                    <th className="px-6 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {profiles.map((profile) => (
                    <tr
                      key={profile.id}
                      className="hover:bg-gray-50 transition"
                    >
                      {/* Employee ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                            {profile.employee_id}
                          </div>
                          <span className="text-sm text-gray-700 font-medium">
                            Employee 
                          </span>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                          {profile.department}
                        </span>
                      </td>

                      {/* Joining date */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                         {profile.joining_date}
                      </td>

                      {/* Progress bar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${profile.completion_percentage}%`
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-600 w-10">
                            {profile.completion_percentage}%
                          </span>
                        </div>
                      </td>

                      {/* View button */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/profiles/${profile.id}`)}
                          className="bg-blue-700 hover:bg-blue-800 text-white text-xs px-4 py-2 rounded-lg transition"
                        >
                          View 
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;