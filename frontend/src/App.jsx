import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { BuildProvider } from "./contexts/BuildContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./components/Home/Home";
import Build from "./components/Build/Build";
import Compatibility from "./components/Compatibility/Compatibility";
import Learn from "./components/Learn/Learn";
import Brands from "./components/Brands/Brands";
import PCBuilder3D from "./components/3D/PCBuilder3D";
import Admin from "./components/Admin/Admin";
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
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const { theme } = useTheme();
  const location = useLocation();

  return (
    <div className={`min-h-screen app-layout ${theme === 'dark' ? 'theme-dark' : 'theme-light'} ${isSidebarPinned ? 'sidebar-pinned' : ''}`}>
      <Navbar isPinned={isSidebarPinned} setIsPinned={setIsSidebarPinned} />
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

                  {/* Admin Dashboard */}
                  <Route path="/admin" element={<MotionPage routeKey="/admin"><Admin /></MotionPage>} />

                </Routes>
              </AnimatePresence>
              {/* Footer suppressed on immersive fullscreen workstations */}
              {location.pathname !== "/" &&
                location.pathname !== "/build" &&
                location.pathname !== "/compatibility" &&
                location.pathname !== "/3d-builder" &&
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
          <Router>
            <ScrollToTop />
            <AppContent />
          </Router>
        </BuildProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
