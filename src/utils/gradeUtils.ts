import type { Subject, Course, GpaScale } from "../types";

// ================== GPA CONVERSION UTILITIES ==================
export const convertGpaScale = (value: number, fromScale: GpaScale, toScale: GpaScale): number => {
  if (fromScale === toScale) return value;
  
  // First convert to 10-point scale as base
  let base10Value: number;
  
  switch (fromScale) {
    case "10":
      base10Value = value;
      break;
    case "4":
      base10Value = value * 2.5; // 4.0 * 2.5 = 10.0
      break;
    case "100":
      base10Value = value / 10; // 100 / 10 = 10.0
      break;
    default:
      base10Value = value;
  }
  
  // Then convert from 10-point scale to target scale
  switch (toScale) {
    case "10":
      return base10Value;
    case "4":
      return base10Value / 2.5;
    case "100":
      return base10Value * 10;
    default:
      return base10Value;
  }
};

export const formatGpaDisplay = (value: number, scale: GpaScale): string => {
  switch (scale) {
    case "10":
      return value.toFixed(2);
    case "4":
      return value.toFixed(2);
    case "100":
      return Math.round(value).toString();
    default:
      return value.toFixed(2);
  }
};

export const getMaxScoreForScale = (scale: GpaScale): number => {
  switch (scale) {
    case "10":
      return 10;
    case "4":
      return 4;
    case "100":
      return 100;
    default:
      return 10;
  }
};

export const validateScoreForScale = (value: number, scale: GpaScale): boolean => {
  const maxScore = getMaxScoreForScale(scale);
  return value >= 0 && value <= maxScore;
};

// ================== CHECK EXEMPT COURSE =======================
export const isExemptCourse = (subject: Subject): boolean => {
  // Check if course name contains "Mien" (case insensitive)
  const courseName = subject.courseName?.toLowerCase() || "";
  const courseCode = subject.courseCode?.toLowerCase() || "";
  
  // Check for "mien" in name or code
  if (courseName.includes("mien") || courseCode.includes("mien")) {
    return true;
  }
  
  // Check for specific exempt English courses
  const exemptEnglishCourses = ["eng01", "eng02", "eng03", "eng04", "eng05"];
  if (exemptEnglishCourses.includes(courseCode)) {
    return true;
  }
  
  return false;
};

// ================== DISPLAY TEXT FOR EXEMPT COURSES ============
export const getScoreDisplayText = (subject: Subject, scoreField: string): string => {
  if (isExemptCourse(subject)) {
    return "Miễn";
  }
  return (subject as any)[scoreField] || "";
};

// ================== AUTO CALCULATE - ĐIỂM HP =================
export const calcSubjectScore = (subj: Partial<Subject>, scale: GpaScale = "10"): string => {
  // If this is a Mien subject, set score to 0
  if (isExemptCourse(subj as Subject)) {
    return "0";
  }

  const scores = [
    Number(subj.progressScore) || 0,
    Number(subj.midtermScore) || 0,
    Number(subj.practiceScore) || 0,
    Number(subj.finalScore) || 0,
  ];

  // Get weights and convert to numbers, handling both percentage (e.g., 20) and decimal (e.g., 0.2) formats
  const weights = [
    Number(subj.progressWeight) || 0,
    Number(subj.midtermWeight) || 0,
    Number(subj.practiceWeight) || 0,
    Number(subj.finalWeight) || 0,
  ];

  // Check if weights are in percentage format (sum ~100) or decimal format (sum ~1)
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const isPercentageFormat = totalWeight > 1; // If sum is greater than 1, assume it's in percentage format
  
  // Convert weights to decimal if they're in percentage format
  const decimalWeights = isPercentageFormat 
    ? weights.map(w => w / 100)
    : weights;

  const hasScores = scores.some(score => score > 0);

  // Only check weight sum if there are actual scores to calculate
  if (hasScores) {
    const expectedTotal = isPercentageFormat ? 100 : 1;
    if (Math.abs(totalWeight - expectedTotal) > 0.01) {
      return "Sai %";
    }
  }

  // If no scores are entered, return empty string instead of 0
  if (!hasScores) {
    return "";
  }

  // Use the decimal weights for calculation (always calculate in 10-point scale first)
  const total =
    scores[0] * decimalWeights[0] +
    scores[1] * decimalWeights[1] +
    scores[2] * decimalWeights[2] +
    scores[3] * decimalWeights[3];

  // Convert from 10-point scale to target scale if needed
  const convertedTotal = convertGpaScale(total, "10", scale);
  
  return formatGpaDisplay(convertedTotal, scale);
};


export const calcSemesterAverage = (subjects: Subject[], scale: GpaScale = "10") => {
  let totalTC = 0;
  let totalScore = 0;

  subjects.forEach((sub) => {
    // Skip exempt courses from GPA calculation
    if (isExemptCourse(sub)) {
      return;
    }

    const hp = Number(calcSubjectScore(sub, scale));
    const tc = Number(sub.credits);
    if (!isNaN(hp) && !isNaN(tc)) {
      totalTC += tc;
      totalScore += hp * tc;
    }
  });

  if (totalTC === 0) return { tc: 0, avg: 0 };
  return { tc: totalTC, avg: convertGpaScale(totalScore / totalTC, "10", scale).toFixed(2) };
};

// ================== VALIDATE SCORE INPUT ======================
export const normalizeScore = (value: string, scale: GpaScale = "10"): string => {
  const trimmed = value.trim();

  
  if (trimmed === "") return "";

  let num = Number(trimmed);

  if (isNaN(num)) return "";
  
  const maxScore = getMaxScoreForScale(scale);
  if (num < 0) num = 0; 
  if (num > maxScore) num = maxScore; 

  
  return parseFloat(num.toFixed(2)).toString();
};

export const calcRequiredScores = (subj: Subject, expected: number, scale: GpaScale = "10"): Partial<Subject> => {
  const fields: (keyof Subject)[] = ["progressScore", "midtermScore", "practiceScore", "finalScore"];
  const weightFields: (keyof Subject)[] = ["progressWeight", "midtermWeight", "practiceWeight", "finalWeight"];
  const minFields: (keyof Subject)[] = ["minProgressScore", "minMidtermScore", "minPracticeScore", "minFinalScore"];

  let currentSum = 0;
  let missingWeight = 0;
  const missingFields: string[] = [];
  const missingMinFields: string[] = [];

  // Convert expected score to 10-point scale for calculation
  const expectedIn10Scale = convertGpaScale(expected, scale, "10");

  fields.forEach((f, idx) => {
    const raw = subj[f] as string;
    const score = Number(raw);
    const weightVal = Number(subj[weightFields[idx]]) || 0;
    const w = weightVal / 100;

    if (raw.trim() !== "" && !isNaN(score)) {
      // Convert current score to 10-point scale for calculation
      const scoreIn10Scale = convertGpaScale(score, scale, "10");
      currentSum += scoreIn10Scale * w; 
    } else if (weightVal > 0) {
      missingWeight += w; 
      missingFields.push(f as string);
      missingMinFields.push(minFields[idx] as string);
    }
  });

  if (missingWeight <= 0) return {}; 

  // Calculate needed score in 10-point scale
  const needIn10Scale = (expectedIn10Scale - currentSum) / missingWeight;
  
  // Convert back to target scale
  const maxScore = getMaxScoreForScale(scale);
  const needInTargetScale = convertGpaScale(needIn10Scale, "10", scale);
  const valid = Math.max(0, Math.min(maxScore, needInTargetScale));

  const result: Partial<Subject> = {};
  missingMinFields.forEach((f) => {
    (result as any)[f] = valid.toFixed(2);
  });

  return result;
};


export const isSubjectComplete = (subj: Subject): boolean => {
  const fields: (keyof Subject)[] = ["progressScore", "midtermScore", "practiceScore", "finalScore"];
  const weightFields: (keyof Subject)[] = ["progressWeight", "midtermWeight", "practiceWeight", "finalWeight"];

  for (let i = 0; i < fields.length; i++) {
    const weight = Number(subj[weightFields[i]]) || 0;
    
    if (weight > 0) {
      const val = subj[fields[i]];
      if (val === undefined || val.toString().trim() === "") {
        return false;
      }
    }
  }
  return true;
};


export const hasAllScores = (subj: Subject): boolean => {
  return isSubjectComplete(subj);
};

// ================== CALCULATE TARGET COURSE GPA =================
export const calculateTargetCourseGpa = (
  expectedSemesterGpa: number,
  subjects: { credits: number; currentGpa?: number | null }[],
  scale: GpaScale = "10"
): {
  requiredGpaForRemaining: number;
  isFeasible: boolean;
  totalCredits: number;
  accumulatedScore: number;
  remainingCredits: number;
} => {
  let totalCredits = 0;
  let accumulatedScore = 0;
  let remainingCredits = 0;

  subjects.forEach((sub) => {
    totalCredits += sub.credits;
    if (sub.currentGpa !== null && sub.currentGpa !== undefined) {
      accumulatedScore += sub.currentGpa * sub.credits;
    } else {
      remainingCredits += sub.credits;
    }
  });

  if (totalCredits === 0) {
    return {
      requiredGpaForRemaining: 0,
      isFeasible: true,
      totalCredits: 0,
      accumulatedScore: 0,
      remainingCredits: 0,
    };
  }

  const targetTotalScore = expectedSemesterGpa * totalCredits;
  const remainingScoreNeeded = targetTotalScore - accumulatedScore;

  if (remainingCredits === 0) {
    const currentGpa = accumulatedScore / totalCredits;
    return {
      requiredGpaForRemaining: 0,
      isFeasible: currentGpa >= expectedSemesterGpa - 0.001,
      totalCredits,
      accumulatedScore,
      remainingCredits,
    };
  }

  const requiredGpaForRemaining = remainingScoreNeeded / remainingCredits;
  const maxScore = getMaxScoreForScale(scale);

  return {
    requiredGpaForRemaining,
    isFeasible: requiredGpaForRemaining <= maxScore,
    totalCredits,
    accumulatedScore,
    remainingCredits,
  };
};

// ================== SEARCH HELPER =================
export const getSearchResults = (searchTerm: string, data: Record<string, Course[]>) => {
  if (!searchTerm.trim()) {
    return Object.entries(data).map(([cat, subs]) => ({
      category: cat,
      subjects: subs,
    }));
  }

  const query = searchTerm.toLowerCase();
  const results: { category: string; subjects: Course[] }[] = [];

  Object.entries(data).forEach(([category, subjects]) => {
    const filtered = subjects.filter(
      (s) => s.courseCode.toLowerCase().includes(query) || s.courseNameVi.toLowerCase().includes(query)
    );
    if (filtered.length > 0) {
      results.push({ category, subjects: filtered });
    }
  });

  return results;
};