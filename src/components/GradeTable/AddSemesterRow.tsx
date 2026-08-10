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
            padding: "8px 16px",
            borderRadius: "6px",
            background: "rgba(37, 99, 235, 0.15)",
            color: "#2563eb",
            border: "1px solid rgba(37, 99, 235, 0.4)",
            fontWeight: "700",
            cursor: "pointer"
          }}
        >
          + Thêm học kỳ
        </button>
      </td>
    </tr>
  );
};

export default AddSemesterRow;
