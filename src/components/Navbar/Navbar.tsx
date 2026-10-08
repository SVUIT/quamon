import React, { useEffect, useState } from "react";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import type { TabType } from "../../pages/Home";
import GitHubStats from "./GitHubStats";

interface NavbarProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onStartTour: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  theme,
  toggleTheme,
  activeTab,
  setActiveTab,
  onStartTour,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 850);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const logoSrc = theme === "light" ? "/logolight.png" : "/logodark.png";

  if (!mounted) return null;

  const ActionGroup = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? "6px" : "12px",
        transform: isMobile ? "scale(0.75)" : "none",
        transformOrigin: isMobile ? "right center" : "center",
      }}
    >
      {/* Button to reopen Onboarding Tour */}
      <button
        id="tour-guide-btn"
        onClick={onStartTour}
        title="Hướng dẫn sử dụng"
        aria-label="Hướng dẫn sử dụng"
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border:
            theme === "light"
              ? "1px solid rgba(99, 102, 241, 0.3)"
              : "1px solid rgba(255, 255, 255, 0.18)",
          background:
            theme === "light"
              ? "rgba(99, 102, 241, 0.08)"
              : "rgba(255, 255, 255, 0.08)",
          color: theme === "light" ? "#6366f1" : "#e5e7eb",
          fontWeight: 700,
          fontSize: "16px",
          transition: "all 0.25s ease",
          padding: 0,
          flexShrink: 0,
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(145deg, #6366f1, #8b5cf6)";
          e.currentTarget.style.color = "#ffffff";
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow =
            "0 4px 12px rgba(99, 102, 241, 0.35)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background =
            theme === "light"
              ? "rgba(99, 102, 241, 0.08)"
              : "rgba(255, 255, 255, 0.08)";
          e.currentTarget.style.color =
            theme === "light" ? "#6366f1" : "#e5e7eb";
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        ?
      </button>

      <GitHubStats />
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
    </div>
  );

  const NavigationTabs = (
    <div
      id="tour-nav-tabs"
      style={{
        display: "flex",
        gap: isMobile ? "4px" : "12px",
        transform: isMobile && window.innerWidth < 400 ? "scale(0.9)" : "none",
        transformOrigin: "center",
      }}
    >
      <button
        className={`tab-button ${activeTab === "grades" ? "active" : ""}`}
        onClick={() => setActiveTab("grades")}
        style={{
          whiteSpace: "nowrap",
          padding: isMobile ? "6px 8px" : "10px 20px",
          fontSize: isMobile ? "12px" : "15px",
          fontWeight: 600,
        }}
      >
        Bảng điểm
      </button>
      <button
        className={`tab-button ${activeTab === "add_subject" ? "active" : ""}`}
        onClick={() => setActiveTab("add_subject")}
        style={{
          whiteSpace: "nowrap",
          padding: isMobile ? "6px 8px" : "10px 20px",
          fontSize: isMobile ? "12px" : "15px",
          fontWeight: 600,
        }}
      >
        Thêm môn
      </button>
      <button
        className={`tab-button ${activeTab === "graduation_check" ? "active" : ""}`}
        onClick={() => setActiveTab("graduation_check")}
        style={{
          whiteSpace: "nowrap",
          padding: isMobile ? "6px 8px" : "10px 20px",
          fontSize: isMobile ? "12px" : "15px",
          fontWeight: 600,
        }}
      >
        Kiểm tra tốt nghiệp
      </button>
      <button
        className={`tab-button ${activeTab === "subject_catalog" ? "active" : ""}`}
        onClick={() => setActiveTab("subject_catalog")}
        style={{
          whiteSpace: "nowrap",
          padding: isMobile ? "6px 8px" : "10px 20px",
          fontSize: isMobile ? "12px" : "15px",
          fontWeight: 600,
        }}
      >
        Danh mục môn học
      </button>
    </div>
  );

  return (
    <nav
      className="navbar"
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "center",
        padding: isMobile ? "12px 3%" : "16px 5%",
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: theme === "light" ? "#ffffff" : "#27262B",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderBottom: "1px solid rgba(128, 128, 128, 0.1)",
        gap: isMobile ? "12px" : "0",
      }}
    >
      {isMobile ? (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={logoSrc}
                alt="Quamon Logo"
                style={{ height: 32, marginRight: 8 }}
              />
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "18px",
                  color: "var(--text-color)",
                }}
              >
                Quamon
              </span>
            </div>
            {ActionGroup}
          </div>
          <div
            style={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            {NavigationTabs}
          </div>
        </>
      ) : (
        <>
          {/* Left: Logo */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <img
              src={logoSrc}
              alt="Quamon Logo"
              style={{ width: 42, height: 42, marginRight: 12 }}
            />
            <span
              style={{
                fontWeight: 800,
                fontSize: "24px",
                color: "var(--text-color)",
              }}
            >
              Quamon
            </span>
          </div>

          {/* Middle: 3 Buttons */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {NavigationTabs}
          </div>

          {/* Right: Help + GitHub + Toggle */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            {ActionGroup}
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;