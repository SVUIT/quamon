import React, { useEffect, useState } from 'react';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import type { TabType } from '../../pages/Home';
import GitHubStats from './GitHubStats';

interface NavbarProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  theme,
  toggleTheme,
  activeTab,
  setActiveTab,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 850); 
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const logoSrc = theme === "light" ? "/logo_light.svg" : "/logo_dark.svg";

  if (!mounted) return null;

  const ActionGroup = (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: isMobile ? '6px' : '15px',
      transform: isMobile ? 'scale(0.75)' : 'none',
      transformOrigin: isMobile ? 'right center' : 'center'
    }}>
      <GitHubStats />
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
    </div>
  );

  const NavigationTabs = (
    <div style={{ 
      display: 'flex', 
      gap: isMobile ? '4px' : '12px',
      transform: isMobile && window.innerWidth < 400 ? 'scale(0.9)' : 'none',
      transformOrigin: 'center'
    }}>
      <button
        className={`tab-button ${activeTab === 'grades' ? 'active' : ''}`}
        onClick={() => setActiveTab('grades')}
        style={{ 
          whiteSpace: 'nowrap', 
          padding: isMobile ? '6px 8px' : '10px 20px', 
          fontSize: isMobile ? '12px' : '15px',
          fontWeight: 600
        }}
      >
        Bảng điểm
      </button>
      <button
        className={`tab-button ${activeTab === 'instructions' ? 'active' : ''}`}
        onClick={() => setActiveTab('instructions')}
        style={{ 
          whiteSpace: 'nowrap', 
          padding: isMobile ? '6px 8px' : '10px 20px', 
          fontSize: isMobile ? '12px' : '15px',
          fontWeight: 600
        }}
      >
        Hướng dẫn
      </button>
      <button 
        className={`tab-button ${activeTab === 'add_subject' ? 'active' : ''}`}
        onClick={() => setActiveTab('add_subject')}
        style={{ 
          whiteSpace: 'nowrap', 
          padding: isMobile ? '6px 8px' : '10px 20px', 
          fontSize: isMobile ? '12px' : '15px',
          fontWeight: 600
        }}
      >
        Thêm môn
      </button>
    </div>
  );

  return (
    <nav
      className="navbar"
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row', 
        alignItems: 'center',
        padding: isMobile ? '12px 3%' : '16px 5%',
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: theme === 'light' ? '#ffffff' : '#27262B', 
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid rgba(128, 128, 128, 0.1)',
        gap: isMobile ? '12px' : '0',
      }}
    >
      {isMobile ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={logoSrc} alt="Quamon Logo" style={{ width: 32, height: 32, marginRight: 8 }} />
              <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-color)' }}>Quamon</span>
            </div>
            {ActionGroup}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            {NavigationTabs}
          </div>
        </>
      ) : (
        <>
          {/* Left: Logo */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <img src={logoSrc} alt="Quamon Logo" style={{ width: 42, height: 42, marginRight: 12 }} />
            <span style={{ fontWeight: 800, fontSize: '24px', color: 'var(--text-color)' }}>Quamon</span>
          </div>

          {/* Middle: 3 Buttons */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {NavigationTabs}
          </div>

          {/* Right: GitHub + Toggle */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            {ActionGroup}
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;