import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { exportToExcel } from '../utils/exportExcel';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import BarcodeScanner from './BarcodeScanner';

export default function Stockout() {
  const [form, setForm] = useState({
    date: '',
    inventory_id: '',
    client_id: '',
    barcode: '',
    invoice_no: '',
    qty: '',
    remark: ''
  });

  const [barcodes, setBarcodes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [clients, setClients] = useState([]);
  const [data, setData] = useState([]);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [inventoryQty, setInventoryQty] = useState(null);
  const [clientQty, setClientQty] = useState(null);
  const [userUsageQty, setUserUsageQty] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = localStorage.getItem('role') || user?.role || '';
  const role = localStorage.getItem('role');
  const barcodeRefs = useRef([]);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    setForm(prev => ({ ...prev, date: today }));
  }, []);

  useEffect(() => {
    loadBalances();
  }, [form.inventory_id, form.client_id]);

  const loadDropdowns = async () => {
  const [invRes, cliRes, stockRes] = await Promise.all([
    axios.get('http://localhost:3001/api/inventory'),
    axios.get('http://localhost:3001/api/clients'),
    axios.get('http://localhost:3001/api/stockout', {
      params: {
        user_id: user.id,
        role: user.role
      }
    })
  ]);
  setInventory(invRes.data);
  setClients(cliRes.data);
  setData(stockRes.data);
};


  const loadBalances = async () => {
    if (!form.inventory_id || !form.client_id) return;
    const [inv, cli, usage] = await Promise.all([
      axios.get(`http://localhost:3001/api/dashboard/inventory/${form.inventory_id}`),
      axios.get(`http://localhost:3001/api/dashboard/clients/${form.client_id}`),
      axios.get(`http://localhost:3001/api/dashboard/usage`, {
        params: {
          user_id: user.id,
          client_id: form.client_id,
          inventory_id: form.inventory_id
        }
      })
    ]);
    setInventoryQty(inv.data.qty);
    setClientQty(cli.data.qty);
    setUserUsageQty(usage.data.qty);
  };

  const handleScan = (value) => {
  const qty = parseInt(form.qty || '1');
  if (isNaN(qty) || qty < 1) {
    alert("Please enter a valid quantity first.");
    return;
  }

  // Fill first with scanned value, others empty
  const initialBarcodes = [value, ...Array(qty - 1).fill('')];

  setForm(prev => ({ ...prev, barcode: value }));
  setBarcodes(initialBarcodes);
  setScannerVisible(false);

  // Focus next input after setting (with a slight delay to allow rendering)
  setTimeout(() => {
    if (barcodeRefs.current[1]) {
      barcodeRefs.current[1].focus();
    }
  }, 100);
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    const qty = parseInt(form.qty);

    if (!user?.id || !form.date || !form.inventory_id || !form.client_id || !qty || barcodes.length !== qty || barcodes.includes('')) {
      console.warn("⛔ Validation failed", { userId: user?.id, form, barcodes });
      return alert('Please fill all fields and ensure all barcodes are filled correctly.');
    }

    for (const code of barcodes) {
      try {
        console.log("📤 Sending:", {
          ...form,
          barcode: code,
          qty: 1,
          user_id: user.id
        });

        const res = await axios.post('http://localhost:3001/api/stockout', {
          ...form,
          barcode: code,
          qty: 1,
          user_id: user.id,
          role: userRole
        });

        console.log("✅ Response:", res.data);
      } catch (err) {
        console.error("❌ Server error:", err.response?.data || err.message);
        const message = err.response?.data?.error || err.response?.statusText || err.message || 'Unknown error';
        alert(`Server rejected the request: ${message}`);
        return;
      }
    }

    setForm({
      date: today,
      inventory_id: '',
      client_id: '',
      barcode: '',
      invoice_no: '',
      qty: '',
      remark: ''
    });
    setBarcodes([]);
    setScannerVisible(false);
    loadDropdowns();
    loadBalances();
  };

  const exportPDF = () => {
    const input = document.getElementById('stockout-table');
    html2canvas(input).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('outward_report.pdf');
    });
  };

  const deleteStockout = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Outward entry?')) return;
    await axios.delete(`http://localhost:3001/api/stockout/${id}`);
    loadDropdowns();
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Outward</h2>

      <div className="mb-4 text-sm space-y-1">
        {inventoryQty !== null && <div>📦 Inventory Remaining: <strong>{inventoryQty}</strong></div>}
        {clientQty !== null && <div>🏢 Client Balance: <strong>{clientQty}</strong></div>}
        {userUsageQty !== null && <div>🙍‍♂️ Your Usage: <strong>{userUsageQty}</strong></div>}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} min={user?.role === 'engineer' ? today : undefined} className="p-2 border rounded" />
        <select value={form.inventory_id} onChange={(e) => setForm({ ...form, inventory_id: e.target.value })} className="p-2 border rounded">
          <option value="">Select Item</option>
          {inventory.map(item => <option key={item.id} value={item.id}>{item.item_name}</option>)}
        </select>
        <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="p-2 border rounded">
          <option value="">Select Client</option>
          {clients.map(cli => <option key={cli.id} value={cli.id}>{cli.client_name}</option>)}
        </select>

        <div className="md:col-span-3">
          <label className="block text-sm font-medium mb-1">Barcode</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Scan or enter barcode"
              value={form.barcode}
              onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              className="p-2 border rounded flex-1"
            />
            <button type="button" onClick={() => setScannerVisible(!scannerVisible)} className="bg-blue-600 text-white px-3 py-1 rounded">
              {scannerVisible ? 'Close' : 'Scan'}
            </button>
          </div>
          {scannerVisible && <BarcodeScanner onScan={handleScan} />}
        </div>

        {userRole?.toLowerCase() !== 'engineer' && (
  <input
    type="text"
    placeholder="Invoice No"
    value={form.invoice_no}
    onChange={(e) => setForm({ ...form, invoice_no: e.target.value })}
    className="p-2 border rounded"
  />
)}

        <input type="number" placeholder="Quantity" value={form.qty} onChange={(e) => {
          const q = parseInt(e.target.value || '0');
          setForm({ ...form, qty: e.target.value });
          if (form.barcode && q > 0) {
            const updated = [form.barcode, ...Array(q - 1).fill('')];
            setBarcodes(updated);
          }
        }} className="p-2 border rounded" />
        <input type="text" placeholder="Remark" value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} className="p-2 border rounded col-span-3" />

        <div className="md:col-span-3 flex justify-end">
          <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded w-auto">Add Outward</button>
        </div>
      </form>

      {barcodes.length > 0 && (
        <div className="my-4">
  <h3 className="font-semibold mb-2">Enter Barcodes Manually</h3>
  <div className="flex flex-wrap gap-2">  {/* 👈 Add spacing between inputs */}
    {barcodes.map((code, idx) => (
      <input
        key={idx}
        ref={el => (barcodeRefs.current[idx] = el)}
        type="text"
        value={code}
        onChange={(e) => {
          const updated = [...barcodes];
          updated[idx] = e.target.value;
          setBarcodes(updated);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && barcodeRefs.current[idx + 1]) {
            e.preventDefault();
            barcodeRefs.current[idx + 1].focus();
          }
        }}
        readOnly={idx === 0}
        className="p-2 border border-gray-400 rounded"
      />
    ))}
  </div>

        </div>
      )}

      <div className="flex gap-4 mb-4">
        <button onClick={() => exportToExcel(data, 'outward_report')} className="bg-green-500 text-white px-4 py-1 rounded">Export Excel</button>
        <button onClick={exportPDF} className="bg-red-500 text-white px-4 py-1 rounded">Export PDF</button>
      </div>

      <div id="stockout-table">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2">S.No</th>
              <th className="border px-2">Item</th>
              <th className="border px-2">Client</th>
              <th className="border px-2">Barcode</th>
              <th className="border px-2">Invoice</th>
              <th className="border px-2">Qty</th>
              <th className="border px-2">Remark</th>
              <th className="border px-2">Date</th>
              <th className="border px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.id}>
                <td className="border px-2">{i + 1}</td>
                <td className="border px-2">{row.item_name}</td>
                <td className="border px-2">{row.client_name}</td>
                <td className="border px-2">{row.barcode}</td>
                <td className="border px-2">{row.invoice_no}</td>
                <td className="border px-2">{row.qty}</td>
                <td className="border px-2">{row.remark}</td>
                <td className="border px-2">{new Date(row.date).toLocaleDateString()}</td>
                <td className="border px-2">
                  <button onClick={() => deleteStockout(row.id)} className="bg-red-600 text-white px-2 py-1 text-xs rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
