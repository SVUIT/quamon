self.onmessage = async (event) => {
  // load Pyodide
  importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.0/full/pyodide.js");

  // @ts-ignore
  const pyodide = await loadPyodide();

  const result = await pyodide.runPythonAsync(event.data);
  self.postMessage(result);
};