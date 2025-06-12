// BranchDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function BranchDashboard() {
  const [stockinFromAdmin, setStockinFromAdmin] = useState([]);
  const [stockoutFromUser, setStockoutFromUser] = useState([]);
  const [clients, setClients] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

useEffect(() => {
  // Fetch stockin/stockout specific to this user
  axios.get(`/api/dashboard/branch-dashboard-role/${user.id}`)
    .then(res => {
      setStockinFromAdmin(res.data.stockinFromAdmin);
      setStockoutFromUser(res.data.stockoutFromUser);
    });

  // ✅ Fetch only clients assigned to this branch office user
  if (user.role === 'branch_office') {
    axios.get(`/api/clients`, {
      params: { userId: user.id, role: user.role }
    })
    .then(res => {
      setClients(res.data); // you'll need to define setClients and clients state
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
        {clients.map((client) => (
          <div
            key={client.id}
            className="border rounded p-3 shadow text-center"
          >
            <p className="text-md font-medium">{client.client_name}</p>
            <p className="text-sm text-gray-500">{client.address}</p>
          </div>
        ))}
      </div>
    </div>

    {/* 🟩 StockIn from Admin */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-green-700 mb-2">🟩 StockIn from Admin</h3>
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
