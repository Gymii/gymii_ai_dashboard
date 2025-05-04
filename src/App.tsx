import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./store/auth-context";
import { ErrorProvider } from "./store/error-context";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { QueryProvider } from "./services/queryClient";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./layouts/DashboardLayout";
import { ReactNode } from "react";
import ErrorDemo from "./components/ErrorDemo";

import Cost from "./pages/Cost";
import UserManagement from "./pages/UserManagement";
import UserDetail from "./pages/UserDetail";

// Protected route component
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, initError, isLoading } = useAuth();
  // If there's an initialization error, still render the children
  // The error will be displayed by the error dialog
  if (initError) {
    return <>{children}</>;
  }
  // Show loading or spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("not authenticated", isAuthenticated);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { initError, isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        {/* Add other dashboard routes as needed */}
        <Route path="cost" element={<Cost />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="users/:userId" element={<UserDetail />} />
        <Route
          path="revenue"
          element={<div className="p-4">Revenue page coming soon</div>}
        />
        <Route
          path="conversion"
          element={<div className="p-4">Conversion page coming soon</div>}
        />
        <Route
          path="reports"
          element={<div className="p-4">Reports page coming soon</div>}
        />
        <Route path="error-demo" element={<ErrorDemo />} />
      </Route>
      {/* Allow access to error demo without authentication if there's an init error */}
      {initError && <Route path="/error-demo" element={<ErrorDemo />} />}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorProvider>
      <ErrorBoundary>
        <QueryProvider>
          <AuthProvider>
            <Router>
              <AppRoutes />
            </Router>
          </AuthProvider>
        </QueryProvider>
      </ErrorBoundary>
    </ErrorProvider>
  );
}

export default App;
