import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

function ProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add task form
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  // Assign template
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [assigningTemplate, setAssigningTemplate] = useState(false);

  // Updating task
  const [updatingTask, setUpdatingTask] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchTemplates();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get(`/profiles/${id}`);
      setProfile(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Profile not found.');
      } else if (err.response?.status === 403) {
        setError('You do not have access to this profile.');
      } else {
        setError('Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await API.get('/templates/');
      setTemplates(response.data);
    } catch (err) {
      console.log('Could not load templates');
    }
  };

  // Add ad-hoc task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setAddingTask(true);
    try {
      await API.post(`/profiles/${id}/tasks`, {
        title: newTaskTitle
      });
      setNewTaskTitle('');
      setShowAddTask(false);
      await fetchProfile();
    } catch (err) {
      alert('Failed to add task. Please try again.');
    } finally {
      setAddingTask(false);
    }
  };

  // Assign template to profile
  const handleAssignTemplate = async (templateId) => {
    setAssigningTemplate(true);
    try {
      await API.post(`/profiles/${id}/assign-template`, {
        template_id: templateId
      });
      setShowTemplates(false);
      await fetchProfile();
      alert('Template assigned successfully!');
    } catch (err) {
      alert('Failed to assign template.');
    } finally {
      setAssigningTemplate(false);
    }
  };

  // Update task status
  const handleUpdateTask = async (taskId, newStatus) => {
    setUpdatingTask(taskId);
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      await fetchProfile();
    } catch (err) {
      alert('Failed to update task.');
    } finally {
      setUpdatingTask(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Status badge style
  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-red-100 text-red-600';
    }
  };

  // Status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return ' In Progress';
      default: return ' Pending';
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-sm">Loading profile...</p>
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
            onClick={() => navigate(-1)}
            className="bg-blue-700 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const tasks = profile?.tasks || [];
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Group tasks by status
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

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
              Profile Detail
            </h1>
            <p className="text-blue-300 text-xs">Onboarding Tracker</p>
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

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Profile info card */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex items-start justify-between">

            {/* Left — profile info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center text-2xl font-bold">
                {(profile.employee_name || 'E').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {profile.employee_name || `Employee #${profile.employee_id}`}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                    {profile.department}
                  </span>
                  <span className="text-gray-400 text-xs">
                    Joined {profile.joining_date}
                  </span>
                  <span className="text-gray-400 text-xs">
                    Manager {profile.manager_name || `#${profile.manager_id}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Right — completion % */}
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-800">
                {completionPct}%
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {completed} of {total} tasks done
              </p>
            </div>

          </div>

          {/* Progress bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setShowAddTask(!showAddTask)}
              className="bg-blue-700 hover:bg-blue-800 text-white text-sm px-4 py-2 rounded-lg transition"
            >
              + Add Task
            </button>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-lg transition"
            >
              Assign Template
            </button>
          </div>

          {/* Add task form */}
          {showAddTask && (
            <form
              onSubmit={handleAddTask}
              className="mt-4 flex gap-3 p-4 bg-gray-50 rounded-xl"
            >
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={addingTask}
                className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50"
              >
                {addingTask ? '...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddTask(false)}
                className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-300"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Assign template dropdown */}
          {showTemplates && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm font-semibold text-gray-600 mb-3">
                Select a template to assign:
              </p>
              {templates.length === 0 ? (
                <p className="text-gray-400 text-sm">No templates available.</p>
              ) : (
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {template.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {template.task_titles?.length || 0} tasks
                        </p>
                      </div>
                      <button
                        onClick={() => handleAssignTemplate(template.id)}
                        disabled={assigningTemplate}
                        className="bg-purple-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        {assigningTemplate ? '...' : 'Assign'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowTemplates(false)}
                className="mt-3 text-sm text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Task stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{pendingTasks.length}</p>
            <p className="text-xs text-gray-500 mt-1">Pending</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">{inProgressTasks.length}</p>
            <p className="text-xs text-gray-500 mt-1">In Progress</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{completedTasks.length}</p>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </div>
        </div>

        {/* Task list */}
        <div className="bg-white rounded-2xl shadow">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-lg">All Tasks</h3>
            <span className="text-sm text-gray-400">{total} total</span>
          </div>

          {/* Empty state */}
          {tasks.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 font-medium">No tasks yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Add a task or assign a template above
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">

              {/* Pending */}
              {pendingTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  updating={updatingTask}
                  onUpdate={handleUpdateTask}
                  getStatusStyle={getStatusStyle}
                  getStatusLabel={getStatusLabel}
                />
              ))}

              {/* In Progress */}
              {inProgressTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  updating={updatingTask}
                  onUpdate={handleUpdateTask}
                  getStatusStyle={getStatusStyle}
                  getStatusLabel={getStatusLabel}
                />
              ))}

              {/* Completed */}
              {completedTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  updating={updatingTask}
                  onUpdate={handleUpdateTask}
                  getStatusStyle={getStatusStyle}
                  getStatusLabel={getStatusLabel}
                />
              ))}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Task Row Component ─────────────────────────────────────
function TaskRow({ task, updating, onUpdate, getStatusStyle, getStatusLabel }) {
  const isUpdating = updating === task.id;

  return (
    <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">

      {/* Left — task title */}
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${
          task.status === 'completed' ? 'bg-green-500' :
          task.status === 'in_progress' ? 'bg-yellow-400' : 'bg-red-400'
        }`} />
        <p className={`text-sm font-medium ${
          task.status === 'completed'
            ? 'text-gray-400 line-through'
            : 'text-gray-700'
        }`}>
          {task.title}
        </p>
      </div>

      {/* Right — status badge + action buttons */}
      <div className="flex items-center gap-3">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusStyle(task.status)}`}>
          {getStatusLabel(task.status)}
        </span>

        {/* Action buttons */}
        <div className="flex gap-2">
          {task.status === 'pending' && (
            <button
              onClick={() => onUpdate(task.id, 'in_progress')}
              disabled={isUpdating}
              className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
            >
              {isUpdating ? '...' : 'Start'}
            </button>
          )}

          {task.status === 'in_progress' && (
            <>
              <button
                onClick={() => onUpdate(task.id, 'pending')}
                disabled={isUpdating}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
              >
                {isUpdating ? '...' : 'Back'}
              </button>
              <button
                onClick={() => onUpdate(task.id, 'completed')}
                disabled={isUpdating}
                className="text-xs bg-green-100 hover:bg-green-200 text-green-700 font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
              >
                {isUpdating ? '...' : ' Done'}
              </button>
            </>
          )}

          {task.status === 'completed' && (
            <button
              onClick={() => onUpdate(task.id, 'pending')}
              disabled={isUpdating}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-500 font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
            >
              {isUpdating ? '...' : 'Undo'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileDetail;
