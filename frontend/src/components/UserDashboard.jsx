import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function UserDashboard() {
  const [stockouts, setStockouts] = useState([]);
  const [services, setServices] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

 useEffect(() => {
  axios.get(`http://localhost:3001/api/stockout`, {
    params: {
      userId: user.id,  // ✅ use userId as expected by backend
      role: 'user'
    }
  }).then(res => setStockouts(Array.isArray(res.data) ? res.data : []));

  axios.get(`http://localhost:3001/api/services`, {
    params: {
      userId: user.id,  // ✅ use userId as expected by backend
      role: 'user'
    }
  }).then(res => setServices(Array.isArray(res.data) ? res.data : []));
}, []);


  return (
    <div>
      <h2 className="text-xl font-bold mb-4">User Dashboard</h2>

      <h3 className="text-lg font-semibold mb-2">📤 My StockOuts</h3>
      <table className="w-full border text-sm mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2">Date</th>
            <th className="border px-2">Item</th>
            <th className="border px-2">Client</th>
            <th className="border px-2">Qty</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(stockouts) && stockouts.map((s, i) => (
            <tr key={i}>
              <td className="border px-2">
  {new Date(s.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
</td>

              <td className="border px-2">{s.item_name}</td>
              <td className="border px-2">{s.client_name}</td>
              <td className="border px-2">{s.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-lg font-semibold mb-2">🛠️ My Services</h3>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2">Date</th>
            <th className="border px-2">Client</th>
            <th className="border px-2">Vehicle</th>
            <th className="border px-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(services) && services.map((svc, i) => (
            <tr key={i}>
              <td className="border px-2">
  {new Date(svc.date_time).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
</td>
              <td className="border px-2">{svc.client_name}</td>
              <td className="border px-2">{svc.vehicle_no}</td>
              <td className="border px-2">{svc.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
