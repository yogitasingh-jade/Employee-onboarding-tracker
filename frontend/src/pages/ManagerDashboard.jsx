import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

function ManagerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/dashboard/summary');
      setSummary(response.data);
    } catch (err) {
      setError('Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Progress bar color based on percentage
  const getProgressColor = (percentage) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-400';
  };

  // Badge color based on percentage
  const getBadgeColor = (percentage) => {
    if (percentage >= 75) return 'bg-green-100 text-green-700';
    if (percentage >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-600';
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
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

  const newHires = summary?.new_hires || [];

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-bold text-lg leading-none">
              Onboarding Tracker
            </h1>
            <p className="text-blue-300 text-xs">Manager Panel</p>
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
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, {user?.name}! 
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Track your new hires onboarding progress
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Total new hires */}
          <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
            <div>
              <p className="text-gray-500 text-sm">My New Hires</p>
              <p className="text-3xl font-bold text-gray-800">
                {newHires.length}
              </p>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
            
            <div>
              <p className="text-gray-500 text-sm">Fully Onboarded</p>
              <p className="text-3xl font-bold text-gray-800">
                {newHires.filter(h => h.completion_percentage === 100).length}
              </p>
            </div>
          </div>

          {/* In progress */}
          <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
            <div>
              <p className="text-gray-500 text-sm">In Progress</p>
              <p className="text-3xl font-bold text-gray-800">
                {newHires.filter(h => h.completion_percentage < 100).length}
              </p>
            </div>
          </div>

        </div>

        {/* New hires list */}
        <div className="bg-white rounded-2xl shadow">

          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-lg">
              My New Hires
            </h3>
            <span className="text-sm text-gray-400">
              {newHires.length} assigned
            </span>
          </div>

          {/* Empty state */}
          {newHires.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 font-medium">
                No new hires assigned yet
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Create an onboarding profile to get started
              </p>
              <button
                onClick={() => navigate('/create-profile')}
                className="mt-4 bg-blue-700 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-800"
              >
                + Create Profile
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {newHires.map((hire) => (
                <div
                  key={hire.profile_id}
                  className="px-6 py-5 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between mb-3">

                    {/* Left side — employee info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                        #{hire.employee_id}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          Employee #{hire.employee_id}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            {hire.department}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side — percentage badge + button */}
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBadgeColor(hire.completion_percentage)}`}>
                        {hire.completion_percentage}% done
                      </span>
                      <button
                        onClick={() => navigate(`/profiles/${hire.profile_id}`)}
                        className="bg-blue-700 hover:bg-blue-800 text-white text-xs px-4 py-2 rounded-lg transition"
                      >
                        View 
                      </button>
                    </div>

                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(hire.completion_percentage)}`}
                        style={{ width: `${hire.completion_percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8">
                      {hire.completion_percentage}%
                    </span>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;