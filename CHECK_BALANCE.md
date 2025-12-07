# Quick Balance Check

## Check Backend Logs

When you make a payment, look for these messages in your backend terminal:

```
[TIMESTAMP] Creating transaction for meter 55555, amount: XX, status: SUCCESS
Created transaction -XXXXX for user -OcEgAb2iCzRn32GUzcc: X.X units
Updated user -OcEgAb2iCzRn32GUzcc balance: X.X
Publishing balance update to ESP32: X.X units
```

## Check Firebase Console

1. Go to: https://console.firebase.google.com
2. Select: `iot-smart-meter-205fe`
3. Click: **Realtime Database** (left sidebar)
4. Navigate to: `users/-OcEgAb2iCzRn32GUzcc`
5. Look for: `balance: X.X`

## Check Browser Console

After payment, you should see:
```
[Firebase] Balance updated: X.X units
```

If you see `Balance updated: 0 units` - then Firebase has 0 stored.
If you don't see "Balance updated" at all - Firebase listener isn't working.
