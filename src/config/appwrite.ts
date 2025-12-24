import { Client, Functions, type Models } from 'appwrite';

// Initialize the Appwrite client
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const functions = new Functions(client);

// File upload utility
export const uploadPdf = async (file: File): Promise<any> => {
  try {
    // Convert file to base64
    const fileData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

    // Call the Appwrite function
    const response = await functions.createExecution(
      import.meta.env.VITE_APPWRITE_FUNCTION_ID,
      JSON.stringify({
        file: fileData,
        filename: file.name,
        key: import.meta.env.VITE_GRADES_PDF_EXTRACTOR_KEY
      }),
      true
    ) as Models.Execution & { stderr?: string; response?: string };

    if (response.status === 'failed') {
      throw new Error(response.stderr || 'Function execution failed');
    }

    return response.response ? JSON.parse(response.response) : {};
  } catch (error) {
    console.error('Error uploading file:', error);
    if (error instanceof TypeError) {
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
    }
    if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    throw new Error('An unknown error occurred during file upload');
  }
};