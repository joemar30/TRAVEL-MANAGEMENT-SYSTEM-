import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { useEffect } from 'react';
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useWayfarerStore } from "./lib/store";

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

function Router() {
  const { isAuthenticated, fetchData } = useWayfarerStore();

  useEffect(() => {
    // Restore data from the database if the user is still logged in after a refresh
    if (isAuthenticated) {
      fetchData().catch(console.error);
    }
  }, [isAuthenticated, fetchData]);

  return (
    <Switch>
       {/* Public Routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Shared Routes - both admin and client */}
      <Route path="/" component={() => (
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      )} />
      <Route path="/profile" component={() => (
        <ProtectedRoute>
          <Layout><Profile /></Layout>
        </ProtectedRoute>
      )} />
      <Route path="/settings" component={() => (
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Settings /></Layout>
        </ProtectedRoute>
      )} />

      {/* Client-only Routes */}
      <Route path="/my-bookings" component={() => (
        <ProtectedRoute allowedRoles={['client']}>
          <Layout><ClientBookings /></Layout>
        </ProtectedRoute>
      )} />

      {/* Admin-only Routes */}
      <Route path="/bookings" component={() => (
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Bookings /></Layout>
        </ProtectedRoute>
      )} />
      <Route path="/itineraries" component={() => (
        <ProtectedRoute allowedRoles={['admin', 'client']}>
          <Layout><Itineraries /></Layout>
        </ProtectedRoute>
      )} />
      <Route path="/travelers" component={() => (
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Travelers /></Layout>
        </ProtectedRoute>
      )} />
      <Route path="/expenses" component={() => (
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Expenses /></Layout>
        </ProtectedRoute>
      )} />
      <Route path="/reports" component={() => (
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Reports /></Layout>
        </ProtectedRoute>
      )} />
      <Route path="/approvals" component={() => (
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Approvals /></Layout>
        </ProtectedRoute>
      )} />

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
