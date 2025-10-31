import axios from 'axios';
// --- IMPROVEMENT ---
// Import the complete list of districts from the single source of truth
import { DISTRICTS_CONFIG } from '../routes/districts.js';
// --- END IMPROVEMENT ---

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Find nearest district based on coordinates
export const findNearestDistrict = (lat, lng) => {
  let nearestDistrict = null;
  let minDistance = Infinity;
  
  // --- IMPROVEMENT ---
  // Iterate over the imported 33-district config instead of a stale list
  for (const district of DISTRICTS_CONFIG) {
    const { code, coordinates } = district;
    // Skip districts that might not have coordinates in the config
    if (!coordinates || coordinates.lat == null || coordinates.lng == null) {
      continue; 
    }

    const distance = calculateDistance(lat, lng, coordinates.lat, coordinates.lng);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestDistrict = code;
    }
  }
  // --- END IMPROVEMENT ---
  
  return {
    districtCode: nearestDistrict,
    distance: minDistance,
    confidence: minDistance < 50 ? 'high' : minDistance < 100 ? 'medium' : 'low'
  };
};

// Reverse geocoding using OpenStreetMap Nominatim (free, no API key needed)
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon: lng,
        format: 'json',
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'MGNREGA-Dashboard/1.0'
      },
      timeout: 5000
    });
    
    const address = response.data.address;
    
    // Extract district from response
    const detectedDistrict = address.state_district || address.county || address.city;
    
    return {
      district: detectedDistrict,
      state: address.state,
      country: address.country,
      fullAddress: response.data.display_name
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    return null;
  }
};

// Combined function: detect district from coordinates
export const detectDistrict = async (lat, lng) => {
  try {
    // First, find nearest district by distance
    const nearestDistrict = findNearestDistrict(lat, lng);
    
    // Optionally, verify with reverse geocoding
    const geoData = await reverseGeocode(lat, lng);
    
    return {
      detectedDistrict: nearestDistrict.districtCode,
      distance: nearestDistrict.distance,
      confidence: nearestDistrict.confidence,
      geocodedLocation: geoData,
      coordinates: { lat, lng }
    };
  } catch (error) {
    console.error('District detection error:', error);
    // Fallback to nearest district only
    return findNearestDistrict(lat, lng);
  }
};

// --- IMPROVEMENT ---
// Removed unused isInChhattisgarh function
// --- END IMPROVEMENT ---