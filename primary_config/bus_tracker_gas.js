// Google Apps Script - Free Tier Real-Time location Ingestion
// Expose as a Web App to process incoming smartphone / device coordinates.

const GEOFENCE_RADIUS_METRES = 200;
const CALLMEBOT_API_KEY = "YOUR_CALLMEBOT_API_KEY"; // Replace with your CallMeBot API key

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const liveSheet = ss.getSheetByName("Live_Location");
    
    // Append telemetry: Timestamp, Bus ID, Latitude, Longitude, Status
    liveSheet.appendRow([new Date(), data.bus_id, data.lat, data.lng, data.status]);
    
    // Evaluate Geofences
    const stopsSheet = ss.getSheetByName("Stops");
    const stopsData = stopsSheet.getDataRange().getValues();
    
    for (let i = 1; i < stopsData.length; i++) {
      const stopId = stopsData[i][0];
      const stopName = stopsData[i][1];
      const stopLat = parseFloat(stopsData[i][2]);
      const stopLng = parseFloat(stopsData[i][3]);
      const parentPhones = stopsData[i][4].split(",");
      
      const distance = calculateDistance(data.lat, data.lng, stopLat, stopLng);
      
      if (distance <= GEOFENCE_RADIUS_METRES) {
        // Trigger free WhatsApp notifications
        const message = "🚌 School Bus Alert:\nBus " + data.bus_id + " is approaching " + stopName + ".\nLive Location: https://talaripradeep.info/tools/school-bus-tracker/";
        
        parentPhones.forEach(phone => {
          const cleanPhone = phone.trim();
          const url = "https://api.callmebot.com/whatsapp.php?phone=" + cleanPhone + "&text=" + encodeURIComponent(message) + "&apikey=" + CALLMEBOT_API_KEY;
          UrlFetchApp.fetch(url, { method: "get" });
        });
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

// Haversine Distance Formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
