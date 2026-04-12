import React, { useState, useEffect } from 'react';
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
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousScale, setPreviousScale] = useState(currentScale);

  useEffect(() => {
    if (currentScale !== previousScale) {
      setIsAnimating(true);
      setPreviousScale(currentScale);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [currentScale, previousScale]);
  
  const scales: { value: GpaScale; label: string; }[] = [
    { value: "10", label: "Thang 10" },
    { value: "4", label: "Thang 4"},
    { value: "100", label: "Thang 100" }
  ];

  return (
    <div 
      className={`gpa-scale-selector ${className} ${isAnimating ? 'animating' : ''}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        ...style,
        position: "relative"
      }}
    >
      <span 
        style={{
          fontSize: "12px",
          fontWeight: "500",
          color: "inherit",
          marginRight: "8px"
        }}
      >
        Thang điểm:
      </span>
      <div 
        style={{
          display: "flex",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          borderRadius: "10px",
          padding: "4px",
          gap: "3px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)"
        }}
      >
        {scales.map((scale) => (
          <button
            key={scale.value}
            type="button"
            onClick={() => onScaleChange(scale.value)}
            style={{
              padding: "4px 12px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: currentScale === scale.value 
                ? "rgba(99, 102, 241, 0.8)" 
                : "transparent",
              color: currentScale === scale.value ? "white" : "inherit",
              fontSize: "13px",
              fontWeight: currentScale === scale.value ? "500" : "400",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "70px",
              minHeight: "30px",
              position: "relative",
              overflow: "hidden",
              transform: currentScale === scale.value && isAnimating ? "scale(1.05)" : "scale(1)",
              boxShadow: currentScale === scale.value 
                ? "0 4px 12px rgba(99, 102, 241, 0.3)" 
                : "none"
            }}
            onMouseOver={(e) => {
              if (currentScale !== scale.value) {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
              }
            }}
            onMouseOut={(e) => {
              if (currentScale !== scale.value) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "translateY(0) scale(1)";
              }
            }}
          >
            <span>{scale.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GpaScaleSelector;