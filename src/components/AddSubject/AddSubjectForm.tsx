'use client';

import React, { useState, useEffect } from "react"; 
import { Subject, Course } from "../../types";
import { useSession, signIn } from "next-auth/react";

interface AddSubjectFormProps {
  onAdd: (subject: Subject) => void;
}

const regex = {
  courseCode: /^[A-Z]{2,4}[0-9]{2,4}$/,
  courseNameVi: /^[a-zA-ZÀ-ỹ0-9\s]{3,100}$/,
  courseNameEn: /^[a-zA-Z0-9\s]{3,100}$/,
  credits: /^(10|[1-9])$/,
  weight: /^(100|[1-9]?[0-9])$/,
};

const AddSubjectForm: React.FC<AddSubjectFormProps> = ({ onAdd }) => {
  const { data: session } = useSession();
  
  const [hasProcessed, setHasProcessed] = useState(false);

  const [form, setForm] = useState({
    courseCode: "",
    courseNameEn: "",
    courseNameVi: "",
    courseType: "ĐC",
    credits: "",
    progressWeight: "20",
    midtermWeight: "20",
    practiceWeight: "20",
    finalTermWeight: "40",
  });

  const [isSubmittingPR, setIsSubmittingPR] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getTotalWeight = (formData = form) => {
    return (
      Number(formData.progressWeight) +
      Number(formData.midtermWeight) +
      Number(formData.practiceWeight) +
      Number(formData.finalTermWeight)
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    let newValue = value;

    if (typeof value === "string") {
    newValue = value.replace(/[<>]/g, ""); // tránh inject HTML
  }

    setForm(prev => ({ ...prev, [name]: newValue }));

    const errorMsg = validateField(name, newValue);

    setErrors(prev => ({
      ...prev,
      [name]: errorMsg
    }));
  };

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "courseCode":
        if (!regex.courseCode.test(value)) {
          return "Mã học phần phải dạng IT001, CS313...";
        }
        break;

      case "courseNameVi":
        if (!regex.courseNameVi.test(value)) {
          return "Tên tiếng Việt không hợp lệ";
        }
        break;

      case "courseNameEn":
        if (!regex.courseNameEn.test(value)) {
          return "Tên tiếng Anh không hợp lệ";
        }
        break;

      case "credits":
        if (!regex.credits.test(value)) {
          return "Tín chỉ phải từ 1–10";
        }
        break;

      case "progressWeight":
      case "midtermWeight":
      case "practiceWeight":
      case "finalTermWeight":
        if (!regex.weight.test(value)) {
          return "Phải từ 0–100";
        }
        break;
    }

    return "";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    const errorMsg = validateField(name, value);

    setErrors(prev => ({
      ...prev,
      [name]: errorMsg
    }));
  };

  const getCourseObject = (): Course => {
    return {
      courseCode: form.courseCode,
      courseNameEn: form.courseNameEn,
      courseNameVi: form.courseNameVi,
      courseType: form.courseType,
      credits: Number(form.credits) || 0,
      defaultWeights: {
        progressWeight: (Number(form.progressWeight) || 0) / 100,
        practiceWeight: (Number(form.practiceWeight) || 0) / 100,
        midtermWeight: (Number(form.midtermWeight) || 0) / 100,
        finalTermWeight: (Number(form.finalTermWeight) || 0) / 100,
      }
    };
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // ❗ check rỗng
    Object.entries(form).forEach(([key, value]) => {
      if (value === "" || value === null) {
        newErrors[key] = "Không được để trống";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return newErrors;
    }

    // ✅ regex validate
    if (!regex.courseCode.test(form.courseCode)) {
      newErrors.courseCode = "Mã học phần phải dạng IT001, CS313...";
    }

    if (!regex.courseNameVi.test(form.courseNameVi)) {
      newErrors.courseNameVi = "Tên tiếng Việt không hợp lệ";
    }

    if (!regex.courseNameEn.test(form.courseNameEn)) {
      newErrors.courseNameEn = "Tên tiếng Anh không hợp lệ";
    }

    if (!regex.credits.test(form.credits)) {
      newErrors.credits = "Tín chỉ phải từ 1–10";
    }

    // ✅ validate weight từng cái
    ["progressWeight", "midtermWeight", "practiceWeight", "finalTermWeight"].forEach((key) => {
      if (!regex.weight.test(form[key as keyof typeof form])) {
        newErrors[key] = "Phải là số từ 0–100";
      }
    });

    // ✅ tổng = 100
    const totalWeight = getTotalWeight();
    if (totalWeight !== 100) {
      newErrors.progressWeight = "Tổng trọng số phải = 100";
      newErrors.midtermWeight = "Tổng trọng số phải = 100";
      newErrors.practiceWeight = "Tổng trọng số phải = 100";
      newErrors.finalTermWeight = "Tổng trọng số phải = 100";
    }

    setErrors(newErrors);
    return newErrors;
  };

  const createPR = async (courseObj: Course) => {
    try {
      setIsSubmittingPR(true);

      const res = await fetch("/api/create-course-pr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...courseObj,
          user: {
            name: session?.user?.name,
            username: (session?.user as any)?.username,
            profileUrl: `https://github.com/${(session?.user as any)?.username}`,
            email: session?.user?.email,
          }
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Tạo PR thất bại");
      }

      // ❗ clear trước
      localStorage.removeItem("pendingPR");

      // ❗ mở link trước để không bị block
      if (data.url) {
        window.open(data.url, "_blank");
        alert(`PR đã tạo thành công!\n${data.url}`);
      }

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Có lỗi xảy ra khi tạo PR");
    } finally {
      setIsSubmittingPR(false);
    }
  };

  const handleCreatePR = async () => {

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      const hasEmpty = Object.values(form).some(v => v === "");

      if (hasEmpty) {
        alert("Vui lòng nhập đầy đủ thông tin");
      } else {
        alert("Tổng trọng số phải bằng 100%");
      }
      return;
    }

    const courseObj = getCourseObject();

    if (!session) {
      localStorage.setItem("pendingPR", JSON.stringify(courseObj));

      signIn("github", {
        callbackUrl: "/"
      });

      return;
    }

    await createPR(courseObj);
  };

  useEffect(() => {
    if (session && !hasProcessed) {
      const pending = localStorage.getItem("pendingPR");

      if (pending) {
        localStorage.removeItem("pendingPR"); 

        const courseObj = JSON.parse(pending);
        createPR(courseObj);

        setHasProcessed(true);
      }
    }
  }, [session, hasProcessed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      alert("Bạn cần đăng nhập để thêm môn!");
      signIn();
      return;
    }

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      const hasEmpty = Object.values(form).some(v => v === "");

      if (hasEmpty) {
        alert("Vui lòng nhập đầy đủ thông tin");
      } else {
        alert("Tổng trọng số phải bằng 100%");
      }
      return;
    }

    const courseObj = getCourseObject();
    
    const newSubject: Subject = {
      id: `sub-${self.crypto.randomUUID()}`,
      courseCode: courseObj.courseCode,
      courseName: courseObj.courseNameVi,
      credits: courseObj.credits.toString(),
      progressScore: "",
      midtermScore: "",
      practiceScore: "",
      finalScore: "",
      minProgressScore: "",
      minMidtermScore: "",
      minPracticeScore: "",
      minFinalScore: "",
      progressWeight: (courseObj.defaultWeights.progressWeight * 100).toString(),
      midtermWeight: (courseObj.defaultWeights.midtermWeight * 100).toString(),
      practiceWeight: (courseObj.defaultWeights.practiceWeight * 100).toString(),
      finalWeight: (courseObj.defaultWeights.finalTermWeight * 100).toString(),
      score: "",
      expectedScore: "",
      isExpectedManual: false,
    };

    onAdd(newSubject);
  };

  return (
    <div className="add-subject-container">
      <h1 className="form-title">Thêm môn</h1>
      
      <form onSubmit={handleSubmit} className="subject-form-layout">
        <div className="form-section-card">
          <label className="form-label">Mã học phần</label>
          <p className="form-description">Mã định danh duy nhất (ví dụ: IT001, CS313,...).</p>
          <input 
            type="text" name="courseCode" value={form.courseCode}
            onChange={handleChange} onBlur={handleBlur} placeholder="Mã học phần..." className={`form-white-input ${errors.courseCode ? "input-error" : ""}`}
          />
          {errors.courseCode && (
            <p className="error-text">{errors.courseCode}</p>
          )}
        </div>

    
        <div className="form-section-card">
          <label className="form-label">Tên học phần (tiếng Việt)</label>
          <p className="form-description">Tên tiếng Việt chính thức của học phần.</p>
          <input 
            type="text" name="courseNameVi" value={form.courseNameVi} onChange={handleChange} onBlur={handleBlur} placeholder="Nhập tên tiếng Việt..." className={`form-white-input ${errors.courseNameVi  ? "input-error" : ""}`}
          />

          {errors.courseNameVi && <p className="error-text">{errors.courseNameVi}</p>}
        </div>

        <div className="form-section-card">
          <label className="form-label">Tên học phần (tiếng Anh)</label>
          <p className="form-description">Tên tiếng Anh chính thức của học phần</p>
          <input 
             type="text" name="courseNameEn" value={form.courseNameEn}
            onChange={handleChange} onBlur={handleBlur} placeholder="Nhập tên tiếng Anh..." className={`form-white-input ${errors.courseNameEn  ? "input-error" : ""}`}
          />
          {errors.courseNameEn && <p className="error-text">{errors.courseNameEn}</p>}
        </div>
        

 
        <div className="form-section-card">
          <label className="form-label">Loại học phần</label>
          <p className="form-description">Phân loại theo chương trình đào tạo.</p>
          <select 
            name="courseType" value={form.courseType} 
            onChange={handleChange} className={`form-white-input ${errors.courseType ? "input-error" : ""}`}
            style={{ paddingRight: '30px' }}
           >
            <option value="ĐC">Đại cương (ĐC)</option>
            <option value="CSNN">Cơ sở nhóm ngành (CSNN)</option>
            <option value="CSN">Cơ sở ngành (CSN)</option>
            <option value="CN">Chuyên ngành (CN)</option>
            <option value="CNTC">Chuyên ngành tự chọn (CNTC)</option>
            <option value="TN">Tốt nghiệp (TN)</option>
            <option value="CĐTN">Chuyên đề tốt nghiệp (CĐTN)</option>
          </select>
        </div>

        <div className="form-section-card">
          <label className="form-label">Tín chỉ</label>
          <p className="form-description">Số lượng tín chỉ của học phần.</p>
          <input 
            type="number" name="credits" value={form.credits}
            onChange={handleChange} onBlur={handleBlur} placeholder="Ví dụ: 4" className={`form-white-input ${errors.credits ? "input-error" : ""}`}
          />
          {errors.credits && <p className="error-text">{errors.credits}</p>}
        </div>


        <div className="form-section-card">
          <label className="form-label">Trọng số (%)</label>
          <p className="form-description">Tổng các trọng số phải bằng 100.</p>
          <div className="weights-grid">
            <div className="weight-item">
              <span className="weight-label">Quá trình</span>
              <input type="number" name="progressWeight" value={form.progressWeight} onChange={handleChange} onBlur={handleBlur} className={`form-white-input weight-input ${errors.progressWeight ? "input-error" : ""}`} />
              {errors.progressWeight && <p className="error-text">{errors.progressWeight}</p>}
            </div>
            <div className="weight-item">
              <span className="weight-label">Giữa kỳ</span>
              <input type="number" name="midtermWeight" value={form.midtermWeight} onChange={handleChange} onBlur={handleBlur} className={`form-white-input weight-input ${errors.midtermWeight ? "input-error" : ""}`} />
              {errors.midtermWeight && <p className="error-text">{errors.midtermWeight}</p>}
            </div>
            <div className="weight-item">
              <span className="weight-label">Thực hành</span>
              <input type="number" name="practiceWeight" value={form.practiceWeight} onChange={handleChange} onBlur={handleBlur} className={`form-white-input weight-input ${errors.practiceWeight ? "input-error" : ""}`} />
              {errors.practiceWeight && <p className="error-text">{errors.practiceWeight}</p>}
            </div>
            <div className="weight-item">
              <span className="weight-label">Cuối kỳ</span>
              <input type="number" name="finalTermWeight" value={form.finalTermWeight} onChange={handleChange} onBlur={handleBlur} className={`form-white-input weight-input ${errors.finalTermWeight ? "input-error" : ""}`} />
              {errors.finalTermWeight && <p className="error-text">{errors.finalTermWeight}</p>}
            </div>
          </div>
        </div>

        <div className="form-actions" style={{ gap: '15px' }}>

           <button
              type="submit"
              onClick={handleCreatePR}
              className="btn-submit-form"
              disabled={isSubmittingPR}
            >
              {isSubmittingPR ? "Đang tạo PR..." : "Gửi đóng góp (Tạo PR)"}
            </button>
           <button type="submit" className="btn-submit-form">
              Thêm vào bảng điểm
           </button>
        </div>
      </form>
    </div>
  );
};

export default AddSubjectForm;