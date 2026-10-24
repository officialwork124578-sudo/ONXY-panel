"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Login() {
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [e, setE] = useState('');
  const router = useRouter();
  const handle = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) });
    if ((await r.json()).success) { router.push('/'); router.refresh(); } else setE('Invalid credentials');
  };
  return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center p-4">
      <div className="bg-[#1A1B23] p-8 rounded-xl border border-purple-900/50 w-full max-w-md shadow-[0_0_20px_rgba(139,92,246,0.15)]">
        <h1 className="text-3xl font-bold text-center mb-8"><span className="text-purple-500">CRAZY</span> <span className="text-purple-400">PANEL</span></h1>
        {e && <div className="bg-red-900/50 text-red-400 p-3 rounded mb-4 text-sm text-center border border-red-800">{e}</div>}
        <form onSubmit={handle} className="space-y-4">
          <input type="text" placeholder="Username" value={u} onChange={e => setU(e.target.value)} className="w-full bg-[#0B0C10] border border-gray-800 rounded p-3 text-white focus:border-purple-500 outline-none" required />
          <input type="password" placeholder="Password" value={p} onChange={e => setP(e.target.value)} className="w-full bg-[#0B0C10] border border-gray-800 rounded p-3 text-white focus:border-purple-500 outline-none" required />
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded">LOGIN</button>
        </form>
      </div>
    </div>
  );
}
