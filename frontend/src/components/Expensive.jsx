// Expensive.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Expensive() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [records, setRecords] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total_cost = calculateTotal();
    try {
      await axios.post('http://localhost:3001/api/expensive/manual', {
        ...form,
        total_cost,
        engineer_id: user?.id || 0
      });
      alert('✅ Expense saved!');
      setForm({ from: '', to: '', transport: '', accommodation: '', food: '', days: '', paid: 'N', remarks: '' });
      loadRecords();
    } catch (err) {
      alert('❌ Failed to save expense');
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('photo', file);

    try {
      await axios.post('http://localhost:3001/api/expensive/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('✅ Upload successful!');
    } catch (err) {
      setMessage('❌ Upload failed');
    }
  };

  const loadRecords = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/expensive/engineer/${user?.id}`);
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🧾 Engineer Expenses</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input name="from" value={form.from} onChange={handleFormChange} placeholder="From" className="p-2 border rounded" />
        <input name="to" value={form.to} onChange={handleFormChange} placeholder="To" className="p-2 border rounded" />
        <input name="transport" type="number" value={form.transport} onChange={handleFormChange} placeholder="Transport (₹)" className="p-2 border rounded" />
        <input name="accommodation" type="number" value={form.accommodation} onChange={handleFormChange} placeholder="Accommodation (₹/Night)" className="p-2 border rounded" />
        <input name="food" type="number" value={form.food} onChange={handleFormChange} placeholder="Food (₹/Day)" className="p-2 border rounded" />
        <input name="days" type="number" value={form.days} onChange={handleFormChange} placeholder="Days" className="p-2 border rounded" />
        <input value={`₹ ${calculateTotal().toFixed(2)}`} disabled className="p-2 border rounded bg-gray-100 font-bold" />
        <select name="paid" value={form.paid} onChange={handleFormChange} className="p-2 border rounded">
          <option value="N">Paid?</option>
          <option value="Y">Yes</option>
          <option value="N">No</option>
        </select>
        <input name="remarks" value={form.remarks} onChange={handleFormChange} placeholder="Remarks" className="p-2 border rounded" />
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

      <h3 className="text-lg font-semibold mt-6">🧾 Expense Records</h3>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2">From</th>
            <th className="border px-2">To</th>
            <th className="border px-2">Transport</th>
            <th className="border px-2">Accommodation</th>
            <th className="border px-2">Food</th>
            <th className="border px-2">Days</th>
            <th className="border px-2">Total (₹)</th>
            <th className="border px-2">Paid</th>
            <th className="border px-2">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={i}>
              <td className="border px-2">{r.from}</td>
              <td className="border px-2">{r.to}</td>
              <td className="border px-2">{r.transport}</td>
              <td className="border px-2">{r.accommodation}</td>
              <td className="border px-2">{r.food}</td>
              <td className="border px-2">{r.days}</td>
              <td className="border px-2">{r.total_cost}</td>
              <td className="border px-2">{r.paid}</td>
              <td className="border px-2">{r.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
