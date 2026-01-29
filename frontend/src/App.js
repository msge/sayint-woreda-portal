import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Public Pages
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/public/Home';
import News from './pages/public/News';
import Blogs from './pages/public/Blogs';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Resources from './pages/public/Resources';
import Documents from './pages/public/Documents';

// Admin/Protected Pages
import Login from './pages/Login';
import AdminLayout from './components/Layout';
import Dashboard from './pages/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="news" element={<News />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="resources" element={<Resources />} />
            <Route path="documents" element={<Documents />} />
          </Route>

          {/* Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="documents" element={<div className="p-6">Admin Documents - Coming Soon</div>} />
            <Route path="news" element={<div className="p-6">Admin News - Coming Soon</div>} />
            <Route path="archives" element={<div className="p-6">Admin Archives - Coming Soon</div>} />
            <Route path="users" element={<div className="p-6">Admin Users - Coming Soon</div>} />
            <Route path="settings" element={<div className="p-6">Admin Settings - Coming Soon</div>} />
          </Route>

          {/* Redirect to home for unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;