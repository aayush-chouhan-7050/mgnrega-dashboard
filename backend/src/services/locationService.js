import axios from 'axios';

const DISTRICTS_COORDINATES = {
  'raipur': { lat: 21.2514, lng: 81.6296, radius: 50 },
  'bilaspur': { lat: 22.0797, lng: 82.1409, radius: 50 },
  'durg': { lat: 21.1904, lng: 81.2849, radius: 40 },
  'rajnandgaon': { lat: 21.0974, lng: 81.0379, radius: 40 },
  'korba': { lat: 22.3595, lng: 82.7501, radius: 45 },
  'raigarh': { lat: 21.8974, lng: 83.3950, radius: 45 },
  'janjgir-champa': { lat: 22.0156, lng: 82.5772, radius: 40 },
  'mahasamund': { lat: 21.1078, lng: 82.0984, radius: 40 },
  'bastar': { lat: 19.0688, lng: 81.9598, radius: 60 },
  'jashpur': { lat: 22.8858, lng: 84.1411, radius: 45 }
};

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
  
  for (const [districtCode, coords] of Object.entries(DISTRICTS_COORDINATES)) {
    const distance = calculateDistance(lat, lng, coords.lat, coords.lng);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestDistrict = districtCode;
    }
  }
  
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

// Validate if coordinates are within Chhattisgarh bounds
export const isInChhattisgarh = (lat, lng) => {
  // Approximate bounds of Chhattisgarh
  const bounds = {
    north: 24.0,
    south: 17.5,
    east: 84.5,
    west: 80.0
  };
  
  return lat >= bounds.south && 
         lat <= bounds.north && 
         lng >= bounds.west && 
         lng <= bounds.east;
};