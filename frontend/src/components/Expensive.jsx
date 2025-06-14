import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Expensive() {
  const [form, setForm] = useState({
    from: '', to: '', transport: '', accommodation: '', food: '', days: '', paid: 'N', remarks: ''
  });
  const [file, setFile] = useState(null);
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  const calculateTotal = () => {
    const t = parseFloat(form.transport) || 0;
    const a = (parseFloat(form.accommodation) || 0) * (parseInt(form.days) || 0);
    const f = (parseFloat(form.food) || 0) * (parseInt(form.days) || 0);
    return t + a + f;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    formData.append('user_id', user?.id);
    if (file) formData.append('image', file);

    try {
      await axios.post('http://localhost:3001/api/expensive/add', formData);
      setMessage('Expense submitted!');
      fetchRecords();
    } catch (err) {
      setMessage('Error submitting expense');
    }
  };

  const fetchRecords = async () => {
    const res = await axios.get(`http://localhost:3001/api/expensive/all/${user?.id}`);
    setRecords(res.data);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Expense Form</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {['from', 'to', 'transport', 'accommodation', 'food', 'days', 'remarks'].map((field) => (
          <input key={field} name={field} value={form[field]} onChange={handleChange}
            placeholder={field} className="border p-2 w-full" />
        ))}
        <select name="paid" value={form.paid} onChange={handleChange} className="border p-2 w-full">
          <option value="N">Not Paid</option>
          <option value="Y">Paid</option>
        </select>
        <input type="file" onChange={e => setFile(e.target.files[0])} className="border p-2 w-full" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
      </form>
      {message && <p className="mt-2 text-green-600">{message}</p>}

      <h3 className="text-lg font-semibold mt-6 mb-2">Expense Records</h3>
      {records.map((rec, i) => (
        <div key={i} className="border p-2 mb-2">
          <p>{rec.from_place} → {rec.to_place}</p>
          <p>Transport: ₹{rec.transport}, Food: ₹{rec.food}, Days: {rec.days}</p>
          {rec.image_url && (
            <img src={`http://localhost:3001${rec.image_url}`} alt="Expense" className="w-40 mt-2" />
          )}
        </div>
      ))}
    </div>
  );
}
