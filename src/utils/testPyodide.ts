import { isPyodideSupported, preloadPyodide } from './pyodidePdfParser';

// Simple test to verify Pyodide setup
export const testPyodideSetup = async () => {
  console.log('Testing Pyodide setup...');
  
  // Test 1: Check if Pyodide is supported
  const supported = isPyodideSupported();
  console.log('Pyodide supported:', supported);
  
  if (!supported) {
    console.warn('Pyodide is not supported in this browser');
    return false;
  }
  
  // Test 2: Try to preload Pyodide
  try {
    console.log('Attempting to preload Pyodide...');
    await preloadPyodide();
    console.log('Pyodide preloaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to preload Pyodide:', error);
    return false;
  }
};

// Export for use in browser console or debugging
if (typeof window !== 'undefined') {
  (window as any).testPyodide = testPyodideSetup;
}
