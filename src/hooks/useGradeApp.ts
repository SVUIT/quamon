import { useState, useEffect } from "react";
import type { Semester, Subject } from "../types";
import { getSearchResults, normalizeScore } from "../utils/gradeUtils";
import { SUBJECTS_DATA } from "../constants";

const LOCAL_STORAGE_KEY = "grade_app_semesters";
const THEME_KEY = "grade_app_theme";

// Helper to generate unique IDs
const generateId = (prefix = "sem") =>
  `${prefix}-${typeof crypto !== "undefined" ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)}`;

// Default empty subject
const createEmptySubject = (): Subject => ({
  id: generateId("sub"),
  courseCode: "",
  courseName: "",
  credits: "",
  progressScore: "",
  midtermScore: "",
  practiceScore: "",
  finalScore: "",
  minProgressScore: "",
  minMidtermScore: "",
  minPracticeScore: "",
  minFinalScore: "",
  progressWeight: "20",
  midtermWeight: "20",
  practiceWeight: "20",
  finalWeight: "40",
  score: "",
  expectedScore: "",
});

export const useGradeApp = () => {
  // ✅ Lazy initializer ensures SSR safety
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(THEME_KEY);
      return saved === "dark" ? "dark" : "light";
    }
    return "light";
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // ✅ Safe side-effect
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_KEY, theme);
      document.body.className = theme === "light" ? "light-mode" : "";
    }
  }, [theme]);

  // ✅ Safe initialization of semesters
  const [semesters, setSemesters] = useState<Semester[]>(() => {
    if (typeof window === "undefined") {
      // SSR fallback
      return [
        {
          id: generateId("sem"),
          name: "Học kỳ 1",
          subjects: [createEmptySubject()],
        },
      ];
    }

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((s: any) => ({
          ...s,
          id: s.id || generateId("sem"),
          subjects: s.subjects.map((sub: any) =>
            sub.maHP !== undefined
              ? {
                  id: sub.id || generateId("sub"),
                  courseCode: sub.maHP,
                  courseName: sub.tenHP,
                  credits: sub.tinChi,
                  progressScore: sub.diemQT,
                  midtermScore: sub.diemGK,
                  practiceScore: sub.diemTH,
                  finalScore: sub.diemCK,
                  minProgressScore: sub.min_diemQT || "",
                  minMidtermScore: sub.min_diemGK || "",
                  minPracticeScore: sub.min_diemTH || "",
                  minFinalScore: sub.min_diemCK || "",
                  progressWeight: sub.weight_diemQT || "20",
                  midtermWeight: sub.weight_diemGK || "20",
                  practiceWeight: sub.weight_diemTH || "20",
                  finalWeight: sub.weight_diemCK || "40",
                  score: sub.diemHP,
                  expectedScore: sub.expectedScore,
                }
              : { ...sub, id: sub.id || generateId("sub") }
          ),
        }));
      }
    } catch (error) {
      console.error("Error reading from local storage:", error);
    }

    return [
      {
        id: generateId("sem"),
        name: "Học kỳ 1",
        subjects: [createEmptySubject()],
      },
    ];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(semesters));
    }
  }, [semesters]);

  // ====== UI States ======
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<{ semesterIdx: number; subjectIdx: number } | null>(null);
  const [backupSubject, setBackupSubject] = useState<Subject | null>(null);
  const [openMenu, setOpenMenu] = useState<{ s: number; i: number } | null>(null);
  const [semesterMenuOpen, setSemesterMenuOpen] = useState<number | null>(null);
  const [addDropdownOpen, setAddDropdownOpen] = useState<number | null>(null);
  const [addSearchTerm, setAddSearchTerm] = useState("");
  const [addExpandedCategories, setAddExpandedCategories] = useState<Set<string>>(new Set());
  const [editDropdownOpen, setEditDropdownOpen] = useState<{ s: number; i: number; field: string } | null>(null);
  const [editSearchTerm, setEditSearchTerm] = useState("");
  const [editExpandedCategories, setEditExpandedCategories] = useState<Set<string>>(new Set());

  const deleteSemester = (id: string) => {
    setSemesters((prev) => prev.filter((s) => s.id !== id));
  };

  const deleteSubject = (sIdx: number, subIdx: number) => {
    setSemesters((prev) => {
      const updated = [...prev];
      const sem = updated[sIdx];
      if (sem) {
        updated[sIdx] = {
          ...sem,
          subjects: sem.subjects.filter((_, i) => i !== subIdx),
        };
      }
      return updated;
    });
  };

  const openAdvancedModal = (s: number, i: number) => {
    setBackupSubject(JSON.parse(JSON.stringify(semesters[s].subjects[i])));
    setEditing({ semesterIdx: s, subjectIdx: i });
    setModalOpen(true);
  };

  const updateSubjectField = (sIdx: number, subIdx: number, field: string, value: string) => {
    setSemesters((prev) => {
      const updated = [...prev];
      const sem = updated[sIdx];
      if (!sem) return prev;

      const subs = [...sem.subjects];
      const sub = subs[subIdx];
      if (!sub) return prev;

      const isScoreField = ["progressScore", "midtermScore", "practiceScore", "finalScore"].includes(field);
      const newValue = isScoreField ? normalizeScore(value) : value;

      subs[subIdx] = { ...sub, [field]: newValue };
      updated[sIdx] = { ...sem, subjects: subs };
      return updated;
    });
  };

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
