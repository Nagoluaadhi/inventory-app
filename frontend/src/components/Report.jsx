import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { exportToExcel } from '../utils/exportExcel';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Report() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState({ type: '', client_id: '', from: '', to: '', user_id: '' });
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const role = localStorage.getItem('role');

  const loadClients = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await axios.get('http://localhost:3001/api/clients', {
        params: { userId: user.id, role }
      });
      setClients(res.data);
    } catch (err) {
      console.error('❌ Error loading clients:', err.message);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error('❌ Error loading users:', err.message);
    }
  };

  const loadReports = async () => {
    try {
      const localUser = JSON.parse(localStorage.getItem('user'));
      const finalUserId = filter.user_id || localUser.id;

      const res = await axios.get('http://localhost:3001/api/report', {
        params: { ...filter, user_id: finalUserId }
      });
      setData(res.data);
    } catch (err) {
      console.error("❌ Error loading reports:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    loadClients();
    loadUsers();
  }, []);

  const exportPDF = () => {
    const input = document.getElementById('report-table');
    html2canvas(input).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('report.pdf');
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Report</h2>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
  <div className="flex flex-wrap items-center gap-4 mb-6">
  <select onChange={e => setFilter({ ...filter, type: e.target.value })} className="p-2 border rounded min-w-[130px]">
    <option value="">All Types</option>
    <option value="in">Stock In</option>
    <option value="out">Stock Out</option>
  </select>

  <select onChange={e => setFilter({ ...filter, client_id: e.target.value })} className="p-2 border rounded min-w-[150px]">
    <option value="">All Clients</option>
    {clients.map(cli => (
      <option key={cli.id} value={cli.id}>{cli.client_name}</option>
    ))}
  </select>

  {role === 'admin' && (
    <select onChange={e => setFilter({ ...filter, user_id: e.target.value })} className="p-2 border rounded min-w-[130px]">
      <option value="">All Users</option>
      {users.map(user => (
        <option key={user.id} value={user.id}>{user.username}</option>
      ))}
    </select>
  )}

  <input type="date" onChange={e => setFilter({ ...filter, from: e.target.value })} className="p-2 border rounded" />
  <input type="date" onChange={e => setFilter({ ...filter, to: e.target.value })} className="p-2 border rounded" />

  <button onClick={loadReports} className="bg-blue-600 text-white px-4 py-2 rounded">Filter</button>
</div>


      <div className="flex gap-4 mb-4">
        <button onClick={() => exportToExcel(data, 'report')} className="bg-green-500 text-white px-4 py-1 rounded">Export Excel</button>
        <button onClick={exportPDF} className="bg-red-500 text-white px-4 py-1 rounded">Export PDF</button>
      </div>

      <div id="report-table">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2">S.No</th>
              <th className="border px-2">Type</th>
              <th className="border px-2">Client</th>
              <th className="border px-2">Item</th>
              <th className="border px-2">Qty</th>
              <th className="border px-2">Barcode</th>
              <th className="border px-2">Invoice</th>
              <th className="border px-2">Date</th>
              <th className="border px-2">Remark</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td className="border px-2 text-center" colSpan="9">No records found</td></tr>
            ) : (
              data.map((row, i) => (
                <tr key={row.id}>
                  <td className="border px-2">{i + 1}</td>
                  <td className="border px-2">{row.transaction_type}</td>
                  <td className="border px-2">{row.client_name}</td>
                  <td className="border px-2">{row.item_name}</td>
                  <td className="border px-2">{row.qty}</td>
                  <td className="border px-2">{row.barcode}</td>
                  <td className="border px-2">{row.invoice_no}</td>
                  <td className="border px-2">{new Date(row.date).toLocaleDateString()}</td>
                  <td className="border px-2">{row.remark}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
