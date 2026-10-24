"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network Error. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center p-4">
      <div className="bg-[#1A1B23] p-8 rounded-xl border border-purple-900/50 w-full max-w-md shadow-[0_0_20px_rgba(139,92,246,0.15)]">
        <h1 className="text-3xl font-bold text-center mb-8 tracking-wider">
          <span className="text-purple-500">CRAZY</span> <span className="text-purple-400">PANEL</span>
        </h1>
        
        {error && <div className="bg-red-900/50 text-red-400 p-3 rounded mb-4 text-sm text-center border border-red-800">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full bg-[#0B0C10] border border-gray-800 rounded p-3 text-white focus:border-purple-500 outline-none transition" 
              required 
            />
          </div>
          
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-[#0B0C10] border border-gray-800 rounded p-3 text-white focus:border-purple-500 outline-none transition pr-12" 
              required 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm"
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={() => alert('Please contact Admin to reset password.')} className="text-xs text-purple-400 hover:underline">
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded transition shadow-lg shadow-purple-900/50 mt-2">
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}
