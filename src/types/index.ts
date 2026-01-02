export interface Course {
  courseCode: string;
  courseNameEn: string;
  courseNameVi: string;
  courseType: string;
  credits: number;
  defaultWeights: {
    progressWeight: number;
    practiceWeight: number;
    midtermWeight: number;
    finalTermWeight: number;
  };
}

/* ================== PDF PROCESSING TYPES ================== */
export interface PdfCourse {
  courseCode: string;
  courseNameVi: string;
  credits: number;
  scores?: {
    progressScore?: number;
    practiceScore?: number;
    midtermScore?: number;
    finaltermScore?: number;
    totalScore?: number;
  };
}

export interface PdfSemester {
  semesterName: string;
  courses: PdfCourse[];
}

export interface ProcessedPdfData {
  semesters: PdfSemester[];
}
/* ========================================================== */

export interface Subject {
  id?: string;
  courseCode: string;
  courseName: string;
  credits: string;

  // Scores
  progressScore: string;
  practiceScore: string;
  midtermScore: string;
  finalScore: string;

  // Weights
  progressWeight: string;
  practiceWeight: string;
  midtermWeight: string;
  finalWeight: string;

  score: string;
  expectedScore: string;
  isExpectedManual?: boolean;
  [key: string]: any;
}

// Helper function to find course by code
export function findCourseByCode(courseCode: string, coursesData: any[]): any | undefined {
  return coursesData.find(course => course.courseCode === courseCode);
}

export interface Semester {
  id?: string;
  name: string;
  subjects: Subject[];
  expectedAverage?: string;
  isExpectedAverageManual?: boolean;
}