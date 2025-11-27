const fetch = global.fetch || require("node-fetch");

exports.getETA = async (origin, destination) => {
  try {
    const key = process.env.MAPBOX_ACCESS_TOKEN;
    if (!key) return null;

    const url =
      `https://api.mapbox.com/directions/v5/mapbox/driving/` +
      `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
      `?geometries=polyline&overview=full&access_token=${key}`;

    const res = await fetch(url);
    const json = await res.json();

    if (!json.routes || json.routes.length === 0) return null;

    const route = json.routes[0];

    return {
      distance: {
        value: route.distance,
        text: (route.distance / 1000).toFixed(2) + " km",
      },
      duration: {
        value: route.duration,
        text: Math.round(route.duration / 60) + " mins",
      },
      polyline: route.geometry,
    };
  } catch (err) {
    console.error("Mapbox Directions Error:", err);
    return null;
  }
};
