import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import EditModal from "../components/GradeTable/EditModal";
import GradeTable from "../components/GradeTable/GradeTable";
import { useGradeApp } from "../hooks/useGradeApp";
import { useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
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
  } = useGradeApp();

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      
      if (!responseData || typeof responseData !== 'object') {
        throw new Error('Invalid response format from server');
      }

      // If the response contains semesters data, use it directly
      if (responseData.semesters && Array.isArray(responseData.semesters)) {
        // Transform the server data to match our expected format
        const formattedSemesters = responseData.semesters.map((semester: any, semIndex: number) => {
          // Map courses to subjects, handling null scores
          const subjects = Array.isArray(semester.courses) ? semester.courses.map((course: any, index: number) => {
            const scores = course.scores || {};
            return {
              maHP: String(course.courseCode || '').trim(),
              tenHP: String(course.courseNameVi || '').trim(),
              tinChi: String(course.credits || '').trim(),
              diemQT: scores.progressScore !== null ? String(scores.progressScore) : '',
              diemGK: scores.midtermScore !== null ? String(scores.midtermScore) : '',
              diemTH: scores.practiceScore !== null ? String(scores.practiceScore) : '',
              diemCK: scores.finaltermScore !== null ? String(scores.finaltermScore) : '',
              diemHP: scores.totalScore !== null ? String(scores.totalScore) : '',
              // Score weights (default values)
              min_diemQT: '',
              min_diemGK: '',
              min_diemTH: '',
              min_diemCK: '',
              weight_diemQT: '20',
              weight_diemGK: '20',
              weight_diemTH: '20',
              weight_diemCK: '40',
              expectedScore: '',
              id: `subj-${Date.now()}-${semIndex}-${index}`,
              stt: index + 1,
            };
          }) : [];
          
          return {
            id: `sem-${Date.now()}-${semIndex}`,
            name: String(semester.semesterName || `Học kỳ ${semIndex + 1}`).trim(),
            subjects: subjects
          };
        });
        
        setSemesters(formattedSemesters);
        return;
      }
      
      // If no semesters in response but has individual course data
      if (responseData.courseCode || responseData.courseNameVi) {
        setSemesters(prevSemesters => {
          const newSemesters = [...prevSemesters];
          
          // If no semesters exist, create one
          if (newSemesters.length === 0) {
            newSemesters.push({
              id: Date.now().toString(),
              name: 'Học kỳ 1',
              subjects: []
            });
          }

          // Create a new subject with all required fields
          const newSubject = {
            maHP: responseData.courseCode?.trim() || '',
            tenHP: responseData.courseNameVi?.trim() || '',
            tinChi: responseData.credits ? responseData.credits.toString() : '0',
            diemQT: responseData.progressScore ? responseData.progressScore.toString() : '',
            diemGK: responseData.midtermScore ? responseData.midtermScore.toString() : '',
            diemTH: responseData.practiceScore ? responseData.practiceScore.toString() : '',
            diemCK: responseData.finaltermScore ? responseData.finaltermScore.toString() : '',
            min_diemQT: '0',
            min_diemGK: '0',
            min_diemTH: '0',
            min_diemCK: '0',
            weight_diemQT: '20',
            weight_diemGK: '20',
            weight_diemTH: '20',
            weight_diemCK: '40',
            diemHP: responseData.totalScore ? responseData.totalScore.toString() : '',
            expectedScore: '',
            id: Date.now().toString(),
            stt: (newSemesters[0]?.subjects?.length || 0) + 1
          };

          // Add the new subject to the first semester
          const firstSemester = { 
            ...newSemesters[0],
            subjects: [...(newSemesters[0]?.subjects || []), newSubject]
          };
          
          newSemesters[0] = firstSemester;
          return newSemesters;
        });
      } else if (responseData.semesters && responseData.semesters.length > 0) {
        // Handle multiple semesters if needed
        const formattedSemesters = responseData.semesters.map((semester: any, semIndex: number) => {
          // Map courses to subjects, handling null scores
          const subjects = Array.isArray(semester.courses) ? semester.courses.map((course: any, index: number) => {
            const scores = course.scores || {};
            return {
              maHP: String(course.courseCode || '').trim(),
              tenHP: String(course.courseNameVi || '').trim(),
              tinChi: String(course.credits || '').trim(),
              diemQT: scores.progressScore !== null ? String(scores.progressScore) : '',
              diemGK: scores.midtermScore !== null ? String(scores.midtermScore) : '',
              diemTH: scores.practiceScore !== null ? String(scores.practiceScore) : '',
              diemCK: scores.finaltermScore !== null ? String(scores.finaltermScore) : '',
              diemHP: scores.totalScore !== null ? String(scores.totalScore) : '',
              // Score weights (default values)
              min_diemQT: '',
              min_diemGK: '',
              min_diemTH: '',
              min_diemCK: '',
              weight_diemQT: '20',
              weight_diemGK: '20',
              weight_diemTH: '20',
              weight_diemCK: '40',
              expectedScore: '',
              id: `subj-${Date.now()}-${semIndex}-${index}`,
              stt: index + 1,
            };
          }) : [];
          
          return {
            id: `sem-${Date.now()}-${semIndex}`,
            name: String(semester.semesterName || `Học kỳ ${semIndex + 1}`).trim(),
            subjects: subjects
          };
        });
        
        setSemesters(formattedSemesters);
      }
    } catch (err) {
      console.error('Error uploading PDF:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xử lý file PDF');
    } finally {
      setIsLoading(false);
      // Reset the file input to allow re-uploading the same file
      if (event.target) {
        event.target.value = '';
      }
    }
  };


  return (
    <div className={theme === 'light' ? 'light-mode' : ''} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <div
        className="app-container"
        onClick={() => {
          setOpenMenu(null);
          setSemesterMenuOpen(null);        
          setEditDropdownOpen(null);
          setAddDropdownOpen(null);
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Bảng điểm</h1>
          <div>
            <label htmlFor="pdf-upload" className="button" style={{
              padding: '10px 20px',
              backgroundColor: 'var(--primary-purple)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'inline-block',
              marginLeft: '10px',
              transition: 'opacity 0.2s'
            }}>
              {isLoading ? 'Đang xử lý...' : 'Nhập điểm từ PDF'}
            </label>
            <input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              style={{ display: 'none' }}
              disabled={isLoading}
            />
          </div>
        </div>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '15px' }}>
            Lỗi: {error}
          </div>
        )}

        {/* TABLE CHÍNH VỚI WRAPPER SCROLL */}
        <div className="table-wrapper">
          <GradeTable
            semesters={semesters}
            setSemesters={setSemesters}
            updateSubjectField={updateSubjectField}
            deleteSemester={deleteSemester}
            deleteSubject={deleteSubject}
            openAdvancedModal={openAdvancedModal}
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
            semesterMenuOpen={semesterMenuOpen}
            setSemesterMenuOpen={setSemesterMenuOpen}
            addDropdownOpen={addDropdownOpen}
            setAddDropdownOpen={setAddDropdownOpen}
            addSearchTerm={addSearchTerm}
            setAddSearchTerm={setAddSearchTerm}
            addSearchResults={addSearchResults}
            addExpandedCategories={addExpandedCategories}
            setAddExpandedCategories={setAddExpandedCategories}
            editDropdownOpen={editDropdownOpen}
            setEditDropdownOpen={setEditDropdownOpen}
            editSearchTerm={editSearchTerm}
            setEditSearchTerm={setEditSearchTerm}
            editSearchResults={editSearchResults}
            editExpandedCategories={editExpandedCategories}
            setEditExpandedCategories={setEditExpandedCategories}
          />
        </div>

        {/* ================== POPUP EDIT ================== */}
        {modalOpen && editing && (
          <EditModal
            editing={editing}
            semesters={semesters}
            setSemesters={setSemesters}
            onClose={() => {
              setModalOpen(false);
              setEditing(null);
              setBackupSubject(null);
            }}
            backupSubject={backupSubject}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}