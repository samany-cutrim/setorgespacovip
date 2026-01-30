import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import Financial from './app/admin/financial/page';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import ClientArea from './pages/ClientArea';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/client-area" element={<ClientArea />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="guests" element={<Guests />} />
            <Route path="settings" element={<Settings />} />
            <Route path="reports" element={<Reports />} />
            <Route path="financial" element={<Financial />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
