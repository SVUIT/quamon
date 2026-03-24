import { useState } from "react";

export const GraduationCheck = () => {
  const [form, setForm] = useState({
    creditsDC: "",
    creditsCSN: "", // Major Foundation + Others (49 + 8 = 57)
    creditsCN: "", // Major (12)
    creditsTN: "", // Graduation (Thesis/Project) (14)

    englishType: "IELTS",
    englishScore: "",
    toeicLR: "",
    toeicSW: "",

    hasFGrade: false,
    completedPhysicalEducation: false,
    completedMilitaryTraining: false,
    isUnderDisciplinaryAction: false,
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

    const numDC = Number(form.creditsDC) || 0;
    const numCSN = Number(form.creditsCSN) || 0;
    const numCN = Number(form.creditsCN) || 0;
    const numTN = Number(form.creditsTN) || 0;

    const totalCredits = numDC + numCSN + numCN + numTN;

    // --- UPDATE LOGIC ACCORDING TO 130 CREDITS TABLE ---
    // Total credits required: 130
    if (totalCredits < 130) {
      missingCredits.push(
        `Tổng số tín chỉ: ${totalCredits}/130 (Còn thiếu ${130 - totalCredits} TC)`,
      );
    }
    // General Education block: 47 Credits
    if (numDC < 47) missingCredits.push(`Đại cương: ${numDC}/47 TC`);

    // Professional Education block (Major Foundation 49 + Major 12 + Others 8 = 69 Credits)
    // Checking if total of Foundation + Major >= 69
    if (numCSN + numCN < 69)
      missingCredits.push(
        `Chuyên nghiệp (CSN + CN + Khác): ${numCSN + numCN}/69 TC`,
      );

    // Graduation block (Thesis/Internship): 14 Credits
    if (numTN < 14) missingCredits.push(`Tốt nghiệp: ${numTN}/14 TC`);

    // --- UPDATE LOGIC ACCORDING TO ENGLISH PROFICIENCY TABLE (STANDARD PROGRAM) ---
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
      // Standard Program requirements: L&R >= 450 and S&W >= 185
      if (lr >= 450 && sw >= 185) {
        englishPassed = true;
        englishMsg = "Đạt điều kiện (TOEIC L&R 450, S&W 185)";
      } else {
        englishMsg = `Chưa đạt (Yêu cầu L&R: 450, S&W: 185)`;
      }
    } else if (englishType === "VSTEP") {
      // VSTEP B1 standard is usually equivalent to 4.0/10 or Level 3/6
      if (Number(englishScore) >= 4.0) {
        englishPassed = true;
        englishMsg = "Đạt điều kiện (VSTEP >= B1)";
      } else {
        englishMsg = `Chưa đạt (VSTEP yêu cầu B1)`;
      }
    } else if (englishType === "UIT") {
      // VNU-EPT required score in table is 176
      if (Number(englishScore) >= 176) {
        englishPassed = true;
        englishMsg = "Đạt điều kiện (VNU-EPT >= 176)";
      } else {
        englishMsg = `Chưa đạt (VNU-EPT ${englishScore || 0}/176)`;
      }
    }

    // --- CHECK GENERAL CONDITIONS (KEEP UNCHANGED) ---
    if (form.hasFGrade) generalIssues.push("Còn nợ môn học (Điểm <5)");
    if (!form.completedPhysicalEducation)
      generalIssues.push("Chưa hoàn thành Giáo dục thể chất (GDTC)");
    if (!form.completedMilitaryTraining)
      generalIssues.push("Chưa hoàn thành Giáo dục Quốc phòng (GDQP)");

    if (form.isUnderDisciplinaryAction)
      generalIssues.push("Đang trong thời gian bị kỷ luật");

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
        {/* ACCUMULATED KNOWLEDGE BLOCKS */}
        <div className="form-section-card">
          <label className="form-label">
            1. Tín chỉ tích lũy (Chuẩn 130TC)
          </label>
          <p className="form-description">
            Nhập số tín chỉ hiện tại ở mỗi nhóm theo quy định mới.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="weight-item">
              <span className="weight-label">Đại cương (Y/c: 47)</span>
              <input
                type="number"
                name="creditsDC"
                value={form.creditsDC}
                onChange={handleChange}
                placeholder="VD: 47"
                className="form-white-input weight-input"
              />
            </div>
            <div className="weight-item">
              <span className="weight-label">Cơ sở & Khác (Y/c: 57)</span>
              <input
                type="number"
                name="creditsCSN"
                value={form.creditsCSN}
                onChange={handleChange}
                placeholder="VD: 57"
                className="form-white-input weight-input"
              />
            </div>
            <div className="weight-item">
              <span className="weight-label">Chuyên ngành (Y/c: 12)</span>
              <input
                type="number"
                name="creditsCN"
                value={form.creditsCN}
                onChange={handleChange}
                placeholder="VD: 12"
                className="form-white-input weight-input"
              />
            </div>
            <div className="weight-item">
              <span className="weight-label">Tốt nghiệp (Y/c: 14)</span>
              <input
                type="number"
                name="creditsTN"
                value={form.creditsTN}
                onChange={handleChange}
                placeholder="VD: 14"
                className="form-white-input weight-input"
              />
            </div>
          </div>
        </div>

        {/* ENGLISH PROFICIENCY STANDARD */}
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
                  Listening &amp; Reading (&gt;= 450)
                </span>
                <input
                  type="number"
                  name="toeicLR"
                  value={form.toeicLR}
                  onChange={handleChange}
                  placeholder="Điểm L&R"
                  className="form-white-input weight-input"
                />
              </div>
              <div className="weight-item">
                <span className="weight-label">
                  Speaking &amp; Writing (&gt;= 185)
                </span>
                <input
                  type="number"
                  name="toeicSW"
                  value={form.toeicSW}
                  onChange={handleChange}
                  placeholder="Điểm S&W"
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
                placeholder={form.englishType === "IELTS" ? "VD: 4.5" : "Điểm"}
                className="form-white-input weight-input"
              />
            </div>
          )}
        </div>

        {/* OTHER CONDITIONS */}
        <div className="form-section-card">
          <label className="form-label">3. Yêu cầu chung</label>
          <p className="form-description">Đánh dấu các mục đã hoàn thành.</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm text-[var(--text-color)]">
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
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="hasFGrade"
                checked={form.hasFGrade}
                onChange={handleChange}
                className="w-5 h-5 cursor-pointer"
              />
              Có môn trung bình &lt; 5 (chưa học lại)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-red-500">
              <input
                type="checkbox"
                name="isUnderDisciplinaryAction"
                checked={form.isUnderDisciplinaryAction}
                onChange={handleChange}
                className="w-5 h-5 cursor-pointer"
              />
              Đang bị kỷ luật
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit-form">
            Kiểm tra & Phân tích
          </button>
        </div>
      </form>

      {/* EVALUATION RESULT DISPLAY */}
      {result && (
        <div
          className={`form-section-card mt-7.5 ${result.eligible ? "border-success-green bg-success-green/5" : "border-red-500 bg-red-500/5"}`}
        >
          <h2
            className={`mt-0 ${result.eligible ? "text-(--success-green)" : "text-red-500"}`}
          >
            {result.eligible
              ? "🎉 ĐỦ ĐIỀU KIỆN TỐT NGHIỆP"
              : "⚠️ CHƯA ĐỦ ĐIỀU KIỆN"}
          </h2>

          <div className="mt-4 flex flex-col gap-3 text-sm">
            <div>
              <strong
                className={
                  result.englishPassed
                    ? "text-(--success-green)"
                    : "text-red-500"
                }
              >
                Ngoại ngữ:
              </strong>
              <span className="text-(--text-color)">{result.englishMsg}</span>
            </div>

            {result.generalIssues.length > 0 && (
              <div>
                <strong className="text-[#ff4d4f]">
                  Yêu cầu chung còn thiếu:
                </strong>
                <ul className="text-[#ff4d4f]">
                  {result.generalIssues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.missingCredits.length > 0 ? (
              <div>
                <strong className="text-[#ff4d4f]">
                  Tín chỉ môn học còn thiếu:
                </strong>
                <ul className="text-[#ff4d4f]">
                  {result.missingCredits.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <strong className="text-(--success-green)">
                  Tín chỉ môn học:
                </strong>{" "}
                <span className="text-(--text-color)">
                  Đã đủ điều kiện ({result.totalCredits}/130 TC)
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraduationCheck;
