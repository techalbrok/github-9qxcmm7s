import { Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useRoutes,
} from "react-router-dom";
import routes from "tempo-routes";
import LoginForm from "./components/auth/LoginForm";
import SignUpForm from "./components/auth/SignUpForm";
import Success from "./components/pages/success";
import { AuthProvider, useAuth } from "../supabase/auth";
import AppLayout from "./components/layout/AppLayout";
import LeadsLayout from "./components/leads";
import LeadsList from "./components/leads/LeadsList";
import LeadForm from "./components/leads/LeadForm";
import LeadDetail from "./components/leads/LeadDetail";
import LeadDashboard from "./components/leads/LeadDashboard";
import LeadPipeline from "./components/leads/LeadPipeline";
import TasksListPage from "./components/leads/TasksListPage";
import SettingsPage from "./components/settings/SettingsPage";
import UserManagement from "./components/settings/UserManagement";
import PermissionGuard from "./components/auth/PermissionGuard";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./lib/theme-provider";
import FranchisesLayout from "./components/franchises";
import FranchisesList from "./components/franchises/FranchisesList";
import FranchiseForm from "./components/franchises/FranchiseForm";
import FranchiseDetail from "./components/franchises/FranchiseDetail";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (user) {
    return <Navigate to="/leads/dashboard" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUpForm />
          </PublicRoute>
        }
      />
      <Route path="/success" element={<Success />} />

      {/* Leads Routes */}
      <Route
        path="/leads"
        element={
          <PrivateRoute>
            <AppLayout>
              <LeadsLayout />
            </AppLayout>
          </PrivateRoute>
        }
      >
        <Route index element={<LeadDashboard />} />
        <Route path="dashboard" element={<LeadDashboard />} />
        <Route path="list" element={<LeadsList />} />
        <Route
          path="new"
          element={
            <PermissionGuard allowedRoles={["superadmin", "admin"]}>
              <LeadForm />
            </PermissionGuard>
          }
        />
        <Route path="pipeline" element={<LeadPipeline />} />
        <Route path="tasks" element={<TasksListPage />} />
      </Route>

      <Route
        path="/leads/:id"
        element={
          <PrivateRoute>
            <AppLayout>
              <LeadDetail />
            </AppLayout>
          </PrivateRoute>
        }
      />

      {/* Settings Routes */}
      <Route path="/settings" element={<Navigate to="/settings/account" />} />
      <Route
        path="/settings/account"
        element={
          <PrivateRoute>
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings/users"
        element={
          <PrivateRoute>
            <AppLayout>
              <PermissionGuard allowedRoles={["superadmin"]}>
                <UserManagement />
              </PermissionGuard>
            </AppLayout>
          </PrivateRoute>
        }
      />

      {/* Franchises Routes */}
      <Route
        path="/franchises"
        element={
          <PrivateRoute>
            <AppLayout>
              <FranchisesLayout />
            </AppLayout>
          </PrivateRoute>
        }
      >
        <Route index element={<FranchisesList />} />
      </Route>
      <Route
        path="/franchises/new"
        element={
          <PrivateRoute>
            <AppLayout>
              <FranchiseForm />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/franchises/:id"
        element={
          <PrivateRoute>
            <AppLayout>
              <FranchiseDetail />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/franchises/edit/:id"
        element={
          <PrivateRoute>
            <AppLayout>
              <FranchiseForm isEdit={true} />
            </AppLayout>
          </PrivateRoute>
        }
      />

      {/* Add this before the catchall route for Tempo */}
      {import.meta.env.VITE_TEMPO === "true" && (
        <Route path="/tempobook/*" element={<></>} />
      )}

      {/* Redirect all other routes to login */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

// Create a separate component for Tempo routes to ensure they're used within Router context
function TempoRoutesWrapper() {
  // Only use tempo routes if VITE_TEMPO is true
  if (import.meta.env.VITE_TEMPO === "true") {
    try {
      return useRoutes(routes);
    } catch (error) {
      console.error("Error in TempoRoutesWrapper:", error);
      return null;
    }
  }
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <Suspense fallback={<p>Cargando...</p>}>
            <TempoRoutesWrapper />
            <AppRoutes />
            <Toaster />
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
