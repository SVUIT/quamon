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
  useEffect(() => { setMounted(true); }, []);

  const logoSrc = theme === "light" ? "/logo_light.svg" : "/logo_dark.svg";

  if (!mounted) return null;

  return (
    <nav
      className="navbar"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 5%',
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: theme === 'light' ? '#ffffff' : '#27262B', 
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid rgba(128, 128, 128, 0.1)',
      }}
    >
      {/* LOGO */}
      <div
        className="navbar-logo"
        style={{ display: 'flex', alignItems: 'center', flex: 1 }}
      >
        <img
          src={logoSrc}
          alt="Quamon Logo"
          style={{ height: 36, marginRight: 10, display: 'block' }}
        />
        <span
          className="navbar-logo-text"
          style={{
            fontWeight: 800,
            fontSize: '20px',
            color: 'var(--text-color)',
            lineHeight: 1,
            whiteSpace: 'nowrap'
          }}
        >
          Quamon
        </span>
      </div>

       {/* TABS */}
      <div className="tab-navigation" style={{ marginBottom: 0, display: 'flex', gap: '8px', flex: 0 }}>
        <button
          className={`tab-button ${activeTab === 'grades' ? 'active' : ''}`}
          onClick={() => setActiveTab('grades')}
          style={{ whiteSpace: 'nowrap' }}
        >
          Bảng điểm
        </button>
        <button
          className={`tab-button ${activeTab === 'instructions' ? 'active' : ''}`}
          onClick={() => setActiveTab('instructions')}
          style={{ whiteSpace: 'nowrap' }}
        >
          Hướng dẫn
        </button>
        <button 
          className={`tab-button ${activeTab === 'add_subject' ? 'active' : ''}`}
          onClick={() => setActiveTab('add_subject')}
          style={{ whiteSpace: 'nowrap' }}
        >
          Thêm môn
        </button>
      </div>

      {/* THEME TOGGLE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>
        <GitHubStats />
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
    </nav>
  );
};

export default Navbar;