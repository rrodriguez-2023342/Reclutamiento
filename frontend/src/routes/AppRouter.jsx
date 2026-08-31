import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import ChangePassword from "../pages/auth/ChangePassword.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import Login from "../pages/auth/Login.jsx";
import ResetPassword from "../pages/auth/ResetPassword.jsx";
import Dashboard from "../pages/dashboard/Dashboard.jsx";
import Postulantes from "../pages/postulantes/Postulantes.jsx";
import NuevoPostulante from "../pages/postulantes/NuevoPostulante.jsx";
import EditarPostulante from "../pages/postulantes/EditarPostulante.jsx";
import DetallePostulante from "../pages/postulantes/DetallePostulante.jsx";
import Plazas from "../pages/plazas/Plazas.jsx";
import NuevaPlaza from "../pages/plazas/NuevaPlaza.jsx";
import EditarPlaza from "../pages/plazas/EditarPlaza.jsx";
import DetallePlaza from "../pages/plazas/DetallePlaza.jsx";
import Usuarios from "../pages/usuarios/Usuarios.jsx";
import NuevoUsuario from "../pages/usuarios/NuevoUsuario.jsx";
import DetalleUsuario from "../pages/usuarios/DetalleUsuario.jsx";
import EditarUsuario from "../pages/usuarios/EditarUsuario.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";

function ProtectedWithPasswordCheck({ children }) {
  const { user } = useAuth();

  if (user?.mustChangePassword) {
    return <Navigate to="/cambiar-password" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user || user.rol !== 'Administrador') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRouter() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/recuperar"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route
        path="/cambiar-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ProtectedWithPasswordCheck>
              <Dashboard />
            </ProtectedWithPasswordCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/postulantes"
        element={
          <ProtectedRoute>
            <ProtectedWithPasswordCheck>
              <Postulantes />
            </ProtectedWithPasswordCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/postulantes/nuevo"
        element={
          <ProtectedRoute>
            <ProtectedWithPasswordCheck>
              <NuevoPostulante />
            </ProtectedWithPasswordCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/postulantes/:id"
        element={
          <ProtectedRoute>
            <ProtectedWithPasswordCheck>
              <DetallePostulante />
            </ProtectedWithPasswordCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/postulantes/:id/editar"
        element={
          <ProtectedRoute>
            <ProtectedWithPasswordCheck>
              <EditarPostulante />
            </ProtectedWithPasswordCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/plazas"
        element={
          <ProtectedRoute>
            <ProtectedWithPasswordCheck>
              <Plazas />
            </ProtectedWithPasswordCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/plazas/nueva"
        element={
          <ProtectedRoute>
            <ProtectedWithPasswordCheck>
              <NuevaPlaza />
            </ProtectedWithPasswordCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/plazas/:id"
        element={
          <ProtectedRoute>
            <ProtectedWithPasswordCheck>
              <DetallePlaza />
            </ProtectedWithPasswordCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/plazas/:id/editar"
        element={
          <ProtectedRoute>
            <ProtectedWithPasswordCheck>
              <EditarPlaza />
            </ProtectedWithPasswordCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <ProtectedWithPasswordCheck>
                <Usuarios />
              </ProtectedWithPasswordCheck>
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios/nuevo"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <ProtectedWithPasswordCheck>
                <NuevoUsuario />
              </ProtectedWithPasswordCheck>
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios/:id"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <ProtectedWithPasswordCheck>
                <DetalleUsuario />
              </ProtectedWithPasswordCheck>
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios/:id/editar"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <ProtectedWithPasswordCheck>
                <EditarUsuario />
              </ProtectedWithPasswordCheck>
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRouter;
