import { useState, useEffect } from "react";
import type { Semester, Subject } from "../types";
import { getSearchResults, normalizeScore } from "../utils/gradeUtils";
import { SUBJECTS_DATA } from "../constants";

const LOCAL_STORAGE_KEY = "grade_app_semesters";
const THEME_KEY = "grade_app_theme";

// Helper to generate unique ID
const generateId = (prefix = "sem") => `${prefix}-${self.crypto.randomUUID()}`;

export const useGradeApp = () => {
  // Theme State
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return (savedTheme as "light" | "dark") || "dark";
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.body.className = theme === "light" ? "light-mode" : "";
  }, [theme]);

  const [semesters, setSemesters] = useState<Semester[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migration: Ensure all semesters have IDs
        return parsed.map((s: Semester) => ({
          ...s,
          id: s.id || generateId()
        }));
      }
    } catch (error) {
      console.error("Error reading from local storage:", error);
    }
    
    // Default initial state
    return [
      {
        id: 'default-semester',
        name: "Học kỳ 1",
        isDefault: true,
        subjects: [
          {
            maHP: "",
            tenHP: "",
            tinChi: "",
            diemQT: "",
            diemGK: "",
            diemTH: "",
            diemCK: "",
            min_diemQT: "",
            min_diemGK: "",
            min_diemTH: "",
            min_diemCK: "",
            weight_diemQT: "20",
            weight_diemGK: "20",
            weight_diemTH: "20",
            weight_diemCK: "40",
            diemHP: "",
            expectedScore: "",
          },
        ],
      },
    ];
  });

  // Save to local storage whenever semesters changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(semesters));
  }, [semesters]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<{
    semesterIdx: number;
    subjectIdx: number;
  } | null>(null);
  const [backupSubject, setBackupSubject] = useState<Subject | null>(null);

  // ======================= DELETE SEMESTER ====================
  const deleteSemester = (id: string) => {
    setSemesters((prevSemesters) => prevSemesters.filter((s) => s.id !== id));
  };

  // ======================= DELETE SUBJECT =====================
  const deleteSubject = (sIdx: number, subIdx: number) => {
    setSemesters((prev) => {
      const updatedSemesters = [...prev];
      const targetSemester = updatedSemesters[sIdx];
      
      if (targetSemester) {
        // Create a new subjects array excluding the one at subIdx
        const updatedSubjects = targetSemester.subjects.filter((_, idx) => idx !== subIdx);
        
        updatedSemesters[sIdx] = {
          ...targetSemester,
          subjects: updatedSubjects
        };
      }
      
      return updatedSemesters;
    });
  };

  // ======================= OPEN POPUP EDIT ====================
  const openAdvancedModal = (s: number, i: number) => {
    // Deep copy for backup
    setBackupSubject(JSON.parse(JSON.stringify(semesters[s].subjects[i])));
    setEditing({ semesterIdx: s, subjectIdx: i });
    setModalOpen(true);
  };

  // ================== UPDATE ANY FIELD ========================
  const updateSubjectField = (
    sIdx: number,
    subIdx: number,
    field: string,
    value: string
  ) => {
    setSemesters((prev) => {
      // Clone the semesters array
      const updatedSemesters = [...prev];
      const targetSemester = updatedSemesters[sIdx];
      if (!targetSemester) return prev;

      // Clone the subjects array for the target semester
      const updatedSubjects = [...targetSemester.subjects];
      const targetSubject = updatedSubjects[subIdx];
      if (!targetSubject) return prev;

      // Logic for score normalization
      const isScoreField = ["diemQT", "diemGK", "diemTH", "diemCK"].includes(field);
      const newValue = isScoreField ? normalizeScore(value) : value;

      // Update the specific subject
      updatedSubjects[subIdx] = {
        ...targetSubject,
        [field]: newValue,
      };

      // Update the semester with the new subjects array
      updatedSemesters[sIdx] = {
        ...targetSemester,
        subjects: updatedSubjects,
      };

      return updatedSemesters;
    });
  };

  const [openMenu, setOpenMenu] = useState<{ s: number; i: number } | null>(
    null
  );
  
  // New state for Semester Menu - No longer strictly needed but kept for compatibility
  const [semesterMenuOpen, setSemesterMenuOpen] = useState<number | null>(null);

  const [addDropdownOpen, setAddDropdownOpen] = useState<number | null>(null);
  const [addSearchTerm, setAddSearchTerm] = useState("");
  const [addExpandedCategories, setAddExpandedCategories] = useState<
    Set<string>
  >(new Set());
  const [editDropdownOpen, setEditDropdownOpen] = useState<{
    s: number;
    i: number;
    field: string;
  } | null>(null);
  const [editSearchTerm, setEditSearchTerm] = useState("");
  const [editExpandedCategories, setEditExpandedCategories] = useState<
    Set<string>
  >(new Set());

  const addSearchResults = getSearchResults(addSearchTerm, SUBJECTS_DATA);
  const editSearchResults = getSearchResults(editSearchTerm, SUBJECTS_DATA);

  return {
    theme,
    toggleTheme,
    semesters,
    setSemesters,
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
  };
};