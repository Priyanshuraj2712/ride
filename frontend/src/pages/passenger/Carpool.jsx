import React, { useEffect, useState } from "react";
import axios from "../../services/api";
import LocationSearch from "../../components/LocationSearch";
import MapPicker from "../../components/MapPicker";

const Carpool = () => {
  const [carpools, setCarpools] = useState([]);

  // Create Carpool States
  const [pickup, setPickup] = useState(null);
  const [pickupAddress, setPickupAddress] = useState("");
  const [openPickupMap, setOpenPickupMap] = useState(false);

  const [destination, setDestination] = useState(null);
  const [destinationAddress, setDestinationAddress] = useState("");
  const [openDestMap, setOpenDestMap] = useState(false);

  const [totalSeats, setTotalSeats] = useState(1);
  const [pricePerSeat, setPricePerSeat] = useState(50);

  // Fetch all carpools (You must add GET /api/carpool/all in backend)
  useEffect(() => {
    loadCarpools();
  }, []);

  const loadCarpools = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/carpool/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCarpools(res.data.carpools);
    } catch (err) {
      console.error(err);
    }
  };

  // Create new carpool
  const createCarpool = async () => {
    if (!pickup || !destination) return alert("Select pickup & destination");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/api/carpool",
        {
          pickup: {
            address: pickupAddress,
            coords: {
              type: "Point",
              coordinates: [pickup.lng, pickup.lat],
            },
          },
          destination: {
            address: destinationAddress,
            coords: {
              type: "Point",
              coordinates: [destination.lng, destination.lat],
            },
          },
          totalSeats,
          seatsRemaining: totalSeats,
          pricePerSeat,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Carpool created!");
      loadCarpools();
    } catch (err) {
      console.error(err);
      alert("Failed to create carpool.");
    }
  };

  // Join carpool
  const joinCarpool = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `/api/carpool/${id}/join`,
        { seats: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Joined successfully!");
      loadCarpools();
    } catch (err) {
      console.error(err);
      alert("Unable to join carpool");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Carpool</h2>

      {/* Create Carpool Section */}
      <h3>Create a Carpool</h3>

      <LocationSearch
        placeholder="Pickup location"
        onSelect={(loc) => {
          setPickup({ lat: loc.lat, lng: loc.lng });
          setPickupAddress(loc.address);
          setOpenPickupMap(true);
        }}
      />

      {openPickupMap && pickup && (
        <MapPicker
          initialPosition={{ lat: pickup.lat, lng: pickup.lng }}
          onSelect={(coords) => setPickup(coords)}
        />
      )}

      <br />

      <LocationSearch
        placeholder="Destination"
        onSelect={(loc) => {
          setDestination({ lat: loc.lat, lng: loc.lng });
          setDestinationAddress(loc.address);
          setOpenDestMap(true);
        }}
      />

      {openDestMap && destination && (
        <MapPicker
          initialPosition={{ lat: destination.lat, lng: destination.lng }}
          onSelect={(coords) => setDestination(coords)}
        />
      )}

      <br />

      <input
        type="number"
        min="1"
        max="6"
        value={totalSeats}
        onChange={(e) => setTotalSeats(parseInt(e.target.value))}
        placeholder="Total Seats"
      />

      <input
        type="number"
        value={pricePerSeat}
        onChange={(e) => setPricePerSeat(parseInt(e.target.value))}
        placeholder="Price Per Seat"
      />

      <button onClick={createCarpool}>Create Carpool</button>

      <hr />

      {/* List Carpool Rides */}
      <h3>Available Carpools</h3>

      {carpools.length === 0 ? (
        <p>No carpools available.</p>
      ) : (
        carpools.map((c) => (
          <div
            key={c._id}
            style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
          >
            <p><strong>Pickup:</strong> {c.pickup.address}</p>
            <p><strong>Destination:</strong> {c.destination.address}</p>
            <p><strong>Seats Left:</strong> {c.seatsRemaining}</p>
            <p><strong>Price/Seat:</strong> ₹{c.pricePerSeat}</p>

            {c.seatsRemaining > 0 ? (
              <button onClick={() => joinCarpool(c._id)}>Join</button>
            ) : (
              <p style={{ color: "red" }}>Full</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Carpool;
