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
      <table className="w-full border text-sm mt-4">
  <thead className="bg-gray-100">
    <tr>
      <th className="border px-2 py-1">From</th>
      <th className="border px-2 py-1">To</th>
      <th className="border px-2 py-1">Transport (₹)</th>
      <th className="border px-2 py-1">Accommodation (₹/Night)</th>
      <th className="border px-2 py-1">Food (₹/Day)</th>
      <th className="border px-2 py-1">Days</th>
      <th className="border px-2 py-1">Total Cost (₹)</th>
      <th className="border px-2 py-1">Paid?</th>
      <th className="border px-2 py-1">Remarks</th>
      <th className="border px-2 py-1">Image</th>
      <th className="border px-2 py-1">Action</th>
    </tr>
  </thead>
  <tbody>
    {records.map((r, i) => (
      <tr key={i} className="text-center">
        <td className="border px-2">{r.from}</td>
        <td className="border px-2">{r.to}</td>
        <td className="border px-2">₹{r.transport}</td>
        <td className="border px-2">₹{r.accommodation}</td>
        <td className="border px-2">₹{r.food}</td>
        <td className="border px-2">{r.days}</td>
        <td className="border px-2 font-semibold">₹{r.total_cost}</td>
        <td className="border px-2">{r.paid}</td>
        <td className="border px-2">{r.remarks}</td>
        <td className="border px-2">
          {(r.image_path || r.image_url) && (
            <img
              src={`http://localhost:3001${r.image_path || r.image_url}`}
              alt="expense"
              className="w-16 h-auto mx-auto"
            />
          )}
        </td>
        <td className="border px-2">
          <button
            onClick={() => handleDelete(r.id)}
            className="text-red-600 hover:underline"
          >
            Delete
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>


    </div>
  );
}
