import { io } from "socket.io-client";

// Reads the token from localStorage each time it connects
export const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
  auth: (cb) => cb({ token: localStorage.getItem("token") }),
});
export default socket;