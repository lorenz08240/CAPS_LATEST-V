import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { BuildProvider } from "./contexts/BuildContext";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./components/Home/Home";
import Build from "./components/Build/Build";
import Compatibility from "./components/Compatibility/Compatibility";
import Learn from "./components/Learn/Learn";
import Brands from "./components/Brands/Brands";
import PCBuilder3D from "./components/3D/PCBuilder3D";
import { AdminInventory, AdminCrawler, AdminLogin, AdminAuthGuard } from "./components/Admin/Admin";
import { Navigate } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);

  return (
    <AuthProvider>
      <BuildProvider>
        <Router>
          <ScrollToTop />
          <div className={`min-h-screen bg-slate-50 app-layout ${isSidebarPinned ? 'sidebar-pinned' : ''}`}>
            <Navbar isPinned={isSidebarPinned} setIsPinned={setIsSidebarPinned} />
            <main className="main-content">
              <Routes>
                {/* Main Landing Page */}
                <Route path="/" element={<Home />} />

                {/* Build Page */}
                <Route path="/build" element={<Build />} />

                {/* Compatibility Page */}
                <Route path="/compatibility" element={<Compatibility />} />

                {/* Learn Page & Component Deep-Dives */}
                <Route path="/learn" element={<Learn />} />
                <Route path="/learn/:componentId" element={<Learn />} />

                {/* Brands Page */}
                <Route path="/brands" element={<Brands />} />

                {/* 3D Builder Page */}
                <Route path="/3d-builder" element={<PCBuilder3D />} />

                {/* Dedicated Admin Login Route */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Protected Admin Routes (Session Auth Guard redirects to /admin/login on expiry/close) */}
                <Route
                  path="/admin"
                  element={
                    <AdminAuthGuard>
                      <Navigate to="/admin/inventory" replace />
                    </AdminAuthGuard>
                  }
                />
                <Route
                  path="/admin/inventory"
                  element={
                    <AdminAuthGuard>
                      <AdminInventory />
                    </AdminAuthGuard>
                  }
                />
                <Route
                  path="/admin/crawler"
                  element={
                    <AdminAuthGuard>
                      <AdminCrawler />
                    </AdminAuthGuard>
                  }
                />

              </Routes>
              <Footer />
            </main>
          </div>
        </Router>
      </BuildProvider>
    </AuthProvider>
  );
}

export default App;
