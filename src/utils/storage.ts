export const isBrowser = typeof window !== 'undefined';
export const getLocalStorage = (key: string, defaultValue: any = null) => {
  if (!isBrowser) return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from local storage:', error);
    return defaultValue;
  }
};
export const setLocalStorage = (key: string, value: any) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing to local storage:', error);
  }
};