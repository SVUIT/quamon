
import React, { useState } from "react";
import { Subject, Course } from "../../types";

interface AddSubjectFormProps {
  onAdd: (subject: Subject) => void;
}

const AddSubjectForm: React.FC<AddSubjectFormProps> = ({ onAdd }) => {
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
  const [errors, setErrors] = useState<Record<string, boolean>>({});

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

    setForm(prev => ({ ...prev, [name]: value }));

    setErrors(prev => {
      const newErrors = { ...prev };
      if (value !== "") {
        delete newErrors[name];
      }
      return newErrors;
    });
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
    const newErrors: Record<string, boolean> = {};

    Object.entries(form).forEach(([key, value]) => {
      if (value === "" || value === null) {
        newErrors[key] = true;
      }
    });

    if (Object.keys(newErrors).length === 0) {
      const totalWeight = getTotalWeight();

      if (totalWeight !== 100) {
        newErrors.progressWeight = true;
        newErrors.midtermWeight = true;
        newErrors.practiceWeight = true;
        newErrors.finalTermWeight = true;
      }
    }

    setErrors(newErrors);
    return newErrors;
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

  try {
    setIsSubmittingPR(true);

    const res = await fetch("/api/create-course-pr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courseObj),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Tạo PR thất bại");
    }

    alert("Đã tạo Pull Request thành công!");
    if (data.url) {
      window.open(data.url, "_blank");
    }
  } catch (err: any) {
    console.error(err);
    alert(err.message || "Có lỗi xảy ra khi tạo PR");
  } finally {
    setIsSubmittingPR(false);
  }
};


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    
    // Tạo Subject để thêm vào bảng điểm hiện tại
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
            onChange={handleChange} placeholder="Mã học phần..." className={`form-white-input ${errors.courseCode ? "input-error" : ""}`}
          />
        </div>

    
        <div className="form-section-card">
          <label className="form-label">Tên học phần (tiếng Việt)</label>
          <p className="form-description">Tên tiếng Việt chính thức của học phần.</p>
          <input 
            type="text" name="courseNameVi" value={form.courseNameVi}              onChange={handleChange} placeholder="Nhập tên tiếng Việt..." className={`form-white-input ${errors.courseNameVi  ? "input-error" : ""}`}
          />
        </div>

        <div className="form-section-card">
          <label className="form-label">Tên học phần (tiếng Anh)</label>
          <p className="form-description">Tên tiếng Anh chính thức của học phần</p>
          <input 
             type="text" name="courseNameEn" value={form.courseNameEn}
            onChange={handleChange} placeholder="Nhập tên tiếng Anh..." className={`form-white-input ${errors.courseNameEn  ? "input-error" : ""}`}
          />
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
            onChange={handleChange} placeholder="Ví dụ: 4" className={`form-white-input ${errors.credits ? "input-error" : ""}`}
          />
        </div>


        <div className="form-section-card">
          <label className="form-label">Trọng số (%)</label>
          <p className="form-description">Tổng các trọng số phải bằng 100.</p>
          <div className="weights-grid">
            <div className="weight-item">
              <span className="weight-label">Quá trình</span>
              <input type="number" name="progressWeight" value={form.progressWeight} onChange={handleChange} className={`form-white-input weight-input ${errors.progressWeight ? "input-error" : ""}`} />
            </div>
            <div className="weight-item">
              <span className="weight-label">Giữa kỳ</span>
              <input type="number" name="midtermWeight" value={form.midtermWeight} onChange={handleChange} className={`form-white-input weight-input ${errors.progressWeight ? "input-error" : ""}`} />
            </div>
            <div className="weight-item">
              <span className="weight-label">Thực hành</span>
              <input type="number" name="practiceWeight" value={form.practiceWeight} onChange={handleChange} className={`form-white-input weight-input ${errors.progressWeight ? "input-error" : ""}`} />
            </div>
            <div className="weight-item">
              <span className="weight-label">Cuối kỳ</span>
              <input type="number" name="finalTermWeight" value={form.finalTermWeight} onChange={handleChange} className={`form-white-input weight-input ${errors.progressWeight ? "input-error" : ""}`} />
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
