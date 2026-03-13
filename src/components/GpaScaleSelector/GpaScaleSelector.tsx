import React from "react";
import type { GpaScale } from "../../types";

interface GpaScaleSelectorProps {
  currentScale: GpaScale;
  onScaleChange: (scale: GpaScale) => void;
  className?: string;
  style?: React.CSSProperties;
}

const GpaScaleSelector: React.FC<GpaScaleSelectorProps> = ({
  currentScale,
  onScaleChange,
  className = "",
  style = {}
}) => {
  const scales: { value: GpaScale; label: string; description: string }[] = [
    { value: "10", label: "Thang 10", description: "0-10 điểm" },
    { value: "4", label: "Thang 4", description: "0-4 điểm" },
    { value: "100", label: "Thang 100", description: "0-100 điểm" }
  ];

  return (
    <div 
      className={`gpa-scale-selector ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        ...style
      }}
    >
      <span 
        style={{
          fontSize: "14px",
          fontWeight: "500",
          color: "inherit"
        }}
      >
        Thang điểm:
      </span>
      <div 
        style={{
          display: "flex",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: "8px",
          padding: "2px",
          gap: "2px"
        }}
      >
        {scales.map((scale) => (
          <button
            key={scale.value}
            type="button"
            onClick={() => onScaleChange(scale.value)}
            style={{
              padding: "6px 12px",
              border: "none",
              borderRadius: "6px",
              backgroundColor: currentScale === scale.value 
                ? "rgba(99, 102, 241, 0.8)" 
                : "transparent",
              color: currentScale === scale.value ? "white" : "inherit",
              fontSize: "13px",
              fontWeight: currentScale === scale.value ? "500" : "400",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
              minWidth: "60px"
            }}
            onMouseOver={(e) => {
              if (currentScale !== scale.value) {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              }
            }}
            onMouseOut={(e) => {
              if (currentScale !== scale.value) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
            title={scale.description}
          >
            <span>{scale.label}</span>
            <span style={{
              fontSize: "10px",
              opacity: 0.8
            }}>
              {scale.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GpaScaleSelector;
