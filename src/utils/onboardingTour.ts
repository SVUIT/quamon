import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const ONBOARDING_STORAGE_KEY = "quamon_onboarding_completed_v1";

export const startOnboardingTour = () => {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayColor: "rgba(0, 0, 0, 0.75)",
    nextBtnText: "Tiếp theo →",
    prevBtnText: "← Quay lại",
    doneBtnText: "Hoàn tất ✓",
    progressText: "Bước {{current}} / {{total}}",
    onDestroyed: () => {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    },
    steps: [
      {
        popover: {
          title: "Chào mừng bạn đến với Quamon!",
          description:
            "Công cụ hỗ trợ tính điểm trung bình (GPA), lập kế hoạch <b>Điểm kỳ vọng</b> và theo dõi tiến độ tốt nghiệp dành cho sinh viên UIT. Hãy điểm qua các tính năng chính nhé!",
        },
      },
      {
        element: "#tour-import-section",
        popover: {
          title: "1. Nhập bảng điểm tự động",
          description:
            "Thay vì nhập tay từng môn, bạn có thể chọn định dạng <b>PDF</b> hoặc <b>Excel</b> để hệ thống tự động điền mã môn, tín chỉ, điểm và trọng số.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-export-btn",
        popover: {
          title: "2. Xuất dữ liệu ra Excel",
          description:
            "Mọi thay đổi đều được tự động lưu trên trình duyệt. Khi cần lưu trữ về máy, hãy nhấn <b>Xuất Excel</b> để tải về toàn bộ bảng điểm, trọng số và điểm kỳ vọng.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-grade-table",
        popover: {
          title: "3. Tùy chỉnh trọng số môn học",
          description:
            "Để thay đổi phần trăm điểm (QT, GK, TH, CK), bạn hãy nhấn vào <b>biểu tượng ⋮</b> ở cuối mỗi dòng môn học hoặc góc học kỳ. Tại đây bạn có thể <b>chỉnh sửa trọng số</b>, xóa môn hoặc khôi phục về mặc định.",
          side: "top",
          align: "center",
        },
      },
      {
        element: "#tour-grade-table",
        popover: {
          title: "4. Cách nhập điểm kỳ vọng",
          description:
            "Hãy <b>click trực tiếp vào ô Điểm kỳ vọng</b> của từng môn học, hoặc ô <b>TBHK kỳ vọng</b> ở dưới cùng để nhập mục tiêu của bạn. Hệ thống sẽ tự động tính toán và phân bổ điểm số cần đạt cho các cột còn trống.",
          side: "top",
          align: "center",
        },
      },
      {
        element: "#tour-grade-table",
        popover: {
          title: "5. Phân biệt màu sắc điểm số",
          description:
            "• <b>Trắng / Đen:</b> Điểm thực tế do bạn tự nhập.<br/>" +
            "• <b>Vàng / Xanh dương:</b> Điểm do hệ thống tự gợi ý để đạt Điểm kỳ vọng (hãy click vào nhập lại để biến nó thành điểm thật).<br/>" +
            "• <b>Màu đỏ:</b> Cảnh báo mục tiêu điểm cần đạt > 10.0.",
          side: "top",
          align: "center",
        },
      },
      {
        element: "#tour-nav-tabs",
        popover: {
          title: "6. Thêm môn học và Subject Catalog",
          description:
            "Sau khi xem xong bảng điểm, bạn hãy nhấn sang tab <b>Thêm môn</b>. Tại đây, bạn có thể kiểm tra danh mục <b>Subject Catalog</b> để xác minh thông tin, tra cứu và thêm các môn học mới vào bảng điểm của mình.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "#tour-guide-btn",
        popover: {
          title: "7. Xem lại hướng dẫn",
          description:
            "Bất cứ khi nào bạn muốn xem lại các bước hướng dẫn này, chỉ cần nhấn vào <b>nút dấu hỏi (?)</b> ở góc phải trên cùng nhé!",
          side: "bottom",
          align: "end",
        },
      },
    ],
  });

  driverObj.drive();
};