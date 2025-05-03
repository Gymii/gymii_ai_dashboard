import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./store/auth-context";
import { QueryProvider } from "./services/queryClient";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./layouts/DashboardLayout";
import { ReactNode } from "react";

import Cost from "./pages/Cost";

// Protected route component
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
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
        <Route
          path="users"
          element={<div className="p-4">Users page coming soon</div>}
        />
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
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryProvider>
          <AppRoutes />
        </QueryProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
