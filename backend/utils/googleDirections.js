const fetch = require('node-fetch');


exports.getETA = async (origin, destination) => {
// origin/destination: { lat, lng }
const key = process.env.GOOGLE_MAPS_API_KEY;
if (!key) return null;
const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${key}`;
const resp = await fetch(url);
const json = await resp.json();
if (json.routes && json.routes.length) {
const leg = json.routes[0].legs[0];
return { duration: leg.duration, distance: leg.distance, polyline: json.routes[0].overview_polyline.points };
}
return null;
};