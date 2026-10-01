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
          title: "1. Nhập bảng điểm tự động (PDF / Excel)",
          description:
            "Thay vì nhập tay từng môn, bạn có thể chọn định dạng <b>PDF</b> (tải từ trang <i>student.uit.edu.vn/sinhvien/kqhoctap → In Bảng Điểm → Ctrl+P lưu PDF</i>) hoặc <b>Excel</b> để hệ thống tự động điền mã môn, tín chỉ, điểm và trọng số.",
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
          title: "3. Bảng điểm và tìm kiếm môn học",
          description:
            "• <b>Tìm kiếm nhanh:</b> Click vào ô <i>Mã HP</i> hoặc <i>Tên HP</i> để chọn môn học chuẩn UIT.<br/>" +
            "• <b>Công thức:</b> <code>Điểm HP = (QT×wQT) + (GK×wGK) + (TH×wTH) + (CK×wCK)</code>.<br/>" +
            "• <b>Tùy chỉnh:</b> Nhấn biểu tượng <b>⋮</b> ở cuối dòng/học kỳ để chỉnh trọng số, xóa môn hoặc khôi phục mặc định.",
          side: "top",
          align: "center",
        },
      },
      {
        element: "#tour-grade-table",
        popover: {
          title: "4. Phân biệt màu sắc điểm số",
          description:
            "• <b>Trắng / Đen:</b> Điểm thực tế bạn nhập thủ công (được dùng để tính GPA).<br/>" +
            "• <b>Vàng / Xanh dương:</b> Điểm do hệ thống gợi ý từ <i>Điểm kỳ vọng</i> (chỉ mang tính tham khảo, click vào nhập lại để xác nhận thành điểm thật).<br/>" +
            "• <b>Màu xám:</b> Cột có trọng số = 0% (bị vô hiệu hóa).<br/>" +
            "• <b>Màu đỏ:</b> Cảnh báo điểm cần đạt > 10.0 (mục tiêu quá khó/không khả thi).",
          side: "top",
          align: "center",
        },
      },
      {
        element: "#tour-grade-table",
        popover: {
          title: "5. Điểm kỳ vọng và tự động phân bổ",
          description:
            "Khi bạn nhập <b>Điểm kỳ vọng</b> cho môn học, <b>TBHK kỳ vọng</b> hoặc <b>ĐTB chung toàn khóa</b>, hệ thống sẽ tự động tính điểm tối thiểu cần đạt ở các cột/học kỳ còn trống theo công thức:<br/>" +
            "<code>(Điểm kỳ vọng − Điểm đã có) / Trọng số còn lại</code><br/>" +
            "<i>Lưu ý: Các môn đã được bạn nhập kỳ vọng thủ công sẽ luôn được ưu tiên giữ nguyên!</i>",
          side: "top",
          align: "center",
        },
      },
      {
        element: "#tour-nav-tabs",
        popover: {
          title: "6. Các công cụ mở rộng",
          description:
            "Sử dụng thanh điều hướng để chuyển sang mục <b>Thêm môn</b> thủ công hoặc <b>Kiểm tra tốt nghiệp</b>.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "#tour-guide-btn",
        popover: {
          title: "7. Xem lại hướng dẫn bất cứ lúc nào",
          description:
            "Bất cứ khi nào bạn muốn xem lại các bước hướng dẫn này, chỉ cần nhấn vào nút dấu hỏi <b>?</b> ở góc phải trên cùng nhé!",
          side: "bottom",
          align: "end",
        },
      },
    ],
  });

  driverObj.drive();
};