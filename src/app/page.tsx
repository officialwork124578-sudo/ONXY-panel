"use client";
import { useState, useEffect, useRef } from 'react';

export default function Dashboard() {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('wss://onxy-backend.onrender.com/ws?role=admin');
    ws.current.onopen = () => setIsConnected(true);
    ws.current.onclose = () => setIsConnected(false);
    return () => ws.current?.close();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto text-center mt-20">
        <h1 className="text-4xl font-bold text-purple-500 mb-4">ONXY MDM Panel</h1>
        <p className="text-xl mb-8">
          Connection Status: {isConnected ? '✅ Online' : '❌ Offline'}
        </p>
        <div className="bg-[#1A1B23] p-6 rounded-xl border border-gray-800 mb-8">
          <h2 className="text-2xl mb-4">Download Latest APK</h2>
          <a href="/crazy-onxy-MDM/app-debug.apk" download className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition">
            ⬇ Download APK
          </a>
        </div>
        <p className="text-gray-400">
          If you see this screen, the black screen issue is fixed. 
          <br/>
          We will add the 500+ device UI back once this is verified.
        </p>
      </div>
    </div>
  );
}
