import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import BarcodeScanner from './BarcodeScanner';
import { exportToExcel } from '../utils/exportExcel';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Services() {
  const [form, setForm] = useState({
    client_id: '',
    vehicle_no: '',
    service_remark: '',
    charges: '',
    status: '',
    barcode: '',
    warranty_status: '',
    date_time: '',
    qty: ''
  });

  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [barcodes, setBarcodes] = useState([]);
  const [scannerVisible, setScannerVisible] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = localStorage.getItem('role'); // add this
  const barcodeRefs = useRef([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const cli = await axios.get('http://localhost:3001/api/clients');
    const svc = await axios.get('http://localhost:3001/api/services', { params: { user_id: user.id } }); // ✅ filter by user
    setClients(cli.data);
    setServices(svc.data);
  };

  const handleScan = (value) => {
    const qty = parseInt(form.qty || '1');
    if (isNaN(qty) || qty < 1) {
      alert('Please enter quantity first');
      return;
    }
    const initialBarcodes = [value, ...Array(qty - 1).fill('')];
    setForm({ ...form, barcode: value });
    setBarcodes(initialBarcodes);
    setScannerVisible(false);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!user || !user.id) return alert('User not logged in');

  const qty = parseInt(form.qty);
  if (!form.client_id || !form.date_time || !qty || barcodes.length !== qty || barcodes.includes('')) {
    alert('Please fill all required fields and barcode entries');
    return;
  }

  try {
    await axios.post('http://localhost:3001/api/services', {
      ...form,
      barcodes,
      user_id: user.id
    });

    setForm({
      client_id: '',
      vehicle_no: '',
      service_remark: '',
      charges: '',
      status: '',
      barcode: '',
      warranty_status: '',
      date_time: '',
      qty: ''
    });
    setBarcodes([]);
    setScannerVisible(false);
    loadData();
  } catch (err) {
    console.error('Service submission failed:', err);
    alert('Something went wrong. Please check the server.');
  }
};


  const exportPDF = () => {
    const input = document.getElementById('service-table');
    html2canvas(input).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('services_report.pdf');
    });
  };

  const deleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    await axios.delete(`http://localhost:3001/api/services/${id}`);
    loadData();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Services</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} className="p-2 border rounded">
          <option value="">Select Client</option>
          {clients.map(cli => <option key={cli.id} value={cli.id}>{cli.client_name}</option>)}
        </select>
        <input type="text" placeholder="Vehicle No" value={form.vehicle_no} onChange={e => setForm({ ...form, vehicle_no: e.target.value })} className="p-2 border rounded" />
        <input type="text" placeholder="Service Remark" value={form.service_remark} onChange={e => setForm({ ...form, service_remark: e.target.value })} className="p-2 border rounded" />
        <input type="text" placeholder="Charges" value={form.charges} onChange={e => setForm({ ...form, charges: e.target.value })} className="p-2 border rounded" />
        <input type="text" placeholder="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="p-2 border rounded" />

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

        <input type="number" placeholder="Quantity" value={form.qty} onChange={(e) => {
          const q = parseInt(e.target.value || '1');
          setForm({ ...form, qty: e.target.value });
          if (form.barcode && q > 0) {
            const updated = [form.barcode, ...Array(q - 1).fill('')];
            setBarcodes(updated);
          }
        }} className="p-2 border rounded" />

        <input type="text" placeholder="Warranty Status" value={form.warranty_status} onChange={(e) => setForm({ ...form, warranty_status: e.target.value })} className="p-2 border rounded" />
        <input type="datetime-local" value={form.date_time} onChange={(e) => setForm({ ...form, date_time: e.target.value })} className="p-2 border rounded" />

        <div className="md:col-span-3 flex justify-end">
          <button type="submit" className="bg-green-600 text-white px-3 py-2 text-sm rounded w-auto">
            Add Service
          </button>
        </div>
      </form>

      {barcodes.length > 0 && (
        <div className="my-4">
          <h3 className="font-semibold mb-2">Enter Barcodes</h3>
          <div className="grid grid-cols-5 gap-2">
            {barcodes.map((code, idx) => (
  <input
    key={idx}
    ref={el => barcodeRefs.current[idx] = el}
    type="text"
    value={code}
    onChange={(e) => {
      const updated = [...barcodes];
      updated[idx] = e.target.value;
      setBarcodes(updated);

      // Auto-focus next input
      if (e.target.value && barcodeRefs.current[idx + 1]) {
        barcodeRefs.current[idx + 1].focus();
      }
    }}
    className="p-2 border border-gray-400 rounded"
  />
))}

          </div>
        </div>
      )}

      <div className="flex gap-4 mb-4">
        <button onClick={() => exportToExcel(services, 'services_report')} className="bg-green-500 text-white px-4 py-1 rounded">Export Excel</button>
        <button onClick={exportPDF} className="bg-red-500 text-white px-4 py-1 rounded">Export PDF</button>
      </div>

      <div id="service-table">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2">S.No</th>
              <th className="border px-2">Client</th>
              <th className="border px-2">Vehicle</th>
              <th className="border px-2">Remark</th>
              <th className="border px-2">Charges</th>
              <th className="border px-2">Status</th>
              <th className="border px-2">Barcode</th>
              <th className="border px-2">Warranty</th>
              <th className="border px-2">Date</th>
              <th className="border px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {services.map((item, i) => (
              <tr key={item.id}>
                <td className="border px-2">{i + 1}</td>
                <td className="border px-2">{item.client_name}</td>
                <td className="border px-2">{item.vehicle_no}</td>
                <td className="border px-2">{item.service_remark}</td>
                <td className="border px-2">{item.charges}</td>
                <td className="border px-2">{item.status}</td>
                <td className="border px-2">{item.barcode}</td>
                <td className="border px-2">{item.warranty_status}</td>
                <td className="border px-2">{new Date(item.date_time).toLocaleString()}</td>
                <td className="border px-2">
                  <button
                    onClick={() => deleteService(item.id)}
                    className="bg-red-600 text-white px-2 py-0.5 text-xs rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
