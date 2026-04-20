import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { useEffect } from 'react';
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useTravelStore } from "./lib/store";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import ClientBookings from "./pages/ClientBookings";
import Itineraries from "./pages/Itineraries";
import Travelers from "./pages/Travelers";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Approvals from "./pages/Approvals";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

function Router() {
  const { isAuthenticated, fetchData, startPolling, stopPolling } = useTravelStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchData().catch(console.error);
      startPolling();  // auto-refresh every 30s
    } else {
      stopPolling();   // clean up when logged out
    }
    return () => {
      // cleanup on unmount
      stopPolling();
    };
  }, [isAuthenticated]);

  return (
    <Switch>
       {/* Public Routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />

      {/* Shared Routes - both admin and client */}
      <Route path="/">
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Layout><Profile /></Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Settings /></Layout>
        </ProtectedRoute>
      </Route>

      {/* Client-only Routes */}
      <Route path="/my-bookings">
        <ProtectedRoute allowedRoles={['client']}>
          <Layout><ClientBookings /></Layout>
        </ProtectedRoute>
      </Route>

      {/* Admin-only Routes */}
      <Route path="/bookings">
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Bookings /></Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/itineraries">
        <ProtectedRoute allowedRoles={['admin', 'client']}>
          <Layout><Itineraries /></Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/travelers">
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Travelers /></Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/expenses">
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Expenses /></Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/reports">
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Reports /></Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/approvals">
        <ProtectedRoute allowedRoles={['admin', 'client']}>
          <Layout><Approvals /></Layout>
        </ProtectedRoute>
      </Route>

      {/* 404 */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
