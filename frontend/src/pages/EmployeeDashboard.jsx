import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingTask, setUpdatingTask] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/dashboard/summary');
      setSummary(response.data);
    } 
    catch (err) {
      setError('Failed to load dashboard. Please try again.');
    } 
    finally {
      setLoading(false);
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId, newStatus) => {
    setUpdatingTask(taskId);
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      // Refresh data after update
      await fetchData();
    } 
    catch (err) {
      alert('Failed to update task. Please try again.');
    } 
    finally {
      setUpdatingTask(null);
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
          <p className="text-gray-500 text-sm">Loading your tasks...</p>
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

  // No profile assigned yet
  if (summary?.message) {
    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-bold text-lg leading-none">Onboarding Tracker</h1>
              <p className="text-blue-300 text-xs">Employee Panel</p>
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
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="bg-white rounded-2xl shadow p-10 text-center max-w-md">
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              No Profile Assigned Yet
            </h3>
            <p className="text-gray-400 text-sm">
              Your manager has not created your onboarding profile yet.
              Please check back later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const pending = summary?.pending || [];
  const inProgress = summary?.in_progress || [];
  const completed = summary?.completed || [];
  const total = pending.length + inProgress.length + completed.length;
  const completionPct = total > 0
    ? Math.round((completed.length / total) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-bold text-lg leading-none">
              Onboarding Tracker
            </h1>
            <p className="text-blue-300 text-xs">Employee Panel</p>
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

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, {user?.name}!
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Here are your onboarding tasks
          </p>
        </div>

        {/* Overall progress card */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-500 text-sm">Overall Progress</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {completionPct}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {completed.length} of {total} tasks done
              </p>
              <div className="flex gap-3 mt-2 text-xs">
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                  {pending.length} Pending
                </span>
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                  {inProgress.length} In Progress
                </span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  {completed.length} Completed
                </span>
              </div>
            </div>
          </div>

          {/* Big progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Task columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Pending tasks */}
          <div className="bg-white rounded-2xl shadow">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
              <h3 className="font-bold text-gray-700 text-sm">
                Pending
              </h3>
              <span className="ml-auto bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                {pending.length}
              </span>
            </div>
            <div className="p-4 space-y-3">
              {pending.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-4">
                  No pending tasks
                </p>
              ) : (
                pending.map((task, index) => (
                  <TaskCard
                    key={index}
                    task={task}
                    status="pending"
                    updating={updatingTask}
                    onUpdate={updateTaskStatus}
                  />
                ))
              )}
            </div>
          </div>

          {/* In Progress tasks */}
          <div className="bg-white rounded-2xl shadow">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
              <h3 className="font-bold text-gray-700 text-sm">
                In Progress
              </h3>
              <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {inProgress.length}
              </span>
            </div>
            <div className="p-4 space-y-3">
              {inProgress.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-4 overflow-y-auto">
                  No tasks in progress
                </p>
              ) : (
                inProgress.map((task, index) => (
                  <TaskCard
                    key={index}
                    task={task}
                    status="in_progress"
                    updating={updatingTask}
                    onUpdate={updateTaskStatus}
                  />
                ))
              )}
            </div>
          </div>

          {/* Completed tasks */}
          <div className="bg-white rounded-2xl shadow">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              <h3 className="font-bold text-gray-700 text-sm">
                Completed
              </h3>
              <span className="ml-auto bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {completed.length}
              </span>
            </div>
            <div className="p-4 space-y-3">
              {completed.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-4">
                  No completed tasks yet
                </p>
              ) : (
                completed.map((task, index) => (
                  <TaskCard
                    key={index}
                    task={task}
                    status="completed"
                    updating={updatingTask}
                    onUpdate={updateTaskStatus}
                  />
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Task Card Component 
function TaskCard({ task, status, updating, onUpdate }) {
  const isUpdating = updating === task.id;

  return (
    <div className="border border-gray-200 rounded-xl p-3 hover:shadow-sm transition">

      {/* Task title */}
      <p className={`text-sm font-medium mb-3 ${
        status === 'completed'
          ? 'text-gray-400 line-through'
          : 'text-gray-700'
      }`}>
        {task.title || task}
      </p>

      {/* Action buttons */}
      <div className="flex gap-2">
        {status === 'pending' && (
          <button
            onClick={() => onUpdate(task.id, 'in_progress')}
            disabled={isUpdating}
            className="flex-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-medium py-1.5 rounded-lg transition disabled:opacity-50"
          >
            {isUpdating ? '...' : 'Start'}
          </button>
        )}

        {status === 'in_progress' && (
          <>
            <button
              onClick={() => onUpdate(task.id, 'pending')}
              disabled={isUpdating}
              className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-1.5 rounded-lg transition disabled:opacity-50"
            >
              {isUpdating ? '...' : ' Back'}
            </button>
            <button
              onClick={() => onUpdate(task.id, 'completed')}
              disabled={isUpdating}
              className="flex-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 font-medium py-1.5 rounded-lg transition disabled:opacity-50"
            >
              {isUpdating ? '...' : ' Done'}
            </button>
          </>
        )}

        {status === 'completed' && (
          <button
            onClick={() => onUpdate(task.id, 'pending')}
            disabled={isUpdating}
            className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-500 font-medium py-1.5 rounded-lg transition disabled:opacity-50"
          >
            {isUpdating ? '...' : ' Undo'}
          </button>
        )}
      </div>
    </div>
  );
}

export default EmployeeDashboard;