import React from "react";
import type { Semester, Course } from "../../types";
import { calcSemesterAverage, calcRequiredScores, calculateTargetCourseGpa, isSubjectComplete, calcSubjectScore } from "../../utils/gradeUtils";
import SearchDropdown from "./SearchDropdown";
import SubjectRow from "./SubjectRow";

interface SemesterBlockProps {
  semester: Semester;
  semesterIndex: number;
  semesters: Semester[];
  setSemesters: (semesters: Semester[] | ((prev: Semester[]) => Semester[])) => void;

  // Handlers for subjects
  updateSubjectField: (s: number, i: number, f: string, v: string) => void;
  deleteSemester: (id: string) => void;
  deleteSubject: (s: number, i: number) => void;
  openAdvancedModal: (s: number, i: number) => void;

  // Menu States
  semesterMenuOpen?: number | null;
  setSemesterMenuOpen?: (val: number | null) => void;

  // Add Dropdown State
  addDropdownOpen: number | null;
  setAddDropdownOpen: (val: number | null) => void;
  addSearchTerm: string;
  setAddSearchTerm: (term: string) => void;
  addSearchResults: { category: string; subjects: Course[] }[];
  addExpandedCategories: Set<string>;
  setAddExpandedCategories: (cats: Set<string>) => void;

  // Passthrough for SubjectRow
  openMenu: { s: number; i: number } | null;
  setOpenMenu: (val: { s: number; i: number } | null) => void;
  editDropdownOpen: { s: number; i: number; field: string } | null;
  setEditDropdownOpen: (
    val: { s: number; i: number; field: string } | null
  ) => void;
  editSearchTerm: string;
  setEditSearchTerm: (term: string) => void;
  editSearchResults: { category: string; subjects: Course[] }[];
  editExpandedCategories: Set<string>;
  setEditExpandedCategories: (cats: Set<string>) => void;
}

const SemesterBlock: React.FC<SemesterBlockProps> = ({
  semester: sem,
  semesterIndex: si,
  semesters,
  setSemesters,
  updateSubjectField,
  deleteSemester,
  deleteSubject,
  openAdvancedModal,
  addDropdownOpen,
  setAddDropdownOpen,
  addSearchTerm,
  setAddSearchTerm,
  addSearchResults,
  addExpandedCategories,
  setAddExpandedCategories,
  openMenu,
  setOpenMenu,
  editDropdownOpen,
  setEditDropdownOpen,
  editSearchTerm,
  setEditSearchTerm,
  editSearchResults,
  editExpandedCategories,
  setEditExpandedCategories,
}) => {
  const avg = calcSemesterAverage(sem.subjects);

  return (
    <React.Fragment>
      {/* HÀNG HỌC KỲ */}
      <tr>
        <td className="semester-bg"></td>
        <td colSpan={9} className="semester-title semester-header-td">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              tabIndex={0}
              aria-label="Tên học kỳ"
              className="editable-cell-multiline"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              onBlur={(e) => {
                const newName = e.currentTarget.textContent || "";
                setSemesters((prev) => {
                  const updated = [...prev];
                  if (updated[si]) {
                      updated[si].name = newName;
                  }
                  return updated;
                });
              }}
            >
              {sem.name}
            </span>

            {/* Nút Thêm Môn */}
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <button
              type="button"
              className="btn-header-action btn-add"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setAddDropdownOpen(addDropdownOpen === si ? null : si);
              }}
              style={{ position: "relative" }}
            >
              + Thêm môn
              </button>
              {/* DROPDOWN THÊM MÔN */}
              {addDropdownOpen === si && (
                <SearchDropdown
                  searchTerm={addSearchTerm}
                  setSearchTerm={setAddSearchTerm}
                  searchResults={addSearchResults}
                  expandedCategories={addExpandedCategories}
                  setExpandedCategories={setAddExpandedCategories}
                  minWidth={260}
                  onSelect={(course: Course) => {
                    setSemesters((prev) => {
                      const updated = JSON.parse(JSON.stringify(prev));
                      if (updated[si]) {
                          const wQT = course.defaultWeights?.progressWeight !== undefined ? (course.defaultWeights.progressWeight * 100).toString() : "20";
                          const wGK = course.defaultWeights?.midtermWeight !== undefined ? (course.defaultWeights.midtermWeight * 100).toString() : "20";
                          const wTH = course.defaultWeights?.practiceWeight !== undefined ? (course.defaultWeights.practiceWeight * 100).toString() : "20";
                          const wCK = course.defaultWeights?.finalTermWeight !== undefined ? (course.defaultWeights.finalTermWeight * 100).toString() : "40";

                          updated[si].subjects.push({
                              id: `sub-${self.crypto.randomUUID()}`,
                              courseCode: course.courseCode,
                              courseName: course.courseNameVi,
                              credits: course.credits !== undefined ? course.credits.toString() : "",
                              progressScore: "",
                              midtermScore: "",
                              practiceScore: "",
                              finalScore: "",
                              minProgressScore: "",
                              minMidtermScore: "",
                              minPracticeScore: "",
                              minFinalScore: "",
                              progressWeight: wQT,
                              midtermWeight: wGK,
                              practiceWeight: wTH,
                              finalWeight: wCK,
                              score: "",
                              expectedScore: "",
                          });
                      }
                      return updated;
                    });
                    setAddDropdownOpen(null);
                    setAddSearchTerm("");
                    setAddExpandedCategories(new Set());
                  }}
                />
              )}
            </div>

            {/* Nút Xóa Học Kỳ */}
            <button
              type="button"
              className="btn-header-action btn-delete"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (sem.id) {
                    deleteSemester(sem.id);
                }
              }}
              title="Xóa học kỳ này"
            >
              Xóa
            </button>
          </div>
        </td>
      </tr>

      {/* MÔN HỌC */}
      {sem.subjects.map((sub, i) => (
        <SubjectRow
          key={sub.id || i}
          semesterIndex={si}
          subjectIndex={i}
          subject={sub}
          semesters={semesters}
          setSemesters={setSemesters}
          updateSubjectField={updateSubjectField}
          deleteSubject={deleteSubject}
          openAdvancedModal={openAdvancedModal}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          editDropdownOpen={editDropdownOpen}
          setEditDropdownOpen={setEditDropdownOpen}
          editSearchTerm={editSearchTerm}
          setEditSearchTerm={setEditSearchTerm}
          editSearchResults={editSearchResults}
          editExpandedCategories={editExpandedCategories}
          setEditExpandedCategories={setEditExpandedCategories}
        />
      ))}

      {/* TRUNG BÌNH HỌC KỲ */}
      <tr style={{ background: "transparent", fontWeight: "bold" }}>
        <td className="semester-bg"></td>
        <td colSpan={2} className="summary-label">Trung bình học kỳ</td>
        <td style={{ textAlign: "center" }}>{avg.tc}</td>
        {/* Empty cells for QT, GK, TH, CK to show grid lines */}
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td style={{ textAlign: "center" }}>{avg.avg}</td>
        <td>
          <div
            contentEditable
            suppressContentEditableWarning
            data-placeholder={"Nhập điểm kỳ vọng học kỳ"}
            className="editable-cell expected-score-cell"
            role="textbox"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            onBlur={(e) => {
              const text = e.currentTarget.textContent?.trim() || "";
              
              setSemesters((prev) => {
                const updated = JSON.parse(JSON.stringify(prev));
                const targetSemester = updated[si];
                if (!targetSemester) return prev;
                
                targetSemester.expectedAverage = text;

                if (text === "") return updated;
                const semesterTargetGpa = Number(text);
                if (isNaN(semesterTargetGpa)) return updated;

                // Prepare data for calculation
                const subjectData = targetSemester.subjects.map((sub: any) => {
                  const credits = Number(sub.credits) || 0;
                  const isComplete = isSubjectComplete(sub);

                  // If complete, use the calculated score. If not, it's a variable.
                  let currentGpa: number | null = null;
                  if (isComplete) {
                    const scoreStr = calcSubjectScore(sub);
                    if (scoreStr && scoreStr !== "") {
                      currentGpa = Number(scoreStr);
                    }
                  }

                  return { credits, currentGpa, originalSubject: sub };
                });

                const { requiredGpaForRemaining } = calculateTargetCourseGpa(semesterTargetGpa, subjectData);

                // Apply the calculated target GPA to incomplete subjects
                targetSemester.subjects.forEach((sub: any) => {
                  if (!sub) return;
                  const isComplete = isSubjectComplete(sub);

                  if (!isComplete) {
                     // If feasible, use the calculated requirement.
                     // If not feasible (e.g. > 10), we still set it so user sees the impossible number.
                     const targetScore = requiredGpaForRemaining;

                     // Format to 2 decimal places for display
                     sub.expectedScore = targetScore.toFixed(2);

                     // Calculate required component scores based on this new target
                     const required = calcRequiredScores(sub, targetScore);
                     Object.entries(required).forEach(([field, value]) => {
                       (sub as any)[field] = value;
                     });
                  }
                });

                return updated;
              });
            }}
          >
            {sem.expectedAverage}
          </div>
        </td>
      </tr>
    </React.Fragment>
  );
};

export default SemesterBlock;