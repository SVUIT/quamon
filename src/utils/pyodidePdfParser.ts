import { ProcessedPdfData } from '../types';

// Type declarations for Pyodide global
declare global {
  interface Window {
    loadPyodide?: (options?: { indexURL?: string }) => Promise<any>;
  }
}

// Python code that will be executed in Pyodide
const PYTHON_CODE = `
import pdfplumber
import io
import json
import base64

def main(context):
    """
    Extract tables from a PDF file.
    Expects PDF binary data in context.req.body_binary.
    Returns JSON object with extracted tables.
    """
    try:
        content_type = context.req.headers.get('content-type', '')
        
        # If sent via curl --data-binary with PDF content type
        if 'application/pdf' in content_type:
            pdf_bytes = context.req.body_binary
        else:
            # Fallback for SDK/JSON which sends Base64
            pdf_bytes = base64.b64decode(context.req.body)
       
        if not pdf_bytes:
             return context.res.json({
                "success": False,
                "error": "No file content received."
            }, 400)

        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            all_tables = []
            for i, page in enumerate(pdf.pages):
                tables = page.extract_tables()
                if tables:
                    # Append each table. A table is a list of rows (lists).
                    all_tables.extend(tables)
        
        parsed_data = parse_transcript(all_tables)

        # Use json.dumps with ensure_ascii=False to preserve Unicode characters
        json_data = json.dumps(parsed_data, ensure_ascii=False)

        return context.res.text(json_data, 200, {'Content-Type': 'application/json'})

    except Exception as e:
        context.error(f"Error extracting tables: {str(e)}")
        # Debugging: return available attributes of context.req
        req_attributes = dir(context.req)
        error_data = json.dumps({
            "success": False,
            "error": str(e),
            "req_attributes": req_attributes
        }, ensure_ascii=False)
        return context.res.text(error_data, 500, {'Content-Type': 'application/json'})

def parse_transcript(tables_data):
    """
    Parses the raw table data into the structured transcript format.
    
    NOTE: This parsing logic is heuristic and deterministic based on the specific 
    layout of the provided PDF. It relies on exact string matches (e.g. "Học kỳ", "Năm học")
    and column positions observed in the sample. Variations in PDF layout may require adjustments.
    """
    transcript = {
        "semesters": [],
        "cumulativeSummary": {}
    }
    
    current_semester = None
    
    # Flatten the list of lists of lists to a single list of rows
    # The pdfplumber text extraction might result in headers sitting in their own rows
    rows = []
    for table in tables_data:
        for row in table:
            # Clean up row items
            cleaned_row = [item.strip() if item else "" for item in row]
            # Skip completely empty rows
            if not any(cleaned_row):
                continue
            rows.append(cleaned_row)

    for row in rows:
        first_cell = row[0]
        
        # Check for Semester Header
        # Example: "Học kỳ 1 - Năm học 2024-2025"
        if "Học kỳ" in first_cell and "Năm học" in first_cell:
            current_semester = {
                "semesterName": first_cell,
                "year": first_cell.split("Năm học")[-1].strip(), # Simple extraction
                "courses": [],
                "semesterSummary": {}
            }
            transcript["semesters"].append(current_semester)
            continue
            
        # Check for Course Row
        # Heuristic: First cell is a number (integer index) and we have a valid semester
        if current_semester is not None and first_cell.isdigit():
            # Check length to ensure we don't index out of bounds, standard row has ~10 cols
            if len(row) >= 9:
                # row structure: [index, code, name, credit, qt, gk, th, ck, hp, note]
                # Note: The mapping depends on exact column indices from the sample
                course = {
                    "courseCode": row[1],
                    "courseNameVi": row[2].replace('\\n', ' ').strip(),
                    "credits": float(row[3]) if row[3].replace('.','',1).isdigit() else 0,
                    "scores": {
                        "progressScore": _parse_score(row[4]),
                        "midtermScore": _parse_score(row[5]),
                        "practiceScore": _parse_score(row[6]),
                        "finalScore": _parse_score(row[7]),  # Fixed field name
                        "totalScore": _parse_score(row[8])
                    },
                    "note": row[9] if len(row) > 9 else ""
                }
                current_semester["courses"].append(course)
            continue

        # Check for Semester Summary
        # Example: "Trung bình học kỳ" in column 2 (index 2) or similar
        # Based on sample: ['', '', 'Trung bình học kỳ', '10', '', '', '', '', '8.9', '']
        if "Trung bình học kỳ" in "".join(row):
             if current_semester:
                 # Try to extract avg score and credits
                 # Credits often in col 3 or specific index
                 # Avg score in col 8
                 try:
                     # Locate 'Trung bình học kỳ' index
                     tb_idx = -1
                     for idx, cell in enumerate(row):
                        if "Trung bình học kỳ" in cell:
                            tb_idx = idx
                            break
                     
                     if tb_idx != -1:
                        # Credits usually next to text or in explicit column. 
                        # In sample: ['', '', 'TB', '10', ...] -> TB is index 2, credits index 3.
                         credits_earned = float(row[tb_idx+1]) if (tb_idx+1 < len(row) and row[tb_idx+1]) else 0
                         avg_score = float(row[-2]) if (len(row) >= 2 and row[-2]) else 0
                         
                         current_semester["semesterSummary"] = {
                             "averageScore": avg_score,
                             "creditsEarned": credits_earned
                         }
                 except:
                     pass
             continue

        # Check for Cumulative Summary
        # Example: "Số tín chỉ tích lũy", "Điểm trung bình chung tích lũy"
        # These are at the end, outside specific semester usually or part of the last one.
        if "Số tín chỉ tích lũy" in first_cell or "Số tín chỉ tích lũy" in "".join(row):
             try:
                val = next((s for s in row if s and s.replace('.','',1).isdigit()), None)
                if val:
                    transcript["cumulativeSummary"]["totalCreditsAccumulated"] = float(val)
             except: pass
        if "Điểm trung bình chung tích lũy" in first_cell or "Điểm trung bình chung tích lũy" in "".join(row):
             try:
                 val = next((s for s in row if s and s.replace('.','',1).isdigit()), None)
                 if val:
                    transcript["cumulativeSummary"]["cumulativeGpa"] = float(val)
             except: pass

def _parse_score(score_str):
    """
    Parse score from string to string format expected by frontend.
    Returns empty string if score is missing or invalid.
    """
    if not score_str or not score_str.strip():
        return ""
    
    score_str = score_str.strip()
    
    # Check if it's a valid number
    if score_str.replace('.','',1).isdigit():
        # Return as string, not as float
        return score_str
    
    return ""

    return transcript
`;


let pyodideInstance: any = null;
let isPyodideLoading = false;

/**
 * Initialize Pyodide and load required packages
 */
const initializePyodide = async (): Promise<any> => {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (isPyodideLoading) {
    // Wait for initialization to complete
    while (isPyodideLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return pyodideInstance;
  }

  isPyodideLoading = true;

  try {
    console.log('Starting Pyodide initialization...');
    
    // Load Pyodide from CDN using global scope
    if (typeof window !== 'undefined' && !(window as any).loadPyodide) {
      console.log('Loading Pyodide script from CDN...');
      // Load Pyodide script if not already loaded
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        script.onload = () => {
          console.log('Pyodide script loaded successfully');
          resolve(void 0);
        };
        script.onerror = (error) => {
          console.error('Failed to load Pyodide script:', error);
          reject(error);
        };
        document.head.appendChild(script);
      });
    }

    // Initialize Pyodide
    const loadPyodide = (window as any).loadPyodide;
    if (!loadPyodide) {
      throw new Error('Pyodide loader not found on window object');
    }
    
    console.log('Initializing Pyodide instance...');
    pyodideInstance = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
    });

    // Try to load PDF processing package, fallback to basic approach if not available
    console.log('Attempting to load pypdf package...');
    try {
      await pyodideInstance.loadPackage(['pypdf']);
      console.log('pypdf loaded successfully');
    } catch (error) {
      console.warn('pypdf not available, using basic text processing approach');
      // Continue without PDF library - will use a simplified approach
    }
    
    // Set up the Python code and ensure functions are in global scope
    console.log('Executing Python code...');
    try {
      pyodideInstance.runPython(PYTHON_CODE);
      
      // Verify that main function is defined
      const mainExists = pyodideInstance.runPython('callable(main)');
      console.log('Main function exists:', mainExists);
      
      if (!mainExists) {
        // Try to re-execute just the function definitions
        console.log('Re-executing function definitions...');
        pyodideInstance.runPython(PYTHON_CODE);
        
        const mainExistsAfter = pyodideInstance.runPython('callable(main)');
        if (!mainExistsAfter) {
          throw new Error('Failed to define main function after retry');
        }
      }
    } catch (pythonError) {
      console.error('Python execution error:', pythonError);
      throw new Error(`Python execution failed: ${pythonError}`);
    }
    
    console.log('Pyodide initialized successfully');
    return pyodideInstance;
  } catch (error) {
    console.error('Failed to initialize Pyodide:', error);
    isPyodideLoading = false;
    throw error;
  }
};

/**
 * Parse PDF using Pyodide and pdfplumber
 */
export const parsePdfWithPyodide = async (file: File): Promise<ProcessedPdfData> => {
  try {
    // Initialize Pyodide if not already done
    const pyodide = await initializePyodide();
    
    // Convert file to bytes
    const arrayBuffer = await file.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);
    
    // Pass the PDF bytes directly to Python instead of using a proxy
    pyodide.globals.set('pdf_bytes', pdfBytes);
    
    try {
      // Run a modified Python function that works with direct data
      const result = pyodide.runPython(`
# Process the PDF bytes directly
import io
import json
import base64
import re

# Try to import pypdf, fallback to basic approach if not available
try:
    import pypdf
    HAS_PYPDF = True
except ImportError:
    HAS_PYPDF = False

def extract_pdf_text(pdf_bytes):
    """Extract text from PDF using available method."""
    if HAS_PYPDF:
        try:
            pdf_reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
            
            # Check if PDF is encrypted
            if pdf_reader.is_encrypted:
                try:
                    # Try to decrypt with empty password
                    pdf_reader.decrypt('')
                except:
                    return "PDF_ENCRYPTED"
            
            all_text = ""
            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    # Try different extraction methods
                    text = page.extract_text()
                    if text.strip():
                        all_text += text + "\\n"
                    else:
                        # Try extracting text differently
                        try:
                            text = page.extract_text(extraction_mode="layout")
                            if text.strip():
                                all_text += text + "\\n"
                        except:
                            pass
                except Exception as e:
                    print(f"Error extracting text from page {page_num}: {e}")
                    continue
            
            if all_text.strip():
                return all_text
            else:
                # Try to extract any text using different approach
                try:
                    for page in pdf_reader.pages:
                        if '/Contents' in page:
                            # Try to get raw content
                            content = page.get_text()
                            if content.strip():
                                all_text += content + "\\n"
                except:
                    pass
                
                return all_text if all_text.strip() else "NO_TEXT_FOUND"
                
        except Exception as e:
            print(f"pypdf extraction failed: {e}")
    
    # Fallback: try to extract raw text from PDF (very basic)
    try:
        # Convert bytes to string and look for readable text patterns
        text = pdf_bytes.decode('utf-8', errors='ignore')
        # Look for patterns that might be Vietnamese text or numbers
        readable_text = ""
        for line in text.split('\\n'):
            if any(c.isalnum() or c.isspace() for c in line) and len(line.strip()) > 3:
                readable_text += line + "\\n"
        
        if readable_text.strip():
            return readable_text
        else:
            return "NO_TEXT_FOUND"
    except:
        return "NO_TEXT_FOUND"

def parse_transcript(tables_data):
    """Parse transcript data into structured format."""
    transcript = {
        "semesters": [],
        "cumulativeSummary": {}
    }
    
    current_semester = None
    
    # Flatten the list of tables to a single list of rows
    rows = []
    for table in tables_data:
        for row in table:
            # Clean up row items
            cleaned_row = [item.strip() if item else "" for item in row]
            # Skip completely empty rows
            if not any(cleaned_row):
                continue
            rows.append(cleaned_row)

    for row in rows:
        first_cell = row[0]
        
        # Check for Semester Header
        if "Học kỳ" in first_cell and "Năm học" in first_cell:
            current_semester = {
                "semesterName": first_cell,
                "year": first_cell.split("Năm học")[-1].strip(),
                "courses": [],
                "semesterSummary": {}
            }
            transcript["semesters"].append(current_semester)
            continue
            
        # Check for Course Row
        if current_semester is not None and first_cell.isdigit():
            if len(row) >= 9:
                course = {
                    "courseCode": row[1],
                    "courseNameVi": row[2].replace('\\n', ' ').strip(),
                    "credits": float(row[3]) if row[3].replace('.','',1).isdigit() else 0,
                    "scores": {
                        "progressScore": float(row[4]) if row[4] and row[4].replace('.','',1).isdigit() else None,
                        "midtermScore": float(row[5]) if row[5] and row[5].replace('.','',1).isdigit() else None,
                        "practiceScore": float(row[6]) if row[6] and row[6].replace('.','',1).isdigit() else None,
                        "finaltermScore": float(row[7]) if row[7] and row[7].replace('.','',1).isdigit() else None,
                        "totalScore": float(row[8]) if row[8] and row[8].replace('.','',1).isdigit() else None
                    },
                    "note": row[9] if len(row) > 9 else ""
                }
                current_semester["courses"].append(course)
            continue

        # Check for Semester Summary
        if "Trung bình học kỳ" in "".join(row):
             if current_semester:
                 try:
                     tb_idx = -1
                     for idx, cell in enumerate(row):
                        if "Trung bình học kỳ" in cell:
                            tb_idx = idx
                            break
                     
                     if tb_idx != -1:
                         credits_earned = float(row[tb_idx+1]) if (tb_idx+1 < len(row) and row[tb_idx+1]) else 0
                         avg_score = float(row[-2]) if (len(row) >= 2 and row[-2]) else 0
                         
                         current_semester["semesterSummary"] = {
                             "averageScore": avg_score,
                             "creditsEarned": credits_earned
                         }
                 except:
                     pass
             continue

        # Check for Cumulative Summary
        if "Số tín chỉ tích lũy" in first_cell or "Số tín chỉ tích lũy" in "".join(row):
             try:
                val = next((s for s in row if s and s.replace('.','',1).isdigit()), None)
                if val:
                    transcript["cumulativeSummary"]["totalCreditsAccumulated"] = float(val)
             except: pass
        if "Điểm trung bình chung tích lũy" in first_cell or "Điểm trung bình chung tích lũy" in "".join(row):
             try:
                 val = next((s for s in row if s and s.replace('.','',1).isdigit()), None)
                 if val:
                    transcript["cumulativeSummary"]["cumulativeGpa"] = float(val)
             except: pass

    return transcript

# Main processing logic
try:
    if not pdf_bytes:
        result = json.dumps({
            "success": False,
            "error": "No file content received."
        })
    else:
        # Extract text from PDF
        text = extract_pdf_text(pdf_bytes)
        
        if text == "PDF_ENCRYPTED":
            result = json.dumps({
                "success": False,
                "error": "PDF is encrypted or password-protected. Please provide an unencrypted PDF."
            })
        elif text == "NO_TEXT_FOUND":
            result = json.dumps({
                "success": False,
                "error": "No readable text found in PDF. The PDF might be image-based or contain only scanned images. Please use a PDF with selectable text."
            })
        elif not text.strip():
            result = json.dumps({
                "success": False,
                "error": "PDF appears to be empty or corrupted."
            })
        else:
            # Parse the extracted text into table-like structures
            all_tables = []
            
            # Split into lines and process
            lines = text.split('\\n')
            table_data = []
            
            for line in lines:
                # Skip empty lines
                if not line.strip():
                    continue
                    
                # Try to split by multiple spaces to create table-like structure
                cells = re.split(r'\\s{2,}', line.strip())
                
                # Filter out empty cells and clean up
                cleaned_cells = [cell.strip() for cell in cells if cell.strip()]
                
                if len(cleaned_cells) > 1:  # Only keep rows with multiple cells
                    table_data.append(cleaned_cells)
            
            if table_data:
                all_tables.append(table_data)
            
            parsed_data = parse_transcript(all_tables)
            result = json.dumps(parsed_data, ensure_ascii=False)

except Exception as e:
    result = json.dumps({
        "success": False,
        "error": str(e)
    }, ensure_ascii=False)

# Return the result
result
      `);
      
      // Parse the result
      console.log('Python result type:', typeof result);
      console.log('Python result value:', result);
      
      if (typeof result === 'string') {
        // The function returned JSON text
        try {
          const jsonData = JSON.parse(result);
          console.log('Parsed JSON data:', jsonData);
          
          // Check if it's an error response
          if (jsonData.success === false) {
            throw new Error(jsonData.error || 'PDF processing failed');
          }
          
          // Validate the structure
          if (!jsonData.semesters || !Array.isArray(jsonData.semesters)) {
            throw new Error('Invalid PDF structure: missing semesters array');
          }
          
          return jsonData as ProcessedPdfData;
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error(`Failed to parse PDF result: ${parseError}`);
        }
      } else if (result && typeof result === 'object' && result.success === false) {
        throw new Error(result.error || 'PDF processing failed');
      } else {
        console.error('Unexpected result format:', result);
        throw new Error(`Unexpected response format from PDF parser. Type: ${typeof result}, Value: ${result}`);
      }
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error parsing PDF with Pyodide:', error);
    throw error instanceof Error ? error : new Error('Failed to parse PDF');
  }
};

/**
 * Check if Pyodide is supported in the current browser
 */
export const isPyodideSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    typeof WebAssembly === 'object' &&
    typeof WebAssembly.instantiate === 'function'
  );
};

/**
 * Preload Pyodide for better performance
 */
export const preloadPyodide = async (): Promise<void> => {
  try {
    await initializePyodide();
  } catch (error) {
    console.warn('Failed to preload Pyodide:', error);
  }
};
