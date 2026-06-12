#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# School Bus Tracking System - Core Ingestion & Agentic Notification Engine
# Deployed under MIT Open-Source parameters.

import time
import math
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

# Key Parameters (RAG / Agentic Features)
GEOFENCE_RADIUS_METRES = 200.0
UPDATE_INTERVAL_MOVING_SECONDS = 5
UPDATE_INTERVAL_IDLE_SECONDS = 30
ETA_SPEED_FACTOR = 1.2

# Mock DB
BUSES = {}
STOPS = {
    'stop_1': {
        'name': 'Main Street Corner',
        'lat': 12.971598,
        'lng': 77.594562,
        'parents_phone': ['+919876543210']
    }
}
NOTIFICATIONS_LOG = []

def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c * 1000.0

@app.route('/api/location', methods=['POST'])
def update_location():
    data = request.json or {}
    bus_id = data.get('bus_id')
    lat = data.get('lat')
    lng = data.get('lng')
    status = data.get('status', 'moving')
    
    if not bus_id or lat is None or lng is None:
        return jsonify({"status": "error", "message": "Missing fields"}), 400
        
    BUSES[bus_id] = {
        "lat": lat,
        "lng": lng,
        "last_update": time.time(),
        "status": status
    }
    
    # Geofence check
    for stop_id, stop in STOPS.items():
        dist = calculate_haversine_distance(lat, lng, stop['lat'], stop['lng'])
        if dist <= GEOFENCE_RADIUS_METRES:
            msg = f"🚌 Bus {bus_id} is entering the geofence for {stop['name']}. Please be ready!"
            for phone in stop['parents_phone']:
                NOTIFICATIONS_LOG.append({
                    "timestamp": time.time(),
                    "delivered_to": phone,
                    "message": msg,
                    "status": "sent"
                })
                print(f"Alert sent to {phone}: {msg}")
                
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    print("🚌 Starting School Bus Ingestion Server...")
    app.run(port=5000)
