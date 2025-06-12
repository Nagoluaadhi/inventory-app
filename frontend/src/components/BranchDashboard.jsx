// BranchDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function BranchDashboard() {
  const [stockinFromAdmin, setStockinFromAdmin] = useState([]);
  const [stockoutFromUser, setStockoutFromUser] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    axios.get(`/api/dashboard/branch-dashboard-role/${user.id}`)
      .then(res => {
        setStockinFromAdmin(res.data.stockinFromAdmin);
        setStockoutFromUser(res.data.stockoutFromUser);
      });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Branch Office Dashboard</h2>

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
