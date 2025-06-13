import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function UserManagement() {
  const [allUsers, setAllUsers] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('');
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: '' });
  const user = JSON.parse(localStorage.getItem('user'));
  const [inventoryForm, setInventoryForm] = useState({ item_name: '', qty: '' });
  const [clientForm, setClientForm] = useState({ client_name: '', branch_user_id: user?.role === 'user' ? user.id : '' });
  const [inventory, setInventory] = useState([]);
  const [clients, setClients] = useState([]);

  const loadInventory = async () => {
    const res = await axios.get('http://localhost:3001/api/inventory');
    setInventory(res.data);
  };

  const loadUsers = async () => {
    const res = await axios.get('http://localhost:3001/api/users');
    setUsers(res.data);
    setAllUsers(res.data);
  };

  const loadClients = async () => {
  console.log('📤 Sending /api/clients with:', { userId: user?.id, role: user?.role });
  const res = await axios.get('http://localhost:3001/api/clients', {
    params: {
      userId: user?.id,
      role: user?.role
    }
  });
  setClients(res.data);
};


  useEffect(() => {
    loadUsers();
    loadClients();
    loadInventory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.role) {
      alert('Please fill all fields');
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/users', form);
      alert('User created successfully');
      setForm({ username: '', password: '', role: '' });
      loadUsers();
    } catch (err) {
      if (err.response?.status === 409) {
        alert('Username already exists');
      } else if (err.response?.status === 400) {
        alert('All fields are required');
      } else {
        alert('User creation failed');
      }
    }
  };

  const handleInventorySubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:3001/api/inventory', inventoryForm);
    setInventoryForm({ item_name: '', qty: '' });
    loadInventory();
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:3001/api/clients', {
      ...clientForm,
      branch_user_id: Number(clientForm.branch_user_id)
    });
    loadClients();
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`http://localhost:3001/api/users/${id}`);
      alert('User deleted successfully');
      loadUsers();
    } catch (err) {
      if (err.response?.status === 400) {
        const force = window.confirm('This user is in use. Do you want to force delete?');
        if (force) {
          try {
            await axios.delete(`http://localhost:3001/api/users/${id}?force=true`);
            alert('User and associated data deleted');
            loadUsers();
          } catch {
            alert('Force delete failed.');
          }
        }
      } else {
        alert('Delete failed.');
      }
    }
  };

  const deleteClient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;

    try {
      await axios.delete(`http://localhost:3001/api/clients/${id}`);
      alert('Client deleted successfully');
      loadClients();
    } catch (err) {
      if (err.response?.status === 400) {
        const force = window.confirm('This client is in use. Do you want to force delete?');
        if (force) {
          try {
            await axios.delete(`http://localhost:3001/api/clients/${id}?force=true`);
            alert('Client and associated data deleted');
            loadClients();
          } catch {
            alert('Force delete failed.');
          }
        }
      } else {
        alert('Delete failed.');
      }
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setNewName(item.item_name);
    setNewQty(item.qty);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3001/api/inventory/${editingItem.id}`, {
        item_name: newName,
        qty: newQty
      });
      setEditingItem(null);
      loadInventory();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const deleteInventory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inventory item?')) return;

    try {
      await axios.delete(`http://localhost:3001/api/inventory/${id}`);
      alert('Inventory deleted successfully');
      loadInventory();
    } catch (err) {
      if (err.response?.status === 400) {
        const force = window.confirm('This item is in use. Do you want to force delete?');
        if (force) {
          try {
            await axios.delete(`http://localhost:3001/api/inventory/${id}?force=true`);
            alert('Item and related data deleted');
            loadInventory();
          } catch {
            alert('Force delete failed.');
          }
        }
      } else {
        alert('Delete failed.');
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">User Management</h2>

      {/* Create User Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input type="text" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="p-2 border rounded" />
        <input type="text" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="p-2 border rounded" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="p-2 border rounded">
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="engineer">Engineer</option>
          <option value="user">User</option>
        </select>
        <div className="md:col-span-3">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded w-auto">Create User</button>
        </div>
      </form>

      {/* User Table */}
      <h3 className="text-md font-semibold mb-2">Users</h3>
      <table className="w-full text-sm border mb-8">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Username</th>
            <th className="border px-2 py-1">Password</th>
            <th className="border px-2 py-1">Role</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="border px-2 py-1">{user.id}</td>
              <td className="border px-2 py-1">{user.username}</td>
              <td className="border px-2 py-1">{user.password}</td>
              <td className="border px-2 py-1">{user.role}</td>
              <td className="border px-2 py-1">
                <button onClick={() => deleteUser(user.id)} className="bg-red-600 text-white px-2 py-1 text-xs rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Inventory Form */}
      <h3 className="text-md font-semibold mb-2">Create Items</h3>
      <form onSubmit={handleInventorySubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input type="text" placeholder="Item Name" value={inventoryForm.item_name} onChange={(e) => setInventoryForm({ ...inventoryForm, item_name: e.target.value })} className="p-2 border rounded" />
        <input type="number" placeholder="Quantity" value={inventoryForm.qty} onChange={(e) => setInventoryForm({ ...inventoryForm, qty: e.target.value })} className="p-2 border rounded" />
        <div className="md:col-span-3">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded w-auto">Create Items</button>
        </div>
      </form>

      {/* Inventory Table */}
      <h3 className="text-md font-semibold mb-2">Existing Items</h3>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Item Name</th>
            <th className="border px-2 py-1">QTY</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map(item => (
            <tr key={item.id}>
              <td className="border px-2 py-1">{item.id}</td>
              {editingItem?.id === item.id ? (
                <>
                  <td className="border px-2 py-1">
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} className="border p-1 w-full" />
                  </td>
                  <td className="border px-2 py-1">
                    <input type="number" value={newQty} onChange={(e) => setNewQty(e.target.value)} className="border p-1 w-full" />
                  </td>
                  <td className="border px-2 py-1">
                    <button onClick={handleUpdate} className="text-green-600 mr-2 hover:underline">Save</button>
                    <button onClick={() => setEditingItem(null)} className="text-gray-600 hover:underline">Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="border px-2 py-1">{item.item_name}</td>
                  <td className="border px-2 py-1">{item.qty}</td>
                  <td className="border px-2 py-1">
                    <div className="flex flex-col md:flex-row gap-2">
  <button
    onClick={() => handleEditClick(item)}
    className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-3 py-1 rounded shadow transition duration-200"
  >
    ✏️ Edit
  </button>
  <button
    onClick={() => deleteInventory(item.id)}
    className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded shadow transition duration-200"
  >
    🗑️ Delete
  </button>
</div>

                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Client Form */}
      <h3 className="text-md font-semibold mt-6 mb-2">Create Client</h3>
<form onSubmit={handleClientSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-center">
  {user?.role === 'admin' && (
    <select
      value={clientForm.branch_user_id}
      onChange={(e) => setClientForm({ ...clientForm, branch_user_id: e.target.value })}
      className="p-2 border rounded"
    >
      <option value="">Assign User</option>
      {allUsers
        .filter(u => u.role === 'user')
        .map(u => (
          <option key={u.id} value={u.id}>{u.username}</option>
        ))}
    </select>
  )}

  <input
    type="text"
    placeholder="Client Name"
    value={clientForm.client_name}
    onChange={(e) => setClientForm({ ...clientForm, client_name: e.target.value })}
    className="p-2 border rounded"
  />

  <button
    type="submit"
    className="bg-blue-600 text-white px-6 py-2 rounded w-full md:w-auto"
  >
    Add Client
  </button>
</form>
      {/* Client Table */}
      <h3 className="text-md font-semibold mb-2">Existing Clients</h3>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
  <tr>
    <th className="border px-2 py-1">ID</th>
    <th className="border px-2 py-1">Client Name</th>
    <th className="border px-2 py-1">Assigned Branch</th>
    <th className="border px-2 py-1">Action</th>
  </tr>
</thead>
        <tbody>
  {clients.map(client => {
    const assignedUser = allUsers.find(u => u.id === client.branch_user_id);
    return (
      <tr key={client.id}>
        <td className="border px-2 py-1">{client.id}</td>
        <td className="border px-2 py-1">{client.client_name}</td>
        <td className="border px-2 py-1">{assignedUser?.username || '—'}</td>
        <td className="border px-2 py-1">
          <div className="flex justify-start">
            <button
              onClick={() => deleteClient(client.id)}
              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1 text-xs rounded shadow transition duration-200"
            >
              🗑️ Delete
            </button>
          </div>
        </td>
      </tr>
    );
  })}
</tbody>

      </table>
    </div>
  );
}
