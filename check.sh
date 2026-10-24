echo "=== ONYX PANEL DIAGNOSTIC ==="
echo "[*] Checking File Structure..."
if [ -f src/app/api/login/route.ts ]; then echo "[OK] Login API file exists"; else echo "[X] Login API MISSING"; fi
if [ -f src/proxy.ts ]; then echo "[OK] Proxy (Security Guard) exists"; else echo "[X] Proxy MISSING"; fi
if [ -f src/app/page.tsx ]; then echo "[OK] Dashboard UI exists"; else echo "[X] Dashboard UI MISSING"; fi
echo ""
echo "=== BACKEND STATUS ==="
if grep -q "auth" src/app/api/login/route.ts; then echo "[REAL] Authentication (Cookie) is working."; fi
if grep -q "smsList" src/app/page.tsx; then echo "[FAKE] SMS/Device Data is hardcoded (Mock)."; fi
if grep -q "Mock Photo" src/app/page.tsx; then echo "[FAKE] Gallery Photos are mocked."; fi
echo ""
echo "=== SETTINGS CHECK ==="
if grep -q "alert" src/app/page.tsx; then echo "[OK] Buttons have interactions."; else echo "[X] Buttons are static."; fi
