import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { AdminDashboardPage } from "./pages/dashboard/AdminDashboardPage";
import { CheckingPage } from "./pages/dashboard/CheckingPage";
import { DashboardHomePage } from "./pages/dashboard/DashboardHomePage";
import { DashboardLayout } from "./pages/dashboard/DashboardLayout";
import { LoansDashboardPage } from "./pages/dashboard/LoansDashboardPage";
import { ProfilePage } from "./pages/dashboard/ProfilePage";
import { PayTransferPage } from "./pages/dashboard/PayTransferPage";
import { ManagePayeesPage } from "./pages/dashboard/ManagePayeesPage";
import { SavingsDashboardPage } from "./pages/dashboard/SavingsDashboardPage";
import { StatementsPage } from "./pages/dashboard/StatementsPage";
import { SecurityPage } from "./pages/dashboard/SecurityPage";
import { TransactionsPage } from "./pages/dashboard/TransactionsPage";
import { AboutPage } from "./pages/public/AboutPage";
import { ContactPage } from "./pages/public/ContactPage";
import { FAQPage } from "./pages/public/FAQPage";
import { LandingPage } from "./pages/public/LandingPage";
import { LoansPage } from "./pages/public/LoansPage";
import { MortgagePage } from "./pages/public/MortgagePage";
import { SavingsPage } from "./pages/public/SavingsPage";
import { useAuth } from "./context/AuthContext";

function App() {
  const { token } = useAuth();
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/admin");
  const isSignOutFlow = new URLSearchParams(location.search).get("signout") === "1";

  return (
    <div className="min-h-screen overflow-x-hidden">
      {!isDashboardRoute ? <Navbar /> : null}
      <main className={`${isDashboardRoute ? "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8" : "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"}`}>
        <Routes>
          <Route path="/" element={token ? <Navigate to="/dashboard.html" replace /> : <LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/loans" element={<LoansPage />} />
          <Route path="/savings" element={<SavingsPage />} />
          <Route path="/mortgage" element={<MortgagePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />

          <Route path="/login" element={token && !isSignOutFlow ? <Navigate to="/dashboard.html" replace /> : <LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route path="/dashboard.html" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHomePage />} />
            <Route path="checking" element={<CheckingPage />} />
            <Route path="savings" element={<SavingsDashboardPage />} />
            <Route path="pay-transfer" element={<PayTransferPage />} />
            <Route path="manage-payees" element={<ManagePayeesPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="statements" element={<StatementsPage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="loans" element={<LoansDashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isDashboardRoute ? <Footer /> : null}
    </div>
  );
}

export default App;
