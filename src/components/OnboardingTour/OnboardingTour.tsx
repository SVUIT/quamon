import React, { useState, useEffect, useRef } from "react";

interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for the element to highlight
  position?: "top" | "bottom" | "left" | "right" | "center";
  elementId?: string; // Specific element ID to target
  scrollTo?: boolean; // Whether to scroll element into view
  scrollToHandler?: (element: HTMLElement) => void; // Custom scroll handler
  beforeShowPromise?: () => Promise<any>; // Promise that resolves before step shows
  beforeNextPromise?: () => Promise<any>; // Promise that resolves before next step
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Chào mừng đến với Quamon",
    content: "Quamon giúp bạn tính điểm trung bình, lập kế hoạch học tập và theo dõi tiến độ tốt nghiệp. Hãy cùng khám phá các tính năng chính!",
    position: "center",
  },
  {
    id: "grades",
    title: "Bảng điểm chính",
    content: "Đây là nơi bạn nhập và quản lý điểm số. Bạn có thể nhập điểm thủ công, nhập từ file PDF/Excel của trường, hoặc tính điểm cần đạt để đạt mục tiêu.",
    elementId: "tour-grades-header",
    position: "bottom",
  },
  {
    id: "import",
    title: "Nhập điểm nhanh chóng",
    content: "Nhấn vào nút 'Nhập từ PDF' hoặc 'Nhập từ Excel' để tự động nhập điểm từ file của trường UIT. Hệ thống sẽ trích xuất dữ liệu và điền vào bảng.",
    elementId: "tour-pdf-import",
    position: "bottom",
  },
  {
    id: "export",
    title: "Xuất dữ liệu",
    content: "Xuất bảng điểm ra file Excel để lưu trữ hoặc chia sẻ. File sẽ chứa đầy đủ thông tin môn học, điểm số và trọng số.",
    elementId: "tour-export",
    position: "bottom",
  },
  {
    id: "score-colors",
    title: "Hiểu về màu sắc điểm",
    content: "Màu trắng/đen: Điểm bạn nhập thủ công (điểm thật). Màu vàng/xanh dương: Điểm hệ thống gợi ý từ điểm kỳ vọng (chỉ tham khảo).",
    target: ".grade-cell",
    position: "right",
  },
  {
    id: "expected-score",
    title: "Điểm kỳ vọng",
    content: "Nhập điểm kỳ vọng để hệ thống tính toán điểm cần đạt ở các cột còn trống. Giúp bạn lập kế hoạch học tập hiệu quả!",
    target: ".expected-score-input",
    position: "left",
  },
  {
    id: "add-subject",
    title: "Thêm môn học",
    content: "Chuyển sang tab 'Thêm môn' để tìm và thêm môn học từ cơ sở dữ liệu UIT. Hệ thống sẽ tự động điền tín chỉ và trọng số.",
    target: '[onclick*="add_subject"]',
    position: "bottom",
  },
  {
    id: "graduation-check",
    title: "Kiểm tra tốt nghiệp",
    content: "Kiểm tra tiến độ tốt nghiệp của bạn theo chương trình đào tạo UIT. Xem các môn đã hoàn thành và còn thiếu.",
    target: '[onclick*="graduation_check"]',
    position: "bottom",
  },
  {
    id: "complete",
    title: "Sẵn sàng bắt đầu",
    content: "Bạn đã biết các tính năng chính của Quamon. Bắt đầu nhập điểm và theo dõi tiến độ học tập ngay bây giờ!",
    position: "center",
  },
];

const OnboardingTour: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  // Check if user has completed the tour
  useEffect(() => {
    const hasCompletedTour = localStorage.getItem("quamon_tour_completed");
    if (!hasCompletedTour) {
      setIsActive(true);
    }
  }, []);

  // Highlight target element
  useEffect(() => {
    if (!isActive) return;

    const step = tourSteps[currentStep];
    let element: HTMLElement | null = null;

    // Remove previous highlight
    if (highlightedElement) {
      highlightedElement.style.boxShadow = "";
      highlightedElement.style.zIndex = "";
      highlightedElement.style.position = "";
    }

    // Find target element using elementId or CSS selector
    if (step.elementId) {
      element = document.getElementById(step.elementId);
    } else if (step.target) {
      const targets = document.querySelectorAll(step.target);
      if (targets.length > 0) {
        element = targets[0] as HTMLElement;
      }
    }

    if (element) {
      setHighlightedElement(element);
      
      // Apply highlight styles
      element.style.boxShadow = "0 0 0 4px rgba(99, 102, 241, 0.5), 0 0 20px rgba(99, 102, 241, 0.3)";
      element.style.zIndex = "9999";
      element.style.position = "relative";
      
      // Scroll element into view (Siemens Element pattern)
      if (step.scrollTo !== false) {
        if (step.scrollToHandler) {
          step.scrollToHandler(element);
        } else {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }

    return () => {
      if (highlightedElement) {
        highlightedElement.style.boxShadow = "";
        highlightedElement.style.zIndex = "";
        highlightedElement.style.position = "";
      }
    };
  }, [currentStep, isActive]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    localStorage.setItem("quamon_tour_completed", "true");
    setCurrentStep(0);
    
    // Remove highlight
    if (highlightedElement) {
      highlightedElement.style.boxShadow = "";
      highlightedElement.style.zIndex = "";
      highlightedElement.style.position = "";
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleRestart = () => {
    localStorage.removeItem("quamon_tour_completed");
    setCurrentStep(0);
    setIsActive(true);
  };

  if (!isActive) {
    return (
      <div className="onboarding-tour-inactive" style={{ padding: "40px", textAlign: "center" }}>
        <h1 style={{ marginBottom: "20px", color: "#1f2937" }}>Hướng dẫn sử dụng</h1>
        <p style={{ marginBottom: "30px", color: "#4b5563", opacity: 0.7 }}>
          Bạn đã hoàn thành tour hướng dẫn. Bạn có thể làm lại tour bất cứ lúc nào.
        </p>
        <button
          onClick={handleRestart}
          style={{
            padding: "12px 24px",
            background: "linear-gradient(145deg, #6366f1, #8b5cf6)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(99, 102, 241, 0.35)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          🔄 Làm lại Tour
        </button>
      </div>
    );
  }

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 9998,
          pointerEvents: "none",
        }}
      />

      {/* Tour Card */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "var(--card-bg, #ffffff)",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "500px",
          width: "90%",
          zIndex: 10000,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          animation: "fadeIn 0.3s ease",
        }}
      >
        {/* Progress Bar */}
        <div
          style={{
            width: "100%",
            height: "4px",
            backgroundColor: "rgba(99, 102, 241, 0.2)",
            borderRadius: "2px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
              borderRadius: "2px",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Step Number */}
        <div
          style={{
            display: "inline-block",
            padding: "4px 12px",
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            color: "#6366f1",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "16px",
          }}
        >
          Bước {currentStep + 1} / {tourSteps.length}
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "16px",
            color: "#1f2937",
          }}
        >
          {step.title}
        </h2>

        {/* Content */}
        <p
          style={{
            fontSize: "16px",
            lineHeight: "1.6",
            color: "#4b5563",
            marginBottom: "32px",
          }}
        >
          {step.content}
        </p>

        {/* Navigation Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={handleSkip}
            style={{
              padding: "10px 20px",
              background: "transparent",
              color: "#9ca3af",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "color 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#6b7280";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "#9ca3af";
            }}
          >
            Bỏ qua
          </button>

          {currentStep > 0 && (
            <button
              onClick={handlePrevious}
              style={{
                padding: "10px 20px",
                background: "rgba(99, 102, 241, 0.1)",
                color: "#6366f1",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(99, 102, 241, 0.2)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)";
              }}
            >
              ← Quay lại
            </button>
          )}

          <button
            onClick={handleNext}
            style={{
              padding: "10px 24px",
              background: "linear-gradient(145deg, #6366f1, #8b5cf6)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {currentStep === tourSteps.length - 1 ? "Hoàn thành" : "Tiếp tục"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
};

export default OnboardingTour;
