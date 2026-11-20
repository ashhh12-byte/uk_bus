DEHRADUN BUS TRACKER - TIME-AWARE UPDATE
=======================================

WHAT CHANGED
- Browser JavaScript reads the device's current local time and refreshes the display every second.
- C++ WebAssembly receives current minutes after midnight, calculates straight-line distance from GPS to each station, and returns the nearest stations.
- Station latitude/longitude and the user's latitude/longitude are displayed for comparison.
- Each vehicle's daily passing times are compared with current time. Earlier times are marked Passed; the next scheduled time is highlighted as Passing now (within 2 minutes) or Upcoming.
- Upcoming times are sorted first by soonest; passed times follow in reverse chronological order. Stations remain sorted by distance.

FILES / DATA FORMAT
stations.txt: id,name,latitude,longitude,data_status
vehicles.txt: stop_id,vehicle_name,route,HH:MM;HH:MM;...,data_status
Times use 24-hour local time and repeat daily. Edit vehicles.txt with verified times for real-world use.

BUILD (Emscripten required)
em++ main.cpp -o main.js --bind --preload-file stations.txt --preload-file vehicles.txt
This creates main.js, main.wasm and main.data. Keep them beside index.html.
Run with VS Code Live Server / localhost or HTTPS; GPS requires permission.

IMPORTANT DATA WARNING
The included passing times are illustrative DEMO values to demonstrate the feature. They are NOT verified official Dehradun schedules. Existing station coordinates are approximate/demo reference points, not verified boarding-platform coordinates. Confirm coordinates and timetables with operators or field observations before relying on them. This is timetable-based status, NOT live vehicle GPS tracking. A scheduled time does not prove a bus is physically present or on time. The clock uses the device's local time (India time if the device is configured for IST).
