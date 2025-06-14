import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import BarcodeScanner from './BarcodeScanner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function StockIn() {
  
  const [form, setForm] = useState({
    date: '',
    inventory_id: '',
    client_id: '',
    barcode: '',
    invoice_no: '',
    qty: '',
    remark: ''
  });

  const userRole = localStorage.getItem('role');
  const user = JSON.parse(localStorage.getItem('user'));
  const [inventory, setInventory] = useState([]);
  const [clients, setClients] = useState([]);
  const [data, setData] = useState([]);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [barcodes, setBarcodes] = useState([]);
  const barcodeRefs = useRef([]);
  const scanRef = useRef(null);
  const canStockIn = role === 'admin' || localStorage.getItem('can_stockin') === '1';

  const loadDropdowns = async () => {
    try {
      const [invRes, cliRes, stockRes] = await Promise.all([
        axios.get('http://localhost:3001/api/inventory'),
        axios.get('http://localhost:3001/api/clients'),
        axios.get(`http://localhost:3001/api/stockin/${userRole}/${user.id}`)
      ]);
      setInventory(invRes.data);
      setClients(cliRes.data);
      setData(stockRes.data);
    } catch (err) {
      console.error('Dropdown loading failed:', err);
    }
  };
  useEffect(() => {
    loadDropdowns();
    scanRef.current?.focus();
  }, []);
if (!canStockIn) {
    return <div className="p-4 text-red-600 font-bold">⛔ Access Denied: You do not have permission to access Stock In.</div>;
  }
  const handleScan = (value) => {
    const qty = parseInt(form.qty || '1');
    if (isNaN(qty) || qty < 1) {
      alert("Please enter a valid quantity first.");
      return;
    }

    const initialBarcodes = [value, ...Array(qty - 1).fill('')];
    setForm(prev => ({ ...prev, barcode: value }));
    setBarcodes(initialBarcodes);
    setScannerVisible(false);

    setTimeout(() => {
      if (barcodeRefs.current[1]) {
        barcodeRefs.current[1].focus();
      }
    }, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id || isNaN(user.id)) {
      alert('User not logged in or invalid user ID.');
      return;
    }

    const qty = parseInt(form.qty);
    if (!form.date || !form.inventory_id || !form.client_id || !qty || barcodes.length !== qty || barcodes.includes('')) {
      alert('Fill all required fields and complete all barcode entries.');
      return;
    }

    try {
      for (const code of barcodes) {
        const payload = {
          date: form.date,
          inventory_id: Number(form.inventory_id),
          client_id: Number(form.client_id),
          barcode: code,
          invoice_no: form.invoice_no,
          qty: 1,
          remark: form.remark,
          user_id: Number(user.id),
          role: user.role
        };
        console.log('Submitting:', payload);
        await axios.post('http://localhost:3001/api/stockin', payload);
      }

      setForm({
        date: '',
        inventory_id: '',
        client_id: '',
        barcode: '',
        invoice_no: '',
        qty: '',
        remark: ''
      });
      setBarcodes([]);
      loadDropdowns();
      scanRef.current?.focus();
    } catch (err) {
      console.error('StockIn submission failed:', err.response?.data || err);
      alert('Error submitting Stock IN.');
    }
  };

  const deleteStockIn = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stock entry?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/stockin/${id}`);
      loadDropdowns();
    } catch (err) {
      console.error(err);
      alert('Failed to delete stock entry');
    }
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'StockIn');
    XLSX.writeFile(wb, 'stockin.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['S.No', 'Item', 'Client', 'Barcode', 'Invoice', 'Qty', 'Remark', 'Date']],
      body: data.map((row, i) => [
        i + 1,
        row.item_name,
        row.client_name,
        row.barcode,
        row.invoice_no,
        row.qty,
        row.remark,
        new Date(row.date).toLocaleDateString()
      ])
    });
    doc.save('stockin.pdf');
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Stock In</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="p-2 border rounded" />
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

        <input
          type="text"
          placeholder="Invoice No"
          value={form.invoice_no}
          onChange={(e) => setForm({ ...form, invoice_no: e.target.value })}
          className="p-2 border rounded"
          disabled={userRole === 'user'}
        />

        <input
          type="number"
          placeholder="Quantity"
          value={form.qty}
          onChange={(e) => {
            const newQty = parseInt(e.target.value || '1');
            setForm({ ...form, qty: e.target.value });
            if (form.barcode && newQty > 0) {
              const updated = [form.barcode, ...Array(newQty - 1).fill('')];
              setBarcodes(updated);
            }
          }}
          className="p-2 border rounded"
        />

        <input type="text" placeholder="Remark" value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} className="p-2 border rounded md:col-span-2" />

        <div className="md:col-span-3 flex justify-end">
          <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded w-auto">Add Stock</button>
        </div>
      </form>

      {barcodes.length > 0 && (
        <div className="my-4">
          <h3 className="font-semibold mb-2">Enter Barcodes Manually</h3>
          <div className="flex flex-wrap gap-3">
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
        <button onClick={exportExcel} className="bg-blue-600 text-white px-4 py-2 rounded">Export Excel</button>
        <button onClick={exportPDF} className="bg-red-600 text-white px-4 py-2 rounded">Export PDF</button>
      </div>

      <h3 className="text-md font-semibold mb-2">Stock In History</h3>
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
                <button onClick={() => deleteStockIn(row.id)} className="bg-red-600 text-white px-2 py-1 text-xs rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
