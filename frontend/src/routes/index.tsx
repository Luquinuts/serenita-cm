import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "./LoginPage";
import AppShell from "./AppShell";
import PrivacyPolicy from "./PrivacyPolicy";

export default function RootRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/politicas" element={<PrivacyPolicy />} />
          <Route path="/app" element={<ProtectedRoute />}>
            <Route index element={<Navigate to="reports" replace />} />
            <Route path=":section" element={<AppShell />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
