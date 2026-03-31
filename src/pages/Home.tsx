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
import GpaScaleSelector from "../components/GpaScaleSelector/GpaScaleSelector";
import { LazyGradeTable, LazyAddSubjectForm, LazyInstructions, LazyEditModal } from "../components/LazyComponents";

// Lazy load Excel components
const ExcelExport = dynamic(
  () => import("../components/ExcelExport/ExcelExport").then(mod => ({ default: mod.ExcelExport })),
  { ssr: false, loading: () => <div>Đang tải...</div> }
);

const ExcelUpload = dynamic(
  () => import("../components/ExcelUpload/ExcelUpload").then(mod => ({ default: mod.ExcelUpload })),
  { ssr: false, loading: () => <div>Đang tải...</div> }
);

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
    setGpaScale,
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
  } = useGradeApp(SUBJECTS_DATA);
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
            // Find course in our database to get default weights
            const courseData = findCourseByCode(c.courseCode, allCourses);
            const defaultWeights = courseData?.defaultWeights || {
              progressWeight: 0.2,
              practiceWeight: 0.2,
              midtermWeight: 0.2,
              finalTermWeight: 0.4
            };

            // Create temporary subject object for exempt course check
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

              // Set scores from PDF, but set to 0 for exempt courses
              progressScore: isExempt ? "0" : (c.scores?.progressScore?.toString() || ""),
              practiceScore: isExempt ? "0" : (c.scores?.practiceScore?.toString() || ""),
              midtermScore: isExempt ? "0" : (c.scores?.midtermScore?.toString() || ""),
              finalScore: isExempt ? "0" : (c.scores?.finaltermScore?.toString() || ""),

              // Set weights from course data or use defaults
              progressWeight: (defaultWeights.progressWeight * 100).toString(),
              practiceWeight: (defaultWeights.practiceWeight * 100).toString(),
              midtermWeight: (defaultWeights.midtermWeight * 100).toString(),
              finalWeight: (defaultWeights.finalTermWeight * 100).toString(),

              // Set total score to 0 for exempt courses
              score: isExempt ? "0" : (c.scores?.totalScore?.toString() || ""),
              expectedScore: "", // Always empty for PDF import
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
  /* ================================================ */

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
              
              {/* GPA Scale Selector */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                <GpaScaleSelector
                  currentScale={gpaScale}
                  onScaleChange={setGpaScale}
                />
              </div>
              
              <div className="button-group" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px', marginBottom: '10px', alignItems: 'stretch' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <select
                    value={importType}
                    onChange={(e) => setImportType(e.target.value as "pdf" | "excel")}
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
