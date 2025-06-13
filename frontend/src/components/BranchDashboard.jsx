// BranchDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function BranchDashboard() {
  const [itemBalances, setItemBalances] = useState([]);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [stockinFromAdmin, setStockinFromAdmin] = useState([]);
  const [stockoutFromUser, setStockoutFromUser] = useState([]);
  const [clients, setClients] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || !user.id || !user.role) {
      console.warn('🚫 No user found in localStorage');
      return;
    }

    axios.get(`http://localhost:3001/api/dashboard/branch-dashboard-role/${user.id}`)
      .then(res => {
        const data = res.data || {};
        setStockinFromAdmin(Array.isArray(data.stockinFromAdmin) ? data.stockinFromAdmin : []);
        setStockoutFromUser(Array.isArray(data.stockoutFromUser) ? data.stockoutFromUser : []);

        const balances = data.itemBalances || [];
        setItemBalances(balances);

        const totalIn = balances.reduce((sum, item) => sum + item.stockin_from_admin, 0);
        const totalOut = balances.reduce((sum, item) => sum + item.stockout_by_engineer, 0);
        setTotalIn(totalIn);
        setTotalOut(totalOut);
        setTotalBalance(totalIn - totalOut);
      })
      .catch(err => {
        console.error('❌ Error fetching branch dashboard:', err);
      });

    if (user.role === 'user') {
      axios.get('http://localhost:3001/api/clients', {
        params: { userId: user.id, role: user.role }
      })
        .then(res => {
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <div className="bg-white p-4 rounded shadow flex flex-col items-center">
    <span className="text-sm text-gray-500">🟩 StockIn from Admin</span>
    <p className="text-3xl font-bold text-green-600 mt-1">{Number(totalIn)}</p>
  </div>
  <div className="bg-white p-4 rounded shadow flex flex-col items-center">
    <span className="text-sm text-gray-500">🟥 StockOut by Engineer</span>
    <p className="text-3xl font-bold text-red-600 mt-1">{Number(totalOut)}</p>
  </div>
  <div className="bg-white p-4 rounded shadow flex flex-col items-center">
    <span className="text-sm text-gray-500">📦 Remaining Balance</span>
    <p className="text-3xl font-bold text-indigo-600 mt-1">{Number(totalBalance)}</p>
  </div>
</div>


      <h3 className="text-lg font-semibold mb-2">🧾 Item-wise Stock Summary</h3>
      <table className="w-full border text-sm mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2">Item</th>
            <th className="border px-2">Client</th>
            <th className="border px-2">Admin StockIn</th>
            <th className="border px-2">Engineer StockOut</th>
            <th className="border px-2">Remaining</th>
          </tr>
        </thead>
        <tbody>
          {itemBalances.map((row, i) => (
            <tr key={i}>
              <td className="border px-2">{row.item_name}</td>
              <td className="border px-2">{row.client_name}</td>
              <td className="border px-2">{row.stockin_from_admin}</td>
              <td className="border px-2">{row.stockout_by_engineer}</td>
              <td className="border px-2">{row.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-6 bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold text-blue-700 mb-2">👥 Assigned Clients</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.isArray(clients) && clients.map((client) => (
            <div key={client.id} className="border rounded p-3 shadow text-center">
              <p className="text-md font-medium">{client.client_name}</p>
              <p className="text-sm text-gray-500">Client ID: {client.id}</p>
            </div>
          ))}
        </div>
      </div>

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
