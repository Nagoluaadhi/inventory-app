import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [itemSummary, setItemSummary] = useState([]);
  const [clientTotalBalance, setClientTotalBalance] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    axios.get('http://localhost:3001/api/dashboard').then(res => {
      console.log('🧪 clientTotalBalance:', res.data.clientTotalBalance);
      setStats(res.data);
      setClientTotalBalance(res.data.clientTotalBalance || []);
    });
    axios.get('http://localhost:3001/api/dashboard/items-summary').then(res => setItemSummary(res.data));
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
        {/* Item Balances */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
            📦 Item Balances
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
  {itemSummary.map((item, idx) => (
    <div
      key={idx}
      className="border border-dashed rounded-lg p-4 text-center transition transform hover:scale-105 hover:shadow-md"
    >
      <p className="text-md font-bold text-gray-800">{item.item_name}</p>
      <p className="text-xs text-green-600">Total Added: {item.total_added}</p>
      <p className="text-xs text-red-600">Used: {item.used}</p>
      <p className={`text-xs font-semibold ${item.balance < 0 ? 'text-red-600' : 'text-blue-600'}`}>
        Remaining: {item.balance}
      </p>
    </div>
  ))}
</div>

        </div>
        {/* Client Balances */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
            👥 Client Balances
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {clientTotalBalance.map((client, idx) => (
              <div
                key={idx}
                className="border border-dashed rounded-lg p-4 text-center transition transform hover:scale-105 hover:shadow-md"
              >
                <p className="text-md font-medium text-gray-800">{client.client_name}</p>
                <p className={`text-sm font-semibold ${client.balance < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                  {client.balance} available
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
