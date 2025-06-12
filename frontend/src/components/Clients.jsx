import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Clients() {
  const [form, setForm] = useState({ client_name: '', address: '', qty: 0 });
  const [data, setData] = useState([]);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const res = await axios.get('/api/clients');
    setData(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.client_name) {
      alert('Client name is required');
      return;
    }

    try {
      await axios.post('/api/clients', form, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      alert('Client added');
      setForm({ client_name: '', address: '', qty: 0 });
      loadClients();
    } catch (err) {
      console.error('Client submit failed:', err.response?.data || err.message);
      alert('Failed to add client');
    }
  };

  const deleteClient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await axios.delete(`/api/clients/${id}`);
      loadClients();
    } catch (err) {
      alert('Failed to delete client');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Client Management</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Client Name"
          value={form.client_name}
          onChange={(e) => setForm({ ...form, client_name: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded col-span-1 md:col-span-2"
        >
          Add Client
        </button>
      </form>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">S.No</th>
            <th className="border px-2 py-1">Client Name</th>
            <th className="border px-2 py-1">Address</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id}>
              <td className="border px-2 py-1">{i + 1}</td>
              <td className="border px-2 py-1">{row.client_name}</td>
              <td className="border px-2 py-1">{row.address}</td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => deleteClient(row.id)}
                  className="bg-red-600 text-white px-3 py-1 text-xs rounded"
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
