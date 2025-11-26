// ---------------- SERVER.JS ------------------

const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const http = require('http');              // REQUIRED
const { Server } = require('socket.io');   // REQUIRED
const jwt = require('jsonwebtoken');       // REQUIRED

dotenv.config();

// Express App
const app = express();

// HTTP Server (Required for Socket.IO)
const server = http.createServer(app);

// Socket Map (userId → socketId)
const userSocketMap = new Map();

// Connect to DB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/drivers', require('./routes/driver'));
app.use('/api/passengers', require('./routes/passenger'));
app.use('/api/rides', require('./routes/rides'));
app.use('/api/carpool', require('./routes/carpool'));
app.use('/api/location', require('./routes/location'));

// ----------------------------------------------------
//      SOCKET.IO INITIALIZATION  (FIXED SECTION)
// ----------------------------------------------------
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket Authentication
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: decoded.id, role: decoded.role };
    }
    return next();
  } catch (err) {
    return next();
  }
});

// Socket Events
io.on('connection', (socket) => {

  console.log("Socket connected:", socket.id);

  // Save socket for user
  if (socket.user && socket.user.id) {
    userSocketMap.set(socket.user.id.toString(), socket.id);
  }

  // Join ride room
  socket.on('joinRideRoom', ({ rideId }) => {
    socket.join(`ride_${rideId}`);
  });

  socket.on('leaveRideRoom', ({ rideId }) => {
    socket.leave(`ride_${rideId}`);
  });

  // Driver live location updates
  socket.on('driverLocation', (payload) => {
    // payload = { lat, lng, rideId, eta }
    if (payload.rideId) {
      io.to(`ride_${payload.rideId}`).emit('driverLocationUpdate', payload);
    }
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    if (socket.user && socket.user.id) {
      userSocketMap.delete(socket.user.id.toString());
    }
    console.log("Socket disconnected:", socket.id);
  });
});

// Expose Socket.IO globally
app.set('io', io);
app.set('userSocketMap', userSocketMap);

// ----------------------------------------------------

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Ridezy backend (with Socket.IO) running on port ${PORT}`);
});
