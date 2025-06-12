import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function UserClientDashboard({ client }) {
  const [inventory, setInventory] = useState([]);
  const [usage, setUsage] = useState([]);

  useEffect(() => {
    if (!client) return;

    axios.get(`/api/dashboard/inventory?client_id=${client.id}`).then(res => setInventory(res.data));
    axios.get(`/api/dashboard/user-usage?client_id=${client.id}`).then(res => setUsage(res.data));
  }, [client]);

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard for {client.client_name}</h2>

      <div>
        <h3 className="font-semibold text-lg mb-2">Inventory Balances</h3>
        <table className="w-full text-sm border">
          <thead><tr><th className="border px-2">Item</th><th className="border px-2">Qty</th></tr></thead>
          <tbody>
            {inventory.map((i, j) => (
              <tr key={j}>
                <td className="border px-2">{i.item_name}</td>
                <td className="border px-2">{i.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-2">User Usage</h3>
        <table className="w-full text-sm border">
          <thead>
            <tr>
              <th className="border px-2">User</th>
              <th className="border px-2">Item</th>
              <th className="border px-2">Used Qty</th>
            </tr>
          </thead>
          <tbody>
            {usage.map((u, k) => (
              <tr key={k}>
                <td className="border px-2">{u.username}</td>
                <td className="border px-2">{u.item_name}</td>
                <td className="border px-2">{u.total_used}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
