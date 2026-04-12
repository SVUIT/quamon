export interface GraduationFormState {
  creditsDC: string;
  creditsCSN: string;
  creditsCN: string;
  creditsKHAC: string;

  englishType: string;
  englishScore: string;
  toeicLR: string;
  toeicSW: string;

  completedPhysicalEducation: boolean;
  completedMilitaryTraining: boolean;
}

export interface GraduationResultData {
  eligible: boolean;
  missingCredits: string[];
  englishPassed: boolean;
  englishMsg: string;
  generalIssues: string[];
  totalCredits: number;
}
