import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { BuildProvider } from "./contexts/BuildContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { SidebarProvider, useSidebar } from "./contexts/SidebarContext";
import { AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./components/Home/Home";
import Build from "./components/Build/Build";
import Compatibility from "./components/Compatibility/Compatibility";
import Learn from "./components/Learn/Learn";
import HelpSupport from "./components/HelpSupport/HelpSupport";
import Brands from "./components/Brands/Brands";
import PCBuilder3D from "./components/3D/PCBuilder3D";
import {
  AdminInventory,
  AdminCrawler,
  AdminAddComponent,
  AdminEditComponent,
  AdminLogin,
  AdminAuthGuard
} from "./components/Admin/Admin";
import MotionPage from "./utilities/pageTransitions";
import soundManager from "./utilities/soundManager";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function AppContent() {
  const { isPinned, isSidebarOpen } = useSidebar();
  const { theme } = useTheme();
  const location = useLocation();

  return (
    <div className={`min-h-screen app-layout ${theme === 'dark' ? 'theme-dark' : 'theme-light'} ${isPinned ? 'sidebar-pinned' : ''} ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Navbar />
      <main className="main-content">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            {/* Main Landing Page */}
            <Route path="/" element={<MotionPage routeKey="/"><Home /></MotionPage>} />

            {/* Build Page */}
            <Route path="/build" element={<MotionPage routeKey="/build"><Build /></MotionPage>} />

            {/* Compatibility Page */}
            <Route path="/compatibility" element={<MotionPage routeKey="/compatibility"><Compatibility /></MotionPage>} />

            {/* Learn Page & Component Deep-Dives */}
            <Route path="/learn" element={<MotionPage routeKey="/learn"><Learn /></MotionPage>} />
            <Route path="/learn/:componentId" element={<MotionPage routeKey="/learn"><Learn /></MotionPage>} />

            {/* Brands Page */}
            <Route path="/brands" element={<MotionPage routeKey="/brands"><Brands /></MotionPage>} />

            {/* 3D Builder Page */}
            <Route path="/3d-builder" element={<MotionPage routeKey="/3d-builder"><PCBuilder3D /></MotionPage>} />

            {/* Help & Support Deck */}
            <Route path="/help" element={<MotionPage routeKey="/help"><HelpSupport /></MotionPage>} />

            {/* Dedicated Admin Login Route */}
            <Route path="/admin/login" element={<MotionPage routeKey="/admin/login"><AdminLogin /></MotionPage>} />

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
                  <MotionPage routeKey="/admin/inventory">
                    <AdminInventory />
                  </MotionPage>
                </AdminAuthGuard>
              }
            />
            <Route
              path="/admin/add"
              element={
                <AdminAuthGuard>
                  <MotionPage routeKey="/admin/add">
                    <AdminAddComponent />
                  </MotionPage>
                </AdminAuthGuard>
              }
            />
            <Route
              path="/admin/edit"
              element={
                <AdminAuthGuard>
                  <MotionPage routeKey="/admin/edit">
                    <AdminEditComponent />
                  </MotionPage>
                </AdminAuthGuard>
              }
            />
            <Route
              path="/admin/edit/:componentId"
              element={
                <AdminAuthGuard>
                  <MotionPage routeKey="/admin/edit-id">
                    <AdminEditComponent />
                  </MotionPage>
                </AdminAuthGuard>
              }
            />
            {/* Dedicated delete page now routed to centralized Edit page */}
            <Route
              path="/admin/delete"
              element={
                <AdminAuthGuard>
                  <Navigate to="/admin/edit" replace />
                </AdminAuthGuard>
              }
            />
            <Route
              path="/admin/crawler"
              element={
                <AdminAuthGuard>
                  <MotionPage routeKey="/admin/crawler">
                    <AdminCrawler />
                  </MotionPage>
                </AdminAuthGuard>
              }
            />

          </Routes>
        </AnimatePresence>
        {/* Footer suppressed on immersive fullscreen workstations & admin decks */}
        {location.pathname !== "/" &&
          location.pathname !== "/build" &&
          location.pathname !== "/compatibility" &&
          location.pathname !== "/3d-builder" &&
          !location.pathname.startsWith("/admin") &&
          !location.pathname.startsWith("/learn") && <Footer />}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BuildProvider>
          <SidebarProvider>
            <Router>
              <ScrollToTop />
              <AppContent />
            </Router>
          </SidebarProvider>
        </BuildProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
