import React, { useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Styles
import './assets/styles/global.css';
import './assets/styles/layout.css';
import './assets/styles/components.css';
import './assets/styles/animations.css';

const LayoutContent = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isLandingPage = location.pathname === '/' || location.pathname === '/landing';

  if (isAuthPage || isLandingPage) {
    return <AppRoutes />;
  }

  return (
    <div className="app-container">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="main-wrapper">
        <Navbar toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="content-area">
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <LayoutContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
