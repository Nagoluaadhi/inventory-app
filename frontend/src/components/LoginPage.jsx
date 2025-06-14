import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
export default function LoginPage({ setUser }) {
  const [form, setForm] = useState({ username: '', password: '', role: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      ...form,
      role: form.role.toLowerCase()
    };

    const res = await axios.post('http://localhost:3001/api/users/login', payload);
    const user = res.data;

    console.log('✅ Login success:', user);

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('user_id', user.id);
    localStorage.setItem('role', user.role);

    if (user.role === 'user') {
      localStorage.setItem('client_id', user.client_id); // optional
    }

    setUser(user);

    // 👇 Role-based redirection
    if (user.role === 'engineer') {
      navigate('app/stockin');
    } else {
      navigate('/app/dashboard');
    }

  } catch (err) {
    console.error('❌ Login error:', err);
    setError(err.response?.data?.error || 'Login failed');
  }
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <div className="relative">
  <input
    type={showPassword ? 'text' : 'password'}
    placeholder="Password"
    value={form.password}
    onChange={(e) => setForm({ ...form, password: e.target.value })}
    className="w-full p-2 border rounded pr-10"
    required
  />
  <div
    className="absolute top-2.5 right-3 w-5 h-5 text-gray-500 cursor-pointer"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
  </div>
</div>

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="engineer">Engineer</option>
          </select>
          <button type="submit" className="w-full bg-orange-600 text-white p-2 rounded hover:bg-orange-700">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
