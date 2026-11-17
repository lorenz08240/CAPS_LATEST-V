import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useParams,
  Navigate,
} from "react-router-dom";
import { BuildProvider } from "./contexts/BuildContext";
import { AuthProvider } from "./contexts/AuthContext";
import { LearnModeProvider } from "./contexts/LearnModeContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { SidebarProvider, useSidebar } from "./contexts/SidebarContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./components/Home/Home";
import Build from "./components/Build/Build";
import Compatibility from "./components/Compatibility/Compatibility";
import Learn from "./components/Learn/Learn";
import CertificationPage from "./components/Learn/CertificationPage";
import HelpSupport from "./components/HelpSupport/HelpSupport";
import AboutUs from "./components/AboutUs/AboutUs";
import Brands from "./components/Brands/Brands";
import LegalPage from "./components/Legal/LegalPage";
import SettingsPage from "./components/Settings/SettingsPage";
import PCBuilder3D from "./components/3D/PCBuilder3D";
import StudentDashboard from "./components/Dashboard/StudentDashboard";
import FullscreenGate from "./components/FullscreenGate/FullscreenGate";
import Preloader from "./components/Home/Preloader";
import CookieConsent from "./components/Navigation/CookieConsent";
import LearnModeGuard from "./components/Navigation/LearnModeGuard";
import {
  AdminInventory,
  AdminCrawler,
  AdminAddComponent,
  AdminEditComponent,
  AdminLogin,
  AdminAuthGuard,
  AdminLogs,
  AdminAccounts,
  AdminContent
} from "./components/Admin/Admin";
import MotionPage from "./utilities/pageTransitions";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AdminEditRedirect = () => {
  const { componentId } = useParams();
  return <Navigate to={`/admin/inventory${componentId ? `?edit=${encodeURIComponent(componentId)}` : ""}`} replace />;
};

function AppContent() {
  const { isPinned, isSidebarOpen, closeSidebar } = useSidebar();
  const { theme } = useTheme();
  const location = useLocation();
  const isAdminLogin = location.pathname === "/admin/login" || location.pathname.startsWith("/admin/login");
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isLegalRoute = [
    "/privacy",
    "/privacy-policy",
    "/terms",
    "/terms-of-service",
    "/cookies",
    "/cookie-policy",
  ].includes(location.pathname);

  // Ensure sidebar is closed when on the login screen
  useEffect(() => {
    if (isAdminLogin && isSidebarOpen) {
      closeSidebar();
    }
  }, [isAdminLogin, isSidebarOpen, closeSidebar]);

  // Globally disable the default browser right-click context menu across all pages
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // One-click demo state & cookie reset handler (Trigger with ?reset=demo or ?reset=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") === "demo" || params.get("reset") === "1" || params.has("clear-demo")) {
      try {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(";").forEach((c) => {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      } catch (err) {
        console.warn("Could not wipe client storage:", err);
      }
      window.location.replace("/");
    }
  }, []);

  return (
    <div className={`min-h-screen app-layout ${theme === 'dark' ? 'theme-dark' : 'theme-light'} ${isPinned && !isAdminLogin ? 'sidebar-pinned' : ''} ${isSidebarOpen && !isAdminLogin ? 'sidebar-open' : ''}`}>
      <Preloader />
      <FullscreenGate disabled={isAdminRoute || isLegalRoute} requireFullscreen>
        <CookieConsent />
        <Navbar />
        <main className="main-content">
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
            <Route path="/" element={<MotionPage routeKey="/"><Home /></MotionPage>} />

            <Route path="/build" element={<MotionPage routeKey="/build"><Build /></MotionPage>} />
            <Route path="/assembly" element={<Navigate to="/build" replace />} />
            <Route path="/builder" element={<Navigate to="/build" replace />} />

            <Route
              path="/compatibility"
              element={
                <MotionPage routeKey="/compatibility">
                  <Compatibility />
                </MotionPage>
              }
            />

            <Route
              path="/diagnostics"
              element={<Navigate to="/compatibility" replace />}
            />
            <Route
              path="/compare"
              element={<Navigate to="/compatibility" replace />}
            />
            <Route
              path="/compare-rigs"
              element={<Navigate to="/compatibility" replace />}
            />

            <Route
              path="/learn"
              element={
                <MotionPage routeKey="/learn">
                  <LearnModeGuard requiredStage="learn" featureName="Hardware Academy">
                    <Learn />
                  </LearnModeGuard>
                </MotionPage>
              }
            />
            <Route
              path="/learn/:componentId"
              element={
                <MotionPage routeKey="/learn">
                  <LearnModeGuard requiredStage="learn" featureName="Hardware Academy">
                    <Learn />
                  </LearnModeGuard>
                </MotionPage>
              }
            />

            <Route
              path="/certificate"
              element={
                <MotionPage routeKey="/certificate">
                  <LearnModeGuard requiredStage="learn" featureName="Official Certification">
                    <CertificationPage />
                  </LearnModeGuard>
                </MotionPage>
              }
            />

            <Route
              path="/dashboard"
              element={
                <MotionPage routeKey="/dashboard">
                  <LearnModeGuard requiredStage="learn" featureName="Student Dashboard">
                    <StudentDashboard />
                  </LearnModeGuard>
                </MotionPage>
              }
            />
            <Route path="/account" element={<Navigate to="/dashboard" replace />} />

            <Route path="/brands" element={<MotionPage routeKey="/brands"><Brands /></MotionPage>} />

            <Route
              path="/3d-builder"
              element={
                <MotionPage routeKey="/3d-builder">
                  <LearnModeGuard requiredStage="3d-builder" featureName="3D Studio">
                    <PCBuilder3D />
                  </LearnModeGuard>
                </MotionPage>
              }
            />

            <Route path="/help" element={<MotionPage routeKey="/help"><HelpSupport /></MotionPage>} />

            <Route path="/about" element={<MotionPage routeKey="/about"><AboutUs /></MotionPage>} />

            <Route path="/settings" element={<MotionPage routeKey="/settings"><SettingsPage /></MotionPage>} />

            <Route path="/privacy" element={<MotionPage routeKey="/privacy"><LegalPage docType="privacy" /></MotionPage>} />
            <Route path="/privacy-policy" element={<MotionPage routeKey="/privacy-policy"><LegalPage docType="privacy" /></MotionPage>} />
            <Route path="/terms" element={<MotionPage routeKey="/terms"><LegalPage docType="terms" /></MotionPage>} />
            <Route path="/terms-of-service" element={<MotionPage routeKey="/terms-of-service"><LegalPage docType="terms" /></MotionPage>} />
            <Route path="/cookies" element={<MotionPage routeKey="/cookies"><LegalPage docType="cookies" /></MotionPage>} />
            <Route path="/cookie-policy" element={<MotionPage routeKey="/cookie-policy"><LegalPage docType="cookies" /></MotionPage>} />

            <Route path="/admin/login" element={<MotionPage routeKey="/admin/login"><AdminLogin /></MotionPage>} />

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
                  <Navigate to="/admin/inventory?action=add" replace />
                </AdminAuthGuard>
              }
            />
            <Route
              path="/admin/edit"
              element={
                <AdminAuthGuard>
                  <Navigate to="/admin/inventory" replace />
                </AdminAuthGuard>
              }
            />
            <Route
              path="/admin/edit/:componentId"
              element={
                <AdminAuthGuard>
                  <AdminEditRedirect />
                </AdminAuthGuard>
              }
            />
            <Route
              path="/admin/delete"
              element={
                <AdminAuthGuard>
                  <Navigate to="/admin/inventory" replace />
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
            <Route
              path="/admin/logs"
              element={
                <AdminAuthGuard>
                  <MotionPage routeKey="/admin/logs">
                    <AdminLogs />
                  </MotionPage>
                </AdminAuthGuard>
              }
            />
            <Route
              path="/admin/accounts"
              element={
                <AdminAuthGuard>
                  <MotionPage routeKey="/admin/accounts">
                    <AdminAccounts />
                  </MotionPage>
                </AdminAuthGuard>
              }
            />
            <Route
              path="/admin/content"
              element={
                <AdminAuthGuard>
                  <MotionPage routeKey="/admin/content">
                    <AdminContent />
                  </MotionPage>
                </AdminAuthGuard>
              }
            />

          </Routes>
        </AnimatePresence>
        {location.pathname !== "/" &&
          location.pathname !== "/build" &&
          location.pathname !== "/compatibility" &&
          location.pathname !== "/3d-builder" &&
          location.pathname !== "/certificate" &&
          !location.pathname.startsWith("/admin") &&
          !location.pathname.startsWith("/learn") && <Footer />}
        </main>
      </FullscreenGate>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <LearnModeProvider>
            <BuildProvider>
              <SidebarProvider>
                <Router>
                  <ScrollToTop />
                  <AppContent />
                </Router>
              </SidebarProvider>
            </BuildProvider>
          </LearnModeProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
