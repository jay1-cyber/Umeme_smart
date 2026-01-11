# ESP32 Smart Meter - Schematic & Wiring Guide

## 1. PIN CONNECTIONS

### ESP32 DevKit V1 Pinout
```
                    ┌─────────────────────┐
                    │    ESP32 DevKit V1  │
                    │                     │
              3V3 ──┤ 3V3           VIN ├── 5V Input
              GND ──┤ GND           GND ├── GND
  (OLED SDA) IO21 ──┤ IO21         IO22 ├── IO22 (OLED SCL)
             IO19 ──┤ IO19         IO23 ├── IO23
             IO18 ──┤ IO18          IO5 ├── IO5  (LED_RED)
  (SIM TX)   IO17 ──┤ IO17         IO17 ├── IO17 (LED_GREEN)
  (SIM RX)   IO16 ──┤ IO16         IO16 ├── IO16 (LED_BLUE)
   (BUZZER)   IO4 ──┤ IO4          IO15 ├── IO15
              IO2 ──┤ IO2 (PWR_LED) IO2 ├──
             IO15 ──┤ IO15         IO0  ├── IO0
             IO27 ──┤ IO27 (SIM TX)IO4  ├──
             IO26 ──┤ IO26 (SIM RX)IO2  ├──
             IO25 ──┤ IO25         IO35 ├── IO35
             IO33 ──┤ IO33         IO34 ├── IO34
             IO32 ──┤ IO32         IO39 ├── IO39
                EN ──┤ EN           IO36 ├── IO36
                    │                     │
                    └─────────────────────┘
```

### Complete Wiring Table

| Component | Component Pin | ESP32 Pin | Wire Color (Suggested) |
|-----------|---------------|-----------|------------------------|
| **OLED Display (SSD1306)** | | | |
| | VCC | 3.3V | Red |
| | GND | GND | Black |
| | SDA | GPIO 21 | Blue |
| | SCL | GPIO 22 | Yellow |
| **SIM800L Module** | | | |
| | VCC | 5V (External) | Red |
| | GND | GND | Black |
| | TXD | GPIO 26 | Green |
| | RXD | GPIO 27 | White |
| **Blue LED (Load ON)** | | | |
| | Anode (+) | GPIO 16 | Blue |
| | Cathode (-) | GND (via 220Ω) | Black |
| **Green LED (Balance OK)** | | | |
| | Anode (+) | GPIO 17 | Green |
| | Cathode (-) | GND (via 220Ω) | Black |
| **Red LED (Low Balance)** | | | |
| | Anode (+) | GPIO 5 | Red |
| | Cathode (-) | GND (via 220Ω) | Black |
| **Active Buzzer** | | | |
| | Positive (+) | GPIO 4 | Red |
| | Negative (-) | GND | Black |
| **Power LED (Onboard)** | | | |
| | (Built-in) | GPIO 2 | - |

---

## 2. DETAILED CONNECTION DIAGRAMS

### OLED Display (I2C - SSD1306 128x64)
```
    OLED Display              ESP32
    ┌──────────┐             ┌──────┐
    │   VCC    │─────────────│ 3.3V │
    │   GND    │─────────────│ GND  │
    │   SDA    │─────────────│ IO21 │
    │   SCL    │─────────────│ IO22 │
    └──────────┘             └──────┘
```

### SIM800L GSM Module
```
    SIM800L                   ESP32
    ┌──────────┐             ┌──────┐
    │   VCC    │──┐          │      │
    │   GND    │──┼──────────│ GND  │
    │   TXD    │──┼──────────│ IO26 │  (ESP32 RX)
    │   RXD    │──┼──────────│ IO27 │  (ESP32 TX)
    └──────────┘  │          └──────┘
                  │
    IMPORTANT: VCC needs 3.7V-4.2V @ 2A
    Use separate power supply or LiPo battery!
    
    Power Options:
    ┌─────────────────┐
    │  18650 Battery  │──── VCC (SIM800L)
    │  with holder    │──── GND (Common)
    └─────────────────┘
    
    OR
    
    ┌─────────────────┐
    │  5V 2A Adapter  │──── Through voltage
    │                 │     regulator (AMS1117)
    └─────────────────┘     to 4.0V
```

### LED Connections (with Resistors)
```
    ESP32 GPIO ────┬──── 220Ω Resistor ────┬──── LED Anode (+)
                   │                       │
                   │                       └──── LED Cathode (-) ──── GND

    GPIO 16 ───220Ω───[BLUE LED]───GND
    GPIO 17 ───220Ω───[GREEN LED]──GND  
    GPIO 5  ───220Ω───[RED LED]────GND
```

### Active Buzzer
```
    ESP32 GPIO 4 ────────────┬──── Buzzer (+)
                             │
    GND ─────────────────────┴──── Buzzer (-)
    
    Note: Active buzzers have built-in oscillator
    No external circuit needed, just HIGH/LOW control
```

---

## 3. EASYEDA COMPONENT LIBRARY NAMES

Search these exact names in EasyEDA's library:

### Main Components
| Component | Search Term in EasyEDA | Library |
|-----------|------------------------|---------|
| ESP32 DevKit V1 | `ESP32-DEVKIT-V1` or `ESP32-WROOM-32` | LCSC / User Contributed |
| OLED 0.96" | `SSD1306` or `OLED 0.96 I2C` | User Contributed |
| SIM800L | `SIM800L` or `SIM800L V2` | User Contributed |
| LED 5mm | `LED-5MM` or `LED_5MM` | Basic Library |
| Resistor 220Ω | `R_220R` or `RESISTOR` | Basic Library |
| Active Buzzer | `BUZZER` or `BUZZER-12MM` | Basic Library |
| Capacitor 100µF | `CAP_100UF` or `CAPACITOR` | Basic Library |

### Alternative Search Terms
```
ESP32:
  - "ESP32 DEVKIT"
  - "ESP-WROOM-32"
  - "NodeMCU-32S"

OLED:
  - "0.96 OLED"
  - "SSD1306 128X64"
  - "OLED I2C 4PIN"

SIM800L:
  - "SIM800L MODULE"
  - "GSM MODULE"
  - "SIM800L GPRS"

Generic:
  - "LED" → then select 5mm
  - "RES" → Resistor
  - "CAP" → Capacitor
```

---

## 4. EASYEDA SCHEMATIC CREATION GUIDE

### Step 1: Create New Project
1. Go to https://easyeda.com
2. Sign in / Create account
3. Click **File → New → Project**
4. Name: `ESP32_Smart_Meter`
5. Click **File → New → Schematic**

### Step 2: Add Components
1. Click **Library** icon (left panel) or press `Shift + F`
2. Search for each component (use names above)
3. Click component → **Place** to add to schematic
4. Press `R` to rotate while placing
5. Press `Esc` when done

### Step 3: Component Placement (Professional Layout)
```
┌─────────────────────────────────────────────────────────────┐
│                     POWER SECTION (Top)                      │
│    [5V Input]    [3.3V Regulator]    [GND Symbol]           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────┐                           ┌─────────────┐     │
│   │ SIM800L │                           │    OLED     │     │
│   │  (GSM)  │       ┌─────────┐         │   Display   │     │
│   │         │       │  ESP32  │         │             │     │
│   └─────────┘       │ DevKit  │         └─────────────┘     │
│                     │         │                              │
│                     │         │         ┌─────────────┐     │
│                     └─────────┘         │   BUZZER    │     │
│                                         └─────────────┘     │
│                                                              │
│   ┌───┐  ┌───┐  ┌───┐                                       │
│   │LED│  │LED│  │LED│    ← Status LEDs (Bottom)             │
│   │ B │  │ G │  │ R │                                       │
│   └───┘  └───┘  └───┘                                       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                     GND RAIL (Bottom)                        │
└─────────────────────────────────────────────────────────────┘
```

### Step 4: Wire Connections
1. Click **Wire** tool (W key)
2. Click on component pin → drag to destination pin
3. Use **Net Labels** for cleaner schematics:
   - Click **Net Label** tool
   - Name: `SDA`, `SCL`, `VCC`, `GND`
   - Place on wires (same names auto-connect)

### Step 5: Add Net Labels (Professional Look)
```
Instead of long wires, use Net Labels:

ESP32 GPIO21 ────○ SDA        OLED SDA ────○ SDA
                 (label)                    (label)
                 
These auto-connect because they have the same name!
```

### Step 6: Add Power Symbols
1. Search `VCC` → Place for 5V/3.3V
2. Search `GND` → Place for ground
3. This makes schematic cleaner

### Step 7: Add Title Block
1. Click **Place → Title Block**
2. Fill in:
   - Title: `IoT Smart Meter - ESP32`
   - Author: `Your Names`
   - Date: `January 2025`
   - Revision: `v1.0`

### Step 8: Add Component Values
1. Double-click each resistor
2. Change **Value** to `220Ω`
3. Change LED colors in **Name** field

### Step 9: Final Touches
1. **Add text labels**: Click **Text** tool
   - Label sections: "POWER", "MCU", "DISPLAY", "GSM", "INDICATORS"
2. **Add border**: Place → Border
3. **Align components**: Select all → Right-click → Align

### Step 10: Export
1. **File → Export → PDF** (for report)
2. **File → Export → PNG** (for PPT)
3. **File → Export → SVG** (high quality)

---

## 5. PROFESSIONAL SCHEMATIC TIPS

### Do's ✅
- Use consistent wire angles (90° or 45°)
- Group related components
- Add decoupling capacitors near ICs (100nF)
- Use net labels instead of crossing wires
- Add component values on all parts
- Include a title block

### Don'ts ❌
- Avoid 4-way wire junctions
- Don't cross wires unnecessarily
- Don't place components randomly
- Don't forget pull-up resistors on I2C (OLED usually has them built-in)

### Wire Junction Rules
```
CORRECT:                    WRONG:
    │                          │
────┼────  (dot = connection) ─┼─── (ambiguous!)
    │                          │
                              
Use ────●──── for connections
Use ────┼──── for crossings (no connection)
```

---

## 6. BILL OF MATERIALS (BOM)

| # | Component | Specification | Qty | Est. Cost (KES) |
|---|-----------|---------------|-----|-----------------|
| 1 | ESP32 DevKit V1 | 38-pin, USB-C | 1 | 800 |
| 2 | OLED Display | 0.96" 128x64 I2C SSD1306 | 1 | 350 |
| 3 | SIM800L Module | GSM/GPRS with antenna | 1 | 600 |
| 4 | LED 5mm Blue | 3.0-3.2V, 20mA | 1 | 10 |
| 5 | LED 5mm Green | 2.0-2.2V, 20mA | 1 | 10 |
| 6 | LED 5mm Red | 1.8-2.0V, 20mA | 1 | 10 |
| 7 | Resistor | 220Ω 1/4W | 3 | 15 |
| 8 | Active Buzzer | 5V 12mm | 1 | 80 |
| 9 | Breadboard | 830-point | 1 | 300 |
| 10 | Jumper Wires | M-M, M-F assorted | 1 set | 150 |
| 11 | USB Cable | Type-C or Micro | 1 | 100 |
| 12 | Power Supply | 5V 2A USB adapter | 1 | 400 |
| | | **TOTAL** | | **~2,825** |

---

## 7. QUICK REFERENCE CARD

```
╔═══════════════════════════════════════════════════════════╗
║            ESP32 SMART METER - QUICK WIRING               ║
╠═══════════════════════════════════════════════════════════╣
║  OLED (I2C):     VCC→3.3V  GND→GND  SDA→21  SCL→22       ║
║  SIM800L:        VCC→4V    GND→GND  TX→26   RX→27        ║
║  LED Blue:       GPIO 16 → 220Ω → LED → GND              ║
║  LED Green:      GPIO 17 → 220Ω → LED → GND              ║
║  LED Red:        GPIO 5  → 220Ω → LED → GND              ║
║  Buzzer:         GPIO 4  → Buzzer(+)   GND → Buzzer(-)   ║
║  Power LED:      GPIO 2 (built-in)                       ║
╚═══════════════════════════════════════════════════════════╝
```
