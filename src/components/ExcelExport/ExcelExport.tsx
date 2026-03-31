import { useState, useCallback, useMemo } from 'react';
import { Semester } from '../../types';

interface ExcelExportProps {
  semesters: Semester[];
}

export const ExcelExport = ({ semesters }: ExcelExportProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Memoize data preparation to avoid recalculations
  const exportData = useMemo(() => {
    const headers = [
      "Học kỳ", "STT", "Mã HP", "Tên HP", "TC", 
      "QT", "GK", "TH", "CK", "Điểm HP", "Điểm kỳ vọng"
    ];

    const rows: string[][] = [];
    let totalSubjects = 0;

    semesters.forEach((semester) => {
      if (semester.subjects.length === 0) return;
      
      semester.subjects.forEach((subject, idx) => {
        rows.push([
          semester.name,
          (idx + 1).toString(),
          subject.courseCode || "",
          subject.courseName || "",
          subject.credits || "0",
          subject.progressScore || "",
          subject.midtermScore || "",
          subject.practiceScore || "",
          subject.finalScore || "",
          subject.averageScore || "",
          subject.expectedScore || ""
        ]);
        totalSubjects++;
      });
    });

    return { headers, rows, totalSubjects };
  }, [semesters]);

  const exportToExcel = useCallback(async () => {
    if (exportData.totalSubjects === 0) {
      setError('Không có dữ liệu để xuất');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Dynamically import xlsx-populate only when needed
      const XlsxPopulate = (await import('xlsx-populate/browser/xlsx-populate')).default;
      
      setProgress(20);
      
      const workbook = await XlsxPopulate.fromBlankAsync();
      const sheet = workbook.sheet(0).name("Tất cả học kỳ");

      // Write headers with styling
      const headerRow = sheet.row(1);
      exportData.headers.forEach((header, colIndex) => {
        const cell = headerRow.cell(colIndex + 1);
        cell.value(header);
        cell.style({
          bold: true,
          fill: '2C84FA',
          fontColor: 'FFFFFF',
          border: {
            top: { style: 'thin', color: '000000' },
            bottom: { style: 'thin', color: '000000' },
            left: { style: 'thin', color: '000000' },
            right: { style: 'thin', color: '000000' }
          }
        });
      });

      setProgress(40);

      // Write data rows with styling
      exportData.rows.forEach((rowData, rowIndex) => {
        const row = sheet.row(rowIndex + 2);
        rowData.forEach((cellData, colIndex) => {
          const cell = row.cell(colIndex + 1);
          cell.value(cellData);
          cell.style({
            border: {
              top: { style: 'thin', color: 'E0E0E0' },
              bottom: { style: 'thin', color: 'E0E0E0' },
              left: { style: 'thin', color: 'E0E0E0' },
              right: { style: 'thin', color: 'E0E0E0' }
            }
          });
        });
        
        // Update progress
        if (rowIndex % Math.ceil(exportData.rows.length / 40) === 0) {
          setProgress(40 + (rowIndex / exportData.rows.length) * 40);
        }
      });

      setProgress(80);

      // Auto-fit columns
      for (let col = 1; col <= exportData.headers.length; col++) {
        sheet.column(col).width();
      }

      setProgress(90);

      // Generate and download file
      const arrayBuffer = await workbook.outputAsync();
      const blob = new Blob([arrayBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bang_diem_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setProgress(100);
      
      // Reset progress after a short delay
      setTimeout(() => setProgress(0), 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export Excel file');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  }, [exportData]);

  return (
    <div className="relative">
      <button
        onClick={exportToExcel}
        disabled={loading || exportData.totalSubjects === 0}
        className="group relative font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
        style={{
          height: '40px',
          width: '220px',
          background: 'linear-gradient(145deg, #10b981, #059669)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          padding: '0 16px',
          lineHeight: '1',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.25)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'linear-gradient(145deg, #0ea968, #047857)';
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(16, 185, 129, 0.35)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'linear-gradient(145deg, #10b981, #059669)';
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.25)';
        }}
      >
        <span className="flex items-center justify-center">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Đang xuất...</span>
            </>
          ) : (
            <span>Xuất Excel</span>
          )}
        </span>
        
        {/* Optimized progress indicator - only show when actually progressing */}
        {loading && progress > 0 && progress < 100 && (
          <div className="absolute bottom-0 left-0 h-1 w-full bg-white bg-opacity-30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </button>
      
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm animate-pulse">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}
    </div>
  );
};
