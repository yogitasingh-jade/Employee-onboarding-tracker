import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Templates() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New template form
  const [showForm, setShowForm] = useState(false);
  const [templateTitle, setTemplateTitle] = useState('');
  const [taskInputs, setTaskInputs] = useState(['', '', '']);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Expanded template
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/templates/');
      setTemplates(response.data);
    } catch (err) {
      setError('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add a new task input field
  const addTaskInput = () => {
    setTaskInputs([...taskInputs, '']);
  };

  // Remove a task input field
  const removeTaskInput = (index) => {
    const updated = taskInputs.filter((_, i) => i !== index);
    setTaskInputs(updated);
  };

  // Update a task input value
  const updateTaskInput = (index, value) => {
    const updated = [...taskInputs];
    updated[index] = value;
    setTaskInputs(updated);
  };

  // Create new template
  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');

    // Filter out empty task inputs
    const taskTitles = taskInputs.filter(t => t.trim() !== '');

    if (taskTitles.length === 0) {
      setCreateError('Please add at least one task.');
      setCreating(false);
      return;
    }

    try {
      await API.post('/templates/', {
        title: templateTitle,
        task_titles: taskTitles
      });

      // Reset form
      setTemplateTitle('');
      setTaskInputs(['', '', '']);
      setShowForm(false);
      await fetchTemplates();

    } catch (err) {
      if (err.response?.status === 403) {
        setCreateError('Only admins can create templates.');
      } else {
        setCreateError('Failed to create template. Please try again.');
      }
    } finally {
      setCreating(false);
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
          <p className="text-gray-500 text-sm">Loading templates...</p>
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
            onClick={fetchTemplates}
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
          <button
            onClick={() => navigate('/admin')}
            className="text-blue-300 hover:text-white text-sm mr-2"
          >
             Back
          </button>
          <span className="text-2xl">📋</span>
          <div>
            <h1 className="font-bold text-lg leading-none">
              Checklist Templates
            </h1>
            <p className="text-blue-300 text-xs">Admin Panel</p>
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

        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Templates
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Create reusable onboarding checklists
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            {showForm ? ' Cancel' : '+ New Template'}
          </button>
        </div>

        {/* Create template form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow p-6 mb-8">
            <h3 className="font-bold text-gray-800 text-lg mb-6">
              Create New Template
            </h3>

            {createError && (
              <div className="bg-red-50 border border-red-300 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateTemplate} className="space-y-5">

              {/* Template title */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateTitle}
                  onChange={(e) => setTemplateTitle(e.target.value)}
                  placeholder="e.g. Engineering Onboarding"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Task inputs */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Tasks
                </label>
                <div className="space-y-2">
                  {taskInputs.map((task, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <span className="text-gray-400 text-sm w-5">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={task}
                        onChange={(e) => updateTaskInput(index, e.target.value)}
                        placeholder={`Task ${index + 1}`}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {taskInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTaskInput(index)}
                          className="text-red-400 hover:text-red-600 text-lg font-bold px-2"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add task button */}
                <button
                  type="button"
                  onClick={addTaskInput}
                  className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Add another task
                </button>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className={`px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition
                    ${creating
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-700 hover:bg-blue-800'
                    }`}
                >
                  {creating ? ' Creating...' : 'Create Template'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold transition"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Templates list */}
        {templates.length === 0 ? (
          <div className="bg-white rounded-2xl shadow text-center py-16">
            <p className="text-gray-500 font-medium">No templates yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Create your first checklist template
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-blue-700 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-800"
            >
              + Create Template
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-2xl shadow overflow-hidden"
              >
                {/* Template header */}
                <div
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpandedId(
                    expandedId === template.id ? null : template.id
                  )}
                >
                  <div className="flex items-center gap-3">
                    
                    <div>
                      <p className="font-bold text-gray-800">
                        {template.title}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {template.task_titles?.length || 0} tasks
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {expandedId === template.id ? ' Hide' : ' Show tasks'}
                  </span>
                </div>

                {/* Task list — shown when expanded */}
                {expandedId === template.id && (
                  <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                    {template.task_titles?.length === 0 ? (
                      <p className="text-gray-400 text-sm">No tasks in this template</p>
                    ) : (
                      <ul className="space-y-2">
                        {template.task_titles?.map((title, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-3 text-sm text-gray-600"
                          >
                            <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {index + 1}
                            </span>
                            {title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Templates;