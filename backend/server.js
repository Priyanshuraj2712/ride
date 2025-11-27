// ---------------- FIXED SERVER.JS ------------------

const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");

dotenv.config();

// Express App
const app = express();
const server = http.createServer(app);

// Socket Map (userId → socketId)
const userSocketMap = new Map();

// Connect to DB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/drivers", require("./routes/driver"));
app.use("/api/passengers", require("./routes/passenger"));
app.use("/api/rides", require("./routes/rides"));
app.use("/api/carpool", require("./routes/carpool"));
app.use("/api/location", require("./routes/location"));

// ----------------------------------------------------
//              SOCKET.IO INITIALIZATION
// ----------------------------------------------------
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket Authentication (JWT optional)
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: decoded.id, role: decoded.role };
    }
    next();
  } catch (err) {
    next();
  }
});

// ----------------------------------------------------
//             ALL SOCKET EVENTS (FIXED)
// ----------------------------------------------------
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Map user to socket
  if (socket.user && socket.user.id) {
    userSocketMap.set(socket.user.id.toString(), socket.id);
  }

  // -----------------------------
  //   RIDE REQUEST FROM USER
  // -----------------------------
  socket.on("newRideRequest", (rideData) => {
    console.log("Broadcasting ride request...");
    io.emit("rideRequest", rideData); // every driver receives popup
  });

  // -----------------------------
  // DRIVER ACCEPTS THE RIDE
  // -----------------------------
  socket.on("driverAcceptedRide", (data) => {
    console.log("Driver Accepted:", data);

    // Notify passenger & update ride
    io.emit("rideAccepted", data);
  });

  // -----------------------------
  // DRIVER REJECTS THE RIDE
  // -----------------------------
  socket.on("driverRejectedRide", (data) => {
    console.log("Driver Rejected:", data);
    io.emit("rideRejected", data);
  });

  // -----------------------------
  // JOIN RIDE ROOM
  // -----------------------------
  socket.on("joinRideRoom", ({ rideId }) => {
    socket.join(`ride_${rideId}`);
  });

  socket.on("leaveRideRoom", ({ rideId }) => {
    socket.leave(`ride_${rideId}`);
  });

  // -----------------------------
  // DRIVER LIVE LOCATION STREAM
  // -----------------------------
  socket.on("driverLocation", (payload) => {
    // { lat, lng, rideId, eta }
    if (payload.rideId) {
      io.to(`ride_${payload.rideId}`).emit("driverLocationUpdate", payload);
    }
  });

  // -----------------------------
  // DRIVER/PASSENGER DISCONNECT
  // -----------------------------
  socket.on("disconnect", () => {
    if (socket.user && socket.user.id) {
      userSocketMap.delete(socket.user.id.toString());
    }
    console.log("Socket disconnected:", socket.id);
  });
});

// Expose globally
app.set("io", io);
app.set("userSocketMap", userSocketMap);

// ----------------------------------------------------

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Ridezy backend running on port ${PORT}`);
});
