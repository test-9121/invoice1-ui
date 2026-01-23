import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import OAuth2Callback from "./pages/OAuth2Callback";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import VoiceInput from "./pages/VoiceInput";
import InvoicePreview from "./pages/InvoicePreview";
import InvoiceHistory from "./pages/InvoiceHistory";
import Invoices from "./pages/Invoices";
import Clients from "./pages/Clients";
import ClientForm from "./pages/ClientForm";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import RolePermissions from "./pages/RolePermissions";
import Permissions from "./pages/Permissions";
import Reports from "./pages/Reports";
import WorkOrders from "./pages/WorkOrders";
import SettingsPage from "./pages/SettingsPage";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/oauth2/callback" element={<OAuth2Callback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/voice-input" element={<VoiceInput />} />
              <Route path="/invoice-preview" element={<InvoicePreview />} />
              <Route path="/invoice-history" element={<InvoiceHistory />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/new" element={<ClientForm />} />
              <Route path="/clients/edit/:id" element={<ClientForm />} />
              <Route path="/users" element={<Users />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/roles/:id/permissions" element={<RolePermissions />} />
              <Route path="/permissions" element={<Permissions />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/work-orders" element={<WorkOrders />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/templates" element={<Dashboard />} />
              <Route path="/help" element={<Dashboard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
