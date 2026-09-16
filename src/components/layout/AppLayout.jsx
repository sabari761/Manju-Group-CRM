import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 992;
    }
    return true;
  });

  const [desktopCollapsed, setDesktopCollapsed] = useState(() => {
    try {
      return localStorage.getItem('crm_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Track viewport width
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 992;
      setIsDesktop(desktop);
      if (desktop) {
        setMobileOpen(false); // Close mobile drawer when resizing to desktop
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (window.innerWidth < 992) {
      setMobileOpen((prev) => !prev);
    } else {
      setDesktopCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('crm_sidebar_collapsed', String(next));
        } catch {}
        return next;
      });
    }
  }, []);

  const toggleDesktop = useCallback(() => {
    setDesktopCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('crm_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  }, []);

  const isCollapsed = isDesktop && desktopCollapsed;

  return (
    <div className={`app-wrapper ${isCollapsed ? 'layout-collapsed' : ''}`}>
      <Sidebar
        open={mobileOpen}
        collapsed={isCollapsed}
        onClose={() => setMobileOpen(false)}
        onToggleDesktop={toggleDesktop}
      />

      <div className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          onToggleSidebar={toggleSidebar}
          desktopCollapsed={isCollapsed}
        />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
