import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ToastProvider } from './components/ui/use-toast';
import DocumentManagement from './pages/admin/DocumentManagement';
import NewsManagement from './pages/admin/NewsManagement';
// Public Pages
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/public/Home';
import News from './pages/public/News';
import Blogs from './pages/public/Blogs';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Resources from './pages/public/Resources';
import Documents from './pages/public/Documents';
import UserManagement from './pages/admin/UserManagement';
// Admin/Protected Pages
import Login from './pages/Login';
import AdminLayout from './components/Layout';
import Dashboard from './pages/Dashboard';

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
                <ToastProvider>
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
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />

            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminLayout />
                  
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              <Route path="documents" element={<DocumentManagement />} />
              
             <Route path="news" element={<NewsManagement />} />
              
              <Route path="archives" element={<div className="p-6">
                <h2 className="text-2xl font-bold mb-4 font-amharic">አርክይቭ አስተዳደር</h2>
                <p className="text-muted-foreground">Archive management system coming soon...</p>
              </div>} />
              
              <Route path="users" element={<UserManagement />} />
              
              <Route path="settings" element={<div className="p-6">
                <h2 className="text-2xl font-bold mb-4 font-amharic">ቅንብሮች</h2>
                <p className="text-muted-foreground">Settings coming soon...</p>
              </div>} />
              
              <Route path="profile" element={<div className="p-6">
                <h2 className="text-2xl font-bold mb-4 font-amharic">መገለጫ</h2>
                <p className="text-muted-foreground">Profile page coming soon...</p>
              </div>} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
</ToastProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;