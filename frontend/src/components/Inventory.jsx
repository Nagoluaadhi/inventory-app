import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Inventory() {
  const [form, setForm] = useState({ item_name: '', remark: '' });
  const [data, setData] = useState([]);

  const loadInventory = async () => {
    const res = await axios.get('/api/inventory');
    setData(res.data);
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/inventory', form);
    setForm({ item_name: '', remark: '' });
    loadInventory();
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Inventory Management</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input type="text" placeholder="Item Name" value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} className="p-2 border rounded" />
        <input type="text" placeholder="Remark" value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} className="p-2 border rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded col-span-1 md:col-span-3">Add Inventory</button>
      </form>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2">S.No</th>
            <th className="border px-2">Item Name</th>
            <th className="border px-2">Remark</th>
            <th className="border px-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id}>
              <td className="border px-2">{i + 1}</td>
              <td className="border px-2">{row.item_name}</td>
              <td className="border px-2">{row.remark}</td>
              <td className="border px-2">{row.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
