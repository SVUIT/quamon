import React from "react";
import type { Semester } from "../../types";

interface AddSemesterRowProps {
  semesters: Semester[];
  setSemesters: (semesters: Semester[] | ((prev: Semester[]) => Semester[])) => void;
}

const AddSemesterRow: React.FC<AddSemesterRowProps> = ({
  semesters,
  setSemesters,
}) => {
  return (
    <tr style={{ background: "transparent" }}>
      <td className="semester-bg"></td>
      <td colSpan={9} style={{ textAlign: "left", padding: 10 }}>
        <button
          onClick={() => {
            const newId = `sem-${self.crypto.randomUUID()}`;
            const newSubId = `sub-${self.crypto.randomUUID()}`;
            
            if (typeof setSemesters === 'function') {
                setSemesters([
                  ...semesters,
                  {
                    id: newId,
                    name: "Nhập tên học kỳ",
                    semesterName: `Học kỳ ${semesters.length + 1}`,
                    year: "2024-2025", // Default year, can be made dynamic
                    subjects: [
                      {
                        id: newSubId,
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
                      },
                    ],
                  },
                ]);
            }
          }}
          style={{
            background: "transparent",
            color: "var(--primary-purple)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "bold",
            padding: "8px 16px",
            borderRadius: "4px",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 3.33334V12.6667M3.33333 8H12.6667"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Thêm học kỳ
        </button>
      </td>
    </tr>
  );
};

export default AddSemesterRow;
