import { useState, useEffect } from 'react';
import type { Course } from '../types';

interface CoursesData {
  SUBJECTS_DATA: Record<string, Course[]>;
  loading: boolean;
  error: string | null;
}

export const useCoursesData = (): CoursesData => {
  const [data, setData] = useState<CoursesData>({
    SUBJECTS_DATA: {},
    loading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    const loadCoursesData = async () => {
      try {
        // Dynamically import the large JSON file
        const coursesModule = await import('../assets/courses_weighted.json');
        const courses = coursesModule.default as Course[];

        const CATEGORY_MAP: Record<string, string> = {
          "ĐC": "Đại cương",
          "CSNN": "Cơ sở ngành (CSN)",
          "CSN": "Cơ sở ngành (CSN)",
          "CN": "Chuyên ngành (CN/CNTC)",
          "CNTC": "Chuyên ngành (CN/CNTC)",
          "TN": "Khác (Tự chọn/CĐTN/TN)",
          "CĐTN": "Khác (Tự chọn/CĐTN/TN)",
        };

        const subjectsData = courses.reduce((acc, course) => {
          const cat = CATEGORY_MAP[course.courseType] || "Khác (Tự chọn/CĐTN/TN)";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(course);
          return acc;
        }, {} as Record<string, Course[]>);

        if (isMounted) {
          setData({
            SUBJECTS_DATA: subjectsData,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        if (isMounted) {
          setData({
            SUBJECTS_DATA: {},
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load courses data'
          });
        }
      }
    };

    loadCoursesData();

    return () => {
      isMounted = false;
    };
  }, []);

  return data;
};
