import React, { useState } from 'react';
import axios from 'axios';

export default function Expensive() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    from: '',
    to: '',
    transport: '',
    accommodation: '',
    food: '',
    days: '',
    paid: 'N',
    remarks: ''
  });

  const calculateTotal = () => {
    const t = parseFloat(form.transport) || 0;
    const a = (parseFloat(form.accommodation) || 0) * (parseInt(form.days) || 0);
    const f = (parseFloat(form.food) || 0) * (parseInt(form.days) || 0);
    return t + a + f;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('photo', file);

    try {
      await axios.post('/api/expensive/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('✅ Upload successful!');
    } catch (err) {
      setMessage('❌ Upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total_cost = calculateTotal();

    try {
      const res = await axios.post('/api/expensive/manual', { ...form, total_cost });
      alert('✅ Expense entry saved!');
      setForm({ from: '', to: '', transport: '', accommodation: '', food: '', days: '', paid: 'N', remarks: '' });
    } catch (err) {
      alert('❌ Failed to save expense');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🧾 Engineer Expenses</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input type="text" name="from" value={form.from} onChange={handleFormChange} placeholder="From" className="p-2 border rounded" />
        <input type="text" name="to" value={form.to} onChange={handleFormChange} placeholder="To" className="p-2 border rounded" />
        <input type="number" name="transport" value={form.transport} onChange={handleFormChange} placeholder="Transport (₹)" className="p-2 border rounded" />
        <input type="number" name="accommodation" value={form.accommodation} onChange={handleFormChange} placeholder="Accommodation (₹/Night)" className="p-2 border rounded" />
        <input type="number" name="food" value={form.food} onChange={handleFormChange} placeholder="Food (₹/Day)" className="p-2 border rounded" />
        <input type="number" name="days" value={form.days} onChange={handleFormChange} placeholder="Days" className="p-2 border rounded" />
        <input type="text" value={`₹ ${calculateTotal().toFixed(2)}`} disabled className="p-2 border rounded bg-gray-100 font-bold" />
        <select name="paid" value={form.paid} onChange={handleFormChange} className="p-2 border rounded">
          <option value="N">Paid?</option>
          <option value="Y">Yes</option>
          <option value="N">No</option>
        </select>
        <input type="text" name="remarks" value={form.remarks} onChange={handleFormChange} placeholder="Remarks" className="p-2 border rounded" />
        <div className="md:col-span-3 flex justify-end">
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Save</button>
        </div>
      </form>

      <h3 className="text-lg font-semibold mb-2">📸 Upload Expense Image</h3>
      <form onSubmit={handleUpload} className="space-y-4">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*" required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Upload</button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
