// Google Sheets Database Initializer
function setupSheetDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Create Live_Location sheet
  let liveSheet = ss.getSheetByName("Live_Location");
  if (!liveSheet) {
    liveSheet = ss.insertSheet("Live_Location");
    liveSheet.appendRow(["Timestamp", "Bus ID", "Latitude", "Longitude", "Status"]);
  }

  // 2. Create Stops sheet
  let stopsSheet = ss.getSheetByName("Stops");
  if (!stopsSheet) {
    stopsSheet = ss.insertSheet("Stops");
    stopsSheet.appendRow(["Stop ID", "Stop Name", "Latitude", "Longitude", "Parents Phone Numbers"]);
    stopsSheet.appendRow(["stop_1", "Main Street Corner", 12.971598, 77.594562, "+919876543210"]);
  }
  
  Logger.log("✅ School Bus database sheets successfully initialized.");
}
