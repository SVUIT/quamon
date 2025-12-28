import { useState, useEffect } from "react";
import type { Semester, Subject } from "../types";
import { getSearchResults, normalizeScore } from "../utils/gradeUtils";
import { SUBJECTS_DATA } from "../constants";

const LOCAL_STORAGE_KEY = "grade_app_semesters";
const THEME_KEY = "grade_app_theme";

const generateId = (prefix = "sem") =>
  `${prefix}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

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

/* ===================== HOOK ===================== */

export const useGradeApp = () => {
  /* ========== THEME ========== */
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(THEME_KEY, theme);
    document.body.className = theme === "light" ? "light-mode" : "";
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  /* ========== SEMESTERS ========== */
  const [semesters, setSemesters] = useState<Semester[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);

        const migrated = parsed.map((s: any) => ({
          ...s,
          id: s.id || generateId("sem"),
          subjects: s.subjects.map((sub: any) => {
            if (sub.maHP !== undefined) {
              return {
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
              };
            }
            return { ...sub, id: sub.id || generateId("sub") };
          }),
        }));

        setSemesters(migrated);
        return;
      }
    } catch (e) {
      console.error("LocalStorage error:", e);
    }

    setSemesters([
      {
        id: generateId("sem"),
        name: "Học kỳ 1",
        subjects: [createEmptySubject()],
      },
    ]);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(semesters));
  }, [semesters]);

  /* ========== MODAL / EDIT ========== */
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<{
    semesterIdx: number;
    subjectIdx: number;
  } | null>(null);
  const [backupSubject, setBackupSubject] = useState<Subject | null>(null);

  const openAdvancedModal = (s: number, i: number) => {
    setBackupSubject(JSON.parse(JSON.stringify(semesters[s].subjects[i])));
    setEditing({ semesterIdx: s, subjectIdx: i });
    setModalOpen(true);
  };

  /* ========== DELETE ========== */
  const deleteSemester = (id: string) => {
    setSemesters((prev) => prev.filter((s) => s.id !== id));
  };

  const deleteSubject = (sIdx: number, subIdx: number) => {
    setSemesters((prev) => {
      const updated = [...prev];
      const sem = updated[sIdx];
      if (!sem) return prev;

      updated[sIdx] = {
        ...sem,
        subjects: sem.subjects.filter((_, i) => i !== subIdx),
      };
      return updated;
    });
  };

  /* ========== UPDATE FIELD ========== */
  const updateSubjectField = (
    sIdx: number,
    subIdx: number,
    field: string,
    value: string
  ) => {
    setSemesters((prev) => {
      const updated = [...prev];
      const sem = updated[sIdx];
      if (!sem) return prev;

      const subjects = [...sem.subjects];
      const subject = subjects[subIdx];
      if (!subject) return prev;

      const isScore = [
        "progressScore",
        "midtermScore",
        "practiceScore",
        "finalScore",
      ].includes(field);

      subjects[subIdx] = {
        ...subject,
        [field]: isScore ? normalizeScore(value) : value,
      };

      updated[sIdx] = { ...sem, subjects };
      return updated;
    });
  };

  /* ========== UI STATES ========== */
  const [openMenu, setOpenMenu] = useState<{ s: number; i: number } | null>(null);
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

  /* ========== EXPORT ========== */
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
