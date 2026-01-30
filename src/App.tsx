import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from './components/ui/toaster';

// Pages
import AuthPage from './app/auth/page';
import AdminLayout from './app/admin/layout';
import Dashboard from './app/admin/dashboard/page';
import Reservations from './app/admin/reservations/page';
import Guests from './app/admin/guests/page';
import Settings from './app/admin/settings/page';
import Reports from './app/admin/reports/page';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import ClientArea from './pages/ClientArea';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/client-area" element={<ClientArea />} />
          <Route
            path="/admin"
            element={
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
            }
          />
          <Route
            path="/admin/reservations"
            element={
                <AdminLayout>
                  <Reservations />
                </AdminLayout>
            }
          />
          <Route
            path="/admin/guests"
            element={
                <AdminLayout>
                  <Guests />
                </AdminLayout>
            }
          />
          <Route
            path="/admin/settings"
            element={
                <AdminLayout>
                  <Settings />
                </AdminLayout>
            }
          />
          <Route
            path="/admin/reports"
            element={
                <AdminLayout>
                  <Reports />
                </AdminLayout>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
