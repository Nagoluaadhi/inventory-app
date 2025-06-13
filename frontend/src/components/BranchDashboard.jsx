// BranchDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function BranchDashboard() {
  const [stockinFromAdmin, setStockinFromAdmin] = useState([]);
  const [stockoutFromUser, setStockoutFromUser] = useState([]);
  const [clients, setClients] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

useEffect(() => {
  if (!user || !user.id || !user.role) {
    console.warn('🚫 No user found in localStorage');
    return;
  }

  // ✅ Fetch stockin/stockout
  axios.get(`http://localhost:3001/api/dashboard/branch-dashboard-role/${user.id}`)
    .then(res => {
      const data = res.data || {};
      console.log("✅ Received stockinFromAdmin:", data.stockinFromAdmin);
      setStockinFromAdmin(Array.isArray(data.stockinFromAdmin) ? data.stockinFromAdmin : []);
      setStockoutFromUser(Array.isArray(data.stockoutFromUser) ? data.stockoutFromUser : []);
    });

  // ✅ Fetch assigned clients for 'user'
  if (user.role === 'user') {
    console.log('📦 Sending to /api/clients', { userId: user.id, role: user.role });
    axios.get('http://localhost:3001/api/clients', {
      params: { userId: user.id, role: user.role }
    })
    .then(res => {
      console.log("✅ Received clients:", res.data);
      setClients(Array.isArray(res.data) ? res.data : []);
    })
    .catch(err => {
      console.error('❌ Error fetching clients:', err);
    });
  }
}, []);

  return (
  <div>
    <h2 className="text-xl font-bold mb-4">Branch Office Dashboard</h2>

    {/* ✅ Assigned Clients Section */}
    <div className="mb-6 bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold text-blue-700 mb-2">👥 Assigned Clients</h3>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.isArray(clients) && clients.map((client) => (
  <div key={client.id} className="border rounded p-3 shadow text-center">
    <p className="text-md font-medium">{client.client_name}</p>
    <p className="text-sm text-gray-500">Client ID: {client.id}</p> {/* Or any other valid field */}
  </div>
))}
      </div>
    </div>

    {/* 🟩 StockIn from Admin */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-green-700 mb-2">📦 Items Sent by Admin (Outward)</h3>
      <table className="w-full border text-sm mb-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2">Date</th>
            <th className="border px-2">Item</th>
            <th className="border px-2">Client</th>
            <th className="border px-2">Qty</th>
          </tr>
        </thead>
        <tbody>
          {stockinFromAdmin.map((row, i) => (
            <tr key={i}>
              <td className="border px-2">
                {new Date(row.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </td>
              <td className="border px-2">{row.item_name}</td>
              <td className="border px-2">{row.client_name}</td>
              <td className="border px-2 text-green-700">{row.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* 🟥 StockOut from User */}
    <div>
      <h3 className="text-lg font-semibold text-red-700 mb-2">🟥 StockOut from User</h3>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2">Date</th>
            <th className="border px-2">Item</th>
            <th className="border px-2">Client</th>
            <th className="border px-2">Qty</th>
          </tr>
        </thead>
        <tbody>
          {stockoutFromUser.map((row, i) => (
            <tr key={i}>
              <td className="border px-2">
                {new Date(row.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </td>
              <td className="border px-2">{row.item_name}</td>
              <td className="border px-2">{row.client_name}</td>
              <td className="border px-2 text-red-700">{row.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
}
