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
  <>
    <div className="w-full px-6">
      {/* Item Balances */}
      <div className="bg-white rounded-xl shadow p-6 w-full">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
          📦 Item Balances
        </h3>

        {/* ✅ Horizontal Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {itemSummary.map((item, idx) => (
            <div
              key={idx}
              className="bg-white min-w-[220px] min-h-[160px] border border-gray-200 rounded-xl p-4 text-center shadow"
            >
              <p className="text-lg font-bold text-gray-800">{item.item_name}</p>
              <p className="text-sm text-green-600">Total Added: {item.total_added}</p>
              <p className="text-sm text-red-600">Used: {item.used}</p>
              <p className="text-sm text-blue-600">Remaining: {item.balance}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Spacing */}
      <div className="my-6"></div>

      {/* Client Balances */}
      <div className="bg-white rounded-xl shadow p-6 w-full">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
          👥 Client Balances
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {clientTotalBalance.map((client, idx) => (
            <div
              key={idx}
              className="border border-dashed rounded-lg p-4 text-center transition transform hover:scale-105 hover:shadow-md"
            >
              <p className="text-md font-medium text-gray-800">{client.client_name}</p>
              <p
                className={`text-sm font-semibold ${
                  client.balance < 0 ? 'text-red-600' : 'text-blue-600'
                }`}
              >
                {client.balance} available
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);
}
