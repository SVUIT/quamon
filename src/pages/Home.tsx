import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import EditModal from "../components/GradeTable/EditModal";
import GradeTable from "../components/GradeTable/GradeTable";
import GradeImporter from "../components/GradeImporter/GradeImporter";
import { useGradeApp } from "../hooks/useGradeApp";

export default function Home() {
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
        <main className="main-content">
          <div style={{ marginBottom: '40px' }}>
            <h2>Import Grades</h2>
            <GradeImporter onImport={(importedGrades) => {
              // Group imported grades by semester
              const gradesBySemester: Record<string, any[]> = {};
              
              importedGrades.forEach(grade => {
                const semesterName = grade.semester || 'Imported Grades';
                if (!gradesBySemester[semesterName]) {
                  gradesBySemester[semesterName] = [];
                }
                
                gradesBySemester[semesterName].push({
                  maHP: grade.code,
                  tenHP: grade.name,
                  soTC: parseFloat(grade.credits) || 0,
                  diemQT: parseFloat(grade.score1) || 0,
                  diemGK: parseFloat(grade.score2) || 0,
                  diemTH: parseFloat(grade.score3) || 0,
                  diemCK: parseFloat(grade.score4) || 0,
                  diemHP: parseFloat(grade.average) || 0, // Use the average score from HTML
                  diemMongMuon: 0,
                  id: `imported-${grade.id}`,
                  isEditing: false,
                  isNew: true
                });
              });
              
              // Create new semesters for the imported grades
              const newSemesters = Object.entries(gradesBySemester).map(([semesterName, subjects]) => ({
                id: `imported-${Date.now()}-${semesterName}`,
                name: semesterName,
                subjects: subjects,
                isEditing: false,
                isNew: true
              }));
              
              // Remove the default semester if it exists and is empty
              setSemesters(prev => {
                const filteredPrev = prev.filter(semester => 
                  !(semester.id === 'default-semester' && semester.subjects.every(sub => 
                    !sub.maHP && !sub.tenHP && !sub.diemQT && !sub.diemGK && !sub.diemTH && !sub.diemCK
                  ))
                );
                return [...filteredPrev, ...newSemesters];
              });
            }} />
          </div>
          <h2>Bảng điểm</h2>
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
        </main>
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
      <Footer />
    </div>
  );
}