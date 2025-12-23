import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./ScrollToTop";

import Home from "./pages/Home";
import About from "./pages/About";
import DataScience from "./pages/DataScience";
import Contact from "./pages/Contact";
import Renewable from "./pages/Renewable";
import NonRenewable from "./pages/NonRenewable";
import DetailsPage from "./pages/DetailsPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Logout from "./pages/logout";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

const App = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <ScrollToTop />

      <main className="flex-fill">
        <Routes>

          {/* PUBLIC ROUTES (ONLY THESE) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ROOT */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* 🔒 ENTIRE WEBSITE PROTECTED */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/datascience" element={<ProtectedRoute><DataScience /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
          <Route path="/renewable" element={<ProtectedRoute><Renewable /></ProtectedRoute>} />
          <Route path="/nonrenewable" element={<ProtectedRoute><NonRenewable /></ProtectedRoute>} />
          <Route path="/details" element={<ProtectedRoute><DetailsPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/logout" element={<Logout />} />

        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
