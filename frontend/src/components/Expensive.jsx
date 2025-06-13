import React, { useState } from 'react';
import axios from 'axios';

export default function Expensive() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await axios.post('/api/expensive/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('✅ Upload successful!');
    } catch (err) {
      setMessage('❌ Upload failed');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📸 Upload Expense Photo</h2>
      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="block"
          accept="image/*"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
