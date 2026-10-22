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
import Admin from "./components/Admin/Admin";

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

                {/* Admin Dashboard */}
                <Route path="/admin" element={<Admin />} />

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
