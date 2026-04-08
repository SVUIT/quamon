import React from "react";
import { GraduationResultData } from "./types";

interface GraduationResultProps {
  result: GraduationResultData;
}

export const GraduationResult: React.FC<GraduationResultProps> = ({ result }) => {
  if (!result) return null;

  return (
    <div
      className={`form-section-card mt-7.5 border-2 ${result.eligible ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
        }`}
    >
      <h2 className={`mt-0 ${result.eligible ? "text-green-600" : "text-red-600"}`}>
        {result.eligible ? "🎉 ĐỦ ĐIỀU KIỆN TỐT NGHIỆP" : "⚠️ CHƯA ĐỦ ĐIỀU KIỆN"}
      </h2>

      <div className="mt-4 flex flex-col gap-3 text-sm">
        <div>
          <strong className={result.englishPassed ? "text-green-600" : "text-red-500"}>
            Ngoại ngữ:
          </strong>
          <span className="ml-2 text-(--text-color)">{result.englishMsg}</span>
        </div>

        {result.generalIssues.length > 0 && (
          <div>
            <strong className="text-red-500">Yêu cầu chung:</strong>
            <ul className="list-disc ml-5 text-red-500">
              {result.generalIssues.map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <strong
            className={result.missingCredits.length === 0 ? "text-green-600" : "text-red-500"}
          >
            Tín chỉ môn học:
          </strong>
          {result.missingCredits.length > 0 ? (
            <ul className="list-disc ml-5 text-red-500">
              {result.missingCredits.map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          ) : (
            <span className="ml-2 text-green-600 font-bold">
              Đã đủ điều kiện ({result.totalCredits}/130 TC)
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-dashed border-gray-300">
        <div className="text-xs text-gray-500 italic mb-3 space-y-1.5">
          <p>
            * Kết quả kiểm tra dựa trên quy chế đào tạo và chuẩn đầu ra ngành
            <strong> Mạng máy tính và Truyền thông dữ liệu 2025</strong> UIT.
          </p>
          <p>
            * Kết quả này giả định bạn đã thỏa mãn 3 điều kiện là:
            <br />
            - Đã hoàn thành nghĩa vụ học phí.
            <br />
            - Đạt điểm rèn luyện tích lũy tối thiểu là 50 điểm.
            <br />
            - Đã hoàn trả sách mượn cho Thư viện.
          </p>
          <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 text-yellow-800 not-italic mt-2">
            <strong className="block mb-1">💡 Lưu ý:</strong>
            Trường hợp sinh viên hoàn thành chương trình đào tạo sớm tiến độ vào HK1 và sẽ xét tốt nghiệp trong HK2, sinh viên vẫn sẽ cần phải đóng học phí của HK2 để được đăng ký xét tốt nghiệp và khoản tiền học phí này sẽ được hoàn trả.
            <span className="text-yellow-600 text-[11px] block mt-1.5">
              - Nguồn tham khảo: sinh viên K17 khoa Mạng.
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <a
            href="https://student.uit.edu.vn/content/cu-nhan-nganh-mang-may-tinh-va-truyen-thong-du-lieu-ap-dung-tu-khoa-19-2024"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-blue-600 hover:underline font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            Chương trình đào tạo
          </a>
          <a
            href="https://student.uit.edu.vn/content/huong-dan-sinh-vien-dai-hoc-he-chinh-quy-thuc-hien-cac-quy-dinh-ve-chuan-qua-trinh-va-chuan"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-blue-600 hover:underline font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            Quy định chuẩn Ngoại ngữ
          </a>
          <a
            href="https://student.uit.edu.vn/sites/daa/files/202309/790-qd-dhcntt_28-9-22_quy_che_dao_tao.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-blue-600 hover:underline font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            Quy chế đào tạo
          </a>
        </div>
      </div>
    </div>
  );
};
