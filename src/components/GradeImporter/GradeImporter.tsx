import React from 'react';
import './GradeImporter.css';

interface Grade {
  id: number;
  semester: string;
  code: string;
  name: string;
  credits: string;
  score1: string;
  score2: string;
  score3: string;
  score4: string;
  average: string;
  note: string;
}

interface GradeImporterProps {
  onImport: (grades: Grade[]) => void;
}

const GradeImporter: React.FC<GradeImporterProps> = ({ onImport }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const html = event.target?.result as string;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const rows = doc.querySelectorAll('tr');
      
      const newGrades: Grade[] = [];
      rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 9) {
          const newGrade: Grade = {
            id: Date.now() + index,
            semester: cells[0]?.textContent?.trim() || '',
            code: cells[1]?.textContent?.trim() || '',
            name: cells[2]?.textContent?.trim() || '',
            credits: cells[3]?.textContent?.trim() || '',
            score1: cells[4]?.textContent?.trim() || '',
            score2: cells[5]?.textContent?.trim() || '',
            score3: cells[6]?.textContent?.trim() || '',
            score4: cells[7]?.textContent?.trim() || '',
            average: cells[8]?.textContent?.trim() || '',
            note: cells[9]?.textContent?.trim() || ''
          };
          newGrades.push(newGrade);
        }
      });
      
      onImport(newGrades);
    };
    reader.readAsText(file);
  };

  return (
    <div className="grade-importer">
      <div className="controls">
        <div className="file-upload">
          <input
            type="file"
            id="fileInput"
            accept=".html,.htm"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button
            className="upload-btn"
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            Import from HTML
          </button>
        </div>
      </div>

      <div className="import-instructions">
        <p>Click the button below to import grades from an HTML file.</p>
      </div>
    </div>
  );
};

export default GradeImporter;
