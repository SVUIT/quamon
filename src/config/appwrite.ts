import { Client, Functions, Storage } from 'node-appwrite';

/**
 * Sanitizes a filename by removing or replacing non-ASCII characters
 * @param filename The original filename
 * @returns A sanitized filename with only ASCII characters
 */
const sanitizeFilename = (filename: string): string => {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.\-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
};

// Initialize the Appwrite client
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || '')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '')
  .setSelfSigned(true); // Only for development with self-signed certificates

// Set the API key if it exists
if (import.meta.env.VITE_APPWRITE_API_KEY) {
  client.setKey(import.meta.env.VITE_APPWRITE_API_KEY);
}

// Default headers for fetch requests
const defaultHeaders = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
  'X-Appwrite-Key': import.meta.env.VITE_APPWRITE_API_KEY || '',
  'Accept': 'application/json',
};

const functions = new Functions(client);
const storage = new Storage(client);

// Helper function to create a file reader promise
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Method 1: Direct file upload using fetch API
export const uploadPdfDirect = async (file: File): Promise<any> => {
  try {
    console.log('Starting direct file upload...');
    
    // Read the file as ArrayBuffer first
    const arrayBuffer = await file.arrayBuffer();
    // Convert to base64
    const base64Data = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    const payload = {
      file: base64Data,
      filename: sanitizeFilename(file.name),
      key: import.meta.env.VITE_GRADES_PDF_EXTRACTOR_KEY || ''
    };

    const functionUrl = `${import.meta.env.VITE_APPWRITE_ENDPOINT}/functions/${
      import.meta.env.VITE_APPWRITE_FUNCTION_ID
    }/executions`;

    console.log('Sending request to:', functionUrl);
    console.log('File size:', file.size, 'bytes');
    console.log('Payload keys:', Object.keys(payload));
    
    // Try using the Appwrite client first
    try {
      const response = await functions.createExecution(
        import.meta.env.VITE_APPWRITE_FUNCTION_ID,
        JSON.stringify(payload),
        false
      ) as any;

      console.log('Upload successful via Appwrite client. Response:', {
        id: response.$id,
        status: response.status,
        responseType: typeof response.response,
        responseLength: typeof response.response === 'string' ? response.response.length : 'N/A'
      });
      
      // Handle the response
      if (response.response) {
        try {
          const responseData = typeof response.response === 'string' 
            ? JSON.parse(response.response) 
            : response.response;
          
          console.log('Parsed response data:', responseData);
          
          // Check if the response has the expected structure
          if (responseData.semesters || responseData.courseCode) {
            return responseData;
          } else if (responseData.error) {
            throw new Error(responseData.error);
          } else {
            // If we can't find the expected structure, return the full response
            // and let the calling function handle it
            return responseData;
          }
        } catch (e) {
          console.warn('Error parsing response:', e);
          console.warn('Raw response:', response.response);
          // Return the raw response if parsing fails
          return { response: response.response };
        }
      }
      
      return response;
      
    } catch (error) {
      console.error('Appwrite client upload failed:', error);
      
      // Fallback to direct fetch
      try {
        console.log('Falling back to direct fetch...');
        const fetchResponse = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
            'X-Appwrite-Key': import.meta.env.VITE_APPWRITE_API_KEY || '',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        
        console.log('Direct fetch response status:', fetchResponse.status);
        
        if (!fetchResponse.ok) {
          const errorText = await fetchResponse.text();
          console.error('Error response:', errorText);
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            errorData = { message: errorText };
          }
          throw new Error(
            `HTTP error! status: ${fetchResponse.status}, message: ${errorData.message || 'Unknown error'}`
          );
        }
        
        const data = await fetchResponse.json();
        console.log('Upload successful via direct fetch:', data);
        
        if (data.response) {
          try {
            const parsedResponse = typeof data.response === 'string' 
              ? JSON.parse(data.response) 
              : data.response;
            
            // Check if the response has the expected structure
            if (parsedResponse.semesters || parsedResponse.courseCode) {
              return parsedResponse;
            }
            return parsedResponse;
          } catch (e) {
            console.warn('Could not parse response:', data.response);
            return data;
          }
        }
        
        return data;
        
      } catch (fetchError) {
        console.error('Direct fetch also failed:', fetchError);
        throw new Error(`Both Appwrite client and direct fetch failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
      }
    }
  } catch (error) {
    console.error('Error in direct upload:', {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

// Method 2: Upload to Storage first, then process
const uploadPdfViaStorage = async (file: File): Promise<any> => {
  try {
    console.log('Starting storage-based file upload...');
    
    // Upload file to storage
    const fileId = `temp_${Date.now()}_${file.name}`;
    const uploadedFile = await storage.createFile(
      'default',
      fileId,
      file
    );

    console.log('File uploaded to storage, processing...');
    
    // Call function with file ID
    const response = await functions.createExecution(
      import.meta.env.VITE_APPWRITE_FUNCTION_ID,
      JSON.stringify({
        fileId: uploadedFile.$id,
        filename: sanitizeFilename(file.name),
        key: import.meta.env.VITE_APPWRITE_API_KEY
      }),
      false
    ) as {
      status: string;
      stderr?: string;
      stdout?: string;
      response?: string;
      error?: string;
    };

    // Clean up the file from storage
    try {
      await storage.deleteFile(
        'default',
        uploadedFile.$id
      );
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary file:', cleanupError);
    }

    return response;
  } catch (error) {
    console.error('Error in storage-based uploadPdf:', error);
    throw new Error(`Storage upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Main upload function that tries both methods
export const uploadPdf = async (file: File): Promise<any> => {
  // For small files (< 5MB), try direct upload first
  if (file.size <= 5 * 1024 * 1024) {
    try {
      return await uploadPdfDirect(file);
    } catch (error) {
      console.log('Direct upload failed, falling back to storage upload...');
      return uploadPdfViaStorage(file);
    }
  }
  
  // For larger files, use storage upload directly
  return uploadPdfViaStorage(file);
};

interface AcademicRecord {
  totalCredits: number;
  gpa: number;
  hasFGrade: boolean;
  completedThesis: boolean;
  thesisScore?: number;
  englishProficiency: {
    type: 'IELTS' | 'TOEFL' | 'TOEIC' | 'VSTEP' | 'UIT';
    score: number;
  };
  completedMilitaryTraining: boolean;
  completedPhysicalEducation: boolean;
  completedSoftSkills: boolean;
  isUnderDisciplinaryAction: boolean;
}

export const checkGraduationEligibility = (record: AcademicRecord): { eligible: boolean; reasons: string[] } => {
  const reasons: string[] = [];

  // 1. Check credit and GPA requirements
  if (record.totalCredits < 130) {
    reasons.push(`Not enough credits (${record.totalCredits}/130 required)`);
  }
  if (record.gpa < 2.0) {
    reasons.push(`GPA too low (${record.gpa.toFixed(2)}/4.00 required)`);
  }
  if (record.hasFGrade) {
    reasons.push('Has F grade in one or more courses');
  }

  // 2. Check thesis or alternative requirements
  if (!record.completedThesis || (record.thesisScore !== undefined && record.thesisScore < 5.0)) {
    reasons.push('Thesis or alternative requirements not met');
  }

  // 3. Check English proficiency
  const { type, score } = record.englishProficiency;
  const englishPassed = 
    (type === 'IELTS' && score >= 5.5) ||
    (type === 'TOEFL' && score >= 61) ||
    (type === 'TOEIC' && score >= 600) ||
    (type === 'VSTEP' && score >= 3.5) || // B1 level
    (type === 'UIT' && score >= 60); // Assuming 60 is passing for UIT test

  if (!englishPassed) {
    reasons.push('English proficiency requirement not met');
  }

  // 4. Check additional requirements
  if (!record.completedMilitaryTraining) {
    reasons.push('Military training not completed');
  }
  if (!record.completedPhysicalEducation) {
    reasons.push('Physical education not completed');
  }
  if (!record.completedSoftSkills) {
    reasons.push('Soft skills requirement not met');
  }

  // 5. Check disciplinary status
  if (record.isUnderDisciplinaryAction) {
    reasons.push('Student is under disciplinary action');
  }

  return {
    eligible: reasons.length === 0,
    reasons
  };
};