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
const { errorHandler } = require("./middleware/errorHandler");

dotenv.config();

// Express App
const app = express();
const server = http.createServer(app);

// Socket Map (userId → socketId)
const userSocketMap = new Map();

// Connect to DB
connectDB();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.options("*", cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// Routes
app.use("/api/auth",      require("./routes/auth"));
app.use("/api/drivers",   require("./routes/driver"));
app.use("/api/passengers",require("./routes/passenger"));
app.use("/api/rides",     require("./routes/rides"));
app.use("/api/carpool",   require("./routes/carpool"));
app.use("/api/location",  require("./routes/location"));
app.use("/api/reviews",   require("./routes/review"));
app.use("/api/driver",    require("./routes/driverActiveRide"));
app.use("/api/driver",    require("./routes/driverProfile"));
app.use("/api/driver",    require("./routes/driverEarnings"));

// ----------------------------------------------------
//              SOCKET.IO INITIALIZATION
// ----------------------------------------------------
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
  allowEIO3: true,
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

  socket.on("SOSAlert", (data) => {
    console.log("🚨 SOS ALERT RECEIVED (SOCKET):", data);
    io.emit("SOSAlert", data);
  });

  // RIDE REQUEST FROM USER
  socket.on("newRideRequest", (rideData) => {
    console.log("Broadcasting ride request...");
    io.emit("rideRequest", rideData);
  });

  // DRIVER ACCEPTS THE RIDE
  socket.on("driverAcceptedRide", (data) => {
    console.log("Driver Accepted:", data);
    io.emit("rideAccepted", data);
  });

  // DRIVER REJECTS THE RIDE
  socket.on("driverRejectedRide", (data) => {
    console.log("Driver Rejected:", data);
    io.emit("rideRejected", data);
  });

  // JOIN / LEAVE RIDE ROOM
  socket.on("joinRideRoom", ({ rideId }) => {
    socket.join(`ride_${rideId}`);
  });

  socket.on("leaveRideRoom", ({ rideId }) => {
    socket.leave(`ride_${rideId}`);
  });

  // DRIVER LIVE LOCATION STREAM
  socket.on("driverLocation", (payload) => {
    if (payload.rideId) {
      io.to(`ride_${payload.rideId}`).emit("driverLocationUpdate", payload);
    }
  });

  // DISCONNECT
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

// Error handler (must be after routes)
app.use(errorHandler);

// ----------------------------------------------------

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Ridezy backend running on port ${PORT}`);
});
