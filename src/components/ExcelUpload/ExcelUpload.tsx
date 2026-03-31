import { Semester, Subject } from '../../types';

interface ExcelUploadProps {
  onSemestersImport: (semesters: Semester[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const ExcelUpload = ({ onSemestersImport, setLoading, setError }: ExcelUploadProps) => {
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Dynamically import xlsx-populate only when needed
      const XlsxPopulate = (await import('xlsx-populate/browser/xlsx-populate')).default;
      
      const workbook = await XlsxPopulate.fromDataAsync(file);
      const sheet = workbook.sheet(0);
      
      // Find the used range by iterating through rows and columns
      let maxRow = 0;
      let maxCol = 0;
      
      // Check first 100 rows and 50 columns to find the used range
      for (let row = 1; row <= 100; row++) {
        for (let col = 1; col <= 50; col++) {
          const cellValue = sheet.cell(row, col).value();
          if (cellValue !== undefined && cellValue !== null && cellValue !== "") {
            maxRow = Math.max(maxRow, row);
            maxCol = Math.max(maxCol, col);
          }
        }
      }
      
      if (maxRow === 0) {
        throw new Error("File Excel trống hoặc không có dữ liệu");
      }

      const startRow = 1;
      const endRow = maxRow;
      const startCol = 1;
      const endCol = maxCol;

      // Read headers to determine column positions
      const headers: string[] = [];
      for (let col = startCol; col <= endCol; col++) {
        const headerValue = sheet.cell(startRow, col).value();
        headers.push(headerValue?.toString().toLowerCase().trim() || "");
      }

      // Find column indices
      const findColumnIndex = (headerName: string) => {
        return headers.findIndex(h => h.includes(headerName.toLowerCase()));
      };

      const semesterCol = findColumnIndex("học kỳ");
      const codeCol = findColumnIndex("mã hp");
      const nameCol = findColumnIndex("tên hp");
      const creditsCol = findColumnIndex("tc");
      const progressCol = findColumnIndex("qt");
      const midtermCol = findColumnIndex("gk");
      const practiceCol = findColumnIndex("th");
      const finalCol = findColumnIndex("ck");
      const scoreCol = findColumnIndex("điểm hp");
      const expectedCol = findColumnIndex("điểm kỳ vọng");

      if (semesterCol === -1 || codeCol === -1 || nameCol === -1) {
        throw new Error("File Excel không đúng định dạng. Thiếu các cột bắt buộc: Học kỳ, Mã HP, Tên HP");
      }

      const importedSemesters: Semester[] = [];
      let currentSemester: Semester | null = null;

      for (let row = startRow + 1; row <= endRow; row++) {
        const semesterName = sheet.cell(row, semesterCol + 1).value()?.toString().trim();
        
        if (!semesterName) continue;

        // Create new semester if different from current
        if (!currentSemester || currentSemester.name !== semesterName) {
          currentSemester = {
            id: `excel-sem-${Date.now()}-${importedSemesters.length}`,
            name: semesterName,
            subjects: []
          };
          importedSemesters.push(currentSemester);
        }

        // Extract subject data
        const courseCode = sheet.cell(row, codeCol + 1).value()?.toString().trim() || "";
        const courseName = sheet.cell(row, nameCol + 1).value()?.toString().trim() || "";
        const credits = sheet.cell(row, creditsCol + 1).value()?.toString() || "0";
        const progressScore = sheet.cell(row, progressCol + 1).value()?.toString() || "";
        const midtermScore = sheet.cell(row, midtermCol + 1).value()?.toString() || "";
        const practiceScore = sheet.cell(row, practiceCol + 1).value()?.toString() || "";
        const finalScore = sheet.cell(row, finalCol + 1).value()?.toString() || "";
        const averageScore = sheet.cell(row, scoreCol + 1).value()?.toString() || "";
        const expectedScore = sheet.cell(row, expectedCol + 1).value()?.toString() || "";

        if (courseCode && courseName) {
          const subject: Subject = {
            id: `excel-sub-${Date.now()}-${currentSemester!.subjects.length}`,
            courseCode,
            courseName,
            credits,
            progressScore,
            midtermScore,
            practiceScore,
            finalScore,
            progressWeight: "",
            practiceWeight: "",
            midtermWeight: "",
            finalWeight: "",
            score: averageScore,
            expectedScore,
            averageScore,
            minProgressScore: "",
            minMidtermScore: "",
            minPracticeScore: "",
            minFinalScore: ""
          };

          currentSemester.subjects.push(subject);
        }
      }

      onSemestersImport(importedSemesters);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to import Excel file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <input
      type="file"
      accept=".xlsx,.xls"
      onChange={handleExcelUpload}
      disabled={false} // This will be managed by parent
    />
  );
};
