# 📱 Mobile Testing Guide - Access App on Your Phone

## Quick Start

### Step 1: Find Your Computer's IP Address

**On Windows (PowerShell or CMD):**
```bash
ipconfig
```

Look for `IPv4 Address` under your active network adapter:
- **WiFi**: Look under "Wireless LAN adapter Wi-Fi"
- **Ethernet**: Look under "Ethernet adapter"

Example output:
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

**Quick PowerShell Command:**
```powershell
(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias Wi-Fi*).IPAddress
```

### Step 2: Start Development Server

**Option A: Regular Command**
```bash
cd frontend
npm run dev
```

**Option B: Mobile-Optimized Command (NEW!)**
```bash
cd frontend
npm run dev:mobile
```

Both will show:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: http://192.168.1.100:8080/
  ➜  Network: http://[fe80::xxxx]:8080/
```

### Step 3: Access on Your Phone

1. **Ensure both devices are on the same WiFi network**
2. **Open your phone's browser** (Chrome, Safari, Firefox, etc.)
3. **Navigate to the Network URL**: `http://192.168.1.100:8080`
   - Replace `192.168.1.100` with YOUR computer's IP
4. **Login** with your credentials
5. **Test the PWA install prompt!**

## 🎯 Testing Checklist

### Mobile Features to Test:
- [ ] Dashboard loads correctly
- [ ] Logo shows in header
- [ ] App name visible on mobile
- [ ] Stats cards display in 1 column
- [ ] Consumption chart is readable
- [ ] Transaction cards (not table) on mobile
- [ ] Quick actions banner responsive
- [ ] PWA install prompt appears (after 3 seconds)
- [ ] Login page responsive
- [ ] Touch targets are adequate (buttons, inputs)

### PWA Installation Test:

**Android/Chrome:**
- [ ] Wait 3 seconds on dashboard
- [ ] Install prompt slides up from bottom
- [ ] Click "Install" button
- [ ] Native prompt appears
- [ ] Confirm installation
- [ ] App added to home screen
- [ ] Open from home screen (full-screen mode)

**iOS/Safari:**
- [ ] Wait 3 seconds on dashboard
- [ ] Manual instructions appear
- [ ] Follow steps to add to home screen
- [ ] App icon appears on home screen
- [ ] Open from home screen

## 🔧 Troubleshooting

### Can't Access from Phone?

**1. Check Firewall (Most Common Issue)**

Windows Firewall might be blocking port 8080. Allow it:

```powershell
# Run as Administrator
netsh advfirewall firewall add rule name="Vite Dev Server" dir=in action=allow protocol=TCP localport=8080
```

Or manually:
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Port → TCP → 8080 → Allow → Apply

**2. Verify Same Network**

On computer:
```bash
ipconfig
# Note the network (e.g., 192.168.1.x)
```

On phone:
- Go to WiFi settings
- Check IP address (should be same network: 192.168.1.x)

**3. Check Vite Config**

File: `frontend/vite.config.ts`

Should have:
```typescript
server: {
  host: "::",  // or "0.0.0.0"
  port: 8080,
}
```

**4. Restart Dev Server**

```bash
# Stop current server (Ctrl+C)
cd frontend
npm run dev:mobile
```

**5. Try Different IP Format**

If IPv4 doesn't work, try IPv6:
```
http://[fe80::xxxx]:8080
```

**6. Check Backend Connection**

If dashboard loads but can't fetch data:
- Backend must also accept connections from network
- Update backend to listen on `0.0.0.0` instead of `localhost`

File: `backend/index.js`
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

Then update frontend API base URL for network testing:

File: `frontend/src/lib/api.ts` (temporarily)
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.100:3000';
```

### Install Prompt Not Showing?

**Conditions that prevent prompt:**
- ❌ Already installed (running in standalone mode)
- ❌ On desktop (width > 768px)
- ❌ Dismissed within last 7 days
- ❌ Browser cache issue

**Solutions:**
1. Clear localStorage: `localStorage.clear()` in browser console
2. Clear browser cache
3. Try incognito/private browsing mode
4. Check browser console for errors
5. Verify screen width is ≤768px

### HTTPS Warning on Mobile?

Your phone might show security warnings because you're using HTTP (not HTTPS) with a local IP.

**Solutions:**
1. **Accept the warning** (safe for local development)
2. **Use ngrok** for HTTPS tunnel (see Advanced section)
3. **Install self-signed certificate** (complex, not recommended)

## 🌐 Alternative Methods

### Method 1: QR Code Access

Generate QR code for easy access:

1. Go to: https://www.qr-code-generator.com/
2. Enter your URL: `http://192.168.1.100:8080`
3. Generate QR code
4. Scan with phone camera

### Method 2: Using ngrok (Public HTTPS URL)

Install ngrok:
```bash
choco install ngrok  # Windows with Chocolatey
# or download from https://ngrok.com/download
```

Start tunnel:
```bash
# Terminal 1: Start your dev server
cd frontend
npm run dev

# Terminal 2: Start ngrok
ngrok http 8080
```

You'll get a public URL like:
```
https://abc123.ngrok.io
```

Access this URL from anywhere (even outside your network)!

**Note:** Backend will also need to be tunneled if using API calls.

### Method 3: Local Hostname (Windows)

If you have a Windows hostname set:
```bash
hostname
# Example output: DESKTOP-ABC123
```

Try accessing:
```
http://DESKTOP-ABC123.local:8080
```

(May not work on all networks)

## 📊 Network Performance Testing

### Check Load Times on Mobile:

1. Open Chrome DevTools on phone:
   - Chrome: `chrome://inspect/#devices`
   - Or use desktop Chrome's remote debugging

2. Check Network tab:
   - Should load within 3-5 seconds on local network
   - Slow? Check WiFi signal strength

3. Lighthouse Mobile Audit:
   - Chrome DevTools → Lighthouse → Mobile
   - Run audit to check performance

## 🔒 Security Notes

### Development Mode:
- ✅ Safe on your local network
- ⚠️ Don't expose to internet without security
- ⚠️ Use strong WiFi password

### Production Mode:
- Always use HTTPS
- Don't use dev server in production
- Build and deploy properly

## 📝 Useful Commands

### Quick Reference:

```bash
# Find your IP (Windows)
ipconfig | findstr IPv4

# Start dev server with network access
cd frontend
npm run dev:mobile

# Check if port is open
netstat -an | findstr 8080

# Clear firewall rule (if needed)
netsh advfirewall firewall delete rule name="Vite Dev Server"

# Re-add firewall rule
netsh advfirewall firewall add rule name="Vite Dev Server" dir=in action=allow protocol=TCP localport=8080
```

### Environment Variables:

Create `.env` in frontend:
```env
VITE_API_BASE_URL=http://192.168.1.100:3000
```

This allows API to work on mobile too.

## 🎨 Mobile Testing Best Practices

### 1. Test on Real Devices
- Emulators are good, but real devices are better
- Test on different screen sizes
- Test on both iOS and Android

### 2. Test Different Browsers
- Chrome (Android)
- Safari (iOS)
- Firefox
- Samsung Internet

### 3. Test Different Network Conditions
- Fast WiFi
- Slow WiFi
- 4G/5G (using ngrok)
- Offline mode (with service worker)

### 4. Test Touch Interactions
- Buttons should be ≥44x44px
- Inputs should be easy to tap
- No hover-only features
- Test swipe gestures

### 5. Test Orientations
- Portrait mode
- Landscape mode
- Auto-rotation

## 🚀 Next Steps

After mobile testing works:

1. **Add Service Worker** for offline support
2. **Optimize Images** for mobile
3. **Add Touch Gestures** for better UX
4. **Test on Multiple Devices** (different OS, screens)
5. **Performance Optimization** (lazy loading, code splitting)
6. **Deploy to Production** with HTTPS

## 📱 Expected Results

### On Your Phone You Should See:

1. **Login Page**:
   - Responsive layout
   - Glassmorphism card
   - Touch-friendly inputs
   - Smooth animations

2. **Dashboard**:
   - Logo in header
   - App name visible
   - 4 stat cards (stacked)
   - Consumption chart
   - Transaction cards (not table)
   - Quick actions banner at top

3. **Install Prompt** (after 3 seconds):
   - Android: Native install button
   - iOS: Manual instructions
   - Smooth slide-up animation

4. **After Installation**:
   - App icon on home screen
   - Opens in full-screen (no browser chrome)
   - Fast loading
   - Native app feel

---

## ✅ Success Checklist

- [ ] Found computer's IP address
- [ ] Started dev server with `npm run dev:mobile`
- [ ] Firewall allows port 8080
- [ ] Both devices on same WiFi
- [ ] Accessed app on phone successfully
- [ ] Dashboard loads completely
- [ ] All mobile features work
- [ ] PWA install prompt appears
- [ ] Installed app to home screen
- [ ] App runs in standalone mode

## 🆘 Still Having Issues?

**Check these common problems:**
1. Typo in IP address
2. Wrong port number
3. Firewall blocking
4. VPN or proxy interfering
5. Different WiFi networks
6. Backend not accessible from network

**Debug steps:**
1. Can you ping the IP? `ping 192.168.1.100`
2. Can you access in computer's browser? `http://localhost:8080`
3. Can phone access other local services?
4. Check Windows Event Viewer for firewall blocks
5. Try disabling firewall temporarily (testing only!)

---

**Happy Mobile Testing! 📱✨**

Remember: This is for development only. For production, deploy to a proper hosting service with HTTPS!
