import { ProcessedPdfData } from '../types';

// Type declarations for Pyodide global
declare global {
  interface Window {
    loadPyodide?: (options?: { indexURL?: string }) => Promise<any>;
  }
}

// Python code that will be executed in Pyodide
const PYTHON_CODE = `
try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False

import io
import json
import base64
from pyodide.ffi import create_proxy

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

        if not HAS_PDFPLUMBER:
            return context.res.json({
                "success": False,
                "error": "pdfplumber not available in Pyodide environment"
            }, 500)

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

    // Note: pdfplumber is not available in Pyodide, will use fallback approach
    console.log('pdfplumber not available in Pyodide, using fallback approach');
    
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
      // Create a mock context object for the main function
      const mockContext: any = {
        req: {
          body_binary: pdfBytes,
          headers: { get: () => 'application/pdf' }
        },
        res: {
          json: pyodide.runPython(`
            create_proxy(lambda data, status: globals().set('_response_data', data))
          `),
          text: pyodide.runPython(`
            create_proxy(lambda data, status, headers: globals().set('_response_data', data))
          `)
        },
        _response: null
      };
      
      // Set the context in Python globals
      pyodide.globals.set('context', mockContext);
      
      // Call the main function we defined earlier
      pyodide.runPython('main(context)');
      
      // Get the response data from Python globals
      const result = pyodide.globals.get('_response_data') || '{}';
      
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
      } else if (result && typeof result === 'object' && (result as any).success === false) {
        throw new Error((result as any).error || 'PDF processing failed');
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
