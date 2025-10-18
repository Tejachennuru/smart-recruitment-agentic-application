import React, { useState } from 'react';
import { ragAPI } from '../services/api';

export default function UploadApplications({ job }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const onFileChange = (e) => {
    setMessage(null);
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return setMessage({ type: 'error', text: 'Select a file first' });
    setUploading(true);
    setMessage(null);
    try {
      const resp = await ragAPI.uploadExcel(job.id, file);
      const data = resp.data || resp;
      if (data.success) {
        setMessage({ type: 'success', text: `Ingested: ${data.inserted || 0}, Skipped: ${data.skipped || 0}` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed' });
      }
    } catch (err) {
      console.error('Upload error', err);
      const text = err.response?.data?.error || err.message || 'Upload failed';
      setMessage({ type: 'error', text });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass p-4 rounded-xl">
      <h4 className="font-display font-semibold text-dark-700 text-sm mb-3">Upload Applications</h4>
      <p className="text-xs text-dark-500 mb-2">Upload an XLSX/CSV with applicant rows to add them to the RAG index.</p>
      <div className="flex items-center gap-2">
        <input type="file" accept=".xlsx,.xls,.csv" onChange={onFileChange} />
        <button onClick={handleUpload} disabled={uploading || !file} className="btn-primary px-3 py-1">
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      {message && (
        <div className={`mt-3 text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
