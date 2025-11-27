import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

// Create socket function that always reads fresh token
const createSocket = () => {
  return io(SOCKET_URL, {
    transports: ["websocket"],
    auth: {
      token: localStorage.getItem("token"), // always fresh token
    },
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1500,
  });
};

// initial connect
const socket = createSocket();

// Whenever token changes → reconnect with new token
window.addEventListener("storage", (event) => {
  if (event.key === "token") {
    console.log("🔄 Token changed → reconnecting socket...");
    socket.auth = { token: localStorage.getItem("token") };
    socket.connect();
  }
});

// Useful logs
socket.on("connect", () => {
  console.log("🟢 Socket connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("🔴 Socket connection error:", err.message);
});

export default socket;
