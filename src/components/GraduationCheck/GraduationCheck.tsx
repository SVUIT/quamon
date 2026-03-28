import { SUBJECTS_DATA } from "@/constants";
import { useState, useMemo } from "react";

interface Subject {
  courseCode: string;
  credits: string | number;
}
interface Semester {
  subjects: Subject[];
}

const courseToCategoryMap: Record<string, string> = {};
Object.entries(SUBJECTS_DATA).forEach(([categoryName, courses]) => {
  (courses as any[]).forEach((c: { courseCode: string }) => {
    courseToCategoryMap[c.courseCode] = categoryName;
  });
});

export const GraduationCheck = ({ semesters }: { semesters: Semester[] }) => {
  const creditSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    semesters?.forEach((sem) => {
      sem.subjects.forEach((subj) => {
        const category =
          courseToCategoryMap[subj.courseCode] || "Khác (Tự chọn/CĐTN/TN)";
        const creditValue = Number(subj.credits) || 0;
        summary[category] = (summary[category] || 0) + creditValue;
      });
    });
    return summary;
  }, [semesters]);

  const {
    "Đại cương": autoDC = 0,
    "Cơ sở ngành (CSN)": autoCSN = 0,
    "Chuyên ngành (CN/CNTC)": autoCN = 0,
    "Khác (Tự chọn/CĐTN/TN)": autoKHAC = 0,
  } = creditSummary;

  const [form, setForm] = useState({
    creditsDC: "",
    creditsCSN: "",
    creditsCN: "",
    creditsKHAC: "",

    englishType: "IELTS",
    englishScore: "",
    toeicLR: "",
    toeicSW: "",

    completedPhysicalEducation: false,
    completedMilitaryTraining: false,
  });

  const [result, setResult] = useState<{
    eligible: boolean;
    missingCredits: string[];
    englishPassed: boolean;
    englishMsg: string;
    generalIssues: string[];
    totalCredits: number;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const checkEligibility = (e: React.FormEvent) => {
    e.preventDefault();

    const missingCredits: string[] = [];
    let englishPassed = false;
    let englishMsg = "";
    const generalIssues: string[] = [];

    const numDC = Number(form.creditsDC || autoDC);
    const numCSN = Number(form.creditsCSN || autoCSN);
    const numCN = Number(form.creditsCN || autoCN);
    const numKHAC = Number(form.creditsKHAC || autoKHAC);

    const totalCredits = numDC + numCSN + numCN + numKHAC;

    // 1. Tổng tín chỉ
    if (totalCredits < 130) {
      missingCredits.push(
        `Tổng tích lũy: ${totalCredits}/130 TC (Thiếu ${130 - totalCredits} TC)`,
      );
    }
    // 2. Đại cương (47 TC)
    if (numDC < 47) missingCredits.push(`Đại cương: ${numDC}/47 TC`);

    // 3. Cơ sở ngành (49 TC)
    if (numCSN < 49) missingCredits.push(`Cơ sở ngành: ${numCSN}/49 TC`);

    // 4. Chuyên ngành (12 TC)
    if (numCN < 12) missingCredits.push(`Chuyên ngành: ${numCN}/12 TC`);

    // 5. Khác/Tự chọn/Tốt nghiệp (22 TC)
    if (numKHAC < 22) missingCredits.push(`Khác/Tự chọn/TN: ${numKHAC}/22 TC`);

    const { englishType, englishScore, toeicLR, toeicSW } = form;
    if (englishType === "IELTS") {
      if (Number(englishScore) >= 4.5) {
        englishPassed = true;
        englishMsg = "Đạt điều kiện (IELTS >= 4.5)";
      } else {
        englishMsg = `Chưa đạt (IELTS ${englishScore || 0}/4.5)`;
      }
    } else if (englishType === "TOEIC") {
      const lr = Number(toeicLR) || 0;
      const sw = Number(toeicSW) || 0;
      if (lr >= 450 && sw >= 185) {
        englishPassed = true;
        englishMsg = "Đạt điều kiện (TOEIC L&R 450, S&W 185)";
      } else {
        englishMsg = `Chưa đạt (Yêu cầu L&R: 450, S&W: 185)`;
      }
    } else if (englishType === "VSTEP") {
      if (Number(englishScore) >= 4.0) {
        englishPassed = true;
        englishMsg = "Đạt điều kiện (VSTEP >= B1)";
      } else {
        englishMsg = `Chưa đạt (VSTEP yêu cầu B1)`;
      }
    } else if (englishType === "UIT") {
      if (Number(englishScore) >= 176) {
        englishPassed = true;
        englishMsg = "Đạt điều kiện (VNU-EPT >= 176)";
      } else {
        englishMsg = `Chưa đạt (VNU-EPT ${englishScore || 0}/176)`;
      }
    }

    if (!form.completedPhysicalEducation)
      generalIssues.push("Chưa hoàn thành Giáo dục thể chất (GDTC)");
    if (!form.completedMilitaryTraining)
      generalIssues.push("Chưa hoàn thành Giáo dục Quốc phòng (GDQP)");

    const eligible =
      missingCredits.length === 0 &&
      englishPassed &&
      generalIssues.length === 0;

    setResult({
      eligible,
      missingCredits,
      englishPassed,
      englishMsg,
      generalIssues,
      totalCredits,
    });
  };

  return (
    <div className="add-subject-container">
      <h1 className="form-title">Kiểm tra tốt nghiệp UIT</h1>

      <form onSubmit={checkEligibility} className="subject-form-layout">
        <div className="form-section-card">
          <label className="form-label">1. Tín chỉ tích lũy</label>
          <p className="form-description">
            Số tín chỉ tự động tính từ bảng điểm. Bạn có thể nhập đè nếu cần.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="weight-item">
              <span className="weight-label">Đại cương (47)</span>
              <input
                type="number"
                name="creditsDC"
                value={form.creditsDC !== "" ? form.creditsDC : autoDC}
                onChange={handleChange}
                placeholder="0"
                className="form-white-input weight-input"
              />
            </div>
            <div className="weight-item">
              <span className="weight-label">Cơ sở ngành (49)</span>
              <input
                type="number"
                name="creditsCSN"
                value={form.creditsCSN !== "" ? form.creditsCSN : autoCSN}
                onChange={handleChange}
                placeholder="0"
                className="form-white-input weight-input"
              />
            </div>
            <div className="weight-item">
              <span className="weight-label">Chuyên ngành (12)</span>
              <input
                type="number"
                name="creditsCN"
                value={form.creditsCN !== "" ? form.creditsCN : autoCN}
                onChange={handleChange}
                placeholder="0"
                className="form-white-input weight-input"
              />
            </div>
            <div className="weight-item">
              <span className="weight-label">Khác/TN (22)</span>
              <input
                type="number"
                name="creditsKHAC"
                value={form.creditsKHAC !== "" ? form.creditsKHAC : autoKHAC}
                onChange={handleChange}
                placeholder="0"
                className="form-white-input weight-input"
              />
            </div>
          </div>
        </div>

        <div className="form-section-card">
          <label className="form-label">
            2. Chuẩn đầu ra Ngoại ngữ (Hệ Đại trà)
          </label>
          <p className="form-description">
            Chuẩn: IELTS 4.5, TOEIC 450/185, VNU-EPT 176.
          </p>

          <div className="flex mb-4 items-center gap-4">
            <select
              name="englishType"
              value={form.englishType}
              onChange={handleChange}
              className="form-white-input w-50 pr-8"
            >
              <option value="IELTS">IELTS</option>
              <option value="TOEIC">TOEIC (4 kỹ năng)</option>
              <option value="VSTEP">VSTEP</option>
              <option value="UIT">VNU-EPT</option>
            </select>
          </div>

          {form.englishType === "TOEIC" ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="weight-item">
                <span className="weight-label">
                  Listening & Reading (≥ 450)
                </span>
                <input
                  type="number"
                  name="toeicLR"
                  value={form.toeicLR}
                  onChange={handleChange}
                  className="form-white-input weight-input"
                />
              </div>
              <div className="weight-item">
                <span className="weight-label">Speaking & Writing (≥ 185)</span>
                <input
                  type="number"
                  name="toeicSW"
                  value={form.toeicSW}
                  onChange={handleChange}
                  className="form-white-input weight-input"
                />
              </div>
            </div>
          ) : (
            <div className="weight-item max-w-50">
              <span className="weight-label">Điểm số / Level</span>
              <input
                type="number"
                step="0.5"
                name="englishScore"
                value={form.englishScore}
                onChange={handleChange}
                className="form-white-input weight-input"
              />
            </div>
          )}
        </div>

        <div className="form-section-card">
          <label className="form-label">3. Yêu cầu chung</label>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm text-(--text-color) mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="completedPhysicalEducation"
                checked={form.completedPhysicalEducation}
                onChange={handleChange}
                className="w-5 h-5 cursor-pointer"
              />
              Chứng chỉ Thể chất (GDTC)
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="completedMilitaryTraining"
                checked={form.completedMilitaryTraining}
                onChange={handleChange}
                className="w-5 h-5 cursor-pointer"
              />
              Chứng chỉ Quốc phòng (GDQP)
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit-form">
            Kiểm tra & Phân tích
          </button>
        </div>
      </form>

      {result && (
        <div
          className={`form-section-card mt-7.5 border-2 ${
            result.eligible
              ? "border-green-500 bg-green-50"
              : "border-red-500 bg-red-50"
          }`}
        >
          <h2
            className={`mt-0 ${result.eligible ? "text-green-600" : "text-red-600"}`}
          >
            {result.eligible
              ? "🎉 ĐỦ ĐIỀU KIỆN TỐT NGHIỆP"
              : "⚠️ CHƯA ĐỦ ĐIỀU KIỆN"}
          </h2>

          <div className="mt-4 flex flex-col gap-3 text-sm">
            <div>
              <strong
                className={
                  result.englishPassed ? "text-green-600" : "text-red-500"
                }
              >
                Ngoại ngữ:
              </strong>
              <span className="ml-2 text-(--text-color)">
                {result.englishMsg}
              </span>
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
                className={
                  result.missingCredits.length === 0
                    ? "text-green-600"
                    : "text-red-500"
                }
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
        </div>
      )}
    </div>
  );
};

export default GraduationCheck;
