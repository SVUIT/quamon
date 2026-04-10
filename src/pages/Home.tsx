"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { useGradeApp } from "../hooks/useGradeApp";
import { uploadPdf } from "../config/appwrite";
import { Subject, ProcessedPdfData, findCourseByCode } from "../types";
import { useCoursesData } from "../hooks/useCoursesData";
import { isExemptCourse } from "../utils/gradeUtils";
import { ExcelExport } from "../components/ExcelExport/ExcelExport";

// Dynamic imports for better performance
const LazyGradeTable = dynamic(() => import("../components/GradeTable/GradeTable"), {
  loading: () => <div>Loading grade table...</div>,
  ssr: false
});

const LazyInstructions = dynamic(() => import("../components/Instructions/Instructions"), {
  loading: () => <div>Loading instructions...</div>,
  ssr: false
});

const LazyAddSubjectForm = dynamic(() => import("../components/AddSubject/AddSubjectForm"), {
  loading: () => <div>Loading form...</div>,
  ssr: false
});

const LazyEditModal = dynamic(() => import("../components/GradeTable/EditModal"), {
  loading: () => <div>Loading modal...</div>,
  ssr: false
});

const ExcelUpload = dynamic(() => import("../components/ExcelUpload/ExcelUpload").then(mod => ({ default: mod.ExcelUpload })), {
  loading: () => <div>Loading Excel upload...</div>,
  ssr: false
});

export type TabType = "grades" | "instructions" | "add_subject";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("grades");
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [importType, setImportType] = useState<"pdf" | "excel">("pdf");
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [excelError, setExcelError] = useState<string | null>(null);

  const { SUBJECTS_DATA } = useCoursesData();
  
  const {
    theme,
    toggleTheme,
    gpaScale,
    semesters,
    setSemesters,
    cumulativeExpected,
    setCumulativeExpected,
    isCumulativeManual,
    setIsCumulativeManual,
    modalOpen,
    setModalOpen,
    editing,
    setEditing,
    backupSubject,
    setBackupSubject,
    deleteSemester,
    deleteSubject,
    openAdvancedModal,
    updateSubjectField,
    updateSubjectExpectedScore,
    openMenu,
    setOpenMenu,
    semesterMenuOpen,
    setSemesterMenuOpen,
    addDropdownOpen,
    setAddDropdownOpen,
    addSearchTerm,
    setAddSearchTerm,
    addExpandedCategories,
    setAddExpandedCategories,
    editDropdownOpen,
    setEditDropdownOpen,
    editSearchTerm,
    setEditSearchTerm,
    editExpandedCategories,
    setEditExpandedCategories,
    addSearchResults,
    editSearchResults,
  } = useGradeApp();

  // 
  // const exportToExcel = async (semesters: Semester[]) => {
  //   try {
  //     const workbook = await XlsxPopulate.fromBlankAsync();
  //     const sheet = workbook.sheet(0).name("T\u1ea5t c\u1ea3 h\u1ecdc k\u1ef3");
  //
  //     const headers = [
  //       "H\u1ecdc k\u1ef3",
  //       "STT",
  //       "M\u00e3 HP",
  //       "T\u00ean HP",
  //       "TC",
  //       "QT",
  //       "GK",
  //       "TH",
  //       "CK",
  //       "\u0110i\u1ec3m HP",
  //       "\u0110i\u1ec3m k\u1ef3 v\u1ecdng",
  //     ];
  //     sheet.cell("A1").value(headers);
  //
  //     let currentRow = 2;
  //     semesters.forEach((semester) => {
  //       if (semester.subjects.length === 0) return;
  //
  //       // Add semester header
  //       sheet.cell(`A${currentRow}`).value([semester.name]);
  //       sheet.range(`A${currentRow}:K${currentRow}`).merged(true);
  //       currentRow++;
  //
  //       // Add subjects
  //       semester.subjects.forEach((subject, index) => {
  //         sheet.cell(`A${currentRow}`).value(index + 1);
  //         sheet.cell(`B${currentRow}`).value(subject.courseCode);
  //         sheet.cell(`C${currentRow}`).value(subject.courseNameVi);
  //         sheet.cell(`D${currentRow}`).value(subject.credits);
  //         sheet.cell(`E${currentRow}`).value(subject.progressScore);
  //         sheet.cell(`F${currentRow}`).value(subject.midtermScore);
  //         sheet.cell(`G${currentRow}`).value(subject.practiceScore);
  //         sheet.cell(`H${currentRow}`).value(subject.finalScore);
  //         sheet.cell(`I${currentRow}`).value(subject.subjectScore);
  //         sheet.cell(`J${currentRow}`).value(subject.expectedScore);
  //         currentRow++;
  //       });
  //       currentRow++; // Add space between semesters
  //     });
  //
  //     // Auto-fit columns
  //     sheet.column("A").width(8);
  //     sheet.column("B").width(15);
  //     sheet.column("C").width(40);
  //     sheet.column("D").width(8);
  //     sheet.column("E").width(8);
  //     sheet.column("F").width(8);
  //     sheet.column("G").width(8);
  //     sheet.column("H").width(8);
  //     sheet.column("I").width(12);
  //     sheet.column("J").width(12); // \u0110i\u1ec3m HP
  //     sheet.column("K").width(15); // \u0110i\u1ec3m k\u1ef3 v\u1ecdng
  //
  //     const blob = await workbook.outputAsync();
  //     const fileName = `bang-diem-${new Date()
  //       .toISOString()
  //       .split("T")[0]}.xlsx`;
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = fileName;
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error("L\u1ed7i khi xu\u1ea5t file Excel:", error);
  //     alert("\u0110\u00e3 x\u1ea3y ra l\u1ed7i khi xu\u1ea5t file Excel. Vui l\u00f2ng th\u1eed l\u1ea1i.");
  //   }
  // };
  /* ================== PDF UPLOAD ================== */
  const getAllCourses = () => {
    return Object.values(SUBJECTS_DATA).flat();
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingPdf(true);
    setPdfError(null);

    try {
      const data: ProcessedPdfData = await uploadPdf(file);
      const allCourses = getAllCourses();

      const formattedSemesters = data.semesters.map((sem, semIndex) => {
        return {
          id: `pdf-sem-${Date.now()}-${semIndex}`,
          name: sem.semesterName,
          subjects: sem.courses.map((c, i): Subject => {
            const courseData = findCourseByCode(c.courseCode, allCourses);
            const defaultWeights = courseData?.defaultWeights || {
              progressWeight: 0.2,
              practiceWeight: 0.2,
              midtermWeight: 0.2,
              finalTermWeight: 0.4
            };

            const tempSubject: Subject = {
              courseCode: c.courseCode || "",
              courseName: c.courseNameVi || courseData?.courseNameVi || "",
              credits: (c.credits || courseData?.credits || 0).toString(),
              progressScore: "",
              practiceScore: "",
              midtermScore: "",
              finalScore: "",
              progressWeight: "",
              practiceWeight: "",
              midtermWeight: "",
              finalWeight: "",
              score: "",
              expectedScore: ""
            };
            
            const isExempt = isExemptCourse(tempSubject);

            return {
              id: `pdf-sub-${Date.now()}-${i}`,
              courseCode: c.courseCode || "",
              courseName: c.courseNameVi || courseData?.courseNameVi || "",
              credits: (c.credits || courseData?.credits || 0).toString(),

              progressScore: isExempt ? "0" : (c.scores?.progressScore?.toString() || ""),
              practiceScore: isExempt ? "0" : (c.scores?.practiceScore?.toString() || ""),
              midtermScore: isExempt ? "0" : (c.scores?.midtermScore?.toString() || ""),
              finalScore: isExempt ? "0" : (c.scores?.finaltermScore?.toString() || ""),

              progressWeight: (defaultWeights.progressWeight * 100).toString(),
              practiceWeight: (defaultWeights.practiceWeight * 100).toString(),
              midtermWeight: (defaultWeights.midtermWeight * 100).toString(),
              finalWeight: (defaultWeights.finalTermWeight * 100).toString(),

              score: isExempt ? "0" : (c.scores?.totalScore?.toString() || ""),
              expectedScore: "", 
              isExpectedManual: false,
            };
          }),
          expectedAverage: "",
          isExpectedAverageManual: false,
        };
      });

      setSemesters(formattedSemesters);
    } catch (err: any) {
      setPdfError(err.message || "Lỗi khi đọc file PDF");
    } finally {
      setLoadingPdf(false);
      e.target.value = "";
    }
  };
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingExcel(true);
    setExcelError(null);

    try {
      const workbook = await XlsxPopulate.fromDataAsync(file);
      const sheet = workbook.sheet(0);
      
      let maxRow = 0;
      let maxCol = 0;
      
      for (let row = 1; row <= 100; row++) {
        for (let col = 1; col <= 50; col++) {
          const cellValue = sheet.cell(row, col).value();
          if (cellValue !== undefined && cellValue !== null && cellValue !== "") {
            maxRow = Math.max(maxRow, row);
            maxCol = Math.max(maxCol, col);
          }
        }
      }
      
      if (maxRow === 0) {
        throw new Error("File Excel trống hoặc không có dữ liệu");
      }

      const startRow = 1;
      const endRow = maxRow;
      const startCol = 1;
      const endCol = maxCol;

      const headers: string[] = [];
      for (let col = startCol; col <= endCol; col++) {
        const headerValue = sheet.cell(startRow, col).value();
        headers.push(headerValue?.toString().toLowerCase().trim() || "");
      }

      const findColumnIndex = (headerName: string) => {
        return headers.findIndex(h => h.includes(headerName.toLowerCase()));
      };

      const semesterCol = findColumnIndex("học kỳ");
      const codeCol = findColumnIndex("mã hp");
      const nameCol = findColumnIndex("tên hp");
      const creditsCol = findColumnIndex("tc");
      const progressCol = findColumnIndex("qt");
      const midtermCol = findColumnIndex("gk");
      const practiceCol = findColumnIndex("th");
      const finalCol = findColumnIndex("ck");
      const scoreCol = findColumnIndex("điểm hp");
      const expectedCol = findColumnIndex("điểm kỳ vọng");

      if (codeCol === -1 || nameCol === -1) {
        throw new Error("Không tìm thấy cột 'Mã HP' hoặc 'Tên HP' trong file Excel");
      }

      const allCourses = getAllCourses();
      const semesterMap = new Map<string, Subject[]>();

      for (let row = startRow + 1; row <= endRow; row++) {
        const semesterName = semesterCol !== -1 ? (sheet.cell(row, semesterCol + 1).value()?.toString() || "") : "Học kỳ 1";
        const courseCode = sheet.cell(row, codeCol + 1).value()?.toString() || "";
        const courseName = nameCol !== -1 ? (sheet.cell(row, nameCol + 1).value()?.toString() || "") : "";
        const credits = creditsCol !== -1 ? (sheet.cell(row, creditsCol + 1).value()?.toString() || "") : "0";
        const progressScore = progressCol !== -1 ? (sheet.cell(row, progressCol + 1).value()?.toString() || "") : "";
        const midtermScore = midtermCol !== -1 ? (sheet.cell(row, midtermCol + 1).value()?.toString() || "") : "";
        const practiceScore = practiceCol !== -1 ? (sheet.cell(row, practiceCol + 1).value()?.toString() || "") : "";
        const finalScore = finalCol !== -1 ? (sheet.cell(row, finalCol + 1).value()?.toString() || "") : "";
        const totalScore = scoreCol !== -1 ? (sheet.cell(row, scoreCol + 1).value()?.toString() || "") : "";
        const expectedScore = expectedCol !== -1 ? (sheet.cell(row, expectedCol + 1).value()?.toString() || "") : "";

        if (!courseCode.trim()) continue; 

        const courseData = findCourseByCode(courseCode, allCourses);

        const tempSubject: Subject = {
          courseCode,
          courseName: courseName || courseData?.courseNameVi || "",
          credits: credits || courseData?.credits?.toString() || "0",
          progressScore: "",
          practiceScore: "",
          midtermScore: "",
          finalScore: "",
          progressWeight: "",
          practiceWeight: "",
          midtermWeight: "",
          finalWeight: "",
          score: "",
          expectedScore: ""
        };

        const isExempt = isExemptCourse(tempSubject);

        const defaultWeights = courseData?.defaultWeights || {
          progressWeight: 0.2,
          practiceWeight: 0.2,
          midtermWeight: 0.2,
          finalTermWeight: 0.4
        };

        const subject: Subject = {
          id: `excel-sub-${Date.now()}-${Math.random()}`,
          courseCode,
          courseName: courseName || courseData?.courseNameVi || "",
          credits: credits || courseData?.credits?.toString() || "0",
          progressScore: isExempt ? "0" : progressScore,
          practiceScore: isExempt ? "0" : practiceScore,
          midtermScore: isExempt ? "0" : midtermScore,
          finalScore: isExempt ? "0" : finalScore,
          score: isExempt ? "0" : totalScore,
          expectedScore: isExempt ? "" : expectedScore, // Clear expected score for exempt courses
          isExpectedManual: false,
          progressWeight: (defaultWeights.progressWeight * 100).toString(),
          practiceWeight: (defaultWeights.practiceWeight * 100).toString(),
          midtermWeight: (defaultWeights.midtermWeight * 100).toString(),
          finalWeight: (defaultWeights.finalTermWeight * 100).toString(),
        };

        if (!semesterMap.has(semesterName)) {
          semesterMap.set(semesterName, []);
        }
        semesterMap.get(semesterName)!.push(subject);
      }

      const formattedSemesters = Array.from(semesterMap.entries()).map(([semesterName, subjects], index) => ({
        id: `excel-sem-${Date.now()}-${index}`,
        name: semesterName,
        subjects,
        expectedAverage: "",
        isExpectedAverageManual: false,
      }));

      if (formattedSemesters.length === 0) {
        throw new Error("Không tìm thấy dữ liệu hợp lệ trong file Excel");
      }

      setSemesters(formattedSemesters);
    } catch (err: any) {
      setExcelError(err.message || "Lỗi khi đọc file Excel");
    } finally {
      setLoadingExcel(false);
      e.target.value = "";
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div className={theme === "light" ? "light-mode" : ""} style={{ minHeight: "100vh" }}>
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div
        className="app-container"
        onClick={() => {
          setOpenMenu(null);
          setSemesterMenuOpen(null);
          setEditDropdownOpen(null);
          setAddDropdownOpen(null);
        }}
      >
        {activeTab === "grades" && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <h1 style={{ textAlign: "center", marginBottom: "10px" }}>
                Bảng điểm
              </h1>
              <div className="button-group" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px', marginBottom: '10px', alignItems: 'stretch' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <select
                    value={importType}
                    onChange={(e) => setImportType(e.target.value as "pdf" | "excel")}
                    aria-label="Select import type: PDF or Excel"
                    style={{
                      position: 'absolute',
                      left: '1px',
                      top: '1px',
                      height: '38px',
                      width: '50px',
                      borderRadius: '6px 0 0 6px',
                      border: 'none',
                      padding: '0 4px',
                      fontSize: '10px',
                      fontWeight: '500',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: '#374151',
                      cursor: 'pointer',
                      zIndex: 2,
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                  </select>
                  
                  {importType === "pdf" ? (
                    <>
                      <label
                        htmlFor="pdf-upload"
                        className="action-btn pdf-import-btn"
                        style={{
                          height: '40px',
                          width: '220px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          borderRadius: '10px',
                          background: 'linear-gradient(145deg, #6366f1, #8b5cf6)',
                          color: 'white',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          fontSize: '13px',
                          fontWeight: '500',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          whiteSpace: 'nowrap',
                          boxSizing: 'border-box',
                          padding: '0 12px 0 62px',
                          lineHeight: '1',
                          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.25)',
                          backdropFilter: 'blur(20px)',
                          position: 'relative',
                          overflow: 'hidden',
                          textAlign: 'center',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(145deg, #5558e3, #7c3aed)';
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.35)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(145deg, #6366f1, #8b5cf6)';
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.25)';
                        }}
                      >
                        {loadingPdf ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ 
                              width: '16px', 
                              height: '16px', 
                              border: '2px solid rgba(255,255,255,0.3)', 
                              borderTop: '2px solid white', 
                              borderRadius: '50%', 
                              animation: 'spin 1s linear infinite' 
                            }}></span>
                            Đang xử lý...
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14,2 14,8 20,8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                              <polyline points="10,9 9,9 8,9"/>
                            </svg>
                            Nhập điểm từ PDF
                          </span>
                        )}
                      </label>

                      <input
                        id="pdf-upload"
                        type="file"
                        accept=".pdf"
                        hidden
                        disabled={loadingPdf}
                        onChange={handlePdfUpload}
                      />
                    </>
                  ) : (
                    <>
                      <label
                        htmlFor="excel-upload"
                        className="action-btn excel-import-btn"
                        style={{
                          height: '40px',
                          width: '220px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          borderRadius: '10px',
                          background: 'linear-gradient(145deg, #10b981, #059669)',
                          color: 'white',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          fontSize: '13px',
                          fontWeight: '500',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          whiteSpace: 'nowrap',
                          boxSizing: 'border-box',
                          padding: '0 12px 0 62px', // Reduced right padding
                          lineHeight: '1',
                          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.25)',
                          backdropFilter: 'blur(20px)',
                          position: 'relative',
                          overflow: 'hidden',
                          textAlign: 'center',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(145deg, #0ea968, #047857)';
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 12px 40px rgba(16, 185, 129, 0.35)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(145deg, #10b981, #059669)';
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.25)';
                        }}
                      >
                        {loadingExcel ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ 
                              width: '16px', 
                              height: '16px', 
                              border: '2px solid rgba(255,255,255,0.3)', 
                              borderTop: '2px solid white', 
                              borderRadius: '50%', 
                              animation: 'spin 1s linear infinite' 
                            }}></span>
                            Đang xử lý...
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14,2 14,8 20,8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                              <polyline points="10,9 9,9 8,9"/>
                            </svg>
                            Nhập điểm từ Excel
                          </span>
                        )}
                      </label>

                      <ExcelUpload
                        onSemestersImport={(importedSemesters) => {
                          setSemesters([...semesters, ...importedSemesters]);
                        }}
                        setLoading={setLoadingExcel}
                        setError={setExcelError}
                      />
                    </>
                  )}
                </div>
                
                <ExcelExport semesters={semesters} />
              </div>
            </div>

            {(pdfError || excelError) && (
              <p style={{ color: "red" }}>
                {pdfError || excelError}
              </p>
            )}

            <div className="table-wrapper">
              <LazyGradeTable
                semesters={semesters}
                setSemesters={setSemesters}
                cumulativeExpected={cumulativeExpected}
                setCumulativeExpected={setCumulativeExpected}
                isCumulativeManual={isCumulativeManual}
                setIsCumulativeManual={setIsCumulativeManual}
                gpaScale={gpaScale}
                updateSubjectField={updateSubjectField}
                updateSubjectExpectedScore={updateSubjectExpectedScore} 
                deleteSemester={deleteSemester}
                deleteSubject={deleteSubject}
                openAdvancedModal={openAdvancedModal}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                semesterMenuOpen={semesterMenuOpen}
                setSemesterMenuOpen={setSemesterMenuOpen}
                addDropdownOpen={addDropdownOpen}
                setAddDropdownOpen={setAddDropdownOpen}
                addSearchTerm={addSearchTerm}
                setAddSearchTerm={setAddSearchTerm}
                addSearchResults={addSearchResults}
                addExpandedCategories={addExpandedCategories}
                setAddExpandedCategories={setAddExpandedCategories}
                editDropdownOpen={editDropdownOpen}
                setEditDropdownOpen={setEditDropdownOpen}
                editSearchTerm={editSearchTerm}
                setEditSearchTerm={setEditSearchTerm}
                editSearchResults={editSearchResults}
                editExpandedCategories={editExpandedCategories}
                setEditExpandedCategories={setEditExpandedCategories}
              />
            </div>
          </>
        )}

        {activeTab === 'instructions' && <LazyInstructions />}
        
        {activeTab === 'add_subject' && (
          <LazyAddSubjectForm 
            onAdd={(newSubject) => {
              setSemesters(prev => {
                const next = [...prev];
                if (next.length === 0) {
                  next.push({ id: `sem-${self.crypto.randomUUID()}`, name: "Học kỳ 1", subjects: [newSubject] });
                } else {
                  next[next.length - 1].subjects.push(newSubject);
                }
                return next;
              });
              setActiveTab("grades");
            }}
          />
        )}

        {modalOpen && editing && (
        <LazyEditModal
            editing={editing}
            semesters={semesters}
            setSemesters={setSemesters}
            onClose={() => {
              setModalOpen(false);
              setEditing(null);
              setBackupSubject(null);
            }}
            backupSubject={backupSubject}
            gpaScale={gpaScale}
            subjectsData={SUBJECTS_DATA}
          />
        )}
      </div>

      <Footer />
    </div>
    </>
  );
}
