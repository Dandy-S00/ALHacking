import app from './app';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
io.on('connection', (socket) => {
  socket.on('join_game', (gameId) => socket.join(gameId));
});
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
export { io };
