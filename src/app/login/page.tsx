"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function LoginPage() {
  const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  const router = useRouter();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    const data = await res.json();
    if (data.success) { router.push('/'); router.refresh(); } else { setError('Invalid Credentials'); }
  };
  return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center p-4">
      <div className="bg-[#1A1B23] p-8 rounded-xl border border-gray-800 w-full max-w-md shadow-2xl">
        <h1 className="text-2xl font-bold text-purple-500 text-center mb-6">CRAZY Web Admin</h1>
        {error && <div className="bg-red-900/50 text-red-400 p-3 rounded mb-4 text-sm text-center">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full bg-black border border-gray-700 rounded p-3 text-white outline-none" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-black border border-gray-700 rounded p-3 text-white outline-none" required />
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded">Login</button>
        </form>
      </div>
    </div>
  );
}
