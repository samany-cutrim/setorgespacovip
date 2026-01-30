import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Suspense, lazy } from "react";
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const ClientArea = lazy(() => import("./pages/ClientArea"));
const AdminLayout = lazy(() => import("./pages/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Reservations = lazy(() => import("./pages/admin/Reservations"));
const Guests = lazy(() => import("./pages/admin/Guests"));
const Calendar = lazy(() => import("./pages/admin/Calendar"));
const Finance = lazy(() => import("./pages/admin/Finance"));
const Pricing = lazy(() => import("./pages/admin/Pricing"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const AudienciasTRT = lazy(() => import("./pages/admin/AudienciasTRT"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div>Carregando...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/cliente" element={<ClientArea />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="reservations" element={<Reservations />} />
                <Route path="guests" element={<Guests />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="finance" element={<Finance />} />
                <Route path="pricing" element={<Pricing />} />
                <Route path="settings" element={<Settings />} />
                <Route path="audiencias-trt" element={<AudienciasTRT />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
