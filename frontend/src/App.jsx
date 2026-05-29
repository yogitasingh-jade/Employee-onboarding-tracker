import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ProfileDetail from './pages/ProfileDetail';
import Templates from './pages/Templates';
import CreateProfile from './pages/CreateProfile';
import AddUser from './pages/AddUser';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* login and register */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin only */}
          <Route path="/admin" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } />

          {/* Manager only */}
          <Route path="/manager" element={
            <PrivateRoute allowedRoles={['manager']}>
              <ManagerDashboard />
            </PrivateRoute>
          } />

          {/* Employee only */}
          <Route path="/employee" element={
            <PrivateRoute allowedRoles={['employee']}>
              <EmployeeDashboard />
            </PrivateRoute>
          } />

          {/* Admin and Manager */}
          <Route path="/profiles/:id" element={
            <PrivateRoute allowedRoles={['admin', 'manager']}>
              <ProfileDetail />
            </PrivateRoute>
          } />

          <Route path="/templates" element={
            <PrivateRoute allowedRoles={['admin']}>
              <Templates />
            </PrivateRoute>
          } />

          <Route path="/add-user" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AddUser />
            </PrivateRoute>
          } />

          <Route path="/create-profile" element={
            <PrivateRoute allowedRoles={['admin', 'manager']}>
              <CreateProfile />
            </PrivateRoute>
          } />

          {/* Default */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
