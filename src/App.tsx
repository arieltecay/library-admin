import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import Layout from "./layout/Layout";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/products/ProductsPage";
import SalesPage from "./pages/sales/SalesPage";
import ClientesPage from "./pages/clients/ClientsPage";
import CreditosPage from "./pages/credits/CreditsPage";
import ArqueoPage from "./pages/cash-register/CashRegisterPage";
import UsuariosPage from "./pages/users/UsersPage";
import ConfigPage from "./pages/settings/ConfigPage";
import AdminsPage from "./pages/admins/AdminsPage";
import PosPage from "./pages/pos/PosPage";
import SchoolsPage from "./pages/schools/SchoolsPage";

type RouteDef = { path: string; element: ReactNode };

const protectedRoutes: RouteDef[] = [
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/dashboard", element: <DashboardPage /> },
  { path: "/products", element: <ProductsPage /> },
  { path: "/sales", element: <SalesPage /> },
  { path: "/clients", element: <ClientesPage /> },
  { path: "/credits", element: <CreditosPage /> },
  { path: "/cash-register", element: <ArqueoPage /> },
  { path: "/users", element: <UsuariosPage /> },
  { path: "/settings", element: <ConfigPage /> },
  { path: "/schools", element: <SchoolsPage /> },
];

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {protectedRoutes.map((r) => (
        <Route
          key={r.path}
          path={r.path}
          element={<ProtectedRoute>{r.element!}</ProtectedRoute>}
        />
      ))}
      <Route path="/admins" element={<SuperAdminRoute><AdminsPage /></SuperAdminRoute>} />
      <Route path="/pos" element={<ProtectedRoute><PosPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
