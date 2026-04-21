'use client'

import { useState } from "react";

export default function PythonPage() {
  const [output, setOutput] = useState("");

  const runPython = () => {
    const worker = new Worker(
      new URL("../../workers/python.worker.ts", import.meta.url)
    );

    worker.postMessage(`
sum([1,2,3,4,5])
`);

    worker.onmessage = (e) => {
      setOutput(String(e.data));
    };
  };

  return (
    <div className="p-6">
      <button 
        onClick={runPython}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Run Python
      </button>

      <pre className="mt-4">{output}</pre>
    </div>
  );
}