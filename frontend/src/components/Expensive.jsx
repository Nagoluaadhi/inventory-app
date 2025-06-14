import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Expensive() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [form, setForm] = useState({
    from: '', to: '', transport: '', accommodation: '', food: '',
    days: '', paid: 'N', remarks: ''
  });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [records, setRecords] = useState([]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('engineer_id', user?.id);
    if (file) formData.append('image', file);

    try {
      await axios.post('http://localhost:3001/api/expensive/add', formData);
      setMessage('✅ Expense submitted');
      fetchRecords();
    } catch (err) {
      setMessage('❌ Submission failed');
    }
  };
const handleDelete = async (id) => {
  try {
    await axios.delete(`http://localhost:3001/api/expensive/delete/${id}`);
    setMessage('🗑️ Expense deleted');
    fetchRecords(); // refresh list
  } catch (err) {
    setMessage('❌ Delete failed');
  }
};

  const fetchRecords = async () => {
    const res = await axios.get(`http://localhost:3001/api/expensive/engineer/${user?.id}`);
    setRecords(res.data);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Submit Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        {['from', 'to', 'transport', 'accommodation', 'food', 'days', 'remarks'].map(field => (
          <input
            key={field}
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={field}
            className="w-full border p-2"
          />
        ))}
        <select name="paid" value={form.paid} onChange={handleChange} className="w-full border p-2">
          <option value="N">Not Paid</option>
          <option value="Y">Paid</option>
        </select>
        <input type="file" onChange={e => setFile(e.target.files[0])} className="w-full" />
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">Submit</button>
      </form>

      {message && <p className="mt-2 text-green-600">{message}</p>}

      <h3 className="text-lg font-semibold mt-6 mb-2">Expense Records</h3>
      {records.map((r, i) => (
  <div key={i} className="border p-2 mb-2 relative">
    <p>{r.from} → {r.to}</p>
    <p>Transport: ₹{r.transport}, Food: ₹{r.food}, Days: {r.days}</p>
    <p>Total: ₹{r.total_cost} | Paid: {r.paid}</p>
    {(r.image_path || r.image_url) && (
      <img
        src={`http://localhost:3001${r.image_path || r.image_url}`}
        alt="expense"
        className="w-40 mt-2"
      />
    )}
    <button
      onClick={() => handleDelete(r.id)}
      className="absolute top-2 right-2 text-red-600 bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-sm"
    >
      Delete
    </button>
  </div>
))}

    </div>
  );
}
