# Testing the Consumption Analytics Chart

## Prerequisites
- Backend server running (`cd backend && npm run dev`)
- Frontend server running (`cd frontend && npm run dev`)
- Firebase configured with valid credentials
- At least one user registered in the system

## Testing Methods

### Method 1: Generate Historical Test Data (Recommended)

This creates realistic consumption data for the last 24-48 hours:

```bash
# Navigate to backend directory
cd backend

# Run without arguments to see available users
node generate-test-consumption.js

# Generate 24 hours of data (default)
node generate-test-consumption.js <USER_ID> <METER_NO>

# Generate 48 hours of data
node generate-test-consumption.js <USER_ID> <METER_NO> 48

# Example with actual data:
node generate-test-consumption.js -OcEgAb2iCzRn32GUzcc 55555 24
```

**What it does:**
- Creates hourly consumption records with realistic patterns
- Morning peak (6am-10am): ~1.5 units/hour
- Daytime (10am-5pm): ~1.0 units/hour  
- Evening peak (5pm-10pm): ~2.0 units/hour
- Night (10pm-6am): ~0.3 units/hour

### Method 2: Test API Endpoint Directly

Test the backend API to see what data is being returned:

```bash
# Test daily analytics (last 24 hours)
curl http://localhost:3000/analytics/consumption/<USER_ID>?period=daily

# Test weekly analytics (last 7 days)
curl http://localhost:3000/analytics/consumption/<USER_ID>?period=weekly

# Test monthly analytics (last 30 days)
curl http://localhost:3000/analytics/consumption/<USER_ID>?period=monthly

# Example:
curl http://localhost:3000/analytics/consumption/-OcEgAb2iCzRn32GUzcc?period=daily
```

**Expected Response:**
```json
{
  "period": "daily",
  "data": [
    {
      "label": "12 AM",
      "value": 0.25
    },
    {
      "label": "01 AM",
      "value": 0.30
    }
    // ... more data points
  ],
  "summary": {
    "total": 24.50,
    "average": 1.02,
    "peak": 2.15,
    "dataPoints": 24
  }
}
```

### Method 3: Use Existing MQTT Consumption

If you have the ESP32 device running and consuming units:

1. **Login to the dashboard** with your credentials
2. **Navigate to dashboard** - the chart should load automatically
3. **Wait for data** - chart displays after consumption records exist
4. **Toggle periods** - Click Daily/Weekly/Monthly buttons to see different views

### Method 4: Manual Firebase Entry

Add test data directly in Firebase Console:

1. Go to Firebase Console → Realtime Database
2. Navigate to `unit_consumption` node
3. Add records with this structure:
```json
{
  "unit_consumption": {
    "uniqueKey1": {
      "consumption_id": "uniqueKey1",
      "user_id": "YOUR_USER_ID",
      "meter_no": "YOUR_METER_NO",
      "units_consumed": 1.5,
      "units_before": 100.0,
      "units_after": 98.5,
      "consumption_rate": 0.1,
      "timestamp": "2025-12-06T10:00:00.000Z",
      "type": "manual_test"
    }
  }
}
```

## Verifying the Chart Works

### 1. Check Browser Console
Open Developer Tools (F12) and look for:
- ✅ No red errors related to Chart.js
- ✅ Success messages: "Fetching daily consumption analytics"
- ✅ Data being received from API

### 2. Visual Verification
The chart should show:
- ✅ **Three toggle buttons** (Daily/Weekly/Monthly) at the top
- ✅ **Three summary cards** showing Total, Average, and Peak consumption
- ✅ **Line chart** with smooth gradient fill
- ✅ **Hover tooltips** when you mouse over data points
- ✅ **Loading spinner** while fetching data
- ✅ **"No data" message** if no consumption records exist

### 3. Test Each Period

**Daily View:**
- Shows last 24 hours
- X-axis: Hourly labels (12 AM, 01 AM, etc.)
- Should have 24 data points

**Weekly View:**
- Shows last 7 days
- X-axis: Day labels (Mon Dec 2, Tue Dec 3, etc.)
- Should have 7 data points

**Monthly View:**
- Shows last 30 days
- X-axis: Date labels (Dec 1, Dec 2, etc.)
- Should have 30 data points

## Troubleshooting

### Chart Not Showing
1. Check browser console for errors
2. Verify backend is running: `http://localhost:3000/health`
3. Test API endpoint directly (see Method 2)
4. Ensure userId is correct (check AuthContext in browser console)

### "No consumption data available"
- No records exist in Firebase `unit_consumption` table
- Run `generate-test-consumption.js` to create data
- Check if userId matches records in database

### Chart Loads Then Crashes
- Clear browser cache (Ctrl+Shift+R)
- Restart dev server
- Check vite.config.ts has React deduplication settings
- Verify chart.js versions: `npm list chart.js react-chartjs-2`

### API Returns Empty Data
```bash
# Check if consumption records exist
# In Firebase Console, look for unit_consumption node

# Or query via backend:
node -e "require('./firebase').db.ref('unit_consumption').once('value', snap => { console.log('Records:', snap.numChildren()); process.exit(0); })"
```

## Quick Test Checklist

- [ ] Backend server running
- [ ] Frontend server running  
- [ ] User logged into dashboard
- [ ] Test data generated (run generate-test-consumption.js)
- [ ] Chart loads without errors
- [ ] All three period toggles work
- [ ] Summary cards display correct values
- [ ] Hover tooltips show on data points
- [ ] Chart updates when toggling periods

## Sample Test Flow

```bash
# 1. Start backend
cd backend
npm run dev

# 2. In another terminal, generate test data
cd backend
node generate-test-consumption.js -OcEgAb2iCzRn32GUzcc 55555 48

# 3. Start frontend (in another terminal)
cd frontend
npm run dev

# 4. Open browser
# Navigate to: http://localhost:8080
# Login with your credentials
# View the dashboard - chart should display!

# 5. Test API directly
curl http://localhost:3000/analytics/consumption/-OcEgAb2iCzRn32GUzcc?period=daily | json_pp
```

## Expected Behavior

✅ **Loading State**: Spinner appears while fetching data  
✅ **Data Display**: Chart renders with smooth line and gradient  
✅ **Summary Cards**: Show total, average, and peak values  
✅ **Interactive**: Hover shows tooltips with exact values  
✅ **Period Toggle**: Switching updates chart smoothly  
✅ **Responsive**: Works on mobile and desktop  
✅ **Error Handling**: Shows friendly error if data fetch fails  

---

**Need Help?** Check browser console (F12) for detailed error messages.
