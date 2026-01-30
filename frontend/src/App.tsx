import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RequireAuth from './components/auth/RequireAuth';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';

// Placeholder components
const ClientProfile = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-gray-800">Client Profile</h1>
    <p>Welcome to your profile.</p>
  </div>
);

const Unauthorized = () => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
    <p>You do not have access to this page.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin Routes */}
        <Route element={<RequireAuth allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="clients" element={<div>Clients List Placeholder</div>} />
            <Route path="products" element={<div>Products List Placeholder</div>} />
            <Route path="orders" element={<div>Orders List Placeholder</div>} />
          </Route>
        </Route>

        {/* Client Routes */}
        <Route element={<RequireAuth allowedRoles={['CLIENT']} />}>
          <Route path="/client/profile" element={<ClientProfile />} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
